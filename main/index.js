const { app, Menu, BrowserWindow, ipcMain } = require('electron')
const storage = require('./storage')
const path = require('path')

const rendererPageBaseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8188' : 'file://' + path.join(__dirname, '../renderer/index.html')
let mainWindow = null

function initialize () {

  makeSingleInstance()

  function createMainWindow () {

    const windowOptions = {
      width: 440,
      height: 640,
      title: app.getName(),
      vibrancy: 'dark',
      transparent: true,
      // backgroundColor: 'transparent',
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      icon: path.join(__dirname, 'assets/icon.png'),
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        webSecurity: false
      }
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(`${rendererPageBaseURL}`)

    mainWindow.on('closed', () => {
      mainWindow = null
    })

  }

  app.on('ready', async () => {

    Menu.setApplicationMenu(null)

    await storage.initializeAPPData()
    createMainWindow()

  })

  app.on('window-all-closed', () => {
    !mainWindow && app.quit()
  })

  app.on('activate', () => {

    if (mainWindow === null) {
      createMainWindow()
    }

  })

}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

  })

}

initialize()