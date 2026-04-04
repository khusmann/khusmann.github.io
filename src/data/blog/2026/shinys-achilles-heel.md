---
author: Kyle Husmann
pubDatetime: 2026-04-04T08:00:00-07:00
title: "Shiny's Achilles Heel: The Unnecessary UI/Server Split"
slug: shinys-achilles-heel
featured: false
draft: true
tags:
  - r
  - shiny
description:
---

If you've done extensive development in Shiny, you know the pain. For simple dashboards, Shiny works great: you define your UI layout, hook up a reactive data pipeline between your inputs and outputs, and ship it. Your client is happy. But then the requests start coming in.

"Can we hide this panel when nothing's selected?" "Can we add a dropdown that changes which filters are shown?" No problem, you say, and wire up some `uiOutput()` / `renderUI()` pairs. The client is happy, but then they want more.

"Can users add and remove their own cards?" "Can we make the sidebar reorganize itself based on what step they're on?" Ok, so now you're reaching for `shinyjs` to run jQuery expressions client-side, using `insertUI()` and `removeUI()` to manage dynamic elements...

But now you need the inserted UI to be reactive, so you need nested observers. Now you need to manually manage the lifecycle of those observers to avoid phantom clicks and memory leaks and other [surprising behavior](/posts/2025/shiny-dynamic-observers/).

Pretty soon, your project is a brittle mess of workarounds and hacks. Adding new features risks creating oscillating updates or cascades of rerenders. You're spending more time fighting the framework than building your app.

I call this Shiny's "complexity wall". Simple apps are a joy. But as soon as your UI needs to be genuinely dynamic -- responding to user actions by restructuring itself, not just updating values -- you hit a cliff.

## The Root Cause

The standard advice for managing this complexity is to use [Shiny modules](https://mastering-shiny.org/scaling-modules.html). And modules do help with organizing code. But they don't address the fundamental issue.

The real problem is the UI/server split itself.

In Shiny, every piece of your app lives in one of two places: a UI function that defines structure, and a server function that defines behavior. These two halves communicate through string IDs -- you put `textOutput("result")` in your UI and `output$result <- renderText(...)` in your server, and Shiny matches them up by name.

For static layouts, this works fine. The UI is declared once, the server hooks into it, and everything is clean. But dynamic UIs break this contract. When your UI needs to change shape at runtime, you're forced to generate UI _from the server_ (via `renderUI`) and then somehow wire up reactive behavior for the things you just generated. You end up with server code that generates UI that references other server code. The clean separation that made simple apps elegant becomes a liability.

Modules don't fix this -- they don't even fully contain it. Each module still has its own `ui`/`server` pair, its own string IDs (now wrapped in `ns()`), and its own version of the same structural tension. Worse, there's no lifecycle management: when you remove a module's UI, its server-side observers [keep firing](https://github.com/rstudio/shiny/issues/2281), its inputs [linger as ghosts](https://github.com/rstudio/shiny/issues/2374), and there are no [hooks](https://github.com/rstudio/shiny/issues/3812) to clean any of it up.

## Shiny Came Before Components

Shiny was released in 2012 -- before React (2013), before the entire modern web learned the lesson that UI is best expressed as composable, self-contained components that own both their structure and their behavior.

In React, a component is a function. It returns what to render, holds its own state, and responds to events -- all in one place. There's no separate "UI definition" and "behavior definition" that you wire together with string IDs. This isn't just an ergonomic preference; it's what makes components genuinely composable. You can pass them around, nest them, reuse them, and reason about them locally.

Shiny doesn't have this. And as a result, as your UI gets more dynamic, you're essentially fighting to build component-like patterns on top of a framework that was never designed for them.

## A Way Forward

This is why I built [irid](https://irid.kylehusmann.com). It's an R package that brings fine-grained, component-based reactivity to Shiny -- without leaving the Shiny ecosystem.

In irid, a component is a function that returns a tag tree. State lives right next to the markup that uses it. Any tag attribute can be made reactive by passing a function instead of a value, and irid surgically updates just that attribute -- no re-rendering of the surrounding DOM. There are no string IDs to manage, no separate UI and server definitions to keep in sync.

Here's what a simple counter looks like:

```r
library(irid)

Counter <- function() {
  count <- reactiveVal(0)

  tags$div(
    tags$p("Count: ", count),
    tags$button(
      "Increment",
      onClick = \(ev) count(count() + 1)
    )
  )
}

iridApp(Counter)
```

State, markup, and event handling -- all in one function. You can compose these, nest them, pass reactive values between them. The things that required `renderUI` and nested observers and lifecycle management in standard Shiny just... work.

irid integrates with existing Shiny apps through `iridOutput()` / `renderIrid()`, so you can adopt it incrementally. You don't have to rewrite your app -- you can start using components in the places where Shiny's complexity wall hits hardest.

If you've felt the pain I described at the top of this post, [give irid a look](https://irid.kylehusmann.com). I think you'll find it changes your relationship with Shiny for the better.
