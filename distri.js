/* global fetch URL Image location distriDefault */

/*
    * Distri-JS by Flarp Emerald and contributors. Where I reused code
    * I give credit to the proper people so don't freak out.
*/

/*
    * This part was bummed from http://www.quirksmode.org/js/cookies.html.
    * When I was writing the cookie portion of this GitHub was under a DDoS
    * attack so I just used one from a website. I'm terrible with cookies.
*/

import './node_modules/bootstrap/dist/css/bootstrap.min.css'
import './distri.css'
let sockets = [];

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

window.Distri = {
    start: (objs, cb) => {
        objs.map(obj => {
            const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${obj.url}`)
            
            socket.onopen = () => {
                socket.send(msg.encode({responseType:'request',response:['javascript']}))
            }
            
            let worker;
            
            socket.onmessage = (m) => {
                const reader = new FileReader()
                reader.addEventListener('loadend', () => {
                    const message = msg.decode(new Uint8Array(reader.result))
                    switch(message.responseType) {
                        case 'file':
                            fetch(`${location.protocol}//${message.response[0]}`)
                            .then(result => result.blob())
                            .then(result => {
                                worker = new Worker(URL.createObjectURL(result))
                                cb(socket, worker)
                                socket.send(msg.encode({responseType: 'request_hash', response: true}))
                            })
            
                            break;
                        case "submit_hash":
                            socket.send(msg.encode({responseType: 'submit_hash', response: hashcash(message.response[0], message.response[1])}))
                            break;
                        case 'submit_work':
                            worker.postMessage({work:message.work})
                            worker.onmessage = function(result) {
                                socket.send(msg.encode({responseType: 'submit_work', response: result.data.result}))
                            }
                    }
                })
                reader.readAsArrayBuffer(m.data)
            }
        })
    },
    settings: () => {
        distriDiv.className = 'fadein'
        const complete = () => {
            distriDiv.style.opacity = '1'
            distriDiv.style.margin = '-275px 0 0 -325px'
        }
        distriDiv.addEventListener('webkitAnimationEnd', complete, {once:true})
        distriDiv.addEventListener('animationend', complete, {once:true})
        distriDiv.addEventListener('oanimationend', complete, {once:true})
    }
    
}

const msg = require('msgpack-js-v5')
const hashcash = require('hashcashgen')
const menu = document.createElement('div')
const go = document.createElement('button')


const distriDiv = document.createElement('div')
distriDiv.id = 'distriDiv'

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

go.textContent = 'Go!'
go.className = 'btn btn-primary'

const [saveButton, resetButton] = [document.createElement('button'), document.createElement('button')]

Object.assign(saveButton.style, {
    width: '60px',
    height: '40px',
    borderRadius: '10%',
    position: 'relative',
    top: '20px',
    marginBottom: '10px',
    right: '10px',
    fontFamily: 'Abel'
})

Object.assign(resetButton.style, {
    width: '60px',
    height: '40px',
    borderRadius: '10%',
    position: 'relative',
    top: '20px',
    marginBottom: '10px',
    fontFamily: 'Abel'
})

resetButton.className = 'btn btn-danger'
saveButton.className = 'btn btn-success'

resetButton.textContent = 'Reset'
saveButton.textContent = 'Save'

const centerify = document.createElement('center')
centerify.appendChild(menu)
centerify.appendChild(saveButton)
centerify.appendChild(resetButton)
centerify.appendChild(document.createElement('br'))
centerify.appendChild(go)
distriDiv.appendChild(centerify)

let interval;

window.onclick = (e) => {
    if (e.target !== distriDiv && distriDiv.style.opacity === '1' && !distriDiv.contains(e.target)) {
        distriDiv.className = 'fadeout'
        const complete = () => {
            distriDiv.style.opacity = '0'
            distriDiv.style.margin = '-650px 0 0 -325px'
        }
        distriDiv.addEventListener('webkitAnimationEnd', complete, {once:true})
        distriDiv.addEventListener('animationend', complete, {once:true})
        distriDiv.addEventListener('oanimationend', complete, {once:true})
    }
        
}

go.onclick = (e) => {
    if (e.x !== 0 && e.y !== 0) {
        distriDiv.className = 'fadeout'
        const complete = () => {
            distriDiv.style.opacity = '0'
            distriDiv.style.margin = '-650px 0 0 -325px'
        }
        distriDiv.addEventListener('webkitAnimationEnd', complete, {once:true})
        distriDiv.addEventListener('animationend', complete, {once:true})
        distriDiv.addEventListener('oanimationend', complete, {once:true})
    }
    
    sockets.map(socket => {
        socket.socket.close()
        socket.worker.terminate()
    })
    
    Distri.start(using, function(socket, worker) {
        sockets.push({socket,worker})
    })
    
}



document.body.appendChild(distriDiv)

const using = readCookie('save') ? JSON.parse(readCookie('save')) : []

saveButton.onclick = () => {
    createCookie('save',JSON.stringify(using),365)
}

resetButton.onclick = () => {
    Array.from(menu.children).map(child => {
        child.children[0].children[3].className = 'btn btn-success'
        child.children[0].children[3].textContent = '+'
        const ind = using.map(obj => obj.title).indexOf(child.children[0].children[1].textContent)
        if (ind !== -1) using.splice(ind, 1)
    })
}

fetch(`${location.protocol}//rawgit.com/Flarp/Distri-Safe/master/safe.json`).then(result => result.json())
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
    
    if ((obj.title === distriDefault && using.length === 0) || (using.indexOf(obj.title) !== -1)) 
        curButton.click()
        
        
    
        menu.appendChild(cur)
    })
    
    go.click()
})
