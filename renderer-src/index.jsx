import electron from 'electron'
import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import AppEntry from './entry'

window.electron = electron
window.electronStorage = electron.remote.require('./storage')

const renderApp = Component => render((
  <AppContainer>
    <Component/>
  </AppContainer>
), document.querySelector('#root'))

renderApp(AppEntry)

if (module.hot) {
  module.hot.accept('./entry', () => {
    renderApp(AppEntry)
  })
}