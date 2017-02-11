---
layout: page
title: Node API
description: Documentation for Distri-Node
hide: true
permalink: /doc/node
---

## Classes

<dl>
<dt><a href="#DistriServer">DistriServer</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Constructor for DistriServer.</p>
</dd>
<dt><a href="#DistriClient">DistriClient</a></dt>
<dd><p>A Node.js client for Distri.</p>
</dd>
</dl>

<a name="DistriServer"></a>

## DistriServer ⇐ <code>EventEmitter</code>
Constructor for DistriServer.

**Kind**: global class  
**Extends:** <code>EventEmitter</code>  
**Emits**: [`work_submitted`](#DistriServer+event_work_submitted), [`workgroup_complete`](#DistriServer+event_workgroup_complete), [`workgroup_accepted`](#DistriServer+event_workgroup_accepted), [`workgroup_rejected`](#DistriServer+event_workgroup_rejected),  [`all_work_complete`](#DistriServer+event_all_work_complete)

* [DistriServer](#DistriServer) ⇐ <code>EventEmitter</code>
    * [new DistriServer(opts)](#new_DistriServer_new)
    * [.addWork(work)](#DistriServer+addWork)
    * [.CheckPercentage(solutions, percentage, resolve, reject)](#DistriServer+CheckPercentage)
    * ["workgroup_rejected" (work, solutions)](#DistriServer+event_workgroup_rejected)
    * ["work_submitted" (work, solution, resolve, reject)](#DistriServer+event_work_submitted)
    * ["workgroup_complete" (work, solutions, resolve, reject)](#DistriServer+event_workgroup_complete)
    * ["workgroup_accepted" (work, solution)](#DistriServer+event_workgroup_accepted)

<a name="new_DistriServer_new"></a>

### new DistriServer(opts)
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

<a name="DistriServer+addWork"></a>

### distriServer.addWork(work)
A function that adds work to the work queue.

**Kind**: instance method of [`DistriServer`](#DistriServer)  
**Throws**:

- <code>TypeError</code> Work supplied is not an array.


| Param | Type | Description |
| --- | --- | --- |
| work | <code>Array</code> | Work to be added to the work queue. |

<a name="DistriServer+CheckPercentage"></a>

### distriServer.CheckPercentage(solutions, percentage, resolve, reject)
A built-in verification function for Distri that checks to see if a set of solutions contains one solution that occurs more than a certain percentage of the time.

**Kind**: instance method of [`DistriServer`](#DistriServer)  
**See**: [`workgroup_complete`](#DistriServer+event_workgroup_complete)  

| Param | Type | Description |
| --- | --- | --- |
| solutions | <code>Array</code> | The solutions that are being checked. |
| percentage | <code>number</code> | The percent of time a certain solution must occur equal to or more than. |
| resolve | <code>function</code> | A callback function that will be called with the accepted answer. Good to use with the `resolve()` function in `workgroup_complete`. 
| reject | <code>function</code> | A callback function that will be called if none of the solutions satisfy the percentage. Good to use with the `reject()` function in `workgroup_complete`. |

<a name="DistriServer+event_work_submitted"></a>

### "work_submitted" (work, solution, resolve, reject)
Fires when a single user submits work. Useful for authentication the user. Do not use for verifying work, use workgroup_complete instead. If a listener is attached to this event, a `resolve()` and `reject()` function will be emitted, and one of them must be called in order for Distri to know what to do with the work.

**Kind**: event emitted by [`DistriServer`](#DistriServer)  
**See**: [`workgroup_complete`](#DistriServer+event_workgroup_complete)

<a name="DistriServer+event_workgroup_complete"></a>

### "workgroup_complete" (work, solutions, resolve, reject)
Fires when a piece of work has the required amount of solutions, set by the verification strength. If no listener is attached to this event, the first solution is automatically accepted.

**Kind**: event emitted by [`DistriServer`](#DistriServer)  

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | The work sent to all of the clients. |
| solutions | <code>Array</code> | An array of the solutions each client sent back. Note that this will still be an array even if the verification strength is only one. |
| resolve | <code>function</code> | A function that accepts the solution given to it. Be sure to give it just one solution, and not the entire array. |
| reject | <code>function</code> | A function that takes no parameters and rejects the entire workgroup, starting it over. |

<a name="DistriServer+event_workgroup_accepted"></a>

### "workgroup_accepted" (work, solution)
Fires when a piece of work has a solution accepted for it.

**Kind**: event emitted by [`DistriServer`](#DistriServer)  

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | The work sent to the clients. |
| solution | <code>Any</code> | The accepted solution. |

<a name="DistriServer+event_workgroup_rejected"></a>

### "workgroup_rejected" (work, solutions)
Fires when a workgroup is rejected.

**Kind**: event emitted by [`DistriServer`](#DistriServer)  

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | The work the clients were sent. |
| solutions | <code>Array</code> | The solutions that were sent in for the problem. |
 

| Param | Type | Description |
| --- | --- | --- |
| work | <code>Any</code> | Work the client was sent. |
| solution | <code>Any</code> | Solution the client sent back. |
| session | <code>WebSocket</code> | WebSocket session of the user. |
| resolve | <code>function</code> | Function from a Promise. When called, the client's work is accepted and put into the solution pool. |
| reject | <code>function</code> | Function from a Promise. When called, the client's work is rejected. |

<a name="DistriServer+event_all_work_complete"></a>

### "all_work_complete"
Fires when all work is complete. No parameters are given.

**Kind**: event emitted by [`DistriServer`](#DistriServer) 

<a name="DistriClient"></a>

## DistriClient
A Node.js client for Distri.

**Kind**: global class  
<a name="new_DistriClient_new"></a>

### new DistriClient(host)
**Throws**:

- <code>TypeError</code> Host is not a string.


| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | WebSocket link for the Distri server. |

