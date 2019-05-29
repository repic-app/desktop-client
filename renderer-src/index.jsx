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

// TODO
// - 应用图标进度条
// - 标题栏副标题显示状态
// - 配置参数全部应用
// - 重新转换功能
// - 子线程转换，防止UI卡顿
// - 启动体验优化