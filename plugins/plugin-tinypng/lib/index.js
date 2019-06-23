const fs = require('fs')
const tinify = require('tinify')

tinify.key = 'uk6Tsb2tkj6NUVaLgvs3meSZkyLjvQZa'

module.exports = (task) => new Promise((resolve, reject) => {

  fs.readFile(task.path, (error, sourceData) => {
    if (error) {
      reject(error)
    } else {
      tinify.fromBuffer(sourceData).toBuffer((error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve({ data })
        }
      })
    }

  })

})