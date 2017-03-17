---
hide: true
layout: page
title: Obtaining a Distri.js file
description: How to webpack Distri
permalink: /tutorial/webpack
---

Getting a `distri.min.js` file is very simple. You need `npm`, `node` and `git`, but nothing else for this tutorial.

First off, clone the Distri.js repository to get the files.

`git clone https://github.com/Flarp/Distri.js`

Now enter the directory you just cloned.

`cd Distri.js`

Install the modules needed to run everything. (Make sure your Node enviornment is dev, and not production)

`npm i`

Once this is done, you need to run the bundler to put all the modules into one standalone file.

`webpack`

That's it! Once that command is finished running, you will have a `build` directory, with a `distri.min.js` file, and a `distri.min.js.map` file. The `.js` file is the one you will need to have embedded in your webpage to have Distri.