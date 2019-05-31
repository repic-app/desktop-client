const fs = require('fs')
const pngquant = require('pngquant-bin')
const { execFile } = require('child_process')

const compressByImagemin = (filePath, preferences) => new Promise((resolve, reject) => {

  const outputPath = `${filePath}.temp`

  execFile(pngquant, ['--force', `--quality=${preferences.outputQuality * 100}-${preferences.outputQuality * 100}`, '-o', outputPath, filePath], error => {
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

module.exports = { compressByImagemin }