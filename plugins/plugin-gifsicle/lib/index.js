const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const arch = os.arch()
const platform = os.platform()

let gifsicleBinPath = null

if (['win32', 'darwin'].includes(platform)) {
  gifsicleBinPath = `./vendor/${platform}/gifsicle`
} else if (['linux', 'freebsd'].includes(platform)) {
  gifsicleBinPath = `./vendor/${platform}/${arch}/gifsicle`
}

if (platform === 'win32') {
  gifsicleBinPath = `${gifsicleBinPath}.exe`
}

gifsicleBinPath && (gifsicleBinPath = path.join(__dirname, gifsicleBinPath))

module.exports = (task, preferences) => new Promise((resolve, reject) => {

  if (!gifsicleBinPath || !fs.existsSync(gifsicleBinPath)) {
    reject('platform unsupport.')
    return false
  }

  const outputPath = preferences.overrideOrigin ? `${task.path}.temp` : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`

  execFile(gifsicleBinPath, [`--lossy=${parseInt((1 - preferences.outputQuality) * 100)}`, task.path, '-o', outputPath], error => {
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