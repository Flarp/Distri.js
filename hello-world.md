---
layout: page
title: Hello Distri Tutorial
description: Hello!
permalink: /tutorials/hello
hide: true
---

To start off with the very basics of Distri, we're going to be building a simple "Hello Distri" server.

The first thing we need to do is set up a basic server. Here is how we do that.

`server.js`
```javascript
const Distri = require('Distri-Node')

const server = new Distri.DistriServer()
```

Now we have a server, but we don't have any work, and no real way for any clients to connect. We need to add a few settings to get started. The settings are passed to the constructor using an object, and the first option we are going to pass is `connection`, an object that the [`websocket/ws`](https://github.com/websockets/ws) constructor takes.

`server.js`
```javascript
const Distri = require('Distri-Node')

const server = new Distri.DistriServer({
  connection: {
    port: 8080
  }
})
```

If you're not really planning to do anything special with the WebSocket server, this is all you need.

Our clients can now connect, but that's it, nothing else will happen. We need some work to give to the clients. We can do that with the `DistriServer#addWork` function.


`server.js`
```javascript
const Distri = require('Distri-Node')

const server = new Distri.DistriServer({
  connection: {
    port: 8080
  }
})

server.addWork(['hello!'])
```

It's a good idea to call this function when all work runs out, so users can continue to be served work, instead of the process ending.

WIP
