---
author: Kyle Husmann
pubDatetime: 2026-01-07T11:30:00-07:00
title: "A Perfectly Aligned AI Is A Copy of You"
slug: perfectly-aligned-ai-copy-of-you
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

Most conversations I've heard around "alignment" focus on issues at a grand scale, like Miles' interview. The concern is that we have no way to tell the difference between an agent that is truly aligned with our intents and goals, and one that just _appeared_ aligned on the surface while secretly plotting our demise. Call this the problem of "deep alignment": the ability for _us_ to know an agent's true intents and goals.

But there's another alignment problem -- one that's easier to overlook because it seems so much more tractable. Call it "shallow alignment": the ability for an agent to know and act in accordance with _our_ intents and goals, independent of whether they have deeper ulterior motives. Deep alignment is necessary for safety; shallow alignment is necessary for capability.

## Perfect Alignment Is A Copy Of You

As a thought experiment, let's imagine what a perfectly aligned agent would be, according to Miles' definition: an agent that shares an identical ordering over world states as you do, and no ulterior goals or motives. So perfectly aligned, both deep and shallow.

If this existed in a coding assistant, it would be seamless to work with. It would know, out of the box, exactly what I wanted to build and how I wanted to build it. It wouldn't require endless tweaking to its `CLAUDE.md` and loading up its context window, because it would already be attuned to my preferences and styles and goals.

What would this require? A complete understanding of everything that shaped me -- all my life experiences leading to this moment, how they were absorbed through my biology into my current mental state. Or alternatively, a way to directly read my internal neural weights and predict from there.

Either way, predicting my preference for world state ordering requires a model of _me_. And for that model to be deeply aligned -- to not have ulterior motives -- it would need to be a literal _copy_ of me, that is, something with no additional goals or preferences beyond what I already have.

## Back to The Present Reality

This thought experiment might seem abstract, but it helps explain why my experience with Claude Code feels the way it does. LLMs aren't -- and can't be -- perfect models of individuals. They're trained on massive datasets of human behavior, making them models of _humans in aggregate_. An LLM can only be aligned with me insofar as I happen to align with the aggregate patterns in its training data.

This is why agentic coding currently requires such finesse in context and prompting. Without context, an LLM essentially returns "what would humans typically write here": a prediction grounded in aggregate patterns.

To get what _I_ want, I have to condition those probabilities through context: "You're an experienced Python developer. Here's the current codebase. Here's the function you're writing. Now, given all that, what comes next?" I'm conditioning the model to shift from aggregate patterns in its corpus toward my specific situation and goals. In a very real sense, prompting and context engineering _is_ alignment.

It's worth noting that LLMs work as well as they do for programming precisely because "what a typical software engineer would do" often aligns with what I want. Code has conventions, shared patterns, established best practices. So I can typically get what I want with the right context. But this will start to break down for less conventional tasks, or domains where preferences diverge more (like individual values!).

It's important to note that no amount of training in aggregate will eliminate this gap. You can't derive individual-level predictions from population-level patterns without losing information. Context and prompting help, but they're still constrained by what the model learned from aggregate data. The mismatch between population patterns and individual cases is fundamental: aggregate models are optimized for typical cases, not for you and your current context.

In other words, true alignment to _you and your intents and goals_ requires personalized training: a model whose weights update based on interactions with _you in your context specifically_.

## TBA

Takeaways:

1. An agent that is aligned to me and my context is not aligned to you and your context.

2. Generalization sacrifices individual alignment (I'll write more on this in a future post)

3. Here's the troubling part: even if we achieved perfect alignment -- a perfect model of you with no ulterior motives -- that model becomes a dangerous tool in the wrong hands. A malicious agent could run your perfectly aligned model internally, using it to predict exactly how you'll respond to any manipulation. The perfect model of you becomes the perfect tool for deceiving you.

This reveals an uncomfortable truth: a perfectly aligned model can always be used to build a malicious system. It's not sufficient for us to "solve the alignment problem" -- we must also prevent perfect alignment from falling into malicious hands.
