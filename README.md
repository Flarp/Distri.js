# Distri-JS

```npm install Flarp/Distri-JS```

Distributed computing for your browser!

## What is it?

Distri-JS is a client for Distri servers that serve out numbers and equations to those who wish to participate in distributed computing.

## Features

* Does not use ```eval()``` or ```innerHTML``` anywhere at all!
* Uses Web Workers, so the webpage will not be slowed down during computation.
* All files are verified from a public database of trusted sources, with the links and checksums of each file, so if a file is tampered with, it will not be executed on the client-side.
* Very nice menu thing. Looks pretty cool.
![Distri-JS Menu](http://i.imgur.com/NXg874y.png "Distri-JS Menu")

## How do I use it?

To generate the files, simply run ```webpack```. Webpack will do all the hard stuff for you.

Using it is a lot simpler than Distri-Node, just put all the generated files into the browser directory, add the script (```distri.min.js```) into the main HTML page, and make a button somewhere that when clicked, runs ```Distri.settings()```. That's it. If you want more information on what Distri is, check [here](https://github.com/Flarp/Distri-Node).

Another note, if you want to set a default starting point other than ```Collatz Conjecture```, go into the webpack config and change the value in the ```webpack.DefinePlugin``` where it says ```distriDefault: JSON.stringify('Collatz Conjecture')``` to whatever you want. (Note, the value must be still inside the ```JSON.stringify```)

## Personal thank you's

Thank you _Emily Doyle_ for helping spread the word for this!