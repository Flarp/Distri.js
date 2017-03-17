---
layout: page
hide: true
title: Distri.js Usage
permalink: /doc/js
---

Distri.js does not really have an _API_, just a few things you need to keep in mind when either building worker scripts, or embedding it into your webpage.

# Embedding

Distri.js requires a `<body>` tag to be present for it to work. This is because the menu attaches to the body of the page, and then hides itself until it is activated.

```html
<-- good -->
<body>
  <content/>
</body>
<script src='distri.min.js'></script>

<-- bad -->
<script src='distri.min.js'></script>
<body>
  <content/>
<body>

```
The bad example will produce this error - `TypeError: document.body is null` or `Cannot call method 'appendChild' of null`.


Distri has a GUI for the user to be able to choose the servers they would like to contribute to. To activate the Distri menu, you need to have something somewhere call `Distri.settings()`. This function will pull up the Distri menu for the user. It is also called automatically the first time the user loads up the page with Distri embedded, along with a dialog box explaining Distri, and asking for user consent.

# Building Workers

## Javascript Workers

JavaScript Worker files are simply [<span style="color: blue">Web Worker</span>](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) files, with a tiny bit of structured calls to make sure all parts of Distri are in sync. To start the work cycle, the worker file must post a message, `"ready"`, to say that it is ready to start accepting work. No work scripts can have a solution that is `"ready"`, as Distri will not post this to the server.

```javascript
postMessage({result:'ready'})

onmesage = m => {
  // ...
}
```

All Distri work is submitted to the main script through the `result` property. This is due to how the `postMessage` function works, and as of now the value itself (not in an object) cannot be posted.

When the main script posts work to the worker, it will be sent to the `onmessage` function in `m.data.work`. This is, once again, due to how `postMessage` works.


```javascript
postMessage({result:'ready'})

onmessage = m => {
  if (m.data.work % 2 === 0) {
    postMessage({result:'is even'})
  } else {
    postMessage({result:'is odd'})
  }
}
```

## Node Workers

Instead of using `postMessage`, the workers for Node post use `process.stdout.write`. For recieving messages, add an event listener for the `data` event on `process.stdin`. All messages are stringified, so incoming messages must be parsed, and all outgoing messages must be stringified. Here's the example above for Node.

```javascript
process.stdout.write(JSON.stringify({result:'ready'}))

process.stdin.on('data', message => {
  m = JSON.parse(message)
  if (m.data.work % 2 === 0) {
    process.stdout.write(JSON.stringify({result:'is even'}))
  } else {
    process.stdout.wrtie(JSON.stringify({result:'is odd'}))
  }
})
``` 

# Databases

## Adding custom databases

The menu for Distri is populated by JSON databases. Vanilla Distri (the one you get from the official GitHub) only has one database, the official Distri database. You might want to have other databases too, and you can add the ones you would like into your own version of Distri using WebPack.

Inside `webpack.config.js`, an array is injected into the build with the databases to be used by Distri, `distriSafeDatabases`. You can simply add your own URL's to this array as you please.

```javascript
// ...
new webpack.DefinePlugin({
      distriDefault: JSON.stringify('url-of-chosen-default-server'),
      distriSafeDatabases: JSON.stringify(['raw.githubusercontent.com/Flarp/Distri-Safe/master/safe.json','a_custom_url'])
})
// ...
```
Remember to not prepend `http(s)://`, as Distri will automatically choose the best protocol.

## Creating custom databases

Distri databases have a structure to be followed to make sure the user is getting the right information displayed, and the file they are getting is verified by the database owner.

```javascript
// The database is just a JSON array
[
  {
    url: 'the url of the Distri server, not prepended by http(s)://',
    title: 'the title of the server',
    description: 'a short description of what the server is',
    icon: 'a small image to be shown above the title and description',
    hashes: {
      javascript: 'a base64-encoded SHA-256 hash of the javascript file, to prevent people from getting their server on a database, and then changing the worker file to be malicious',
      node: 'same as above, for node servers'
    }
  }
]
```

