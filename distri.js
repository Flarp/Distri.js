/* global fetch URL location distriDefault Blob Distri distriSafeDatabase WebSocket Worker */

'use strict'

if (!window.Crypto && !window.msCrypto) throw new Error('Browser does not support cryptographic functions')
const crypto = window.crypto.subtle || window.msCrypto
if (!window.Worker) throw new Error('Browser does not support Web Workers')
if (!window.Blob || !window.ArrayBuffer) throw new Error('Browser does not support binary blobs')
if (!window.navigator) throw new Error("Browser does not support listing computer information")

// This module converts Base64 encoded strings into ArrayBuffers, and vice versa
const conversion = require('base64-arraybuffer')

// This module tests if two or more ArrayBuffers are equal
const arrEqual = require('arraybuffer-equal')

// This module uses the hashcash algorithm for proof of work
const hashcash = require('hashcashgen')

// This module just abstracts over the document.cookie API
const Cookie = require('js-cookie')

import './distri.css'
let sockets = []

window.Distri = {
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
          socket.send(JSON.stringify({responseType: 'request', response: ['javascript']}))
        }

            // This is where the WebWorker will be stored for this server
        let worker

        socket.onmessage = (m) => {
          const message = JSON.parse(m.data)

                    // Distri tells the user what is getting from the responseType field
          switch (message.responseType) {
            case 'file':
              switch (message.response[1]) {
                case 'javascript':
                                    // location.protocol trick used again
                  fetch(`${location.protocol}//${message.response[0]}`)
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
                                              if ((!obj.hashes) || (arrEqual(conversion.decode(obj.hashes.javascript), hash))) {
                                                worker = new Worker(URL.createObjectURL(new Blob([result])))
                                                cb(socket, worker)
                                                socket.send(JSON.stringify({responseType: 'request_hash', response: true}))
                                              } else {
                                                console.error(`Distri program ${obj.title} has an invalid checksum. Please talk with the creator of the program to fix this problem. The file will not run until this issue is corrected.`)
                                              }
                                            })
                                    })
                  break
                case 'webassembly':
                                    // Once WebAssembly is standardized, this will be filled in
              }

              break

                        // The user is recieving a hash to calcalate. This prevents users from spamming the server
            case 'submit_hash':
              socket.send(JSON.stringify({responseType: 'submit_hash', response: hashcash(message.response[0], message.response[1])}))
              break
                        // This is where the user actually gets work. It is sent to the worker made in the "file" case and awaits a message
            case 'submit_work':
              worker.postMessage({work: message.work})
              worker.onmessage = (result) => {
                socket.send(JSON.stringify({responseType: 'submit_work', response: result.data.result}))
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
  }

}

const Abel = document.createElement('link')
Abel.rel = 'stylesheet'
Abel.href = 'https://fonts.googleapis.com/css?family=Abel'

const menu = document.createElement('div')
const go = document.createElement('button')

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

Object.assign(menu.style, {
  width: '600px',
  height: '500px',
  borderRadius: '10px',
  borderColor: 'grey',
  borderWidth: '1px',
  borderStyle: 'solid',
  backgroundColor: 'white',
  position: 'relative',
  boxShadow: '10px 10px 5px grey',
  overflow: 'auto',
  textAlign: 'center'
})

Object.assign(go.style, {
  width: '60px',
  height: '40px',
  borderRadius: '10%',
  position: 'relative',
  top: '20px',
  fontFamily: 'Abel'
})

go.textContent = 'Finish'
go.className = 'btn btn-primary'

// Creates three buttons
const [saveButton, resetButton, addButton] = [document.createElement('button'), document.createElement('button'), document.createElement('button')]
const btnStyle = {
  height: '40px',
  margin: '10px 5px 5px 5px',
  borderRadius: '10%',
  position: 'relative',
  top: '20px',
  right: '10px',
  fontFamily: 'Abel'
}

Object.assign(saveButton.style, btnStyle)

Object.assign(resetButton.style, btnStyle)

Object.assign(addButton.style, btnStyle)

resetButton.className = 'btn btn-danger'
saveButton.className = 'btn btn-success'
addButton.className = 'btn btn-warning'

resetButton.textContent = 'Reset'
saveButton.textContent = 'Save'
addButton.textContent = 'Add Server'

const centerify = document.createElement('center')
centerify.appendChild(menu)
centerify.appendChild(saveButton)
centerify.appendChild(resetButton)
centerify.appendChild(addButton)
centerify.appendChild(document.createElement('br'))
centerify.appendChild(go)
distriDiv.appendChild(centerify)

go.onclick = (e) => {
    // If go was not clicked using the go.click() function
  if ((e.x !== 0 && e.y !== 0)) {
    distriDiv.className = 'fadeout'
    const complete = () => {
      distriDiv.style.margin = '-1200px 0 0 -325px'
    }
    distriDiv.addEventListener('webkitAnimationEnd', complete)
    distriDiv.addEventListener('animationend', complete)
    distriDiv.addEventListener('oanimationend', complete)
  }

    // Close all existing sockets
  sockets.map(socket => {
    socket.socket.close()
    socket.worker.terminate()
  })

  Distri.start(using, (socket, worker) => {
    sockets.push({socket, worker})
  })
}

