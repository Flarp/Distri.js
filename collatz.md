---
layout: page
permalink: /tutorials/collatz
title: Collatz in Distri
description: An example of using Distri for math
hide: true
---

So far, we have only used Distri for a very simple server that doesn't really *do* much. It's a nice introduction, but it doesn't really show us the kinds of things Distri has in store. In this tutorial, we will make a server that tests numbers against the [<span style="color: blue">Collatz Conjecture</span>](https://www.youtube.com/watch?v=5mFpVDpKX70). You should know the basics of Distri from the previous tutorial, as those concepts will not be discussed in this tutorial.

First thing's first, we need our server. Let's get a quick one up and running.

```javascript
/* server.js */

const Distri = require('distri-node')
const server = new Distri({
  connection: {
    port: process.env.PORT || 8080
  }
})

server.on('workgroup_complete', (i, o, res, rej) => {
  console.log(i, o)
  res()
})

```

There's a simple server, this will be the boilerplate for the rest of the tutorial. Now, let's make the skeleton of our worker file.

```javascript
/* worker.js */
onmessage = m => {
  console.log(m.data.work)
  postMessage({result:true})
}
```

These files obviously don't do anything right now, but we can change that real quickly. First, we need to add another property to the object we're passing to our server contructor, `verificationStrength`.


```javascript
/* server.js */

const Distri = require('distri-node')
const server = new Distri({
  connection: {
    port: process.env.PORT || 8080
  },
  verificationStrength: 3
})

server.on('workgroup_complete', (i, o, res, rej) => {
  console.log(i, o)
  res()
})

```

"_What on earth is that?_"

Verification strength is pretty much the feature that defines Distri. It is the reason it was made.

Let's say you have three problems you need solved, and three clients. Simply pass each client a problem, have them return the result, voila! End of story.

But, one of these clients can be using a malicious client that sends back wrong answers. You wouldn't want those answers to be accepted, would you? Yes, you can check on the server side, but that defeats the entire purpose of using Distri. So, what else can you do?

The problem with this setup is that one problem takes one solution, and no more. Verification strength forces all problems to take more than one solution, and compare these solutions together. So, the above code forces each problem to take _three_ solutions, not just one. This can make it harder for a malicious user to get an invalid result accepted because they must have it compared with other workers in the pool.

"_But wouldn't that slow down the process? It would make it X times slower!_"

Unfortunatly, you're right. The higher the verification strength, the slower everything gets, because problems have to be solved multiple times. There's always a tradeoff, and you have to balance speed with security. For now, we'll keep it at three, but you can choose whatever number you want when you're making your own server.


