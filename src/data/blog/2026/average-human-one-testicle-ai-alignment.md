---
author: Kyle Husmann
pubDatetime: 2026-01-07T11:30:00-07:00
title: "The Average Human Has One Testicle (And Other Challenges For AI Alignment)"
slug: average-human-one-testicle-ai-alignment
featured: true
draft: false
tags:
  - ai
  - thoughts
description: TBA
---

The more I've been using Claude Code, the more I've started to think about AI alignment.

It surprised me, because prior to working with Claude, AI alignment felt abstract -- a problem of distant superintelligence risks or safety guardrails against harmful outputs. Not something relevant to my daily coding activities.

That changed when I recently watched an interview with AI researcher Robert Miles where he defined an "aligned" system as a system that "wants the same thing as what you want... its preference ordering over world states is the same as yours" (around [5:20 in this interview](https://youtu.be/kMLKbhY0ji0?si=JYZIarN7jPS9cUGW&t=320)).

Miles was talking about "world states" at a grand scale: the fate of the human race. But working with Claude, I've been getting hands-on experience with this same concept at a much smaller scale. In the microcosm of my work on a codebase, an aligned agent is one that understands what I want my codebase to become -- an agent that shares my preference ordering over codebase states. In this context, it's easy to see how "alignment" is inextricably linked to a model's usefulness. The more a model can anticipate what I want -- and the less context I need to provide -- the faster we can converge on my desired final product. Gavriel Cohen articulates this idea succinctly in the title of his recent post, ["Alignment is Capability"](https://www.off-policy.com/alignment-is-capability/).

Most conversations I've heard around "alignment" focus on issues at a grand scale, like Miles' interview. The concern is that we have no way to tell the difference between an agent that is truly aligned with our intents and goals, and one that just _appears_ aligned on the surface while secretly plotting our demise. Call this the problem of "deep alignment": the ability for _us_ to know an agent's true intents and goals.

But there's another alignment problem -- one that's easier to overlook because it seems so much more tractable. Call it "shallow alignment": the ability for an agent to know and act in accordance with _our_ intents and goals, independent of whether they have deeper ulterior motives. Deep alignment is necessary for safety; shallow alignment is necessary for capability.

For the rest of this post, I want to set deep alignment aside and focus on shallow alignment: the ability of an agent to model _us_, or at least the ability to predict what we'll likely want in a given situation. Most discussions I've encountered acknowledge this is hard, but treat it as an open engineering problem -- something that better architectures or more data will eventually solve. I'm not so sure.

My graduate work was in human development and family studies, where we spent a lot of time thinking about what it means to model and predict human behavior. There's an inherent tradeoff when modeling human behavior that's well-known in behavioral science but I haven't seen touched on in discussions about AI -- and I think it's fundamental to the problem of shallow alignment.

## A Perfectly Aligned AI Is A Copy Of You

As a thought experiment, let's imagine what a perfectly aligned agent would be, according to Miles' definition: an agent that shares an identical ordering over world states as you do.

If this existed in a coding assistant, it would be seamless to work with. It would know, out of the box, exactly what I wanted to build and how I wanted to build it. It wouldn't require endless tweaking to its `CLAUDE.md` and loading up its context window, because it would already be attuned to my preferences and styles and goals.

What would this require? A complete understanding of everything that shaped me -- all my life experiences leading to this moment, how they were absorbed through my biology into my current mental state. Or alternatively, a way to directly read my internal neural weights and predict from there.

Either way, predicting my preference for world state ordering requires a model of _me_. But that's not what LLMs are. LLMs are trained on massive datasets of human behavior -- they're models of _humans in aggregate_, not models of specific individuals. An LLM can only be aligned with me insofar as I happen to align with the aggregate patterns in its training data.

This is why agentic coding requires such finesse in context and prompting. Without context, an LLM essentially returns "what would humans typically write here": a prediction grounded in aggregate patterns. To get what _I_ want, I have to constrain those probabilities through context: "You're an experienced Kotlin developer. Here's the current codebase. Here's the function you're writing. Now, given all that, what comes next?" I'm conditioning the model to shift from aggregate human patterns toward my specific situation.

## The Average Human Has One Testicle

## The Ideographic-Nomothetic Continuum

## Final Thoughts

Parallel to bias variance tradeoff
