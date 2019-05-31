import Compressor from 'compressorjs'
import remote, { requireRemote } from 'helpers/remote'
import { createThumbnail } from 'utils/image'
import { imageTypesForImagemin, imageTypesForCompressorJS, imageTypesForSvgo, imageTypesForGiflossy, svgoOptions } from 'constants/image'

const fs = requireRemote('fs')
const path = requireRemote('path')
const Svgo = requireRemote('svgo')
const giflossy = requireRemote('giflossy')
const { compressByImagemin } = requireRemote('./helpers/imagemin')
const { execFile } = requireRemote('child_process')

const SYSTEM_TEMP_PATH = remote.app.getPath('temp')
const APP_TEMP_DIR_NAME = '/app.repic.compressor/'

export const APP_TEMP_PATH = path.join(SYSTEM_TEMP_PATH, APP_TEMP_DIR_NAME)

!fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

export const compressByCompressorJS = (file, preferences) => new Promise((resolve, reject) => {
  new Compressor(file, {
    quality: preferences.outputQuality * 1,
    checkOrientation: preferences.tryFixOrientation,
    convertSize: Infinity,
    success: (data) => resolve({ data }),
    error: reject
  })
})

export const compressByGiflossy = (filePath, preferences) => new Promise((resolve, reject) => {

  const outputPath = `${filePath}.temp`

  execFile(giflossy, ['-O3', `--lossy=${preferences.outputQuality * 100}`, '-o', outputPath, filePath], error => {
    if (error) {
      reject(error)
    } else {
      fs.renameSync(outputPath, filePath)
      resolve({
        outputFileCreated: true,
        outputFileSize: fs.statSync(filePath).size
      })
    }
  })

})

export const compressBySvgo = async (filePath) => {

  const svgo = new Svgo(svgoOptions)
  const fileData = fs.readFileSync(filePath)

  return await svgo.optimize(fileData, {
    path: filePath
  })

}

export const writeFileAsync = (filePath, fileData) => new Promise((resolve, reject) => {

  if (fileData instanceof Blob) {
    const fileReader = new FileReader()

    fileReader.onload = () => {
      fs.writeFileSync(filePath, Buffer.from(new Uint8Array(fileReader.result)))
      const fileSize = fs.statSync(filePath).size
      resolve(fileSize)
    }

    fileReader.onerror = reject
    fileReader.readAsArrayBuffer(fileData)

    return false
  }

  fs.writeFileSync(filePath, fileData)
  resolve(fs.statSync(filePath).size)

})

export const backupTask = (task) => {

  try {

    !fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

    const backupFilePath = path.join(APP_TEMP_PATH, `${task.id}_${task.file.name}`)
    fs.copyFileSync(task.file.path, backupFilePath)

    return backupFilePath

  } catch (error) {
    return false
  }

}

export const restoreTask = (task, copy = false) => {

  try {
    copy ? fs.copyFileSync(task.backupPath, task.file.path) : fs.renameSync(task.backupPath, task.file.path)
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

export const compressTask = async (task, preferences, onThumbCreate) => {

  let backupPath = null
  let optimizedFile = null
  let optimizedSize = null

  try {

    if (preferences.showThumb) {
      try {
        const { url: thumbUrl } = await createThumbnail(URL.createObjectURL(task.file), 120, 120)
        URL.revokeObjectURL(task.file)
        onThumbCreate(task.id, thumbUrl)
      } catch (error) {
        // do nothing.
      }
    }

    const filePath = task.file.path
    const imageType = task.file.type.split('/')[1].toLowerCase()

    backupPath = backupTask(task) || filePath

    if (imageTypesForImagemin.includes(imageType)) {
      optimizedFile = await compressByImagemin(backupPath, preferences)
    } else if (imageTypesForCompressorJS.includes(imageType)) {
      optimizedFile = await compressByCompressorJS(task.file, preferences)
    } else if (imageTypesForSvgo.includes(imageType)) {
      optimizedFile = await compressBySvgo(backupPath, preferences)
    } else if (imageTypesForGiflossy.includes(imageType)) {
      optimizedFile = await compressByGiflossy(backupPath, preferences)
    } else {
      throw 'format unsupport.'
    }

    if (optimizedFile && optimizedFile.outputFileCreated) {
      optimizedSize = optimizedFile.outputFileSize
    } else {
      optimizedSize = await writeFileAsync(filePath, optimizedFile.data)
    }

    if (optimizedSize >= task.originalSize) {
      optimizedSize = task.originalSize
      restoreTask(task, true)
    }

    return {
      id: task.id,
      status: 3,
      backupPath: backupPath,
      optimizedSize: optimizedSize,
      optimizedRate: (task.originalSize - optimizedSize) / task.originalSize * 100
    }

  } catch (error) {

    console.log(error)
    backupPath && fs.renameSync(backupPath, task.file.path)

    return {
      id: task.id,
      status: 4,
      error: error,
      optimizedFile: null
    }

  }

}
