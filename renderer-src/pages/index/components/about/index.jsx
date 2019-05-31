import React from 'react'
import { openLink } from 'utils/base'
import './styles.scss'

export default React.memo(() => {

  return (
    <div className="component-about">
      <div className="app-icon" />
      <div className="app-name">
        <span>Repic</span>
        <small>版本号: v0.0.1</small>
      </div>
      <div className="app-description">
        <h5 className="caption">超能刚哥出品，欢迎联系</h5>
        <div className="contacts">
          <a href="mailto:margox@foxmail.com" onClick={openLink} className="link">
            <span>邮箱：margox@foxmail.com</span>
          </a>
          <a href="https://weibo.com/margox" onClick={openLink} className="link">
            <span>微博：@超能刚哥</span>
          </a>
          <a href="https://margox.cn" onClick={openLink} className="link">
            <span>网站：https://margox.cn</span>
          </a>
        </div>
      </div>
    </div>
  )

})