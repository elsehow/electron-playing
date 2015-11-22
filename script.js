
function stringify (buff) {
  return buff.toString()
}

module.exports = function (ones) {

  ones = ones.map(stringify)

  return ones
}
