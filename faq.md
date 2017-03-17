---
layout: page
title: FAQ
description: You can put your hand down now.
permalink: /faq/
---

# What is distributed/volunteer computing, and how does it speed up my math/science project?

Volunteer computing, sometimes more broadly referred to as distributed computing, is taking tasks that can be computed in parallel (at the same time) and doing just that. The tasks are spread out among different computers, and these computers complete the task and report back to the server. You might of heard of this referred to as a master/slave scenario.

Volunteer computing, if done right, and with the right tasks, could rival the power of a supercomputer. If you're not very good with computers, think of it as taking a bunch of computers, and adding their processing power up. It's not _totally_ like that, because getting nine women pregant does not deliver a baby in a month. You can't actually do a problem _faster_, but you can do more problems at the same time. This is great for things like the [<span style="color: blue">Collatz Conjecture</span>](https://www.youtube.com/watch?v=5mFpVDpKX70), in which the result of a number in a set does not depend on the result of other numbers in the set. Problems that depend on the result of the previous calculation (think of something like the [<span style="color: blue">Fibonacci Sequence</span>](https://www.youtube.com/watch?v=wTlw7fNcO-0)) are useless for the approach volunteer computing takes to get things done faster.

The best kinds of tasks for volunteer computing are [<span style="color: blue">embarrassingly parallel</span>](https://en.wikipedia.org/wiki/Embarrassingly_parallel) problems. Wikipedia provides some good examples of these kinds of problems [here](https://en.wikipedia.org/wiki/Embarrassingly_parallel#Examples).

# How does Distri work?

Remember that Distri is a software family split into two different packages, a library for Node.js, Distri-Node, and a drop-in script for JavaScript (the browser), Distri.js.

Distri-Node provides built-in functions to the user to allow them to make their volunteer computing server. The user provides work to Distri-Node, and it processes the work into its internal format, and distributes it to clients when they request it. When a client joins, they are given a link of the worker file, in which they fetch themselves and create a Web Worker using it.

Distri also does not automatically accept the first answer given to it, unless you tell it to do so (or not tell it to do otherwise). This is because of a feature called _verification strength_. The work to client ratio in Distri is by default 1:1, but is _highly discouraged_. Verification strength allows you to grow that ratio, like 3:1, three clients for every piece of work. This is a security measure, and the main reason Distri was made, almost the only one. If some client starts spamming wrong results, they would have to spam it three times, slowing them down. And even if they did spam answers, they don't get the same problem every time.

Work is not distributed serially in Distri. When the first client joins for the first time and requests work, they are not given the first piece of work in the list, they are given a random one. If the work was given serially, a client could easily get around the security measure listed above, by just continously submitting answers, and filling up the solution queue for each piece of work.

Ironically enough, Distri-Node was designed to be as minimalistic and modular as possible, while Distri.js is an batteries-included all-in-one package. Distri.js just needs to be dropped into a script tag, and no further work is needed (if you are satisfied by the default database list).

# What were the inspirations for Distri?

Lots of things. [<span style="color: blue">BOINC</span>](http://boinc.berkeley.edu/) was the first time I came across the concept of volunteer computing, and I knew right away the browser could use it. [<span style="color: blue">Honeybee-Hive</span>](https://github.com/Kurimizumi/Honeybee-Hive) was another inspiration. The program did its job well, but failed a lot of placed internally. It was not database-agnostic, and you had to use [<span style="color: blue">MongoDB</span>](https://www.mongodb.com/) to use HBH. It also did not have the verification strength feature, and work was distributed serially.

Other ideas that influenced the development are the [<span style="color: blue">Unix Philosophy</span>](https://en.wikipedia.org/wiki/Unix_philosophy), the [<span style="color: blue">GNU Manifesto</span>](https://en.wikipedia.org/wiki/GNU_Manifesto), and the ideas of decentrialization and distributed systems. Distri is under the GPLv3 license.

# What are the ethics behind Distri?

A big argument against some types of volunteer computing is the lack of client consent. A tempting implementation of volunteer computing in the browser is to just start without client consent. This is not the goal of Distri, as volunteer computing is not truly volunteer unless the client gives consent to have their computer used for the project. Distri asks, on first loading the website, if the user would like to participate in volunteer computing. They have the option to accept, look at the options, or decline. Distri will not ask again after this.

Cryptocurrency-related projects are barred from Distri's main database for servers, as it goes against the purpose of the program. Distri was made for scientific computing, not for profit. If your website is in need of funds, consider setting up a crowdfunding service for your website, and use Distri alongside it for scientific projects. If you don't think crowdfunding can sustain your website, reconsider what you're doing. 
