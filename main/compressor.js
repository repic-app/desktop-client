const fs = require('fs')
const imagemin = require('imagemin')
const imageminSvgo = require('imagemin-svgo')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngQuant = require('imagemin-pngquant')
const imageminGifsicle = require('imagemin-gifsicle')

const getImageminPlugin = {
  'jpeg': () => {
    return imageminJpegtran({
      // progressive: true,
      arithmetic: true
    })
  },
  'jpg': () => {
    return imageminJpegtran({
      // progressive: true,
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
  }
}

const restoreImage = async (taskItem) => {

  try {

    const filePath = taskItem.file.path
    fs.writeFileSync(taskItem.file, filePath)

    return {
      ...taskItem,
      status: 4,
      optimizedFile: null,
      optimizedSize: null,
      optimizedRate: null
    }

  } catch (error) {
    return taskItem
  }

}

const compressImage = async (taskItem, options) => {

  try {

    const imageType = taskItem.file.type.split('/')[1].toLowerCase()
    const filePath = taskItem.file.path

    const [ optimizedFile ] = await imagemin([filePath], {
      plugins: [getImageminPlugin[imageType](options)]
    })

    fs.writeFileSync(filePath, optimizedFile.data)
    const fileState = fs.statSync(filePath)

    return {
      ...taskItem,
      status: 2,
      optimizedFile: optimizedFile,
      optimizedSize: fileState.size,
      optimizedRate: ((taskItem.originalSize - fileState.size) / taskItem.originalSize * 100).toFixed(2)
    }

  } catch (error) {
    return {
      ...taskItem,
      status: 3,
      error: error,
      optimizedFile: null
    }
  }

}

module.exports = { compressImage, restoreImage }