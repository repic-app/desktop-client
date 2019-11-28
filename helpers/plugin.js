const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')
const http = require('http')
const https = require('https')
const decompress = require('decompress')
const { getAPPData, APP_PLUGIN_PATH } = require('./storage')
const builtinPluginFolder = path.join(__dirname, '../plugins')

const thridPartPluginsURL = 'https://repic.app/plugins.json?r=' + Date.now()

let registeredPlugins = []

!fs.existsSync(APP_PLUGIN_PATH) && fs.mkdirSync(APP_PLUGIN_PATH)

const registerPlugins = () => {
  const builtPlugins = fs.readdirSync(builtinPluginFolder)
  const thridPartPlugins = fs.readdirSync(APP_PLUGIN_PATH)
  const pluginsData = getAPPData('plugins', [])

  registeredPlugins = []

  builtPlugins &&
    builtPlugins.forEach(item => {
      const pluginPath = path.join(builtinPluginFolder, item)

      if (fs.statSync(pluginPath).isDirectory()) {
        const plugin = require(pluginPath)
        const pluginData = pluginsData.find(({ name }) => name === plugin.name) || {}

        if (plugin && plugin.name && plugin.main) {
          registeredPlugins.push({
            ...pluginData,
            ...plugin,
            options: pluginData.options || plugin.options,
            path: path.join(builtinPluginFolder, item, plugin.main),
            isBuiltinPlugin: true,
          })
        }
      }
    })

  thridPartPlugins &&
    thridPartPlugins.forEach(item => {
      const pluginPath = path.join(APP_PLUGIN_PATH, item)

      if (fs.existsSync(path.join(pluginPath, 'index.js'))) {
        const plugin = require(pluginPath)
        const pluginData = pluginsData.find(({ name }) => name === plugin.name) || {}

        if (plugin && plugin.name && plugin.main) {
          registeredPlugins.push({
            ...pluginData,
            ...plugin,
            options: pluginData.options || plugin.options,
            path: path.join(APP_PLUGIN_PATH, item, plugin.main),
            isBuiltinPlugin: false,
          })
        }
      }
    })

  return registeredPlugins
}

const updateRegisteredPlugins = plugins => {
  registeredPlugins = plugins
}

const getCompressors = () => {
  return registeredPlugins.filter(item => !item.disabled && item.type === 'compressor')
}

const fetchPlugins = () =>
  new Promise((resolve, reject) => {
    try {
      https.get(thridPartPluginsURL, res => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (error) {
            reject(error)
          }
        })

        res.on('error', reject)
        res.on('abort', reject)
      })
    } catch (error) {
      reject(error)
    }
  })

const installPlugin = (name, url) =>
  new Promise((resolve, reject) => {
    const httpClient = url.indexOf('https:') === 0 ? https : http

    try {
      const tempFilePath = path.join(APP_PLUGIN_PATH, `.temp_${name}.zip`)
      httpClient.get(url, response => {
        response
          .pipe(fs.createWriteStream(tempFilePath))
          .on('error', reject)
          .on('close', () => {
            decompress(tempFilePath, APP_PLUGIN_PATH)
              .then(res => {
                fs.renameSync(
                  path.join(APP_PLUGIN_PATH, res[0].path),
                  path.join(APP_PLUGIN_PATH, name)
                )
                fs.unlinkSync(tempFilePath)
                const pluginData = require(path.join(APP_PLUGIN_PATH, name))
                pluginData.postinstallFn = pluginData.postinstall
                  ? pluginData.postinstall.toString()
                  : null
                resolve(pluginData)
              })
              .catch(reject)
          })
      })
    } catch (error) {
      reject(error)
    }
  })

const uninstallPlugin = async pluginPath => {
  try {
    rimraf.sync(path.join(APP_PLUGIN_PATH, pluginPath))
    return true
  } catch (error) {
    return true
  }
}

module.exports = {
  APP_PLUGIN_PATH,
  registerPlugins,
  fetchPlugins,
  installPlugin,
  uninstallPlugin,
  getCompressors,
  updateRegisteredPlugins,
}
