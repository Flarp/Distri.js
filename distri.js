/* global fetch URL location distriDefault Blob Distri distriSafeDatabases WebSocket Worker */

'use strict'

if (!window.crypto && !window.msCrypto) throw new Error('Browser does not support cryptographic functions')
const crypto = window.crypto.subtle || window.msCrypto
if (!window.Worker) throw new Error('Browser does not support Web Workers')
if (!window.Blob || !window.ArrayBuffer) throw new Error('Browser does not support binary blobs')
let usableCores = window.navigator ? window.navigator.hardwareConcurrency : 1

// This module converts Base64 encoded strings into ArrayBuffers, and vice versa
const conversion = require('base64-arraybuffer')

// This module tests if two or more ArrayBuffers are equal
const arrEqual = require('arraybuffer-equal')

// This module just abstracts over the document.cookie API
const Cookie = require('js-cookie')

// This module escapes HTML to make sure no malicious code is added
const escape = require('escape-html')

import './distri.css'
let sockets = []
let session = []

window.Distri = {
  okay: () => {
    Cookie.set('distri-inform', 'true', {expires: 365})
    Distri.go()
    inform.className = 'inform-fadeout'
    inform.addEventListener('webkitAnimationEnd', inform.remove, {once: true})
    inform.addEventListener('animationend', inform.remove, {once: true})
    inform.addEventListener('oanimationend', inform.remove, {once: true})
  },
  disable: () => {
    Cookie.set('distri-inform', 'true', {expires: 365})
    inform.className = 'inform-fadeout'
    inform.addEventListener('webkitAnimationEnd', inform.remove, {once: true})
    inform.addEventListener('animationend', inform.remove, {once: true})
    inform.addEventListener('oanimationend', inform.remove, {once: true})
    Distri.reset()
    Distri.save()
    Distri.go()
    Cookie.set('distri-disable', true, {expires: 365})
  },
  options: () => {
    Cookie.set('distri-inform', 'true', {expires: 365})
    inform.className = 'inform-fadeout'
    const optionsFunc = () => {
      inform.remove()
      Distri.settings()
    }
    inform.addEventListener('webkitAnimationEnd', optionsFunc, {once: true})
    inform.addEventListener('animationend', optionsFunc, {once: true})
    inform.addEventListener('oanimationend', optionsFunc, {once: true})
  },
  start: (objs, cb) => {
        /*
            * If the user has not been informed of Distri being on the website, or the user has opted
            * out of Distri, exit the function immediatly.
        */
    if (!Cookie.get('distri-inform') || Cookie.get('distri-disable')) {
      return
    }
    objs.map(obj => {
      for (let x = 0; x < obj.cores; x++) {
                /*
                * A WebSocket will be refused if protocols conflict. For example, if the user connected to the
                * website using HTTP, and the user connects to a WebSocket server using WSS, the server will
                * refuse the connection because the client is on an insecure protocol. If a user connected to the
                * website using HTTPS and tries to connect to a WebSocket server using WS, the browser will refuse
                * the connection because the server is using an insecure protocol. However, if both are secure (HTTPS and WSS)
                * or both are insecure (HTTP and WS), the client and server will work properly.
                * The conditional below just checks everything out.
            */
        const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${obj.url}`)
        socket.onopen = () => {
          socket.send(JSON.stringify({responseType: 'request', response: 'file'}))
        }

            // This is where the WebWorker will be stored for this server
        let worker
        let ready = false
        let workQueue

        socket.onmessage = m => {
          const message = JSON.parse(m.data)

          // Distri tells the user what is getting from the responseType field
          switch (message.responseType) {
            case 'file':
              // location.protocol trick used again
              console.log(`${location.protocol}//${message.response}`)
              fetch(`${location.protocol}//${message.response}`)
              .then(result => result.arrayBuffer())
              .then(result => {
                // put the resulting file through the SHA-512 hashing algorithm
                crypto.digest('SHA-512', result)
                .then(hash => {
                    /*
                        * If the user entered the server in manually through the Add Server
                        * button, the server object will not have any hashes, and will be run anyway.
                        * If it is trusted, however, it will have the SHA-512 hash in Base64 format,
                        * which the below code decodes to an ArrayBuffer, and checks to see if the
                        * hash from the object is the same from the hash generated from the file served to the user.
                        * It's a checksum, to be short. If they are the same, the file is trusted and can be run
                    */
                  if (!obj.hashes || (arrEqual(conversion.decode(obj.hashes.javascript), hash))) {
                    worker = new Worker(URL.createObjectURL(new Blob([result])))
                    worker.onmessage = result => {
                      if (result.data.result === 'ready') {
                        ready = true
                        if (workQueue) {
                          worker.postMessage({ work: workQueue })
                        }
                      } else {
                        socket.send(JSON.stringify({ responseType: 'submit_work', response: result.data.result }))
                      }
                    }
                    worker.onerror = e => {
                      // if the worker has an error, just stop.
                      worker.terminate()
                      socket.close()
                    }
                    cb(socket, worker)
                    socket.send(JSON.stringify({responseType: 'request_work', response: true}))
                  } else {
                    console.error(`Distri program ${obj.title} has an invalid checksum. Please talk with the creator of the program to fix this problem. The file will not run until this issue is corrected.`)
                  }
                })
              })
              break
            // This is where the user actually gets work. It is sent to the worker made in the "file" case and awaits a message
            case 'submit_work':
              workQueue = message.work
              if (ready === true) {
                worker.postMessage({work: message.work})
              }
          }
        }
      }
    })
  },
  settings: () => {
    // Just fades the DistriDiv in
    distriDiv.className = 'fadein'
    const complete = () => {
      distriDiv.style.opacity = '1'
      distriDiv.style.margin = '-275px 0 0 -325px'
    }
    distriDiv.addEventListener('webkitAnimationEnd', complete)
    distriDiv.addEventListener('animationend', complete)
    distriDiv.addEventListener('oanimationend', complete)
  },
  addCore: ind => {
    if (usableCores > 0) {
      usableCores--
      session[ind].cores++
      Distri.update()
    }
  },
  removeCore: ind => {
    if (session[ind].cores > 0) {
      session[ind].cores--
      usableCores++
      Distri.update()
    }
  },
  add: url => {
    if (!url) {
      session.push(
        {
          title: 'Add Server',
          description: 'You are adding a server yourself, use at your own risk!'
        }
      )
    } else {
      session[session.length - 1] = { url, title: 'User Added Server', description: url, cores: 1 }
    }
    Distri.update()
  },
  go: clicked => {
    Distri.start(session, (socket, worker) => {
      sockets.push({ socket, worker })
    })
    if (clicked) {
      distriDiv.className = 'fadeout'
      const complete = () => {
        distriDiv.style.margin = '-1200px 0 0 -325px'
      }
      distriDiv.addEventListener('webkitAnimationEnd', complete)
      distriDiv.addEventListener('animationend', complete)
      distriDiv.addEventListener('oanimationend', complete)
    }
  },
  reset: () => {
    for (let x = 0; x < session.length; x++) {
      session[x].cores = 0
    }
    Distri.update()
  },
  save: () => {
    const items = session.filter(item => {
      return item.cores !== 0
    }).map(item => {
      return { url: item.url, cores: item.cores }
    })
    Cookie.set('distri-save', JSON.stringify(items), { expires: 365 })
  },
  update: () => {
    distriDiv.innerHTML = `
    <div id="distriMenu">
    ${
      session.map((item, ind) => {
        return `<div style="width: 200px; height: 300px; position: absolute; left: ${200 * (ind % 3)}px; top: ${300 * Math.floor(ind / 3)}px; display: inline-block" id="distri-item-${ind}">
          <img src="${item.icon}" style="height: 50px; width: 50px;">
          <h2 style="font-family: Abel;" id="distri-header-${ind}">${escape(item.title)}</h2>
          <p style="font-family: Abel;" id="distri-body-${ind}">${escape(item.description)}</p>
          <br>
          ${
            !item.url
            ? `<input type="text" onkeydown="if (event.keyCode===13){Distri.add(this.value);return false;}" placeholder="Enter server WebSocket URL, without the 'ws(s)://'">`
            : `<button class="btn btn-success" id="distri-add-${ind}" style="width: 30px; height: 30px; display: inline-flex; border-radius: 25%;" onclick="Distri.addCore(${ind})">+</button>
               <p style="font-family: Abel; padding: 0px 5px 0px 5px; display: inline-flex; id="distri-cores-${ind}" ">${session[ind].cores}</p>
               <button class="btn btn-danger" style="width: 30px; height: 30px; display: inline-flex; border-radius: 25%;" onclick="Distri.removeCore(${ind})" id="distri-remove-${ind}">-</button>`
            }
        </div>
        `
      }).join('')
    }
    </div>

    <center>
      <button class="distri-button btn btn-success" onclick="Distri.save()">Save</button>
      <button class="distri-button btn btn-danger" onclick="Distri.reset()">Reset</button>
      <button class="distri-button btn btn-warning" onclick="Distri.add()">Add Server</button>
      <br>
      <button class="distri-button btn btn-primary" onclick="Distri.go(true)">Finish</button>
    </center>
   
    `
  }

}

