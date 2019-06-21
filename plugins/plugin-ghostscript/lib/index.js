const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const arch = os.arch()
const platform = os.platform()

let gsBinPath = null

if (['win32', 'darwin'].includes(platform)) {
  gsBinPath = `./vendor/${platform}/gs`
} else if (['linux', 'freebsd'].includes(platform)) {
  gsBinPath = `./vendor/${platform}/${arch}/gs`
}

if (platform === 'win32') {
  gsBinPath = `${gsBinPath}.exe`
}

gsBinPath && (gsBinPath = path.join(__dirname, gsBinPath))

module.exports = (task, preferences) => new Promise((resolve, reject) => {

  if (!gsBinPath || !fs.existsSync(gsBinPath)) {
    reject('platform unsupport.')
    return false
  }

  const outputPath = preferences.overrideOrigin ? `${task.path}.temp` : `${preferences.autoSavePath}/optmized_${task.id}_${task.file.name}`

  execFile(gsBinPath, ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dPDFSETTINGS=/screen', '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${outputPath}`, task.path], (error, res) => {
    if (error) {
      console.log(error)
      reject(error)
    } else {
      console.log(res)
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
