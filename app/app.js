
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
var menuTemplate = require('./menu-template.js')(ipcRenderer)
var menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)

// a-bit-of handles the user scripts
var abitof = require('a-bit-of')

// a global reference to the last return value of the user's process() fn
var oldRv = null
// this gets executed by main process
// after the user loads a script file.
function startUserScript (path) {
  // charm the script
  var charmed = abitof(path)
  // we get back return values from the script's process() function
  // we use these to `setup()` outputs
  // items in these return value should be of the form:
  //
  //    [fn, args...]
  //
  // where `fn` has methods setup(args..) and taredown()
  charmed.on('return-val', function (rv) {
    if (oldRv) {
      // taredown the old output functions
      oldRv.forEach(function (v) {
        v[0].taredown.apply(null, v.slice(1))
      })
    }
    if (rv) {
      console.log('setting stuff up....', rv)
      // setup the new output functions
      rv.forEach(function (v) {
        v[0].setup.apply(null, v.slice(1))
      })
    }
    // set the last rv we saw to this one
    oldRv = rv
  })
}


