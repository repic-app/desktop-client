import electron from 'electron'
import { APP_TEMP_PATH, APP_DOC_PATH, APP_PLUGIN_PATH } from 'helpers/remote'

const fs = electron.remote.require('fs')
const mimeTypes = electron.remote.require('mime-types')

Object.defineProperty(File, 'path', {
  configurable: true,
  writable: true
})

export const resolveLocalFiles = (filePaths) => {

  return filePaths.map(filePath => {
    return {
      file: new File([fs.readFileSync(filePath)], filePath.split('/').slice(-1)[0], {
        type: mimeTypes.lookup(filePath)
      }),
      path: filePath
    }
  })

}

export const generateId = (prefix = '') => {
  return prefix + Math.random().toString(13).split('.')[1] + new Date().getTime()
}

export const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

export const formatSize = (size) => {
  return size > 1000 * 1000 ? (size / 1000 / 1000).toFixed(2) + 'MB' : (size / 1000).toFixed(2) + 'KB'
}

export const formateOptimizedRate = (optimizedRate) => {

  if (optimizedRate >= 30) {
    return 'success'
  } else if (optimizedRate >= 5) {
    return 'warning'
  } else {
    return 'danger'
  }

}

export const openCacheFolder = () => {
  electron.shell.openItem(APP_TEMP_PATH)
}

export const openPluginFolder = () => {
  electron.shell.openItem(APP_PLUGIN_PATH)
}

export const openFolder = (path) => {
  electron.shell.openItem(path)
}

export const locateFile = (path) => {
  electron.shell.showItemInFolder(path)
}

export const openLink = (event) => {

  if (typeof event === 'string') {
    electron.shell.openExternal(event)
    return false
  }

  electron.shell.openExternal(event.currentTarget.href)
  event.preventDefault()

}

export const formatJJMa = (stringJJMa) => {

  if (stringJJMa.length !== 20) {
    return 'INVAILD SN NUMBER'
  }

  return [stringJJMa.slice(0, 4), stringJJMa.slice(4, 8), '****', '****',stringJJMa.slice(16, 20)].join(' ')

}