const Abel = document.createElement('link')
Abel.rel = 'stylesheet'
Abel.href = 'https://fonts.googleapis.com/css?family=Abel'

const distriDiv = document.createElement('div')
distriDiv.id = 'distriDiv'

// Object.assign is used for styling as it only overwrites style properties that are in the second object
Object.assign(distriDiv.style, {
  opacity: '0',
  width: '650px',
  height: '550px',
  margin: '-1200px 0 0 -325px',
  position: 'absolute',
  top: '50%',
  left: '50%'
})

let saved = Cookie.get('distri-save')
if (saved) {
  saved = JSON.parse(saved)
  for (let x = 0; x < saved.length; x++) {
    let found = false
    for (let y = 0; y < session.length; y++) {
      if (session[y].url === saved[x].url) {
        found = true
        for (let z = 0; z < saved[x].cores; z++) {
          Distri.addCore(y)
        }
        break
      }
    }
    if (!found) session.push({ url: saved[x].url, cores: saved[x].cores, description: `Added server loaded from save, URL is ${saved[x].url}`, title: 'Loaded Server' })
  }
}
let inform
// If the user has not been informed that Distri is running on their computer
if (!Cookie.get('distri-inform')) {
  inform = document.createElement('div')
  Object.assign(inform.style, {
    top: '50%',
    left: '50%',
    width: '500px',
    height: '300px',
    borderRadius: '10px',
    borderColor: 'grey',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: 'white',
    position: 'absolute',
    boxShadow: '10px 10px 5px grey',
    overflow: 'auto',
    textAlign: 'center',
    opacity: '0',
    margin: '-150px 0 0 -250px'
  })

  inform.innerHTML = `
 <h1 style="font-family: Abel;">Distri-JS Disclaimer</h1>
 <center>
  <p style="font-family: Abel;">This website has background distributed computing enabled, powered by Distri-JS. Distri-JS uses idle CPU on computers visiting websites to compute scientific equations to help solve problems that have stumped scientists and mathematicians around the world. If you are okay with this, simply hit 'OK' below. If not, click 'Disable'. If you want to go deep into the configurations, hit 'Options'.</p>
 </center>
 <center style="display: block;">
  <button style="font-family: Abel; position: relative; display: inline-block; margin: 5px;" class="btn btn-success" onclick="Distri.okay()">OK</button>
  <button style="font-family: Abel; position: relative; display: inline-block; margin: 5px;" class="btn btn-danger" onclick="Distri.disable()">Disable</button>
  <button style="font-family: Abel; position: relative; display: inline-block; margin: 5px;" class="btn btn-primary" onclick="Distri.options()">Options</button>
</center>`

  const complete = () => {
    inform.style.opacity = '1'
    inform.style.margin = '-150px 0 0 -250px'
  }
  document.body.appendChild(inform)
  inform.className = 'inform-fadein'
  inform.addEventListener('webkitAnimationEnd', complete, {once: true})
  inform.addEventListener('animationend', complete, {once: true})
  inform.addEventListener('oanimationend', complete, {once: true})
} else {
  let defaultUsed = false
  Promise.all(distriSafeDatabases.map(database => fetch((`${location.protocol}//${database}`))))
  .then(results => Promise.all(results.map(result => result.json())))
  .then(results => {
    session = []
    results.map(database => database.map(item => {
      item.cores = 0
      if (item.url === distriDefault && !defaultUsed) {
        item.cores++
        defaultUsed = true
      }
      session.push(item)
    }))
    Distri.update()
    Distri.go()
  })
}

document.body.appendChild(distriDiv)
document.body.appendChild(Abel)
