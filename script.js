var abitof = require('a-bit-of')
  , spawn = require('child_process').spawn

function setup () {

  var process  = spawn('node', [__dirname + '/one-script.js'])

  return [ 
    abitof.kefir(process.stdout, 'data') 
  ]
}


function process (ones) {

  function stringify (buff) {
    return buff.toString()
  }

  function timesTwo (x) {
    return x*2
  }

  twos = ones.map(stringify).map(timesTwo)

  return twos
}

module.exports = {
  setup: setup,
  process: process
}
