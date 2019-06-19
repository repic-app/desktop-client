const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const arch = os.arch()
const platform = os.platform()

let pngquantBinPath = null

if (['win32', 'darwin'].includes(platform)) {
  pngquantBinPath = `./vendor/${platform}/pngquant`
} else if (['linux', 'freebsd'].includes(platform)) {
  pngquantBinPath = `./vendor/${platform}/${arch}/pngquant`
}

if (platform === 'win32') {
  pngquantBinPath = `${pngquantBinPath}.exe`
}

pngquantBinPath && (pngquantBinPath = path.join(__dirname, pngquantBinPath))

module.exports = (task, preferences) => new Promise((resolve, reject) => {

  console.log(pngquantBinPath)

  if (!pngquantBinPath || !fs.existsSync(pngquantBinPath)) {
    reject('platform unsupport.')
    return false
  }

  const outputPath = preferences.overrideOrigin ? `${task.path}.temp` : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`

  const maxQut = preferences.outputQuality * 1 >= 0.8 ? 80 : preferences.outputQuality * 100
  const minQut = maxQut - 10

  execFile(pngquantBinPath, ['--quality', `${minQut}-${maxQut}`, '-o', outputPath, task.path], error => {
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
