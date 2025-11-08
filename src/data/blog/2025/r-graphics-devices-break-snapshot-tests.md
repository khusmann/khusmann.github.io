---
author: Kyle Husmann
pubDatetime: 2025-11-08T11:30:00-08:00
title: "PSA: R Graphics Devices Can Break Snapshot Tests"
slug: r-graphics-devices-break-snapshot-tests
featured: true
draft: false
tags:
  - r
  - software
  - tips
description: The state of your graphics device can be a surprising source of inconsistent results across test runs in R.
---

If you've ever written snapshot tests in R, you know the frustration: tests that produce different results in different environments.

Most R developers are familiar with the usual suspects that cause test inconsistencies: environment variables, `options()`, random seeds, package versions, and platform-specific differences in architecture, fonts or rendering.

Over the years I've seen a lot of weird edge cases that fall into the above categories. A few months ago, for example, I traced test inconsistencies back to code in `tibble()` that branched on the presence of an `RSTUDIO` environment variable ([link](https://github.com/tidyverse/tibble/issues/1662)).

But this week I discovered a new culprit that wasn't on my radar: the state of R's current graphics device. It turns out that the size and configuration of your current graphics device, including the dimensions of RStudio's Plots pane, can silently affect the results of your code when you least expect it!

## The Mystery

I was writing automated tests for plotly plots. Since plotly outputs interactive HTML rather than static vector graphics, I couldn't use [vdiffr](https://vdiffr.r-lib.org/) for snapshot testing. Instead, I'd render the plotly plots to temporary HTML files via `htmltools::save_html()` and then screenshot the result via webshot2. (I would have preferred using `plotly::save_image()`, but was working in a managed environment where kaleido wasn't installed)

The tests would pass when I ran them interactively with `devtools::test()`, but fail when running via `devtools::check()`. The snapshots differed by a few pixels in margins and element sizes... not much, but enough to fail. Since `devtools::check()` runs in a clean subprocess, something about my interactive RStudio session was affecting the results.

I started my usual investigation: environment variables, `options()`, attached packages. Nothing stood out. This wasn't a cross-platform issue, I was running everything on the same machine. What could possibly be different?

## The Cause

As you might have guessed from the title, I eventually tracked it down the differences to the current state of the graphics device. The plotly plots were being created with `ggplotly()`, which uses `grid::convert*()` to convert ggplot
grid units to mm / px used by plotly. You can easily replicate the heart of the issue by running the following in RStudio:

```r
grid::convertX(grid::unit(1, "npc"), "mm")
```

Now resize your viewer pane and run it again... you'll get a different result! Similarly, if you run in a clean subprocess via callr (as `devtools::check()` does), you'll also (likely) get a different result:

```r
callr::r(\() grid::convertX(grid::unit(1, "npc"), "mm"))
```

`plotly::ggplotly()` makes extensive use of these unit conversions ([source](https://github.com/plotly/plotly.R/blob/e04eb4f08c325846d8cdedb9892332b85e16465d/R/ggplotly.R#L1192)). So the results of my snapshot tests were depending on the size of the current open viewing window (or the default graphics device in the callr process)!

## The Solution

To fix this, you can manually specify a graphics device to ensure the conversion calculations are always the same:

```r
foo <- function() {
  withr::local_png(tempfile(), type = "cairo")
  grid::convertX(grid::unit(1, "npc"), "mm")
}
```

(We use `type = "cairo"` to hopefully get some additional cross-platform consistency, but I haven't tested the limits of this myself. You may also consider using the [ragg package](https://ragg.r-lib.org/) for this)

Try running it with different viewer window sizes, or inside a callr subprocess, and you should get the same values:

```r
foo()
callr::r(foo)
```

This lends itself to an elegant solution for your testthat environment. In `tests/testthat/setup.R`, all you need to add is this:

```r
withr::local_png(tempfile(), type = "cairo", .local_envir = teardown_env())
```

And now all your tests will run with a consistent graphics device! (Assuming your code is well-behaved and doesn't mutate the graphics environment)

## Final Thoughts

They say the definition of insanity is doing the same thing but expecting different results. Despite computers being deterministic machines, it can be surprsingly difficult to get the same code to produce the same results across runs.

I expect this will be one of those posts that will be only interesting to a few people, but I'm putting it here to get the general knowledge out: TIL graphics devices are an important source of context to be managed across runs if you are looking for reproducability!
