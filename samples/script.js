var charms = require('spectral-charms')

function fakeEmitter () {
  var emitter = new require('events').EventEmitter()
  var n = 0
  setInterval(function () {
    emitter.emit('number', n)
    n+=1
  }, 30)
  return emitter
}


function setup () {

  var emitter = fakeEmitter()

  return [ 
    charms.stream(emitter, 'number')
  ]
}


function process (count) {

  function timesTwo (x) {
    return x*2
  }

  var doubled = count.map(timesTwo)

  doubled.log()

  //return doubled
}

module.exports = {
  setup: setup,
  process: process
}
