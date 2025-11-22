---
author: Kyle Husmann
pubDatetime: 2025-11-08T11:30:00-08:00
title: "I Put an ESP32 in My Stationary Bike (And Made an App for It)"
slug: ble-bike-tracker-project
featured: true
draft: true
tags:
  - project
  - software
  - hardware
  - 3dprinting
  - microcontrollers
  - mobile apps
  - micropython
  - kotlin
description: I opened up my cheap stationary bike, wired an ESP32 to the reed switch sensor, and then built an Android app to sync my workouts to Google Health Connect
---

A big pet-peeve of mine is hardware that requires proprietary software to function. I hate it for a number of reasons:

- I can't extend it or hook into it with my own projects
- The bundled software is often bloated, low quality and/or crappy
- It doesn't last -- when the software goes out of date and no longer runs on current systems, I have to throw the hardware away

I go to great lengths to ensure the hardware I buy doesn't require proprietary apps. Last year for example, I reverse engineered the Bluetooth protocol for a ham radio I got and wrote an [open source library for controlling it](https://benlink.kylehusmann.com) so I didn't have to be tied to the manufacturer's app.

So when I got myself a stationary bike, I specifically got a "dumb" one. I really didn't want a fancy bluetooth-enabled thing that would force me to download another bloated app that would require me to register an account with them, and then would promptly go out of date in a couple of years.

But after a while, I started wishing the bike could collect analytics so I could track my usage over time. _Sigh_...

My solution? Open up the bike and put an ESP32 in it.

<Put a ESP32 on it meme picture>

I wired the microcontroller to the bike's reed switch sensor (which triggers once per wheel rotation to track cadence), designed and 3D-printed an enclosure for the electronics, wrote MicroPython firmware to log rides, and built an Android app to sync my workout data to Google Health Connect.

Now I have a smart bike that actually works the way I want it to -- and I control the entire stack.

## Opening the Bike

The stationary bike in question is a [Flexispot one from Amazon](https://www.amazon.com/FLEXISPOT-Removable-Exercise-Capacity-Stationary/dp/B0FNVMWXDK) (~$230 if you catch it on sale). It has a desk so it's nice to pedal on to keep moving while working, and has a magnetic resistance system so it runs very quiet.

It has

It was easy enough to open
