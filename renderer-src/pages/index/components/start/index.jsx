import React from 'react'
import './styles.scss'

export default React.memo((props) => {

  return (
    <div className="component-start">
      <div className="photos-folder"></div>
      <div className="drag-tip">
        <span>拖拽图片至此窗口以开始压缩</span>
        <small>JPG/PNG/WEBP/SVG/GIF</small>
      </div>
      <a onClick={props.onRequestPickFile} className="pick-enrty text-with-icon">
        <i className="mdi mdi-plus" />
        <span>选择图片开始压缩</span>
      </a>
    </div>
  )

})