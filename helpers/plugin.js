const fs = require('fs')
const path = require('path')
const { getAPPData, APP_PLUGIN_PATH } = require('./storage')
const builtinPluginFolder = path.join(__dirname, '../plugins')

const remotePluginsURL = 'https://repic.app/plugins/list.json'

let registeredPlugins = []

!fs.existsSync(APP_PLUGIN_PATH) && fs.mkdirSync(APP_PLUGIN_PATH)

const registerPlugins = () => {

  const builtPlugins = fs.readdirSync(builtinPluginFolder)
  const thridPartPlugins = fs.readdirSync(APP_PLUGIN_PATH)
  const pluginsData = getAPPData('plugins', [])

  registeredPlugins = []

  builtPlugins && builtPlugins.forEach((item) => {

    const pluginPath = path.join(builtinPluginFolder, item)

    if (fs.statSync(pluginPath).isDirectory()) {

      const plugin = require(pluginPath)
      const pluginData = pluginsData.find(({ name }) => name === plugin.name)

      if (plugin && plugin.name && plugin.main) {
        registeredPlugins.push({
          ...plugin,
          ...pluginData,
          path: path.join(builtinPluginFolder, item, plugin.main),
          isBuiltinPlugin: true
        })
      }
    }
  })

  thridPartPlugins && thridPartPlugins.forEach((item) => {

    const pluginPath = path.join(APP_PLUGIN_PATH, item)

    if (fs.statSync(pluginPath).isDirectory()) {

      const plugin = require(pluginPath)
      const pluginData = pluginsData.find(({ name }) => name === plugin.name)

      if (plugin && plugin.name && plugin.main) {
        registeredPlugins.push({
          ...plugin,
          ...pluginData,
          path: path.join(APP_PLUGIN_PATH, item, plugin.main),
          isBuiltinPlugin: false
        })
      }
    }
  })

  return registeredPlugins
}

const updateRegisteredPlugins = (plugins) => {
  registeredPlugins = plugins
}

const getCompressors = () => {
  return registeredPlugins.filter(item => !item.disabled && item.type === 'compressor')
}

const fetchPlugins = async () => {
  // ...
}

const installPlugin = async () => {
  // ...
}

const removePlugin = async () => {
  // ...
}

module.exports = { APP_PLUGIN_PATH, registerPlugins, getCompressors, updateRegisteredPlugins }