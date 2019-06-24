const fs = require('fs')
const path = require('path')
const { getAPPData } = require('./storage')

const builtinPluginFolder = path.join(__dirname, '../plugins')
let registeredPlugins = []

const registerBuiltPlugins = () => {

  const plugins = fs.readdirSync(builtinPluginFolder)
  const pluginsData = getAPPData('plugins', [])

  registeredPlugins = []

  plugins && plugins.forEach((item) => {

    const pluginPath = path.join(builtinPluginFolder, item)

    if (fs.statSync(pluginPath).isDirectory()) {

      const plugin = require(pluginPath)
      const pluginData = pluginsData.find(({ name }) => name === plugin.name)

      if (!plugin.disabled) {
        plugin.path = path.join(builtinPluginFolder, item, plugin.main)
        registerPlugin({ ...plugin, ...pluginData })
      }
    }
  })

  return registeredPlugins
}

const updateRegisteredPlugins = (plugins) => {
  registeredPlugins = plugins
}

const registerPlugins = () => {

  const builtinPlugins = registerBuiltPlugins()
  const thridPartPlugins = []

  return [ ...builtinPlugins, ...thridPartPlugins ]
}

const getCompressors = () => {
  return registeredPlugins.filter(item => !item.disabled && item.type === 'compressor')
}

const registerPlugin = (plugin) => {

  if (plugin && plugin.type) {
    registeredPlugins.push(plugin)
  }
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

module.exports = { registerBuiltPlugins, registerPlugin, registerPlugins, getCompressors, updateRegisteredPlugins }