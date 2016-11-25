/* global fetch URL location distriDefault Blob Distri */

if(!window.Crypto && !window.msCrypto) throw new Error('Browser does not support cryptographic functions')
const crypto = window.crypto.subtle || window.msCrypto
if (!window.Worker) throw new Error('Browser does not support Web Workers')
if (!window.Blob || !window.ArrayBuffer) throw new Error('Browser does not support binary blobs')

const conversion = require('base64-arraybuffer')
const arrEqual = require('arraybuffer-equal')
const hashcash = require('hashcashgen')
const Cookie = require('js-cookie')

import './distri.css'
let sockets = [];

window.Distri = {
    start: (objs, cb) => {
        if (!Cookie.get('distri-inform') || Cookie.get('distri-disable')) {
            return;
        }
        objs.map(obj => {
            const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${obj.url}`)
            socket.onopen = () => {
                console.log("open")
                socket.send(JSON.stringify({responseType:'request',response:['javascript']}))
            }
            
            let worker;
            
            socket.onmessage = (m) => {
                    const message = JSON.parse(m.data)
                    switch(message.responseType) {
                        case 'file':
                            switch(message.response[1]) {
                                case "javascript":
                                    fetch(`${location.protocol}//${message.response[0]}`)
                                    .then(result => result.arrayBuffer())
                                    .then(result => {
                                        crypto.digest('SHA-512', result)
                                            .then(hash => {
                                                if ((!obj.hashes) || (arrEqual(conversion.decode(obj.hashes.javascript), hash))) {
                                                    worker = new Worker(URL.createObjectURL(new Blob([result])))
                                                    cb(socket, worker)
                                                    socket.send(JSON.stringify({responseType: 'request_hash', response: true}))
                                                }
                                            })
                                        
                                    })
                                break;
                                case "webassembly":
                                    // Once WebAssembly is standardized, this will be filled in
                            }
            
                            break;
                        case "submit_hash":
                            socket.send(JSON.stringify({responseType: 'submit_hash', response: hashcash(message.response[0], message.response[1])}))
                            break;
                        case 'submit_work':
                            worker.postMessage({work:message.work})
                            worker.onmessage = function(result) {
                                socket.send(JSON.stringify({responseType: 'submit_work', response: result.data.result}))
                            }
                    }
            }
        })
    },
    settings: () => {
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

const menu = document.createElement('div')
const go = document.createElement('button')


const distriDiv = document.createElement('div')
distriDiv.id = 'distriDiv'

document.body.appendChild(distriDiv)

Object.assign(distriDiv.style, {
    opacity: '0',
    width: '650px',
    height: '550px',
    margin: '-1200px 0 0 -325px',
    position: 'absolute',
    top: '50%',
    left: '50%',
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

const [saveButton, resetButton, addButton] = [document.createElement('button'), document.createElement('button'), document.createElement('button')]

const btnStyle = {
    height: "40px",
    margin: "10px 5px 5px 5px",
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
    if ((e.x !== 0 && e.y !== 0)) {
        distriDiv.className = 'fadeout'
        const complete = () => {
            distriDiv.style.margin = '-1200px 0 0 -325px'
        }
        distriDiv.addEventListener('webkitAnimationEnd', complete)
        distriDiv.addEventListener('animationend', complete)
        distriDiv.addEventListener('oanimationend', complete)
    }
    
    sockets.map(socket => {
        socket.socket.close()
        socket.worker.terminate()
    })
    
    Distri.start(using, (socket, worker) => {
        sockets.push({socket,worker})
    })
 
}



const using = Cookie.get('distri-save') ? Cookie.getJSON('distri-save') : []

saveButton.onclick = () => {
    Cookie.set('distri-save',JSON.stringify(using),{expires: 365})
}

resetButton.onclick = () => {
    Array.from(menu.children).map(child => {
        child.children[0].children[3].className = 'btn btn-success'
        child.children[0].children[3].textContent = '+'
        const ind = using.map(obj => obj.title).indexOf(child.children[0].children[1].textContent)
        if (ind !== -1) using.splice(ind, 1)
    })
}

addButton.onclick = () => {
    
    const [informDiv, informHeader, informBody, informInput, informButton] = [
        document.createElement("div"),
        document.createElement("h2"),
        document.createElement("p"),
        document.createElement("input"),
        document.createElement("button")]
    const place = Array.from(menu.children).length
    Object.assign(informDiv.style, {
        width: '200px',
        height: `300px`,
        position: 'absolute',
        left: `${200*(place%3)}px`,
        top: `${300*Math.floor(place/3)}px`,
        display: 'inline-block',
        fontFamily: "Abel"
    })
    
    informButton.className = "btn btn-danger"
    informButton.textContent = "-"
    Object.assign(informButton.style, {
        width: '30px',
        height: '30px',
        borderRadius: '25%',
        padding: '0px 0px'
    })
    
    let url;
    
    informButton.addEventListener("click", () => {
        if (informButton.textContent === "-") {
            using.splice(using.indexOf({url}), 1)
            informButton.textContent = "+"
            informButton.className = "btn btn-success"
        } else {
            using.push({url})
            informButton.textContent = "-"
            informButton.className = "btn btn-danger"
        }
    })
    
    
    informHeader.textContent = "Add External Server"
    informBody.textContent = "WARNING: You are adding a server not trusted by the Distri list. This could result in damage to your computer if the script is malicious. Distri has no responsbility for these scripts, so run at your own risk."
    informDiv.appendChild(informHeader)
    informDiv.appendChild(informBody)
    informDiv.appendChild(informInput)
    informInput.placeholder = "Enter link here"
    informInput.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
            url = informInput.value
            using.push({url})
            informInput.remove()
            informDiv.appendChild(informButton)
        }
    })
    menu.appendChild(informDiv)
}

