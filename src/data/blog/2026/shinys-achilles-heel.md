---
author: Kyle Husmann
pubDatetime: 2026-04-04T08:00:00-07:00
title: "Shiny's Achilles Heel: The UI/Server Split"
slug: shinys-achilles-heel
featured: false
draft: true
tags:
  - r
  - shiny
description: "Shiny's UI/server split is the root cause of nearly every headache in large, dynamic apps. My new package irid removes the split entirely."
---

If you've done extensive development in Shiny, you know the pain. For simple dashboards, Shiny works great: you define your UI layout, hook up a reactive data pipeline between your inputs and outputs, and ship it. Your client is happy.

But then the requests start coming in.

> Hide this panel when nothing's selected.

> Add a dropdown that changes which filters are shown.

No problem, you say, and wire up some `uiOutput()` / `renderUI()` pairs. The client is happy, but then they want more.

> Let users add and remove their own cards.

> Make the sidebar reorganize itself based on what step they're on.

Ok, so now you're reaching for `insertUI()` and `removeUI()` to manage dynamic elements...

...But the inserted UI needs to be reactive, so you add nested observers -- and now you're manually managing their lifecycle to avoid phantom clicks, memory leaks, and other [surprising behavior](/posts/2025/shiny-dynamic-observers/). You start offloading what you can into the client by using `shinyjs` to run jQuery expressions client-side.

Pretty soon, your project is a brittle mess of workarounds and hacks. You're writing more Javascript than R now. Wasn't Shiny supposed to save you from that?

I call this Shiny's "complexity wall". Simple apps are a joy. But as soon as your UI needs to restructure itself at runtime, you hit a cliff.

## The Root Cause

