const crypto = require('crypto')
const { machineIdSync } = require('node-machine-id')
const { getAppData, setAppData } = require('./storage')


const tokenEncryptKey = 'zvr7ao910ff5x5t7af09avoarx6nt1bb'

const encryptString = (string) => {
  const cipher = crypto.createCipher('aes-256-cbc', tokenEncryptKey)
  return Buffer.concat([cipher.update(new Buffer(string, 'utf8')), cipher.final()]).toString()
}

const checkRegistration = () => {

  const registrationCode = getAppData('registrationCode')

  if (!registrationCode) {
    return false
  }

}

const applyRegistrationCode = async (registrationCode) => {

  if (!code) {
    return false
  }

  const machineId = machineIdSync()

  // 前往服务端校验注册码和机器ID
  // const result = await request('http://registration-server/', { machineId, registrationCode })
  const result = {
    _s: 'asdasdasdasda'
    available: true,
    remineTimes: 2
  }

  if (!result._s || result._s !== encryptString(registrationCode)) {
    return false
  }

  setAppData('registrationCode', registrationCode)

  return result

}
