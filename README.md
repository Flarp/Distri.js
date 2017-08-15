# Distri.js

```npm install Flarp/Distri.js```

Distributed computing for your browser!

## What is it?

Distri.js is a client for Distri servers that serve out numbers and equations to those who wish to participate in distributed computing.

## Features

* Does not use ```eval()``` or ```innerHTML``` anywhere at all!
* Uses Web Workers, so the webpage will not be slowed down during computation.
* All files are verified from a public database of trusted sources, with the links and checksums of each file, so if a file is tampered with, it will not be executed on the client-side.
* Very nice menu thing. Looks pretty cool.
![Distri.js Menu](http://i.imgur.com/NXg874y.png "Distri.js Menu")

## How do I use it?

Using it is a lot simpler than Distri-Node, just put all the generated files into the browser directory, add the script (```distri.out.js```) into the main HTML page, and make a button somewhere that when clicked, runs ```Distri.settings()```. That's it. If you want more information on what Distri is, check [here](https://github.com/Flarp/Distri-Node).

