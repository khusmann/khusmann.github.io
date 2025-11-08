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

Automated testing in R. What it's for.

I'm used to controlling the following aspects of environment:

- Environment variables
- R `options()`
- Random seeds
- Attached packages / package versions
- Locale differences across platforms
- Differences in fonts, DPI, subpixel calculations, etc. across platforms

This week I stumbled on another source of context that can create differences across runs: R graphics devices.

## The Story

I was working on a project where I was creating automated tests for plotly plots. Because plotly was involved I couldn't use vdiffr. So I would build the plot then capture it via webshot2.

But I was getting slightly different results depending on if I ran it in my RStudio session via `devtools::test()` vs in the context of `devtools::check()`. `devtools::check()` forks a clean R subprocess to do its check to provide consistency across runs. But my snapshots differed by a few pixels here and there in margins and sizes. There was something different between my RStudio session environment and the forked callr environment.

I've tracked down differences such as these before -- [in one case](https://github.com/tidyverse/tibble/issues/1662), I literally found a branch in `tibble()` that would create significantly different behavior if it detected an RSTUDIO environment variable or not.

But this case was not so easy -- I checked environment variables, `options()`, attached packages for potential offenders / hints but could not find a thing. It wasn't a cross-platform issue because I was running on the same machine... what could it be?

## The Cause

As you might have guessed from the title, I eventually tracked it down the differences to the current state of the graphics device. My plotly plots were being created with `ggplotly()`, which uses `grid::convert*()` to convert ggplot
grid units to mm / px used by plotly. You can easily repeat the heart of the issue by running the following in RStudio:

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
