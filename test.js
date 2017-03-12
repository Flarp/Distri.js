/* global it describe before after */

const http = require('http')
const path = require('path')
const expect = require('chai').expect
const co = require('co')
const serve = require('serve-static')(path.join(__dirname, '/build'))
const final = require('finalhandler')
const webdriver = require('selenium-webdriver')

const openHttp = port => {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      serve(req, res, final(req, res))
    })
    server.listen(port, () => {
      resolve(server)
    })
  })
}

const closeHttp = server => {
  return new Promise(resolve => {
    server.close(() => {
      resolve('finished')
    })
  })
}

let server, driver

describe('Distri inform dialog', () => {
  before(co.wrap(function*() {
    this.timeout(30000)
    server = yield openHttp(process.env.PORT || 8080)
    driver = new webdriver.Builder().forBrowser('firefox').build()
    yield driver.get(`http://127.0.0.1:${process.env.PORT || 8080}`)
    return Promise.resolve()
  }))
  after(co.wrap(function*() {
    yield driver.quit()
    yield closeHttp(server)
    return Promise.resolve()
  }))
  it('should inform the user of Distri on first visit', co.wrap(function*() {
    yield driver.manage().deleteAllCookies()
    expect(yield driver.findElement(webdriver.By.className('inform-fadein'))).to.be.an('object')
    return Promise.resolve()
  }))
})

