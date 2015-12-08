// our DOM objects
var c = document.getElementById('message-container')
var m = document.getElementById('message')
// timeout on success message disappearing
// we need a ref so we can clear it on error message
var t = null

function delay (t, fn) { setTimeout(fn, t) }

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

function hasClass (c) {
  return m.className.indexOf(c) > -1
}

// public fns -------------------------------------------------------------

function showSuccessMessage () {
  // set message
  setMessage('<img src="img/wand.gif"/> <p>successfully reloaded</p>')
  // if there's a success message hide timeout, clear it
  clearTimeout(t) 
  // if its hidden
  if (hasClass('hidden')) {
    // turn it blue
    setClasses('success hidden blue')
    // show message
    setClasses('success shown green')
  }
  // if its shown
  else {
    // just turn it blue
    setClasses('success shown blue')
    // show message after 80 ms
    delay(80, function () { 
      setClasses('success shown green')
    })
  }
  // set global ref to this hide timeout
  t = setTimeout(function() {
    // hide message 
    setClasses('success hidden blue')
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
