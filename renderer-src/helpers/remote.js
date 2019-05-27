import _electron from 'electron'

export default _electron.remote

export const electron = _electron
export const app = electron.remote.app
export const requireRemote = (modulePath) => electron.remote.require(modulePath)