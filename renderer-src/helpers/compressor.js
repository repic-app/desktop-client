import { requireRemote } from 'helpers/remote'
import { createThumbnail } from 'utils/image'

const { getRegisteredCompressors } = requireRemote('./helpers/plugin')

const cachedCompressors = {}

const fs = requireRemote('fs')
const path = requireRemote('path')

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

  if (task.backupPath) {

    try {
      copy ? fs.copyFileSync(task.backupPath, task.path) : fs.renameSync(task.backupPath, task.path)
    } catch (error) {
      console.warn(error)
      // ...
    }

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

  const compressors = getRegisteredCompressors()

  let backupPath = null
  let optimizeResule = null
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

    const matchedCompressor = compressors.find(compressor => {
      return compressor.accepts.includes(imageType)
    })

    if (!matchedCompressor) {
      throw 'Unsupported file format.'
    }

    if (!cachedCompressors[matchedCompressor.name]) {
      cachedCompressors[matchedCompressor.name] = matchedCompressor.process === 'main' ? requireRemote(matchedCompressor.path) : requireRemote(matchedCompressor.path)
    }

    optimizeResule = await cachedCompressors[matchedCompressor.name](task, preferences)

    if (optimizeResule && optimizeResule.path) {
      optimizedSize = optimizeResule.size
      optimizedPath = optimizeResule.path
    } else {
      optimizedPath = preferences.overrideOrigin ? filePath : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`
      optimizedSize = await writeFileAsync(optimizedPath, optimizeResule.data)
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
