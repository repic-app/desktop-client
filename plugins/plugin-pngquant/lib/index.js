const fs = require('fs')
const pngquant = require('pngquant-bin')
const { execFile } = require('child_process')

module.exports = (task, preferences) => new Promise((resolve, reject) => {

  const outputPath = preferences.overrideOrigin ? `${task.path}.temp` : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`

  const maxQut = preferences.outputQuality * 1 >= 0.8 ? 80 : preferences.outputQuality * 100
  const minQut = maxQut - 10

  execFile(pngquant, ['--quality', `${minQut}-${maxQut}`, '-o', outputPath, task.path], error => {
    if (error) {
      reject(error)
    } else {
      if (preferences.overrideOrigin) {
        fs.renameSync(outputPath, task.path)
        resolve({
          path: task.path,
          size: fs.statSync(task.path).size
        })
      } else {
        resolve({
          path: outputPath,
          size: fs.statSync(outputPath).size
        })
      }
    }
  })

})
