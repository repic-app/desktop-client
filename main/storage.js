// TODO
// 对存储到userData目录的文件内容进行加密处理

const fs = require('fs')
const electron = require('electron')
const path = require('path')
const { encryptFileAsync, decryptFileAsync } = require('./file-crypt')

const SYSTEM_USER_DATA_PATH = (electron.app || electron.remote.app).getPath('userData')
const APP_DATA_FILE_NAME = 'feather_profile.dat'
const APP_DATA_FILE_ENCRYPT_KEY = '6a1c105160278b771b8a65932977'
const APP_DATA_FILE_PATH = path.join(SYSTEM_USER_DATA_PATH, APP_DATA_FILE_NAME)

const defaultAPPData = {
  preferences: {
    outputQuality: 0.6,
    tryFixOrientation: false,
    wipeMetadata: false,
    parallelTaskCount: 5,
    soundEffects: true
  }
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

module.exports = { initializeAPPData, getAPPData, setAPPData, getAPPDataByPage, getGlobalData, setGlobalData, removeGlobalData }