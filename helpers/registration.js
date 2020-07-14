// const request = require('request')
const crypto = require('crypto')
const { machineIdSync } = require('node-machine-id')
const { getAPPData, setAppData } = require('./storage')

const tokenEncryptKey = 'zvr7ao910ff5x5t7af09avoarx6nt1bb'

const encryptString = (string) => {
  const cipher = crypto.createCipher('aes-256-cbc', tokenEncryptKey)
  return Buffer.concat([cipher.update(new Buffer(string, 'utf8')), cipher.final()]).toString()
}

const checkRegistrationAPI = async () => {
  const registrationCode = getAPPData('registrationCode')

  if (!registrationCode) {
    return false
  }

  return {
    jjma: registrationCode,
  }
}

const fakeFetch = (url, param) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: url,
        data: {
          _s: encryptString(param.registrationCode),
          available: true,
        },
      })
    }, 500)
  })

const applyRegistrationCodeAPI = async (registrationCode) => {
  if (!registrationCode) {
    return false
  }

  const machineId = machineIdSync()

  // 前往服务端校验注册码和机器ID
  const result = await fakeFetch('http://registration-server/', { machineId, registrationCode }) //request('http://registration-server/', { machineId, registrationCode })
  // const result = {
  //   _s: 'asdasdasdasda',
  //   available: true,
  //   remineTimes: 2
  // }

  if (!result._s || result._s !== encryptString(registrationCode)) {
    return false
  }

  // setAppData('registrationCode', registrationCode)

  return result
}

module.exports = { checkRegistrationAPI, applyRegistrationCodeAPI }
