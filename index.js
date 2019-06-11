const { app, Menu, BrowserWindow, ipcMain } = require('electron')
const storage = require('./helpers/storage')
const path = require('path')
const isProduction = process.env.NODE_ENV !== 'development'

const rendererPageBaseURL = !isProduction ? 'http://localhost:8188' : 'file://' + path.join(__dirname, './renderer/index.html')
let mainWindow = null

app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

function initialize () {

  makeSingleInstance()

  function createMainWindow () {

    const windowOptions = {
      show: false,
      width: 440,
      height: 640,
      title: app.getName(),
      transparent: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: true,
      hasShadow: true,
      icon: path.join(__dirname, 'assets/icon.png'),
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        devTools: !isProduction,
        webSecurity: false,
        nodeIntegration: true,
        experimentalFeatures: true
      }
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(`${rendererPageBaseURL}`)

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    !isProduction && mainWindow.webContents.openDevTools({
      mode: 'detach'
    })

  }

  app.on('ready', () => {
    storage.initializeAPPData().then(createMainWindow)
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

// TODO
// - APP图标
// - 支持拖动文件到Dock图标
// - 应用图标进度条
// - 标题栏副标题显示状态
// - 配置参数全部应用
// - 重新转换功能
// - 子线程转换，防止UI卡顿
// - 启动体验优化