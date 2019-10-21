import React from 'react'
import './styles.scss'

export default React.memo(() => {

  return (
    <div className="component-about">
      <div className="app-icon" />
      <h2 className="app-name">
        <span>Repic <small>v0.0.3</small></span>
      </h2>
      <h3 className="app-description">一个好用的图片压缩工具</h3>
    </div>
  )
})