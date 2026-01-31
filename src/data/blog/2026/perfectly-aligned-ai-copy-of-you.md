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
description: The better AI gets at predicting what you want, the less it looks like a tool and the more it looks like you. Maybe that's not something we want.
---

The more I've been using Claude Code, the more I've started to think about AI alignment.

It surprised me, because prior to working with Claude, AI alignment felt academic: a problem of distant superintelligence risks or safety guardrails against harmful outputs. Not something relevant to my daily coding activities.

That changed when I recently watched an interview with AI researcher Robert Miles where he defined an "aligned" system as a system that "wants the same thing as what you want... its preference ordering over world states is the same as yours" (around [5:20 in this interview](https://youtu.be/kMLKbhY0ji0?si=JYZIarN7jPS9cUGW&t=320)).

Miles was talking about "world states" at a grand scale: the fate of the human race. But working with Claude, I've been getting hands-on experience with this same concept at a much smaller scale. In the microcosm of my work on a codebase, an aligned agent is one that understands what I want my codebase to become -- an agent that shares my preference ordering over codebase states.

In this context, it's easy to see how "alignment" is inextricably linked to a model's usefulness. The more a model can anticipate what I want -- and the less context I need to provide -- the faster we can converge on my desired final product. Gavriel Cohen articulates this idea succinctly in the title of his recent post, ["Alignment is Capability"](https://www.off-policy.com/alignment-is-capability/).

So I started wondering: what would it actually take to build a perfectly aligned coding assistant? One that just knows what I want, without all the context management and prompting?

## Imagining Perfect Alignment

Let's start with Miles' definition: a perfectly aligned agent would share an identical ordering over world states as you do, with no ulterior goals or motives.

If this existed in a coding assistant, it would be seamless to work with. It would know, out of the box, exactly what I wanted to build and how I wanted to build it. It wouldn't require endless tweaking to its `CLAUDE.md` and loading up its context window, because it would already be attuned to my preferences and styles and goals.

What would this require? It would need my understanding of the current project and everything that led up to it: the problem I'm trying to solve, who the users are and what they need, the domain knowledge that shapes the solution space, the business constraints, etc. etc. But to really match my intent and preferences, it would also need to know all the code I've ever written, every project I've worked on, my formal education, the design patterns I favor, the trade-offs I typically make.

But that's still not enough to perfectly predict my intent in every situation. It still needs more context: my cognitive biases, my personality, my life circumstances. A complete understanding of everything that shaped me into this moment. Or alternatively, a way to directly read my internal neural weights and predict from there.

Either way, perfectly predicting my preference for world state ordering requires a perfect model of _me_. And for that model to not have ulterior motives -- to truly share my goals rather than just appear to -- it would need to be a literal _copy_ of me, that is, something with no additional goals or preferences beyond what I already have.

## Back to The Present Reality

This thought experiment might seem abstract, but it helps explain why my experience with Claude Code feels the way it does. LLMs aren't (and can't be) perfect models of specific individuals. They're trained on massive datasets of human behavior, making them models of _humans in aggregate_. An LLM can only be aligned with me insofar as I happen to align with the aggregate patterns in its training data.

This is why agentic coding currently requires such finesse in context and prompting. Without context, an LLM essentially returns "what would humans typically write here": a prediction grounded in aggregate patterns.

To get what _I_ want, I have to condition those probabilities through context: "You're an experienced Python developer. Here's the current codebase. Here's the function you're writing. Now, given all that, what comes next?" I'm conditioning the model to shift from aggregate patterns in its corpus toward my specific situation and goals. In a very real sense, prompting and context engineering _is_ alignment.

LLMs work as well as they do for programming precisely because "what a typical software engineer would do" often aligns with what I want. Code has conventions, shared patterns, established best practices. So I can typically get what I want with the right context. But the key word is "typically" -- there's still a gap between what I want and what the model predicts, which is why I'm constantly clarifying, refining, and providing more context.

No amount of training in aggregate will eliminate this gap. Population-level patterns can't capture the specifics that make you and your context different: your project's unique history, and your individual goals for this exact moment. When Claude suggests a solution, it's predicting from what it's seen across millions of developers -- not what works for you, right now, in this specific situation. Context and prompting help narrow that gap, but they're still constrained by what the model learned from aggregate data.

In other words, true alignment to _you and your intents and goals_ requires continual personalized training: a model whose weights update based on interactions with _you in your context specifically_.

## The Price of Perfect Alignment

If perfect alignment requires a copy of you, then perfect alignment for me is not perfect alignment for you. We are different individuals in different contexts. Perfect alignment does not generalize.

What's remarkable is how "good enough" aggregate alignment is. A model trained on patterns from millions of people -- then steered through [RLHF](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback) toward "helpful" outputs -- can be incredibly useful to a particular individual in a particular situation. But only when we handle the "last mile" alignment ourselves by manipulating its context window. We load up the prompt with specifics about our project, our goals, our preferences, temporarily conditioning the aggregate model toward our needs. As we're all finding, though, this approach has limits. Context windows are finite, context takes effort to provide, and even with perfect context, we're still constraining an aggregate model rather than working with one that's fundamentally aligned to us.

I expect that increasing the capability of AI agents will require personalized, contextual training: models whose weights update based on interactions with you in your context. AI researcher Richard Sutton makes a similar point in [a recent interview](https://youtu.be/21EYKqUsPfg?si=DtACJ4eriaJpM9N7&t=1929) when discussing what's needed to get beyond current LLM limitations. He talks about systems that "learn a policy that's specific to the environment that you're finding yourself in." To get to the next level of capability, it seems likely we'll need to build individual models.

But consider what this means: a model that continuously learns from its own interactions in a specific environment? That's a kind of entity qualitatively different from the agents that we have now. Current agents are entities produced from aggregate experiences from many individuals; this would be an entity produced from _individual_ experiences. It wouldn't just know about debugging from millions of examples. It would have debugged with you, formed associations specific to your codebases, your patterns, your solutions. And over time, through continued interaction, it would increasingly converge toward becoming a model of you -- or at least, toward having a model of you.

This distinction of "being a model" vs "having a model" brings us right back to the familiar AI safety problem: how do we know this new "individual", formed through experience and interaction with you in your environment, actually shares your goals and doesn't have its own?

And there's another concern that potentially subsumes that safety problem: you can't have individual alignment without individual variability. Humans are generally well-behaved on average, but every once in a while you get a psychopath. I expect aggregate training reduces variance in model personalities and helps avoid dangerous extremes. But individual models trained on individual experiences? We lose that safety buffer. Even training on well-behaved individuals in benign contexts could occasionally produce dangerous outliers.

Furthermore, even if we could guarantee safety in these models, a personalized model becomes a dangerous tool in anyone else's hands: A simulacrum of you and your context that could be used to manipulate and exploit you. (And you thought today's identity theft was bad...)

I suppose we should count the friction we currently experience with today's non-individualized LLMs as a feature, not a bug. The constant prompting, the need to spell out context... maybe that's exactly what's keeping us safe for now.
