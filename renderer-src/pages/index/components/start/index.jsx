import React from 'react'
import './styles.scss'

export default React.memo((props) => {

  const acceptImageExtensions = props.compressors.map(item => item.extensions).flat()
  const noCompressors = !props.compressors.length

  return (
    <div className="component-start">
      <div className="photos-folder"></div>
      <div className="drag-tip">
        {noCompressors ? <span>无可用转换插件</span> : <span>拖拽图片至此窗口以开始压缩</span>}
        <small>{acceptImageExtensions.filter((ext, index, exts) => index === exts.indexOf(ext)).join('/')}</small>
      </div>
      {noCompressors ? null : (
        <a onClick={props.onRequestPickFile} className="pick-enrty text-with-icon">
          <i className="mdi mdi-plus" />
          <span>选择图片开始压缩</span>
        </a>
      )}
    </div>
  )

})