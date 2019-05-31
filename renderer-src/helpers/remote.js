import electron from 'electron'

export default electron.remote

export { electron }
export const app = electron.remote.app
export const requireRemote = (modulePath) => electron.remote.require(modulePath)