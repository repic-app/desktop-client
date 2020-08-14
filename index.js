const { app, ipcMain, BrowserWindow } = require('electron')
const os = require('os')
const storage = require('./helpers/storage')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const packageJSON = require('./package.json')

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
    const returnData = {
      error: { status: -1, msg: '检测更新查询异常' },
      checking: { status: 0, msg: '正在检查应用程序更新' },
      updateAva: { status: 1, msg: '检测到新版本，正在下载,请稍后' },
      updateNotAva: { status: -1, msg: '您现在使用的版本为最新版本,无需更新!' },
    }

    autoUpdater.setFeedURL(packageJSON.publish[0].url)

    //更新错误
    autoUpdater.on('error', function (error) {
      sendUpdateMessage(returnData.error)
    })

    //检查中
    autoUpdater.on('checking-for-update', function () {
      sendUpdateMessage(returnData.checking)
    })

    //发现新版本
    autoUpdater.on('update-available', function (info) {
      sendUpdateMessage(returnData.updateAva)
    })

    //当前版本为最新版本
    autoUpdater.on('update-not-available', function (info) {
      setTimeout(function () {
        sendUpdateMessage(returnData.updateNotAva)
      }, 1000)
    })

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
      mainWindow.webContents.send('downloadProgress', progressObj)
    })

    autoUpdater.on('update-downloaded', function (
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateUrl,
      quitAndUpdate
    ) {
      ipcMain.on('isUpdateNow', (e, arg) => {
        //some code here to handle event
        autoUpdater.quitAndInstall()
      })
      // win.webContents.send('isUpdateNow')
    })

    //执行自动更新检查
    autoUpdater.checkForUpdates()
  }

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
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
