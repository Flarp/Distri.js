---
layout: page
title: Node API
description: Documentation for Distri-Node
hide: true
permalink: /doc/node
---


<a name="module_Distri-Node"></a>

## Distri-Node

* [Distri-Node](#module_Distri-Node)
    * [~DistriServer](#module_Distri-Node..DistriServer) ⇐ <code>EventEmitter</code>
        * [`new DistriServer(opts)`](#new_module_Distri-Node..DistriServer_new)
        * [`.server`](#module_Distri-Node..DistriServer.DistriServer+server) : <code>Object</code>
        * [`.solutions`](#module_Distri-Node..DistriServer.DistriServer+solutions) : <code>number</code>
        * [`.userCount`](#module_Distri-Node..DistriServer.DistriServer+userCount) : <code>number</code>
        * [`.session`](#module_Distri-Node..DistriServer.DistriServer+session) : <code>Array.&lt;DistriProblem&gt;</code>
        * [`.remaining`](#module_Distri-Node..DistriServer.DistriServer+remaining) : <code>Array</code>
        * [`.pending`](#module_Distri-Node..DistriServer.DistriServer+pending) : <code>number</code>
        * [`.addWork(work)`](#module_Distri-Node..DistriServer+addWork)
        * [`.CheckPercentage(solutions, percentage)`](#module_Distri-Node..DistriServer+CheckPercentage)
        * [`"all_work_complete"`](#module_Distri-Node..DistriServer+event_all_work_complete)
        * [`"work_submitted" (work, solution, resolve, reject)`](#module_Distri-Node..DistriServer+event_work_submitted)
        * [`"workgroup_complete" (work, solutions, resolve, reject)`](#module_Distri-Node..DistriServer+event_workgroup_complete)
    * [~DistriClient](#module_Distri-Node..DistriClient)
        * [`new DistriClient(host)`](#new_module_Distri-Node..DistriClient_new)
        * [`.client`](#module_Distri-Node..DistriClient.DistriClient+client) : <code>WebSocket</code>
    * [`~DistriProblem`](#module_Distri-Node..DistriProblem) : <code>Object</code>

<a name="module_Distri-Node..DistriServer"></a>

### Distri-Node~DistriServer ⇐ <code>EventEmitter</code>
Constructor for DistriServer.

**Kind**: inner class of [`Distri-Node`](#module_Distri-Node)
**Extends:** <code>EventEmitter</code>  
**Emits**: <code>DistriServer#event:work_submitted</code>, <code>DistriServer#event:workgroup_complete</code>, <code>DistriServer#event:workgroup_accepted</code>, <code>DistriServer#event:workgroup_rejected</code>, <code>DistriServer#event:all_work_complete</code>  

* [~DistriServer](#module_Distri-Node..DistriServer) ⇐ <code>EventEmitter</code>
    * [`new DistriServer(opts)`](#new_module_Distri-Node..DistriServer_new)
    * [`.server`](#module_Distri-Node..DistriServer.DistriServer+server) : <code>Object</code>
    * [`.solutions`](#module_Distri-Node..DistriServer.DistriServer+solutions) : <code>number</code>
    * [`.userCount`](#module_Distri-Node..DistriServer.DistriServer+userCount) : <code>number</code>
    * [`.session`](#module_Distri-Node..DistriServer.DistriServer+session) : <code>Array.&lt;DistriProblem&gt;</code>
    * [`.remaining`](#module_Distri-Node..DistriServer.DistriServer+remaining) : <code>Array</code>
    * [`.pending`](#module_Distri-Node..DistriServer.DistriServer+pending) : <code>number</code>
    * [`.addWork(work)`](#module_Distri-Node..DistriServer+addWork)
    * [`.CheckPercentage(solutions, percentage)`](#module_Distri-Node..DistriServer+CheckPercentage)
    * [`"all_work_complete"`](#module_Distri-Node..DistriServer+event_all_work_complete)
    * [`"work_submitted" (work, solution, resolve, reject)`](#module_Distri-Node..DistriServer+event_work_submitted)
    * [`"workgroup_complete" (work, solutions, resolve, reject)`](#module_Distri-Node..DistriServer+event_workgroup_complete)

<a name="new_module_Distri-Node..DistriServer_new"></a>

#### `new DistriServer(opts)`
**Throws**:

- <code>TypeError</code> Options sent to the constructor are not in a single object.


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | The object passed to the constructor. |
| opts.connection | <code>Object</code> | Options for a ws.Server constructor. (websockets/ws) |
| opts.verificationStrength | <code>number</code> | How many solutions must be submitted for a problem to be considered complete. Security measure to help keep clients from spamming incorrect answers. |
| opts.files | <code>Object</code> | URL's to files for Distri clients to fetch. |
| opts.files.node | <code>string</code> | File to fetch for Node.js clients, not prepended with 'http(s)://'. |
| opts.files.javascript | <code>string</code> | File to fetch for JavaScript clients, not prepended with 'http(s)://'. |

<a name="module_Distri-Node..DistriServer.DistriServer+server"></a>

#### `distriServer.server` : <code>Object</code>
The WebSocket server for all of Distri's work

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer) 
<a name="module_Distri-Node..DistriServer.DistriServer+solutions"></a>

#### `distriServer.solutions` : <code>number</code>
The number of solutions that have been submitted for a single session. Resets when all work is finished.

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer)  
<a name="module_Distri-Node..DistriServer.DistriServer+userCount"></a>

#### `distriServer.userCount` : <code>number</code>
The number of currently connected clients.

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer)
<a name="module_Distri-Node..DistriServer.DistriServer+session"></a>

#### `distriServer.session` : <code>Array.&lt;DistriProblem&gt;</code>
An array of objects that contains all work, solutions, and other metadata.

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer) 
<a name="module_Distri-Node..DistriServer.DistriServer+remaining"></a>

#### `distriServer.remaining` : <code>Array</code>
An array of indexes that have not been solved yet.

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer)
<a name="module_Distri-Node..DistriServer.DistriServer+pending"></a>

#### `distriServer.pending` : <code>number</code>
How many problems are undergoing verification.

**Kind**: instance property of [`DistriServer`](#module_Distri-Node..DistriServer)
<a name="module_Distri-Node..DistriServer+addWork"></a>

#### `distriServer.addWork(work)`
A function that adds work to the work queue.

**Kind**: instance method of [`DistriServer`](#module_Distri-Node..DistriServer)
**Throws**:

- <code>TypeError</code> Work supplied is not an array.


| Param | Type | Description |
| --- | --- | --- |
| work | <code>Array</code> | Work to be added to the work queue. |

<a name="module_Distri-Node..DistriServer+CheckPercentage"></a>

#### `distriServer.CheckPercentage(solutions, percentage)`
A built-in verification function for Distri that checks to see if a set of solutions contains one solution that occurs more than a certain percentage of the time.

**Kind**: instance method of [`DistriServer`](#module_Distri-Node..DistriServer)  
**See**: DistriServer#workgroup_complete  

| Param | Type | Description |
| --- | --- | --- |
| solutions | <code>Array</code> | The solutions that are being checked. |
| percentage | <code>number</code> | The percent of time a certain solution must occur equal to or more than. |

Returns a Promise with the accepted work.

<a name="module_Distri-Node..DistriServer+event_work_submitted"></a>

#### `"work_submitted" (work, solution, resolve, reject)`
Fires when a single user submits work. Useful for authentication the user. Do not use for verifying work, use workgroup_complete instead. If a listener is attached to this event, a resolve() and reject() function will be emitted, and one of them must be called in order for Distri to know what to do with the work.

**Kind**: event emitted by [`DistriServer`](#module_Distri-Node..DistriServer)
**See**: DistriServer#workgroup_complete  

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | Work the client was sent. |
| solution | <code>Any</code> | Solution the client sent back. |
| socket | <code>WebSocket</code> | WebSocket session of the user. |
| resolve | <code>function</code> | Function from a Promise. When called, the client's work is accepted and put into the solution pool. |
| reject | <code>function</code> | Function from a Promise. When called, the client's work is rejected. |

<a name="module_Distri-Node..DistriServer+event_workgroup_complete"></a>

#### `"workgroup_complete" (work, solutions, resolve, reject)`
Fires when a piece of work has the required amount of solutions, set by the verification strength. If no listener is attached to this event, the first solution is automatically accepted.

**Kind**: event emitted by [`DistriServer`](#module_Distri-Node..DistriServer)

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | The work sent to all of the clients. |
| solutions | <code>Array</code> | An array of the solutions each client sent back. Note that this will still be an array even if the verification strength is only one. |
| resolve | <code>function</code> | A function that accepts the solution given to it. Be sure to give it just one solution, and not the entire array. |
| reject | <code>function</code> | A function that takes no parameters and rejects the entire workgroup, starting it over. |

<a name="module_Distri-Node..DistriServer+event_all_work_complete"></a>

#### `"all_work_complete"`
Fires when all work is complete. No parameters are given.

**Kind**: event emitted by [`DistriServer`](#module_Distri-Node..DistriServer)  

<a name="module_Distri-Node..DistriClient"></a>

### Distri-Node~DistriClient
A Node.js client for Distri.

**Kind**: inner class of [`Distri-Node`](#module_Distri-Node)

* [~DistriClient](#module_Distri-Node..DistriClient)
    * [`new DistriClient(host)`](#new_module_Distri-Node..DistriClient_new)
    * [`.client`](#module_Distri-Node..DistriClient.DistriClient+client) : <code>WebSocket</code>

<a name="new_module_Distri-Node..DistriClient_new"></a>

#### `new DistriClient(host)`
**Throws**:

- <code>TypeError</code> Host is not a string.


| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | WebSocket link for the Distri server. |

<a name="module_Distri-Node..DistriClient.DistriClient+client"></a>

#### `distriClient.client` : <code>WebSocket</code>
The WebSocket session for the client.

**Kind**: instance property of [`DistriClient`](#module_Distri-Node..DistriClient)
<a name="module_Distri-Node..DistriProblem"></a>

### `Distri-Node~DistriProblem` : <code>Object</code>
**Kind**: inner typedef of [`Distri-Node`](#module_Distri-Node)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | The work for that problem. |
| workers | <code>number</code> | The number of clients currently working on the problem. |
| solutions | <code>Array</code> | The submitted solutions for the problem. |