// Load from the cookies the saved preferences of the user
const using = Cookie.get('distri-save') ? Cookie.getJSON('distri-save') : []

// Save to the cookies the preferences of the user
saveButton.onclick = () => {
  const hashStrip = using.map(item => {
    delete item.hashes
    return item
  })
  Cookie.set('distri-save', JSON.stringify(hashStrip), {expires: 365})
}

resetButton.onclick = () => {
    // The children of a DOM element are in an array-like object, but not an array. The below function converts it
  Array.from(menu.children).map(child => {
      // Set all buttons to their original state
        
  })
}

addButton.onclick = () => {
    // Create a div to be put inside the menu
  const [informDiv, informHeader, informBody, informInput, addButton, filler, removeButton] = [
    document.createElement('div'),
    document.createElement('h2'),
    document.createElement('p'),
    document.createElement('input'),
    document.createElement('button'),
    document.createElement('p'),
    document.createElement('button')]

    // Use the method the menu div does to place div's in a 3 per row fashion
  const place = Array.from(menu.children).length
  Object.assign(informDiv.style, {
    width: '200px',
    height: `300px`,
    position: 'absolute',
    left: `${200 * (place % 3)}px`,
    top: `${300 * Math.floor(place / 3)}px`,
    display: 'inline-block',
    fontFamily: 'Abel'
  })


  let url, ind

  addButton.className = 'btn btn-success'
  removeButton.className = 'btn btn-danger'
  addButton.textContent = '+'
  removeButton.textContent = '-'

  Object.assign(addButton.style, {
      textAlign: 'center',
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      padding: '0px 0px',
      display: 'inline-flex',
      justifyContent: 'center'
    })

    Object.assign(filler.style, {
      fontFamily: 'Abel',
      paddingLeft: '5px',
      paddingRight: '5px',
      display: 'inline-flex'
    })

    Object.assign(removeButton.style, {
      textAlign: 'center',
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      padding: '0px 0px',
      display: 'inline-flex',
      justifyContent: 'center'
    })

   addButton.onclick = (e) => {
    if (usableCores === 0) return
    usableCores--
    using[ind].cores++
    filler.textContent = using[ind].cores
  }
  
  removeButton.onclick = (e) => {
    if (using[ind].cores === 0) {
      return
    } else {
      using[ind].cores--
      usableCores++
      filler.textContent = using[ind].cores
    }
    
  }
    
  informHeader.textContent = 'Add External Server'
  informBody.textContent = 'WARNING: You are adding a server not trusted by the Distri list. This could result in damage to your computer if the script is malicious. Distri has no responsbility for these scripts, so run at your own risk.'
  informDiv.appendChild(informHeader)
  informDiv.appendChild(informBody)
  informDiv.appendChild(informInput)
  informInput.placeholder = 'Enter link here'
  informInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
      url = informInput.value
      ind = using.push({url,cores:1})-1
      filler.textContent = using[ind].cores
      informInput.remove()
      informDiv.appendChild(addButton)
      informDiv.appendChild(filler)
      informDiv.appendChild(removeButton)
    }
  })
  menu.appendChild(informDiv)
}

const removeButtons = []
let usableCores = window.navigator.hardwareConcurrency

Promise.all(distriSafeDatabases.map(database => fetch((`${location.protocol}//${database}`))))
.then(results => Promise.all(results.map(result => result.json())))
.then(results => {
  const result = []
  results.map(database => database.map(item => result.push(item)))
  result.map((obj, ind) => {
    using[ind] = obj
    
    using[ind].cores = 0
    
    const [cur, addButton, removeButton, curHeader, curBody, curImage, center, filler] = [document.createElement('div'),
      document.createElement('button'),
      document.createElement('button'),
      document.createElement('h2'),
      document.createElement('p'),
      document.createElement('img'),
      document.createElement('center'),
      document.createElement('p')]
    curBody.style.fontFamily = 'Abel'
    curHeader.style.fontFamily = 'Abel'
    filler.style.fontFamily = 'Abel'
    addButton.textContent = '+'
    removeButton.textContent = '-'
    curHeader.textContent = obj.title
    curBody.textContent = obj.description
    curImage.src = obj.icon
    cur.appendChild(center)
    center.appendChild(curImage)
    center.appendChild(curHeader)
    center.appendChild(curBody)
    center.appendChild(addButton)
    center.appendChild(filler)
    center.appendChild(removeButton)
    // Tile each server div so that it fits three per row
    Object.assign(cur.style, {
      width: '200px',
      height: `300px`,
      position: 'absolute',
      left: `${200 * (ind % 3)}px`,
      top: `${300 * Math.floor(ind / 3)}px`,
      display: 'inline-block'
    })

    Object.assign(curImage.style, {
      width: '50px',
      height: '50px'
    })

    Object.assign(addButton.style, {
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      padding: '0px 0px',
      display: 'inline-flex',
      justifyContent: 'center'
    })

    Object.assign(filler.style, {
      fontFamily: 'Abel',
      paddingLeft: '5px',
      paddingRight: '5px',
      display: 'inline-flex'
    })

    Object.assign(removeButton.style, {
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      padding: '0px 0px',
      display: 'inline-flex',
      justifyContent: 'center'
    })
    
    
    filler.textContent = using[ind].cores
    
    const updateResetState = () => {
      removeButtons[ind] = ({button:removeButton,cores:using[ind].cores})
      
    }
    
    addButton.onclick = (e) => {
      if (usableCores === 0) return
      usableCores--
      using[ind].cores++
      filler.textContent = using[ind].cores
    }
    
    removeButton.onclick = (e) => {
      if (using[ind].cores === 0) {
        return
      } else {
        using[ind].cores--
        usableCores++
        filler.textContent = using[ind].cores
      }
      
    }
    
    
    

    addButton.className = 'btn btn-success'
    removeButton.className = 'btn btn-danger'

    // If the website has designed this server to be default, or the user has saved this server
    if (obj.title === distriDefault) {
      using[ind].cores++
      usableCores--
      updateResetState()
    } else if (using.indexOf(obj)) {
      using[ind].cores++
      usableCores--
      updateResetState()
    }

    menu.appendChild(cur)
  })

  go.click()
})

