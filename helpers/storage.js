// TODO
// 对存储到userData目录的文件内容进行加密处理

const fs = require('fs')
const electron = require('electron')
const path = require('path')
const { encryptFileAsync, decryptFileAsync } = require('./filecrypt')

const SYSTEM_USER_DATA_PATH = (electron.app || electron.remote.app).getPath('userData')
const SYSTEM_TEMP_PATH = (electron.app || electron.remote.app).getPath('temp')
const SYSTEM_DOC_PATH = (electron.app || electron.remote.app).getPath('documents')
const APP_DATA_FILE_NAME = 'app.repic.compressor.profile.dat'
const APP_TEMP_DIR_NAME = '/app.repic.compressor/'
const APP_DOC_DIR_NAMEE = '/Repic'
const APP_PLUGIN_DIR_NAME = '/plugins'
const APP_DATA_FILE_ENCRYPT_KEY = '6a1ca05160278b771b8a65932977'
const APP_DATA_FILE_PATH = path.join(SYSTEM_USER_DATA_PATH, APP_DATA_FILE_NAME)
const APP_TEMP_PATH = path.join(SYSTEM_TEMP_PATH, APP_TEMP_DIR_NAME)
const APP_DOC_PATH = path.join(SYSTEM_DOC_PATH, APP_DOC_DIR_NAMEE)
const APP_PLUGIN_PATH = path.join(SYSTEM_USER_DATA_PATH, APP_PLUGIN_DIR_NAME)

const defaultAPPData = {
  preferences: {
    outputQuality: 0.6,
    convertSvgToPng: false,
    tryFixOrientation: false,
    stripMetedata: false,
    overrideOrigin: true,
    autoSavePath: APP_DOC_PATH,
    theme: 'auto',
    parallelTaskCount: 3,
    showThumb: true,
    stickyOnLaunch: false,
    soundEffects: false
  },
  showPluginInstallTip: true,
  plugins: []
}

let cachedAPPData = {}
let globalData = {}

const getGlobalData = (name) => {
  return globalData[name]
}

const setGlobalData = (name, value) => {
  return globalData[name] = value
}

const removeGlobalData = (name) => {
  delete globalData[name]
}

const createDefaultProfileFile = async () => {
  await encryptFileAsync(APP_DATA_FILE_PATH, defaultAPPData, APP_DATA_FILE_ENCRYPT_KEY)
}

const initializeAPPData = async () => {

  if (!fs.existsSync(APP_DATA_FILE_PATH)) {
    await createDefaultProfileFile()
  }

  if (!fs.existsSync(APP_DOC_PATH)) {
    fs.mkdirSync(APP_DOC_PATH)
  }

  try {    
    cachedAPPData = await decryptFileAsync(APP_DATA_FILE_PATH, APP_DATA_FILE_ENCRYPT_KEY) || defaultAPPData
  } catch (error) {
    cachedAPPData = defaultAPPData
  }

  return cachedAPPData

}

const getAPPData = (name, defaultData = null) => {
  return name ? (cachedAPPData[name] || defaultData) : cachedAPPData
}

const setAPPData = async (name, data) => {

  cachedAPPData[name] = data
  await encryptFileAsync(APP_DATA_FILE_PATH, cachedAPPData, APP_DATA_FILE_ENCRYPT_KEY)

}

const getAPPDataByPage = (name, page, pageSize = 10) => {
  return getAPPData(name, []).slice((page - 1) * pageSize, page * pageSize)
}

module.exports = { initializeAPPData, APP_TEMP_PATH, APP_DOC_PATH, APP_PLUGIN_PATH, getAPPData, setAPPData, getAPPDataByPage, getGlobalData, setGlobalData, removeGlobalData }