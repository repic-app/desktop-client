import electron from 'electron'

const compareViewWindowOptions = {
  show: false,
  width: 800,
  height: 680,
  minWidth: 600,
  minHeight: 680,
  resizable: false,
  maximizable: false,
  fullscreenable: false,
  title: '压缩效果对比',
  frame: true,
  hasShadow: true,
  transparent: true,
  titleBarStyle: 'hiddenInset',
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
    compareViewWindow.focus()
  }
}
