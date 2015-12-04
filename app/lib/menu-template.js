function setup (ipc) {

  return [
    {
      label: 'Spectral Charmer',
      submenu: [

        // quit
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function () { 
            ipc.send('quit-app')
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [

        // open menu
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: function(item, focusedWindow) {
            ipc.send('open-file-dialog')
          },
        },

        // open developer tools menu
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Alt+Command+I';
            else
              return 'Ctrl+Shift+I';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.toggleDevTools();
          }
        },
      ]
    }
  ]
}

module.exports = setup
