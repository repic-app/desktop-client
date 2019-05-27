import electron from 'electron'

const { APP_TEMP_PATH } = electron.remote.require('./compressor')

export const generateId = (prefix = '') => {
  return prefix + Math.random().toString(13).split('.')[1] + new Date().getTime()
}

export const getLocale = () => {
  return window.electron.remote.app.getLocale().split('-')[0]
}

export const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

export const formatSize = (size) => {
  return (size / 1000).toFixed(2) + 'KB'
}

export const openCacheFolder = () => {
  electron.shell.openItem(APP_TEMP_PATH)
}

export const openLink = (event) => {

  if (typeof event === 'string') {
    electron.shell.openExternal(event)
    return false
  }

  electron.shell.openExternal(event.currentTarget.href)
  event.preventDefault()

}