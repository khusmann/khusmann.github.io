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

If you've used React, you already know the core idea that Shiny is missing: a component owns its structure, state, and behavior all in one place. No separate "UI definition" and "behavior definition" wired together with brittle string IDs. This is what makes components genuinely composable -- you can pass them around, nest them, reuse them, and reason about them locally.

But here's the thing -- Shiny got a different part of the puzzle right _first_. It was released in 2012 with reactive primitives that automatically track dependencies and propagate changes. The mainstream frontend world wouldn't arrive at a similar model until [Solid.js](https://www.solidjs.com/) in 2021, nearly a decade later. Shiny's reactivity was genuinely ahead of its time.

What it never picked up is the component model to go with it. And without that, as your UI gets more dynamic, you're fighting to build component-like patterns on top of a framework that was never designed for them.

## A Way Forward

This is why I built [irid](https://irid.kylehusmann.com). It's an R package that brings fine-grained, component-based reactivity to Shiny -- without leaving the Shiny ecosystem.

In irid, a component is a function that returns a tag tree. State lives right next to the markup that uses it. Any tag attribute can be made reactive by passing a function instead of a value. There are no string IDs to manage, no separate UI and server definitions to keep in sync.

Here's what a simple counter looks like:

```r
library(irid)

Counter <- function() {
  count <- reactiveVal(0)

  tags$div(
    tags$p("Count: ", count),
    tags$button(
      "Increment",
      disabled = \() count() >= 10,
      onClick = \(ev) count(count() + 1)
    )
  )
}

iridApp(Counter)
```

Three things to notice here: `count` appears as a reactive text child inside `tags$p()`, the button's `disabled` attribute is a function that re-evaluates whenever `count` changes, and `onClick` is wired directly on the tag -- no observers, no input / output IDs, no `updateActionButton()` or `observeEvent()`.

If you're a Shiny developer, you might recoil at the idea of reactive values scattered throughout your markup -- won't this explode the DOM on every change? Reset cursor position, lose focus, restart animations? That's `renderUI()`'s world. irid's updates are surgical: the browser gets "set this value here" and applies it to the existing DOM node in place. Nothing around it moves, and only the changed value crosses the wire.

No UI/server split, no string IDs, no lifecycle to manage -- and once that's gone, a whole category of Shiny pain points just unravels. They don't need to be solved; they stop existing. Let's look at a few.

## What This Unlocks

### Composing Components

TODO: Show how Shiny modules require ui/server pairs, ns() wiring, string IDs to communicate between modules. Then show irid components as plain functions that accept and return reactive values -- composable without boilerplate.

### Dynamic UI

TODO: Show the Shiny pain of insertUI/removeUI, renderUI, and the lifecycle problems they cause (dangling observers, ghost inputs). Show irid's control flow primitives -- When(), Each(), Match()/Case() -- that handle conditional and list rendering declaratively, with automatic cleanup. And because any attribute can be reactive, you don't need renderUI or custom JS just to toggle a class or disable a button.

### Controlled Inputs

TODO: Show the Shiny pain of updateXxxInput / freezeReactiveValue when you need two-way binding or multiple inputs sharing state. Then show irid's controlled inputs where binding a reactiveVal to an input's value attribute makes it the single source of truth.

### Bookmarkable State

TODO: Show how Shiny's bookmark system is limited to input values and requires explicit exclude/onBookmark/onRestore handling. Then show how irid's approach simplifies this.

## A Better Target for LLMs

TODO: The UI/server split is hard for humans, and LLMs don't eliminate that complexity -- they just raise the ceiling on how much of it you can tolerate before things fall apart. Generating a Shiny app still requires coordinating two separate code locations linked by string IDs, managing observer lifecycles, knowing when to use renderUI vs updateXxxInput vs custom JS. irid's component model is a much better target for AI code generation: self-contained functions with local state, no string ID wiring, no lifecycle footguns. And because irid components sit one step away from React/Solid -- patterns LLMs have seen millions of times in training -- the model's existing knowledge transfers directly. Simpler to generate, simpler to verify.

## Try It Out

irid can be used in two ways: `iridApp()` for new projects or full migrations, or `iridOutput()` / `renderIrid()` to embed components into an existing Shiny app. With the embedded path, you don't have to do it all at once -- start with the places where Shiny's complexity wall hits hardest, and grow from there.

Heads up: irid is still early -- the API isn't stable yet, and rough edges are likely. I'm releasing it now because feedback from people actually building with it is how it matures. If you hit a bug or want a feature, please [open an issue](https://github.com/khusmann/irid/issues). I'll be actively working through them.

If you've felt the pain at the top of this post, [give irid a try](https://irid.kylehusmann.com). I think you'll find that the component model is what Shiny's reactive engine was waiting for.
