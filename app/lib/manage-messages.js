// our DOM objects
var c = document.getElementById('message-container')
var m = document.getElementById('message')
// timeout on success message disappearing
// we need a ref so we can clear it on error message
var t = null

//newline to <Br>
function newlineToBr (str) {
  return str.replace(/(?:\r\n|\r|\n)/g, '<br />')
}
  

function setClasses (classString) {
  c.className = classString
  m.className = classString
  return
}

function setMessage (msg) {
  m.innerHTML = newlineToBr(msg)
  return
}


// public fns -------------------------------------------------------------

function showSuccessMessage () {
  // set message
  setMessage('<img src="/img/wand.gif"/> <p>successfully reloaded</p>')
  // show message
  setClasses('success hidden')
  setClasses('success shown')
  // set global ref to this hide timeout
  t = setTimeout(function() {
    // hide message 
    setClasses('success hidden')
  }, 1400)
}

function showErrorMessage (msg) {
  // if there's a success message hide timeout, clear it
  clearTimeout(t) 
  // set message
  setMessage(msg)
  // show message
  setClasses('error hidden')
  setClasses('error shown')
}

module.exports = {
  success: showSuccessMessage,
  error: showErrorMessage,
}
