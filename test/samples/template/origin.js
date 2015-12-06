var EventEmitter = require('events').EventEmitter

module.exports = function () {
  var ee = new EventEmitter()
  setInterval(() => ee.emit(1, 'event'), 500)
  return [
    [ ee, 'event']
  ]
}
