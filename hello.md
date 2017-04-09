---
layout: page
title: Hello Distri!
permalink: /tutorials/hello/
description: Make a simple "Hello World" server in Distri
hide: true
---

Distri was made to be very minimalistic, providing you pretty much nothing but a tiny framework to help distribute work, and return it to the server. Other than the verification strength feature (which we will go over more in depth in the Collatz tutorial), Distri leaves all verification up to you. So, without further ado, let's make a simple example server.

Distri is split into two parts, _Distri.js_, and _Distri-Node_. These are two different things, be sure to keep that in mind. _Distri.js_ is on the client side, and runs the work that it's provided from _Distri-Node_. We will start with Distri-Node and get a simple do-nothing server running first.

```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({})
```

We now have a simple running server, that does nothing at all. (Yes, the second that constructor is called, it's running. Remember that!) However, our server doesn't quite do anything yet, so we need to change that! We're still missing a worker file, any kind of data handling, and any work. When a user connects, they will be told there is no work, and to go away. That's rude, we don't want our kind clients leaving, so let's keep Distri from telling them that!

Right now the only thing we want is to have the client recieve "Hello", and return " Distri!". The client will recieve "Hello" through _work_, which is what Distri gives to all connected clients. So, let's add "Hello" to the work queue!

```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({})

server.addWork(['Hello'])
```

The `addWork` method of the Distri server takes an array to be appended to the work queue. The content of the array must be able to be stringified into JSON, or Distri will crash.

Now that we have work, we are still missing any kind of data handling, and a worker file. Let's build the worker file right now!

The worker files in Distri are nothing more than Web Worker files, so if you're used to working with those, you should be very familiar with the syntax. If you haven't worked with Web Workers before, [<span style="color: blue">here is a good place to start</span>](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

Let's start making our worker file.

```javascript
/* worker.js */
onmessage = m => {
    postMessage({result:m.data.work})
}
```

When this worker script receives a message, it will simply echo it back to the server. The work is stored in `m.data.work`, so remember that. Also, the work must be submitted in the form of an object, with the `result` property holding the result. This is due to how the `postMessage` function works.

We don't want the script to echo back the message exactly, however. We want it to return " Distri!". Obviously, it won't be too hard.

```javascript
/* worker.js */
onmessage = m => {
    postMessage({result:" Distri!"})
}
```

That's it! Your worker file is done, but your server has no way to give it to your client (yet). We still have a little work to do to have our server fully functioning. As of now, we haven't given the WebSocket constructor any options, so it justs runs with the defaults, which is probably not what you want. If you've worked with the <span style="color: blue">[`ws`](https://github.com/websockets/ws)</span> module before, this will be familiar to you. If not, there's not too much to memorize, as we will only be messing with one option.

Options to the `ws` constructor are passed from the `connection` property in the object passed to the Distri constructor. For this example, we only want to specify the port we're running on, so let's do that now.

```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({
    connection: {
        port: process.env.PORT || 8080
    }
})

server.addWork(['Hello'])
```

We only have two things left to do so make sure to hold out! We still have no way to get the file to our user, and no way to get the result passed back. Let's fix that first part right now. The Distri constructor takes another object property, `file`, which is the URL of the file you are sending to your user. Let's add an example one now!


```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({
    connection: {
        port: process.env.PORT || 8080
    },
    file: 'https://gist.githubusercontent.com/Flarp/9ff6cc8089099c99993102777b392121/raw/ecea94ed92ae80d65c6fd9afe1ba09d7d83dedc1/example-hello-distri.js'
})

server.addWork(['Hello'])
```

When a user submits work, it goes through a process within Distri (which we won't deal with until next tutorial), and is then sent to the server through the event `workgroup_complete`. It is emitted from the server object like a normal event emitter, so let's listen for the event!

```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({
    connection: {
        port: process.env.PORT || 8080
    },
    file: 'https://gist.githubusercontent.com/Flarp/9ff6cc8089099c99993102777b392121/raw/ecea94ed92ae80d65c6fd9afe1ba09d7d83dedc1/example-hello-distri.js'
})

server.addWork(['Hello'])

server.on('workgroup_complete', (i, o, res, rej) => {
    res()
})
```

The bottom three lines probably are very new and obscure, but that's an easy fix. Let's go through it bit by bit.

`server.on('workgroup_complete', (i, o, res, rej) => {...}`

The Distri object extends `EventEmitter`, so it can emit events. When the event `workgroup_complete` is emitted, it provides a callback with four parameters, `i`, `o`, `res`, `rej`. 

* `i` - The work that was given to the user. (In this case, `'Hello'`)
* `o` - The array of sent back work. (This is an array, for reasons that we will discuss in the next tutorial. For our purposes it only has one item, so we can just use the first element in the array.)
* `res` - A function from a Promise that accepts the work. Takes one parameter, the work to be accepted.
* `rej` - A function from a Promise that rejects the work.

The second line accepts (or "resolves") the first item in the array, which is " Distri!". The work needs to be accepted or rejected to continue the Distri work cycle.

```javascript
/* server.js */
const Distri = require('distri-node')
const server = new Distri({
    connection: {
        port: process.env.PORT || 8080
    },
    file: 'https://gist.githubusercontent.com/Flarp/9ff6cc8089099c99993102777b392121/raw/ecea94ed92ae80d65c6fd9afe1ba09d7d83dedc1/example-hello-distri.js'
})

server.addWork(['Hello'])

server.on('workgroup_complete', (i, o, res, rej) => {
    console.log(i.concat(o[0]))
    res()
})

```

Our server side is done, but our client side is not. We still need a running website with Distri on it, so let's make a skeleton right now.

```html
<!-- index.html -->
<body>
    <!--whatever you want here-->
</body>
<!-- Distri must be loaded below the body -->
<script src="path/to/distri.js.min"></script>

```

Right now you may now have a `distri.js.min`, but getting one is very simple. There is a tutorial on it [<span style="color: blue;">here</span>](/tutorials/webpack). 

Now, host your HTML file and visit the website. The first time you visit it, it should ask you if you are okay with Distri being run on your computer. You might be tempted to click okay, but for our purposes, we need to hit "Options". Another menu will popup, and you'll see your server _isn't there_.

"_What?! Why?!_"

Distri gets all of its informations from databases (glorified JSON files) that host the metadata for Distri servers, like its name, description, and lots of other important stuff so your client can actually connect to it. Right now you are using a default database, which really doesn't have too much in it. To be able to connect to your server, you need to manually add it. At the bottom of the menu, there is a yellow button that reads "Add Server". 

<center><img src="http://img.pixady.com/2017/03/458418_capture.png"></center>

When you click that, another item will be added to the list, and it will have a textbox in it. This is where you can input the URL for your server. If you are running it locally, it should be `localhost:8080`. Make sure you run your Distri server, and hit "Enter" to confirm the link, and click "Finish". Now, check your console.

<center><img src="http://img.pixady.com/2017/03/574497_hello.png"></center>

You've done it! You've made your first Distri server! This was obviously a very simple one, and didn't utilize too many Distri features, but the next few tutorials will let you get familiar with these features, so you can become a Distri master!



