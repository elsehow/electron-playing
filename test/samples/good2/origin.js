var EventEmitter = require('events').EventEmitter

module.exports = function (x) {
  var ee2 = new EventEmitter()
  return [
    [ ee2, 'event2']
  ]
}
