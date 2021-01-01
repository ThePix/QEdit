
const { app } = require('electron').remote;
import * as Constants from './constants'

export default class Menus {
  getMenus() {
    const template = [
      {
        label: 'File',
        submenu: [
          { label: 'New', accelerator: 'CmdOrCtrl+N',},
          { label: 'Open...', accelerator: 'CmdOrCtrl+O',},
          { label: 'Save', accelerator: 'CmdOrCtrl+S',},
          { label: 'Save As...', accelerator: 'CmdOrCtrl+Alt+S',},
          { label: 'Export to JavaScript', accelerator: 'CmdOrCtrl+J',},
          { type: 'separator' },
          { label: 'Exit', accelerator: 'Alt+F4',},
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
          { label: 'Paste', role: 'paste' },
          { label: 'Preferences...', accelerator: 'CmdOrCtrl+,' },
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools', accelerator: 'CmdOrCtrl+Shift+I', registerAccelerator: true },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { label: 'Toggle Full Screen', role: 'togglefullscreen' },
          //{ type: 'separator' },
          //{
          //  label: 'Preview in browser',
          //  click () { require('electron').shell.openExternal("file://" + FILENAME) }
          //}
          { type: 'separator' },
          { id: 'toggleBlockly', label: 'Toggle Blockly (EXPERIMENTAL)', visible: false,
            click:() => {
              let of = window.document.getElementsByTagName('body')[0].style.overflow
              window.document.getElementsByTagName('body')[0].style.overflow = of === 'hidden' ? 'auto' : 'hidden'
              getEl('blocklyDiv').style.display = of === 'hidden' ? 'block' : 'none'
              getEl('textarea').style.display = of === 'hidden' ? 'block' : 'none'
              if (of === 'hidden') {
                window.alert("Scroll down for Blockly!\n\n(It's not worth much yet.)")
              }
            }}
        ]
      },
      {
        label: 'Object',
        id: 'objectMenu',
        submenu: [
          { label: 'Add location', accelerator: 'CmdOrCtrl+L',},
          { label: 'Add item', accelerator: 'CmdOrCtrl+I',},
          { label: 'Add stub', },
          { type: 'separator' },
          { label: 'Delete object', },
          { label: 'Duplicate object', accelerator: 'CmdOrCtrl+D',},
          { type: 'separator' },
          { label: 'Add function', accelerator: 'Alt+CmdOrCtrl+F',},
          { label: 'Add command', accelerator: 'Alt+CmdOrCtrl+C',},
          { label: 'Add template', accelerator: 'Alt+CmdOrCtrl+T',},
        ]
      },
      {
        label: 'Search',
        submenu: [
          { label: 'Find', accelerator: 'CmdOrCtrl+F',},
          { label: 'Find next', accelerator: 'F3',},
          { label: 'Search backwards', type: 'checkbox', checked : false, },
          { label: 'Search case sensitive', type: 'checkbox', checked : true, },
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Help',
            click () {
              require('electron').shell.openExternal(Constants.WIKI_URL)
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
          { label: 'Preferences...', accelerator: 'CmdOrCtrl+,',},
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', role: 'quit' }
        ]
      });

      // File menu
      template[1].submenu.pop()
      template[1].submenu.pop()

      // Edit menu
      template[2].submenu.pop()
      template[2].submenu.push(
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      );

      // Window menu
      template.splice(-1, 0, {
        label: 'Window',
        submenu: [
          { role: 'close' },
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ]}
      );
    }
    return template;
  }
}
