const { app, BrowserWindow } = require('electron')
const os = require('os')
const storage = require('./helpers/storage')
const path = require('path')
const isProduction = process.env.NODE_ENV !== 'development'
const isWindows = os.platform() === 'win32'

const rendererPageBaseURL = !isProduction
  ? 'http://localhost:8188'
  : 'file://' + path.join(__dirname, './renderer/index.html')
let mainWindow = null

function initialize() {
  app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

  makeSingleInstance()

  function createMainWindow() {
    const windowOptions = {
      show: false,
      width: isWindows ? 470 : 440,
      height: isWindows ? 710 : 680,
      title: app.getName(),
      backgroundColor: isWindows ? '#00ffffff' : '#00ffffff',
      transparent: true,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      hasShadow: !isWindows,
      icon: path.join(__dirname, 'assets/icon.png'),
      titleBarStyle: isWindows ? 'customBottomOnHover' : 'hiddenInset',
      // trafficLightPosition: { x: 10, y: 22 },
      webPreferences: {
        devTools: !isProduction,
        webSecurity: false,
        nodeIntegration: true,
        experimentalFeatures: true,
      },
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(`${rendererPageBaseURL}`)

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    mainWindow.webContents.openDevTools({
      mode: 'detach',
    })
  }

  app.on('ready', () => {
    storage.initializeAPPData().then(createMainWindow)
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    mainWindow === null && createMainWindow()
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
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

// TODO
