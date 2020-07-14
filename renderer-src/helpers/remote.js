import electron from 'electron'
const { APP_TEMP_PATH, APP_DOC_PATH, APP_PLUGIN_PATH } = electron.remote.require(
  './helpers/storage'
)

export default electron.remote

export { electron, APP_TEMP_PATH, APP_DOC_PATH, APP_PLUGIN_PATH }
export const app = electron.remote.app
export const requireRemote = (modulePath) => electron.remote.require(modulePath)