The standard advice is to use [Shiny modules](https://mastering-shiny.org/scaling-modules.html). And modules genuinely help -- they encapsulate local state, compose, take reactives in, return reactives out.

But they only get you halfway. A module is still two functions called in two different places: a UI function dropped into the UI tree, and a server function called in the server body, linked by a shared string ID. You can't pass a module instance around as a value. You can't iterate over a list and mount one per item.

Fixed-UI apps call each module once at startup, so it doesn't matter. Dynamic apps have to mount and unmount them on the fly, and suddenly it does.

The deeper issue is the UI/server split itself: structure gets declared in one place, behavior in another, and string IDs thread them together by name. When structure has to react to state, you're forced to generate UI _from the server_ (via `renderUI` or `insertUI`) and wire up reactive behavior for things that didn't exist a moment ago.

Server code ends up generating UI that references other server code. That's when [the workarounds start piling up](/posts/2025/shiny-dynamic-observers/).

## What Shiny Got Right

Shiny got half of modern UI right -- and did it early. Its reactive primitives auto-track dependencies and propagate changes, the same core idea behind the "signals" model [Solid.js](https://www.solidjs.com/) popularized almost a decade later.

What Shiny missed at its conception is the other half: the component model that [React](https://react.dev/) would later crystallize. A component owns its structure, state, and behavior all in one place -- no separate UI and behavior halves wired together by string ID. That's what makes components composable: you can pass them around, nest them, iterate over them, conditionally render them, and still reason about them locally.

Without one, dynamic UI becomes a fight -- building component-like patterns on a framework that was never designed for them.

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

<a href="https://irid.kylehusmann.com/apps/counter/index.html?_shinylive-mode=editor-terminal-viewer" target="_blank" rel="noopener">Try it live →</a>

Three things to notice here: `count` appears as a reactive text child inside `tags$p()`, the button's `disabled` attribute is a function that re-evaluates whenever `count` changes, and `onClick` is wired directly on the tag -- no observers, no input / output IDs, no `updateActionButton()` or `observeEvent()`.

If you're a Shiny developer, you might recoil at the idea of reactive values scattered throughout your markup -- won't this explode the DOM on every change? Reset cursor position, lose focus, restart animations?

That's `renderUI()`'s world. irid's updates are surgical: the browser gets "set this value here" and applies it to the existing DOM node in place. Nothing around it moves, and only the changed value crosses the wire.

No UI/server split, no string IDs, no lifecycle to manage -- and once that's gone, a whole category of Shiny pain points just unravels. They don't need to be solved; they stop existing. Let's look at a few.

## What This Unlocks

### Composing Components

Say you want two counters side by side with a running total, each with its own Reset button, plus a Reset All button that disables itself when both counts are zero. In Shiny, the standard way to do this is with modules. Each counter gets a UI function and a server function, linked by a namespaced ID:

```r
library(shiny)
library(bslib)

counterUI <- function(id, label) {
  ns <- NS(id)
  card(
    card_header(label),
    card_body(
      tags$h2(class = "text-center", textOutput(ns("display"))),
      sliderInput(ns("value"), NULL, min = 0, max = 100, value = 0),
      actionButton(ns("reset"), "Reset")
    )
  )
}

counterServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$display <- renderText(paste("Count:", input$value))
    observeEvent(input$reset, {
      updateSliderInput(session, "value", value = 0)
    })
    observe({
      shinyjs::toggleState("reset", input$value != 0)
    })
    list(
      value = reactive(input$value),
      reset = function() updateSliderInput(session, "value", value = 0)
    )
  })
}

ui <- page_fluid(
  shinyjs::useShinyjs(),
  tags$h3(class = "text-center", textOutput("total")),
  layout_columns(
    counterUI("a", "A"),
    counterUI("b", "B")
  ),
  actionButton("reset_all", "Reset All")
)

server <- function(input, output, session) {
  count_a <- counterServer("a")
  count_b <- counterServer("b")
  output$total <- renderText(paste("Total:", count_a$value() + count_b$value()))
  observeEvent(input$reset_all, {
    count_a$reset()
    count_b$reset()
  })
  observe({
    shinyjs::toggleState("reset_all", count_a$value() != 0 || count_b$value() != 0)
  })
}

shinyApp(ui, server)
```

<a href="https://shinylive.io/r/editor/#code=NobwRAdghgtgpmAXGKAHVA6ASmANGAYwHsIAXOMpMAGwEsAjAJykYE8AKAZwAtaJWAlAB0IdJiw71OY4RBHEArmTiMAqgEkABAB4AtJoBmSgqVol2tACa5N1KPTjUBmkCM2aInHfoByAZQtLWXcCFkt2N3dNUMZLAH1uOChLFXY7BydcSJCwuPoiSw5sqNIoAHNOABJuACZ2AjtOLwBeTSEwcgAPUl0CCnJGdpsu0gB5BVJUCfZPCLBLWk5UO1Z2gXWsiCio6SsVdQgp0hnOOYA3KGoFODWbH1UAGQebGD5NVoAGF6hO980ARg+X00FyucD+HwEm227igJjMEAAQhNSOZZu1GHBOHBSLc2mAsFicWtisFNLIAL4ieREJQDPwqM4qbyGYymcxWZyuLaaGAFBTUOAMxhMxiBGxGCDwjmHCY2WmTOWabFNBFc4oKo6VBZLFYszEQFKMAAqcG67FQUE45DmAGFaWREENNHwtaDrusNVJGXAAKJMsgWWWkSqY7GkGzcmGaBSoSxQch+OhGg5HLhYzgImztd03PAgy7XCFk9wUkuaIjekVwdhRmE8PisABWnEQiFRZTKgr8pRtGKJuPzromlVzmgAhJ9y2XinRrREedsx61MXDTEyg27C3AocV3GGcX9JdKIOxnLH44nk-tg+nVSRs2Bc87l5pIaTIjOIFS5BAFLQWUtMo4DiAwrisBd3AbfgWzbBRsT8XgYNOXceVKCpqgAZnqRoWnxEZen6FRnRGcZFWOdpUVKag1lQ9wVgVOJiCuGB0UXaIHQGDQ5igZ12gAQVuYpFGUNR1Dmeg+LARESR5OjNDXBFkVIVFT37cM4kuGj83aQlw00fjqG02RZBEbFq0YFlj3ZU9hwjCsJiOGwVUzEh1R5ETSE0llPJUYVRR42SQk4vIfM4vyfTFdpJLAMlNRHKjLn1CgjVNc1LWtGt2mNIhqKdfNPM00dtzPTQAGoOLpPJirBM9PR5StzKZf1+k3EcDy8rTI2EkKoFDAczx6qr6H68NBp5L93Ean1a2KaDm1bdsiE7bteyysAOs0oznUKvrc1Kyc300AAfY7KrIar9ucQ73wmylqU8JDWH49B2H-ZzIoEMAKQAXSAA" target="_blank" rel="noopener">Try it live →</a>

Notice everything you have to coordinate: string IDs passed into `NS()`, a UI function and a server function that must agree on those IDs, `updateSliderInput()` to push a value back into an input, and a list returned from the module so the parent can read the count _and_ reach back in to reset it. Disabling the Reset All button when both counts hit zero needs yet another observer calling `shinyjs::toggleState()`, because `actionButton()` has no reactive `disabled` attribute.

The parent doesn't own the counter's state -- the module does -- so anything the parent wants to do with that state (read it, reset it, react to it) has to be threaded back out through the module's return value and then plumbed through an observer.

Here's the same thing in irid:

```r
library(irid)
library(bslib)

Counter <- function(label, count) {
  card(
    card_header(label),
    card_body(
      tags$h2(class = "text-center", \() paste("Count:", count())),
      tags$input(
        type = "range", min = 0, max = 100,
        value = count,
        onInput = \(event) count(event$valueAsNumber)
      ),
      tags$button(
        class = "btn btn-outline-secondary btn-sm",
        disabled = \() count() == 0,
        onClick = \() count(0),
        "Reset"
      )
    )
  )
}

App <- function() {
  count_a <- reactiveVal(0)
  count_b <- reactiveVal(0)
  total <- \() count_a() + count_b()

  reset_all <- \() {
    count_a(0)
    count_b(0)
  }

  page_fluid(
    tags$h3(class = "text-center", \() paste("Total:", total())),
    layout_columns(
      Counter("A", count_a),
      Counter("B", count_b)
    ),
    tags$button(
      class = "btn btn-outline-primary",
      disabled = \() count_a() == 0 && count_b() == 0,
      onClick = reset_all,
      "Reset All"
    )
  )
}

iridApp(App)
```

<a href="https://irid.kylehusmann.com/apps/composing/index.html?_shinylive-mode=editor-terminal-viewer" target="_blank" rel="noopener">Try it live →</a>

`Counter` is just a function that takes a `reactiveVal` and returns a tag tree. The parent owns the state, passes it down, and the child reads and writes it directly through the same reactive reference. The Reset All button is short because the parent already holds both counts -- no return-value plumbing, no `updateSliderInput()` reaching back into the module, no `shinyjs::toggleState()` observer wired up on the side.

Look closer at the slider itself: its `value` reads from `count` and its `onInput` writes back to the same reactive. The input doesn't own its state -- it's just a view of the parent's `reactiveVal`. More on that shortly.

### Controlled Inputs

Say you want a temperature converter: a Celsius slider and a Fahrenheit slider, where editing either one updates the other. Two inputs, one underlying value.

In Shiny, each `sliderInput()` owns its own state. To keep them in sync you write two `observeEvent()`s -- one watching Celsius, one watching Fahrenheit -- each calling `updateSliderInput()` on the other. Now you have a feedback loop: updating Fahrenheit fires Celsius's observer, which updates Fahrenheit, which fires its observer again. The usual fix is `freezeReactiveValue()` or an `isolate()` guard, plus careful rounding so the values settle. It works, but you're writing plumbing to stop the inputs from fighting each other.

The root problem is that the input _is_ the state. You can't have two inputs share one value -- you can only have two values that chase each other.

In irid, an input's `value` attribute can be bound to a `reactiveVal`, and that `reactiveVal` becomes the single source of truth. The input displays it, writes to it, and re-renders when it changes -- no feedback loop, because there's only one value:

```r
library(irid)

c_to_f <- function(c) round(c * 9 / 5 + 32, 1)
f_to_c <- function(f) round((f - 32) * 5 / 9, 1)

Thermometer <- function(label, value, on_change, min, max) {
  tags$div(
    tags$label(label),
    tags$input(
      type = "range", min = min, max = max,
      value = value,
      onInput = \(event) on_change(event$valueAsNumber)
    )
  )
}

App <- function() {
  celsius <- reactiveVal(20)
  fahrenheit <- \() c_to_f(celsius())

  tags$div(
    Thermometer("Celsius", celsius, celsius, -40, 60),
    Thermometer("Fahrenheit", fahrenheit, \(f) celsius(f_to_c(f)), -40, 140)
  )
}

iridApp(App)
```

<a href="https://irid.kylehusmann.com/apps/temperature/index.html?_shinylive-mode=editor-terminal-viewer" target="_blank" rel="noopener">Try it live →</a>

Celsius is the canonical value. Fahrenheit is a function that derives from it. The Celsius thermometer reads and writes `celsius` directly; the Fahrenheit thermometer reads the derived value and writes back through `f_to_c()`. Both stay in sync because they're views of the same underlying state, not independent inputs that have to be reconciled.

This also makes re-hydration trivial. Because the `reactiveVal` _is_ the state, restoring a saved session is just calling `celsius(saved_value)` -- the inputs follow. No `updateSliderInput()` calls, no Shiny bookmark gymnastics to thread state back through each widget's own internal store.

### Dynamic UI

I wrote about this pain in detail [previously](/posts/2025/shiny-dynamic-observers/), walking through an example where users select a list of columns and each one gets a card with a close button. In Shiny, that escalates two ways. Every new card needs a nested `observeEvent()` created inside the parent observer that spawned it, wired to a string ID generated on the fly. And when the card goes away, that observer keeps firing as a ghost, with stale inputs lingering in server memory.

In irid, the same thing is a function and a `reactiveVal`:

```r
library(irid)

Card <- function(col, on_close) {
  tags$div(
    class = "card",
    tags$strong(col),
    tags$button(onClick = on_close, "\u00d7")
  )
}

App <- function() {
  selected_columns <- reactiveVal(character(0))

  tags$div(
    # ...add-back UI...
    Each(selected_columns, \(col) {
      Card(
        col,
        on_close = \() selected_columns(setdiff(selected_columns(), col))
      )
    })
  )
}

iridApp(App)
```

The live demo wraps this component in a dataset selector and column dropdown to match the original scenario:

<a href="https://irid.kylehusmann.com/apps/cards/index.html?_shinylive-mode=editor-terminal-viewer" target="_blank" rel="noopener">Try it live →</a>

`Card` doesn't know about the list -- just takes a column name and a close callback. The parent owns `selected_columns` and iterates with [`Each()`](https://irid.kylehusmann.com/reference/Each.html), which mounts a card when an item is added and tears it down when one is removed.

The `onClick` handler lives inside the card, so when the card unmounts it goes with it -- no nested `observeEvent()` to create, no string ID to generate, nothing to wire up by hand. Reactive attributes and nested control flow get the same treatment: mounted with the component, torn down with it.

Conditional rendering works the same way: [`When()`](https://irid.kylehusmann.com/reference/When.html) and [`Match()`](https://irid.kylehusmann.com/reference/Match.html) mount their active branch and destroy the inactive one -- no `renderUI()` regenerating a block just to toggle a label.

As a bonus, here's a [todo list example](https://irid.kylehusmann.com/apps/todo/index.html?_shinylive-mode=editor-terminal-viewer) that uses the same pattern.

## Try It Out

irid can be used in two ways: [`iridApp()`](https://irid.kylehusmann.com/reference/iridApp.html) for new projects or full migrations, or [`iridOutput()`](https://irid.kylehusmann.com/reference/iridOutput.html) / [`renderIrid()`](https://irid.kylehusmann.com/reference/renderIrid.html) to embed components into an existing Shiny app. With the embedded path, you don't have to do it all at once -- start with the places where Shiny's complexity wall hits hardest, and grow from there.

Heads up: I think the core API is stable, but no guarantees. It's also pretty bare-bones right now -- next step is adding reactive "stores" like [Solid.js](https://docs.solidjs.com/concepts/stores). But what's there should be enough to do some pretty cool stuff.

I'm releasing it now because feedback from people actually building with it is how it matures. If you hit a bug or want a feature, please [open an issue](https://github.com/khusmann/irid/issues). I'll be actively working through them.

If you've felt the pain at the top of this post, [give irid a try](https://irid.kylehusmann.com). I think you'll find that the component model is what Shiny's reactive engine was waiting for.
