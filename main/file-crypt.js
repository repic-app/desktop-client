const fs = require('fs')
const crypto = require('crypto')

exports.encryptFileAsync = (filePath, data, key) => new Promise((resolve, reject) => {

  try {

    const cipher = crypto.createCipher('aes-256-cbc', key)
    const encrypted = Buffer.concat([cipher.update(new Buffer(JSON.stringify(data), 'utf8')), cipher.final()])
  
    fs.writeFile(filePath, encrypted, error => {
      if(error) {
        reject(error)
      }
      resolve({ message: 'Encrypted!' })
    })

  } catch (exception) {
    reject({ message: exception.message })
  }

})

exports.decryptFileAsync = (filePath, key) => new Promise((resolve, reject) => {

  fs.readFile(filePath, (error, data) => {

    if(error) {
      reject(error)
    }

    try {

      const decipher = crypto.createDecipher('aes-256-cbc', key)
      const decrypted = Buffer.concat([decipher.update(data), decipher.final()])

      resolve(JSON.parse(decrypted.toString()))

    } catch (exception) {
      reject({ message: exception.message })
    }

  })

})