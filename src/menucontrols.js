
export class MenuControls {
  getMenus() {
return = [
  {
    label: 'File',
    submenu: [
      { label: 'Save XML', },
      { label: 'Save JavaScript', },
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
      { type: 'separator' },
      { label: 'Add room', },
      { label: 'Add item', },
      { label: 'Add stub', },
      { label: 'Delete object', },
      { label: 'Duplicate object', },
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
      { type: 'separator' },
      { 
        label: 'Preview in browser',
        click () { require('electron').shell.openExternal("file://" + FILENAME) }
      }
    ]
  },
  {
    label: 'Options',
    submenu: [
      { 
        label: 'Show only rooms for exits', type: 'checkbox', checked : true,
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
      }
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


