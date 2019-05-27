const fs = require('fs')
const path = require('path')
const electron = require('electron')
const imagemin = require('imagemin')
const imageminSvgo = require('imagemin-svgo')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngQuant = require('imagemin-pngquant')
const imageminGifsicle = require('imagemin-gifsicle')

const SYSTEM_TEMP_PATH = (electron.app || electron.remote.app).getPath('temp')
const APP_TEMP_DIR_NAME = '/cn.margox.piccompressor/'
const APP_TEMP_PATH = path.join(SYSTEM_TEMP_PATH, APP_TEMP_DIR_NAME)

!fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

const getImageminPlugin = {
  'jpeg': () => {
    return imageminJpegtran({
      arithmetic: true
    })
  },
  'jpg': () => {
    return imageminJpegtran({
      arithmetic: true
    })
  },
  'png': (options) => {
    return imageminPngQuant({
      speed: 10,
      strip: options.wipeMetada,
      quality: [options.outputQuality * 1, options.outputQuality * 1]
    })
  },
  'gif': () => {
    return imageminGifsicle()
  },
  'svg': () => {
    return imageminSvgo()()
  },
  'svg+xml': () => {
    return imageminSvgo()()
  }
}

const backupTask = (task) => {

  try {

    !fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

    const backupFilePath = path.join(APP_TEMP_PATH, `${task.id}_${task.file.name}`)
    fs.renameSync(task.file.path, backupFilePath)

    return backupFilePath

  } catch (error) {
    return false
  }

}

const restoreTask = (task) => {

  try {
    fs.renameSync(task.backupPath, task.file.path)
    return {
      id: task.id,
      status: 5,
      optimizedFile: null,
      optimizedSize: null,
      optimizedRate: null
    }
  } catch (error) {
    return false
  }

}

const compressTask = async (task, options) => {

  let backupPath = null

  try {

    const filePath = task.file.path
    const imageType = task.file.type.split('/')[1].toLowerCase()

    backupPath = backupTask(task) || filePath

    const [ optimizedFile ] = await imagemin([backupPath], {
      plugins: [getImageminPlugin[imageType](options)]
    })

    fs.writeFileSync(filePath, optimizedFile.data)
    const optimizedSize = fs.statSync(filePath).size

    return {
      id: task.id,
      status: 3,
      backupPath: backupPath,
      optimizedSize: optimizedSize,
      optimizedRate: (task.originalSize - optimizedSize) / task.originalSize * 100
    }

  } catch (error) {

    backupPath && fs.renameSync(backupPath, task.file.path)

    return {
      id: task.id,
      status: 4,
      error: error,
      optimizedFile: null
    }

  }

}

module.exports = { APP_TEMP_PATH, compressTask, backupTask, restoreTask }