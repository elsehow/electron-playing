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

// a-bit-of handles the user scripts
var abitof = require('a-bit-of')
// this gets executed by main process
// after the user loads a script file.
function startUserScript (path) {
    // do stuff
  })
}


