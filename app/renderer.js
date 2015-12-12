// this gets executed in index.html
// all the logic for the renderer process is here

// require() correctly from index.html
// from https://github.com/atom/electron/issues/2539#issuecomment-135247877
require('module').globalPaths.push(__dirname + '/node_modules');
// make an ipc for the renderer process
const ipcRenderer = require('electron').ipcRenderer
// setup application menu
const remote = require('electron').remote
const Menu = remote.Menu
const Kefir = require('kefir')
var menuTemplate = require('./lib/menu-template.js')(ipcRenderer)
var menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

// manage messages to the user
var messages = require('./lib/manage-messages.js')

function errorMessage (type) {
  return (err) => 
    messages.error(type + ': ' + err)
}

// setup reset button
document.getElementById('reset').onclick = () => {
  if (userScriptPath)
    rendererBootstrap(userScriptPath)
  return
}

// a-bit-of handles the user scripts
var loadFiles = require('./lib/load-files.js')
// keep a ref around to the last path the user succesfully loaded
var userScriptPath;
// this gets executed by main process
// after the user loads a script file.
function rendererBootstrap (path) {
  // clear views div
  document.getElementById('views').innerHTML = ''
  // make new components from the files
  var componentStream = loadFiles.wireComponents(path)
  // save a ref to the path
  userScriptPath = path
  // when the streams components come through,
  componentStream.onValue((cs) => {
    // setup erroring for each stream
    cs.originS.onError(errorMessage('Error in Origin'))
    cs.transformS.onError(errorMessage('Error in Transform'))
    cs.endpointS.onError(errorMessage('Error in Endpoint'))
    // attach them to each other when they all come in
    Kefir
      .combine([cs.originS, cs.transformS, cs.endpointS])
      .onValue(components => {
        // attach origin > transform > endpoint
        components[0].attach(components[1]).attach(components[2])
      })
    // setup notifications for new refreshes
    Kefir
      .merge([cs.originS, cs.transformS, cs.endpointS])
      .onValue(messages.success)
  })
  // setup erroring for file loading
  componentStream.onError(errorMessage('loading files'))
}

