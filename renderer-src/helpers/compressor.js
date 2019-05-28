import Compressor from 'compressorjs'
import remote, { requireRemote } from 'helpers/remote'
import { imagesTypesUsingCompressorJS, imageTypesUsingSvgo, imageTypesUsingGiflossy, svgoOptions } from 'constants/image'

const Svgo = requireRemote('svgo')
const giflossy = requireRemote('giflossy')

const { execFile } = requireRemote('child_process')
const fs = requireRemote('fs')
const path = requireRemote('path')

const SYSTEM_TEMP_PATH = remote.app.getPath('temp')
const APP_TEMP_DIR_NAME = '/cn.margox.piccompressor/'

export const compressNormalImageAsync = (file, options) => new Promise((resolve, reject) => {
  new Compressor(file, {
    ...options,
    convertSize: Infinity,
    success: (data) => resolve({ data }),
    error: reject
  })
})

export const compressGifAsync = (task) => new Promise((resolve, reject) => {

  const outputPath = `${task.file.path}.temp.${task.id}`

  execFile(giflossy, ['-O3', '--lossy=80', '-o', outputPath, task.file.path], error => {
    if (error) {
      reject(error)
    } else {
      fs.renameSync(outputPath, task.file.path)
      resolve({
        outputFileCreated: true,
        outputFileSize: fs.statSync(task.file.path).size
      })
    }
  })

})

export const compressSvgAsync = async (filepath) => {

  const svgo = new Svgo(svgoOptions)
  const fileData = fs.readFileSync(filepath)

  return await svgo.optimize(fileData, {
    path: filepath
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

export const APP_TEMP_PATH = path.join(SYSTEM_TEMP_PATH, APP_TEMP_DIR_NAME)

!fs.existsSync(APP_TEMP_PATH) && fs.mkdirSync(APP_TEMP_PATH)

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

export const restoreTask = (task) => {

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

export const compressTask = async (task, options) => {

  let backupPath = null
  let optimizedFile = null
  let optimizedSize = null

  try {

    const filePath = task.file.path
    const imageType = task.file.type.split('/')[1].toLowerCase()

    backupPath = backupTask(task) || filePath

    if (imagesTypesUsingCompressorJS.includes(imageType)) {
      optimizedFile = await compressNormalImageAsync(task.file, {
        quality: options.outputQuality * 1,
        checkOrientation: options.tryFixOrientation
      })
    } else if (imageTypesUsingSvgo.includes(imageType)) {
      optimizedFile = await compressSvgAsync(task.file.path)
    } else if (imageTypesUsingGiflossy.includes(imageType)) {
      optimizedFile = await compressGifAsync(task)
    } else {
      throw 'format unsupport.'
    }

    if (optimizedFile && optimizedFile.outputFileCreated) {
      optimizedSize = optimizedFile.outputFileSize
    } else {
      optimizedSize = await writeFileAsync(filePath, optimizedFile.data)
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
