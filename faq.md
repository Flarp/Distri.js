---
layout: home
title: FAQ
description: You can put your hand down now.
permalink: /faq/
theme: yellow
---

# What is distributed/volunteer computing, and how does it speed up my math/science project?

Volunteer computing, sometimes more broadly referred to as distributed computing, is taking tasks that can be computed in parallel (at the same time) and doing just that. The tasks are spread out among different computers, and these computers complete the task and report back to the server. You might of heard of this referred to as a master/slave scenario.

Volunteer computing, if done right, and with the right tasks, could rival the power of a supercomputer. If you're not very good with computers, think of it as taking a bunch of computers, and adding their processing power up. It's not _totally_ like that, because getting nine women pregant does not deliver a baby in a month. You can't actually do a problem _faster_, but you can do more problems at the same time. This is great for things like the [Collatz Conjecture](https://www.youtube.com/watch?v=5mFpVDpKX70), in which the result of a number in a set does not depend on the result of other numbers in the set. Problems that depend on the result of the previous calculation (think of something like the [Fibonacci Sequence](https://www.youtube.com/watch?v=wTlw7fNcO-0)) are useless for the approach volunteer computing takes to get things done faster.

# How does Distri work?

Distri was made to be pretty secure, so if you use it right, you will probably run a server that turns out OK.

Worker file are distributed by links, that are fetched 