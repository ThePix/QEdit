import { app, BrowserWindow, dialog } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { enableLiveReload } from 'electron-compile'
import path from 'path'


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

const quitOptions  = {
  buttons: ["Yes", "No"],
  message: "Do you really want to quit?",
  detail:'Any unsaved work will be lost.',
  type:'warning',
};

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      //nodeIntegrationInWorker: false,
      preload: './preload.js',
      contextIsolation: false,
    },
    icon: path.join(__dirname, '/images/icon.png')
  });

  // Maximize the window!
  mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  //mainWindow.webContents.openDevTools();
  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  //Listen close event to show dialog message box
   mainWindow.on('close', (e) => {

     //Cancel the current event to prevent window from closing
     e.preventDefault()

     dialog.showMessageBox(mainWindow, quitOptions, (res, checked) => {
     if (res === 0){
      //Yes button pressed
      mainWindow.destroy()
      app.quit()
     }
   })
 })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
