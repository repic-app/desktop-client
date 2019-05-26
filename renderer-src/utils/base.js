export const generateId = (prefix = '') => {
  return prefix + Math.random().toString(13).split('.')[1] + new Date().getTime()
}

export const getLocale = () => {
  return window.electron.remote.app.getLocale().split('-')[0]
}

export const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})