// If the user has not been informed that Distri is running on their computer
const checkInformed = () => {
  if (!Cookie.get('distri-inform')) {
    const inform = document.createElement('div')
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

    const distriDisclaimer = document.createElement('h1')
    distriDisclaimer.textContent = 'Distri-JS Disclaimer'
    inform.appendChild(distriDisclaimer)
    distriDisclaimer.style.fontFamily = 'Abel'
    const text = document.createElement('p')
    const informCenter = document.createElement('center')
    informCenter.appendChild(text)
    text.style.fontFamily = 'Abel'
    text.textContent = "This website has background distributed computing enabled, powered by Distri-JS. Distri-JS uses idle CPU on computers visiting websites to compute scientific equations to help solve problems that have stumped scientists and mathematicians around the world. If you are okay with this, simply hit 'OK' below. If not, click 'Disable'. If you want to go deep into the configurations, hit 'Options'."
    const [okay, options, disable] = [document.createElement('button'), document.createElement('button'), document.createElement('button')]
    const informBtnStyle = {
      fontFamily: 'Abel',
      position: 'relative',
      display: 'inline-block',
      margin: '5px 5px 5px 5px'
    }

    Object.assign(disable.style, informBtnStyle)

    Object.assign(options.style, informBtnStyle)

    Object.assign(okay.style, informBtnStyle)

    okay.textContent = 'OK'
    options.textContent = 'Options'
    disable.textContent = 'Disable'
    okay.className = 'btn btn-success'
    disable.className = 'btn btn-danger'
    options.className = 'btn btn-primary'

    okay.onclick = () => {
      Cookie.set('distri-inform', 'true', {expires: 365})
      go.click()
      inform.className = 'inform-fadeout'
      inform.addEventListener('webkitAnimationEnd', inform.remove, {once: true})
      inform.addEventListener('animationend', inform.remove, {once: true})
      inform.addEventListener('oanimationend', inform.remove, {once: true})
    }

    disable.onclick = () => {
      Cookie.set('distri-inform', 'true', {expires: 365})
      inform.className = 'inform-fadeout'
      inform.addEventListener('webkitAnimationEnd', inform.remove, {once: true})
      inform.addEventListener('animationend', inform.remove, {once: true})
      inform.addEventListener('oanimationend', inform.remove, {once: true})
      resetButton.click()
      saveButton.click()
      go.click()
      Cookie.set('distri-disable', true, {expires: 365})
    }

    options.onclick = () => {
      Cookie.set('distri-inform', 'true', {expires: 365})
      inform.className = 'inform-fadeout'
      const optionsFunc = () => {
        inform.remove()
        Distri.settings()
      }
      inform.addEventListener('webkitAnimationEnd', optionsFunc, {once: true})
      inform.addEventListener('animationend', optionsFunc, {once: true})
      inform.addEventListener('oanimationend', optionsFunc, {once: true})
    }

    const buttonCenter = document.createElement('center')
    buttonCenter.style.display = 'block'
    buttonCenter.appendChild(okay)
    buttonCenter.appendChild(disable)
    buttonCenter.appendChild(options)

    document.body.appendChild(inform)
    inform.appendChild(informCenter)
    inform.appendChild(buttonCenter)

    const complete = () => {
      inform.style.opacity = '1'
      inform.style.margin = '-150px 0 0 -250px'
    }
    inform.className = 'inform-fadein'
    inform.addEventListener('webkitAnimationEnd', complete, {once: true})
    inform.addEventListener('animationend', complete, {once: true})
    inform.addEventListener('oanimationend', complete, {once: true})
  }
}

document.body.appendChild(distriDiv)
document.body.appendChild(Abel)
checkInformed()
