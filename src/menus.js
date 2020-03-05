
export class Menus {
  getMenus() {
    const template = [
      {
        label: 'File',
        submenu: [
          { label: 'New', },
          { label: 'Open...', },
          { label: 'Save', },
          { label: 'Save As...', },
          { label: 'Export to JavaScript', },
          { type: 'separator' },
          { label: 'Exit', },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
          //{ type: 'separator' },
          //{ 
          //  label: 'Preview in browser',
          //  click () { require('electron').shell.openExternal("file://" + FILENAME) }
          //}
        ]
      },
      {
        label: 'Objects',
        submenu: [
          { label: 'Add location', },
          { label: 'Add item', },
          { label: 'Add stub', },
          { type: 'separator' },
          { label: 'Delete object', },
          { label: 'Duplicate object', },
        ]
      },
      {
        label: 'Options',
        submenu: [
          { 
            label: 'Show only locations for exits', type: 'checkbox', checked : true,
          }
        ]
      },
      {
        label: 'Search',
        submenu: [
          { 
            label: 'Find',
          }
        ]
      },
      {
        role: 'window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Help',
            click () {
              require('electron').shell.openExternal('https://github.com/ThePix/QEdit/wiki');
            }
          },
        ]
      }
    ]

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      })

      // Edit menu
      template[1].submenu.push(
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      )

      // Window menu
      template[3].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
    return template;
  }
}

