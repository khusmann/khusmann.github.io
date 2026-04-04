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

If you've done extensive development in Shiny, you know the pain. For simple dashboards, Shiny works great: you create your UI layout and then hook up a reactive data pipeline between your inputs and outputs. Your client is happy. But then the requests start coming in.

"", "", "". No problem, you say, and put in some `UIOutput()` / `renderUI()` pairs. The client is happy, but then they want more.

"", "", "". Ok, so you start using `shinyjs` to run JQuery expressions client-side, you start using `insertUI()` and `removeUI()`...

But now you need the inserted UI to be reactive, so you need nested observers. Now you need to manage the lifecycle of your observers to avoid memory leaks and phantom clicks and other surprising behavior. (https://www.kylehusmann.com/posts/2025/shiny-dynamic-observers/)

Pretty soon, your project is a brittle mess of workarounds and hacks. Adding new features risks updates that create oscilating updates or cascades of rerenders.
