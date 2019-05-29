import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import AppEntry from './entry'

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
