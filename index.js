const { app, ipcMain, dialog, BrowserWindow } = require('electron')
const os = require('os')
const storage = require('./helpers/storage')
const path = require('path')
const { autoUpdater } = require('electron-differential-updater') //electron-updater
const log = require('electron-log')
const packageJSON = require('./package.json')

const isProduction = process.env.NODE_ENV !== 'development'
const isWindows = os.platform() === 'win32'

const rendererPageBaseURL = !isProduction
  ? 'http://localhost:8188'
  : 'file://' + path.join(__dirname, './renderer/index.html')
let mainWindow = null

const updateCheckResponseData = {
  error: { status: -1, msg: '更新出错，请稍后再试' },
  checking: { status: 0, msg: '正在检查应用程序更新' },
  updating: { status: 1, msg: '检测到新版本，正在下载,请稍后' },
  latest: { status: 2, msg: '您现在使用的版本为最新版本,无需更新!' },
}

if (isProduction) {
  Object.assign(console, log.functions)
}

function initialize() {
  app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required')

  makeSingleInstance()

  function createMainWindow() {
    const windowOptions = {
      show: false,
      width: 440,
      height: 680,
      title: app.getName(),
      backgroundColor: '#ffffff',
      transparent: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      hasShadow: true,
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

  function initializeUpdater() {
    autoUpdater.setFeedURL('http://repic-cdn.margox.cn/releases')

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (data) {
      sendUpdateMessage(data, 'update-download-progress')
    })

    //更新错误
    autoUpdater.on('error', function (error) {
      sendUpdateMessage(updateCheckResponseData.error)
    })

    //检查中
    autoUpdater.on('checking-for-update', function () {
      sendUpdateMessage(updateCheckResponseData.checking)
    })

    //发现新版本
    autoUpdater.on('update-available', function (info) {
      sendUpdateMessage(updateCheckResponseData.updating)
    })

    //当前版本为最新版本
    autoUpdater.on('update-not-available', function (info) {
      setTimeout(function () {
        sendUpdateMessage(updateCheckResponseData.latest)
      }, 1000)
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: 'info',
        buttons: ['重启', '稍后'],
        title: '软件更新',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: '新版本已经下载完成是否重启应用并安装？',
      }

      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
      })
    })
  }

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(message, channel = 'update-event') {
    log.info(message)
    mainWindow.webContents.send(channel, message)
  }

  app.on('ready', () => {
    storage.initializeAPPData().then(() => {
      createMainWindow()
      initializeUpdater()
    })
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    mainWindow === null && createMainWindow()
  })

  ipcMain.on('checkForUpdate', (event, data) => {
    autoUpdater.checkForUpdates()
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

// 处理未捕获的错误
process.on('uncaughtException', (error) => {})

// TODO