fetch(`${location.protocol}//raw.githubusercontent.com/Flarp/Distri-Safe/master/safe.json`).then(result => result.json())
.then(result => {
    result.map((obj, ind) => {
    const [cur, curButton, curHeader, curBody, curImage, center, filler] = [document.createElement('div'), 
    document.createElement('button'), 
    document.createElement('h2'),
    document.createElement('p'),
    document.createElement('img'),
    document.createElement('center'),
    document.createElement('p')];
    curBody.style.fontFamily = 'Abel'
    curHeader.style.fontFamily = 'Abel'
    filler.style.fontFamily = "Abel"
    curButton.textContent = '+'
    curHeader.textContent = obj.title
    curBody.textContent = obj.description
    curImage.src = obj.icon
    cur.appendChild(center)
    center.appendChild(curImage)
    center.appendChild(curHeader)
    center.appendChild(curBody)
    center.appendChild(curButton)
    center.appendChild(filler)
    Object.assign(cur.style, {
        width: '200px',
        height: `300px`,
        position: 'absolute',
        left: `${200*(ind%3)}px`,
        top: `${300*Math.floor(ind/3)}px`,
        display: 'inline-block'
    })
    
    Object.assign(curImage.style, {
        width: '50px',
        height: '50px',
    })
    
    Object.assign(curButton.style, {
        width: '30px',
        height: '30px',
        borderRadius: '25%',
        padding: '0px 0px'
    })
    
    curButton.className = 'btn btn-success'
    
    curButton.onclick = () => {
        let state = curButton.textContent
        switch(state) {
            case '+':
                curButton.className = 'btn btn-danger'
                curButton.textContent = '-'
                using.push(obj)
                break;
            case "-":
                using.splice(using.indexOf(obj), 1)
                curButton.className = 'btn btn-success'
                curButton.textContent = '+'
                break;
        }
        
        
    }
    
    if ((obj.title === distriDefault && using.length === 0 && using.indexOf(obj.title) === -1) || (using.indexOf(obj.title) !== -1)) 
        curButton.click()
        
        menu.appendChild(cur)
    })
    
    
    go.click()
})

if (!Cookie.get('distri-inform')) {
    
    const inform = document.createElement('div')
    Object.assign(inform.style, {
        top: '50%',
        left: "50%",
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
    distriDisclaimer.style.fontFamily = "Abel"
    const text = document.createElement('p')
    const informCenter = document.createElement('center')
    informCenter.appendChild(text)
    text.style.fontFamily = "Abel"
    text.textContent = "This website has background distributed computing enabled, powered by Distri-JS. Distri-JS uses idle CPU on computers visiting websites to compute scientific equations to help solve problems that have stumped scientists and mathematicians around the world. If you are okay with this, simply hit 'OK' below. If not, click 'Disable'. If you want to go deep into the configurations, hit 'Options'."
    const okay = document.createElement('button')
    const options = document.createElement('button')
    const disable = document.createElement('button')
    Object.assign(disable.style, {
        fontFamily: 'Abel',
        position: 'relative',
        display: 'inline-block',
        margin: '5px 5px 5px 5px'
    })
    
    Object.assign(options.style, {
        fontFamily: 'Abel',
        position: 'relative',
        display: 'inline-block',
        margin: '5px 5px 5px 5px'
    })
    
    Object.assign(okay.style, {
        fontFamily: 'Abel',
        position: 'relative',
        display: 'inline-block',
        margin: '5px 5px 5px 5px'
    })
    
    okay.textContent = 'OK'
    options.textContent = 'Options'
    disable.textContent = 'Disable'
    okay.className = 'btn btn-success'
    disable.className = 'btn btn-danger'
    options.className = 'btn btn-primary'
    
    okay.onclick = () => {
        Cookie.set('distri-inform', 'true', {expires:365})
        go.click()
        inform.className = 'inform-fadeout'
        inform.addEventListener('webkitAnimationEnd', inform.remove, {once:true})
        inform.addEventListener('animationend', inform.remove, {once:true})
        inform.addEventListener('oanimationend', inform.remove, {once:true})
    }
    
    disable.onclick = () => {
        Cookie.set('distri-inform', 'true', {expires:365})
        inform.className = 'inform-fadeout'
        inform.addEventListener('webkitAnimationEnd', inform.remove, {once:true})
        inform.addEventListener('animationend', inform.remove, {once:true})
        inform.addEventListener('oanimationend', inform.remove, {once:true})
        resetButton.click()
        saveButton.click()
        go.click()
        Cookie.set('distri-disable', true, {expires:365})
    }
    
    options.onclick = () => {
        Cookie.set('distri-inform', 'true', {expires:365})
        inform.className = 'inform-fadeout'
        const optionsFunc = () => {
            inform.remove()
            Distri.settings()
        }
        inform.addEventListener('webkitAnimationEnd', optionsFunc, {once:true})
        inform.addEventListener('animationend', optionsFunc, {once:true})
        inform.addEventListener('oanimationend', optionsFunc, {once:true})
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
    inform.addEventListener('webkitAnimationEnd', complete, {once:true})
    inform.addEventListener('animationend', complete, {once:true})
    inform.addEventListener('oanimationend', complete, {once:true})
    
}

