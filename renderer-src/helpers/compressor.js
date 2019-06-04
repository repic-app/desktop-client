import Compressor from 'compressorjs'
import { requireRemote } from 'helpers/remote'
import { createThumbnail } from 'utils/image'
import { imageTypesForImagemin, imageTypesForCompressorJS, imageTypesForSvgo, imageTypesForGiflossy, svgoOptions } from 'constants/image'

const fs = requireRemote('fs')
const path = requireRemote('path')
const Svgo = requireRemote('svgo')
const giflossy = requireRemote('giflossy')
const { compressByImagemin } = requireRemote('./helpers/imagemin')
const { execFile } = requireRemote('child_process')

export const { APP_TEMP_PATH } = requireRemote('./helpers/storage')

!fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

export const cleanTempFiles = () => new Promise((resolve) => {
  fs.rmdir(APP_TEMP_PATH, (error) => {
    if (error) {
      resolve()
    } else {
      fs.mkdirSync(APP_TEMP_PATH)
      resolve()
    }
  })
})

export const compressByCompressorJS = (file, preferences) => new Promise((resolve, reject) => {
  new Compressor(file, {
    quality: preferences.outputQuality * 1,
    checkOrientation: preferences.tryFixOrientation,
    convertSize: Infinity,
    success: (data) => resolve({ data }),
    error: reject
  })
})

export const compressByGiflossy = (task, preferences) => new Promise((resolve, reject) => {

  const outputPath = preferences.overrideOrigin ? `${task.path}.temp` : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`

  execFile(giflossy, ['-O3', `--lossy=${preferences.outputQuality * 100}`, '-o', outputPath, task.path], error => {
    if (error) {
      console.log(error)
      reject(error)
    } else {
      if (preferences.overrideOrigin) {
        fs.renameSync(outputPath, task.path)
        resolve({
          outputFileCreated: true,
          outputFilePath: task.path,
          outputFileSize: fs.statSync(task.path).size
        })
      } else {
        resolve({
          outputFileCreated: true,
          outputFilePath: outputPath,
          outputFileSize: fs.statSync(outputPath).size
        })
      }
    }
  })

})

export const compressBySvgo = async (filePath) => {

  const svgo = new Svgo(svgoOptions)
  const fileData = fs.readFileSync(filePath)

  return await svgo.optimize(fileData)

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
    fs.copyFileSync(task.path, backupFilePath)

    return backupFilePath

  } catch (error) {
    return false
  }

}

export const restoreTask = (task, copy = false) => {

  try {
    copy ? fs.copyFileSync(task.backupPath, task.path) : fs.renameSync(task.backupPath, task.path)
  } catch (error) {
    console.warn(error)
    // ...
  }

  return {
    id: task.id,
    status: 5,
    optimizedFile: null,
    optimizedSize: null,
    optimizedRate: null,
    optimizedPath: null
  }

}

export const compressTask = async (task, preferences, onThumbCreate) => {

  let backupPath = null
  let optimizedFile = null
  let optimizedSize = null
  let optimizedPath = null

  try {

    if (!preferences.overrideOrigin && !fs.existsSync(preferences.autoSavePath)) {
      fs.mkdirSync(preferences.autoSavePath)
    }

    if (preferences.showThumb) {
      try {
        const { url: thumbUrl } = await createThumbnail(URL.createObjectURL(task.file), 120, 120)
        URL.revokeObjectURL(task.file)
        onThumbCreate(task.id, thumbUrl)
      } catch (error) {
        // do nothing.
      }
    }

    const filePath = task.path
    const imageType = task.file.type.split('/')[1].toLowerCase()

    if (preferences.overrideOrigin) {
      backupPath = backupTask(task)
    }

    if (imageTypesForImagemin.includes(imageType)) {
      optimizedFile = await compressByImagemin(task, preferences)
    } else if (imageTypesForCompressorJS.includes(imageType)) {
      optimizedFile = await compressByCompressorJS(task.file, preferences)
    } else if (imageTypesForSvgo.includes(imageType)) {
      optimizedFile = await compressBySvgo(filePath, preferences)
    } else if (imageTypesForGiflossy.includes(imageType)) {
      optimizedFile = await compressByGiflossy(task, preferences)
    } else {
      throw 'format unsupport.'
    }

    if (optimizedFile && optimizedFile.outputFileCreated) {
      optimizedSize = optimizedFile.outputFileSize
      optimizedPath = optimizedFile.outputFilePath
    } else {
      optimizedPath = preferences.overrideOrigin ? filePath : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`
      optimizedSize = await writeFileAsync(optimizedPath, optimizedFile.data)
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
      optimizedPath: optimizedPath,
      optimizedRate: (task.originalSize - optimizedSize) / task.originalSize * 100
    }

  } catch (error) {

    console.log(error)
    backupPath && fs.renameSync(backupPath, task.path)

    return {
      id: task.id,
      status: 4,
      error: error,
      optimizedFile: null
    }

  }

}
