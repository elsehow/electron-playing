const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const dialog = require('electron').dialog;
const ipcMain = require('electron').ipcMain;

// Report crashes to our server.
electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// execute this when the user selects a script path
function loadUserScripts (dir) {
  // setup the user script in the renderer process
  mainWindow.webContents.executeJavaScript('rendererBootstrap("'+dir+'")')
  // Open the DevTools.                                                
  mainWindow.webContents.openDevTools();
  //// Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

function setup () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});
  // load index.html 
  mainWindow.loadURL('file://' + __dirname + '/index.html');
}

// TODO make a 'recently-opened' dialogue
// TODO make sure people can only select.js, only one at a time, etc
function showOpenDialog () {
  // `showOpenDialogue` takes properties (of the fie selection dialogue)
  // and a callback that gets executed when a file is selected
  dialog.showOpenDialog({ properties: [ 'openDirectory' ] }, loadUserScripts)
}

// setup ipc listeners
ipcMain.on('open-file-dialog', showOpenDialog) 
ipcMain.on('quit-app', app.quit) 

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', setup)
