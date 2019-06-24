const fs = require('fs')
const path = require('path')
const { getAPPData } = require('./storage')

const builtinPluginFolder = path.join(__dirname, '../plugins')
const registeredPlugins = []

const registerBuiltPlugins = () => {

  const plugins = fs.readdirSync(builtinPluginFolder)

  plugins && plugins.forEach((item) => {

    const pluginPath = path.join(builtinPluginFolder, item)

    if (fs.statSync(pluginPath).isDirectory()) {
      const plugin = require(pluginPath)
      if (!plugin.disabled) {
        plugin.path = path.join(builtinPluginFolder, item, plugin.main)
        registerPlugin(plugin)
      }
    }

  })

}

const getRegisteredCompressors = () => {
  return registeredPlugins.filter(plugin => plugin.type === 'compressor')
}

const getRegisteredPlugins = () => { 

  const pluginData = getAPPData('plugins', {})

  return registeredPlugins.map(item => {
    return { ...item, ...pluginData[item.name] }
  })
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

module.exports = { registerBuiltPlugins, registerPlugin, getRegisteredPlugins, getRegisteredCompressors }