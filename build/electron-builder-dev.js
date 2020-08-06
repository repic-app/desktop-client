const buildConfig = require('./electron-builder')

buildConfig.afterSign = undefined
buildConfig.mac = {
  category: 'public.app-category.photography',
  icon: 'assets/icon.icns',
  target: 'dmg',
}

module.exports = buildConfig
