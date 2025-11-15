---
author: Kyle Husmann
pubDatetime: 2025-11-08T11:30:00-08:00
title: "PSA: R Graphics Devices Can Break Snapshot Tests"
slug: r-graphics-devices-break-snapshot-tests
featured: true
draft: true
tags:
  - r
  - software
  - tips
description: The state of your graphics device can be a surprising source of inconsistent results across test runs in R.
---

If you've ever written unit tests in R, you know the frustration: tests that produce different results in different environments.

Most R developers are familiar with the usual suspects that cause test inconsistencies: environment variables, `options()`, random seeds, package versions, and platform-specific differences in architecture, shared libraries, fonts or rendering.

Over the years I've seen a lot of weird edge cases that fall into the above categories. A few months ago, for example, I traced test inconsistencies on a project back to code in tibble that branched on the presence of an `RSTUDIO` environment variable ([link](https://github.com/tidyverse/tibble/issues/1662)).

But this week I discovered a new culprit that wasn't on my radar until now: the state of R's current graphics device. It turns out that the size and configuration of your current graphics device, including the dimensions of RStudio's Plots pane, can silently affect the results of your code when you least expect it!

## The Mystery

I was writing automated tests for plotly plots. Since plotly outputs interactive HTML, I couldn't use [vdiffr](https://vdiffr.r-lib.org/) for snapshot testing as I would with static ggplot vector outputs. Even though I was creating the base plots in ggplot and converting via `ggplotly()`, I wanted to capture the final plotly output in my tests, not the intermediate ggplot result.

To do this, my tests would render the plotly plots to temporary HTML files via `htmltools::save_html()` and screenshot the result via webshot2. (I would have preferred using `plotly::save_image()`, but was working in a managed environment where kaleido wasn't installed.)

The snapshots I produced when running tests interactively with `devtools::test()` did not match the results from `devtools::check()`. The snapshots differed by a few pixels in margins and element sizes--not much, but enough to fail. Since `devtools::check()` runs in a clean subprocess, something about my interactive RStudio session was affecting the results.

I started my usual investigation: environment variables, `options()`, attached packages. The Chrome executable being used by webshot2/chromote and the options it was launched with. Nothing stood out. I was running everything on the same machine, so it couldn't be a cross-platform issue. What could possibly be different?

## The Cause

As you might have guessed from the title of this post, I eventually tracked the differences down to the current state of the graphics device. The plotly plots were being created with `ggplotly()`, which uses `grid::convert*()` functions to convert ggplot grid units to the mm/px values used by plotly.

You can easily replicate the core issue by running the following in RStudio:

```r
grid::convertX(grid::unit(1, "npc"), "mm")
```

Now resize your Plots pane and run it again--you'll get a different result! Similarly, if you run it in a clean subprocess via callr (as `devtools::check()` does), you'll also get a different result:

```r
callr::r(\() grid::convertX(grid::unit(1, "npc"), "mm"))
```

Because `plotly::ggplotly()` makes extensive use of these unit conversions ([source](https://github.com/plotly/plotly.R/blob/e04eb4f08c325846d8cdedb9892332b85e16465d/R/ggplotly.R#L1192)), my snapshot tests were depending on the size of whatever graphics device happened to be open--either my RStudio Plots pane or the default device created by the callr subprocess.

## The Solution

The fix is to manually specify a graphics device to ensure the conversion calculations are always consistent:

```r
foo <- function() {
  withr::local_png(tempfile(), type = "cairo")
  grid::convertX(grid::unit(1, "npc"), "mm")
}
```

Using `type = "cairo"` potentially provides additional cross-platform consistency, though I haven't tested the limits of this extensively. You might also consider using the [ragg package](https://ragg.r-lib.org/) for more control over graphics devices.

Now try running it with different Plots pane sizes or inside a callr subprocess--you'll get the same values:

```r
foo()
callr::r(foo)
```

As it turns out `ggplotly()`, already does this. The first thing it does when called is to create a fresh graphics device [ggplotly.R#L178](https://github.com/plotly/plotly.R/blob/e04eb4f08c325846d8cdedb9892332b85e16465d/R/ggplotly.R#L178C1-L179C49).

So why weren't my results consistent? Well, if you call `ggplotly()` without specifying `width=` and `height=`, it will create the new graphics device _with the width and height of your currently open graphics device_:

```r
# To convert relative sizes correctly, we use grid::convertHeight(),
# which requires a known output (device) size.
dev_fun <- if (capabilities("aqua") || capabilities("png")) {
  grDevices::png
} else if (capabilities("jpeg")) {
  grDevices::jpeg
} else if (is_installed("Cairo")) {
  function(filename, ...) Cairo::Cairo(file = filename, ...)
} else {
  stop(
    "No Cairo or bitmap device is available. Such a graphics device is required to convert sizes correctly in ggplotly().\n\n",
    " You have two options:\n",
    "  (1) install.packages('Cairo')\n",
    "  (2) compile R to use a bitmap device (png or jpeg)",
    call. = FALSE
  )
}
# if a device (or RStudio) is already open, use the device size as default size
if (!is.null(grDevices::dev.list()) || is_rstudio()) {
  width <- width %||% default(grDevices::dev.size("px")[1])
  height <- height %||% default(grDevices::dev.size("px")[2])
}
# open the device and make sure it closes on exit
dev_fun(filename = tempfile(), width = width %||% 640, height = height %||% 480)
on.exit(grDevices::dev.off(), add = TRUE)
```

So to fix my snapshot inconsistencies with `ggplotly()` the solution was simple: Always include `width=` and `height=` arguments to the `ggplotly()` call.

## Lessons Learned

In hindsight, the fact that `width=` and `height=` arguments are needed to create consistent snapshots looks obvious -- the auto-sizing behavior is even [clearly stated](https://github.com/plotly/plotly.R/blob/e04eb4f08c325846d8cdedb9892332b85e16465d/R/ggplotly.R#L6) in the `ggplotly()` documentation!

To my credit though, I (incorrectly, but reasonably) assumed that any auto-sizing would be computed based on the `<div>` containing the plot in the rendered HTML... Not the current state of the Plots tab in the RStudio session!

But now, after digging in, I can see why that doesn't make sense: Because `ggplot()` makes formatting decisions based on the size of the destination container for the plot it is rendering, `ggplotly()` needs a container size specified ahead of time to make those conversions.

This means in Shiny contexts, it's probably **always** a good idea to specify `width=` and `height=` arguments to `ggplotly()`. At first glance, it may seem like you can control the dimensions of your plot via the `width=` and `height=` arguments to `plotlyOutput()`, but these only set the dimensions of the containing `<div>`. It's so counter-intuitive that the appearance of a plot in your Shiny app would be influenced by the size of your Plots pane in the RStudio session running the Shiny app, but that's how it works!

Perhaps the most valuable lesson in all this for me was learning that graphics devices in R represent a key source of environmental state that can cause identical code to produce inconsistent results. They have been firmly added to my mental checklist now, alongside environment variables, random seeds, and all the other usual suspects!
