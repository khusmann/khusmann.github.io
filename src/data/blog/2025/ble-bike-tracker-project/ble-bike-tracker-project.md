---
author: Kyle Husmann
pubDatetime: 2025-11-08T11:30:00-08:00
title: "I Put an ESP32 in My Stationary Bike (And Made an App for It)"
slug: ble-bike-tracker-project
featured: true
draft: true
tags:
  - project
  - 3dprinting
  - software
  - hardware
  - microcontrollers
  - mobile apps
  - micropython
  - kotlin
description: I opened up my cheap stationary bike, wired an ESP32 to the reed switch sensor, and then built an Android app to sync my workouts to Google Health Connect
---

A big pet-peeve of mine is hardware that requires proprietary software to function. I hate it for a number of reasons:

- It doesn't last -- when the software goes out of date and no longer runs on current systems, I have to throw the hardware away
- I can't extend it or hook into it with my own projects
- The software is usually low quality and crappy

I go to great lengths to avoid buying or using things that require proprietary apps. For example, I reverse engineered the Bluetooth protocol for a ham radio I got and wrote an entire open source library for controlling it so I didn't have to use the manufacturer's app: https://benlink.kylehusmann.com/benlink.html

So when I got myself a stationary bike, I specifically got a "dumb" one. I didn't want a fancy bluetooth-enabled thing that would require an app to use.

But after a while, I started wishing the bike could collect analytics so I could track my progress over time.

The solution? Open up my cheap stationary bike and put an ESP32 in it. I wired the microcontroller to the bike's reed switch sensor (which triggers once per wheel rotation to track cadence), designed and 3D-printed an enclosure for the electronics, wrote MicroPython firmware to log rides, and built an Android app to sync my workout data to Google Health Connect.

Now I have a smart bike that actually works the way I want it to -- and I control the entire stack.

## Opening the Bike
