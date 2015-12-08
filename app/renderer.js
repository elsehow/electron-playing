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
var menuTemplate = require('./lib/menu-template.js')(ipcRenderer)
var menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

// higher-order function for error handling
function handleError (errorType) {
  return function (err) { 
    console.log('ERROR', errorType, err)
  }
}

// a-bit-of handles the user scripts
var loadFiles = require('./lib/loadFiles.js')
// this gets executed by main process
// after the user loads a script file.
function rendererBootstrap (path) {
  var componentStream = loadFiles.wireComponents(path)
  // when the streams components come through,
  componentStream.onValue((cs) => {
    // setup erroring for each stream
    cs.originS.onError(handleError('origin'))
    cs.transformS.onError(handleError('transform'))
    cs.endpointS.onError(handleError('endpoint'))
    // attach them to each other when they all come in
    require('kefir')
      .combine([cs.originS, cs.transformS, cs.endpointS])
      .onValue(components => {
        components[0]
          .attach(components[1])
          .attach(components[2])
      })
  })
  // setup erroring for file loading
  componentStream.onError(handleError('loading files'))
}

