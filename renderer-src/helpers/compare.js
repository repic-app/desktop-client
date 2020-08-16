import electron from 'electron'
import { requireRemote } from 'helpers/remote'

const os = requireRemote('os')
const isWindows = os.platform() === 'win32'

const compareViewWindowOptions = {
  show: false,
  width: isWindows ? 830 : 800,
  height: isWindows ? 730 : 680,
  resizable: false,
  maximizable: false,
  fullscreenable: false,
  title: '压缩效果对比',
  frame: !isWindows,
  hasShadow: !isWindows,
  transparent: isWindows,
  backgroundColor: '#00ffffff',
  titleBarStyle: isWindows ? 'customButtonOnHover' : 'hiddenInset',
  webPreferences: {
    devTools: true,
    webSecurity: false,
    nodeIntegration: true,
    experimentalFeatures: true,
  },
}

let compareViewWindow = null

export const getCompareViewWindow = () => {
  return compareViewWindow
}

export const openCompareView = (url, task) => {
  if (!compareViewWindow) {
    compareViewWindow = new electron.remote.BrowserWindow(compareViewWindowOptions)
    compareViewWindow.loadURL(url)

    compareViewWindow.on('ready-to-show', () => {
      compareViewWindow.webContents.send('load-task-data', task)
      compareViewWindow.show()
    })

    compareViewWindow.on('closed', () => {
      compareViewWindow = null
    })
  } else {
    compareViewWindow.webContents.send('load-task-data', task)
    if (compareViewWindow.isMinimized()) {
      compareViewWindow.restore()
    }
    compareViewWindow.focus()
  }
}
