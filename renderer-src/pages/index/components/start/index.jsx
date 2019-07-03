import React from 'react'
import './styles.scss'

export default React.memo((props) => {

  const acceptImageExtensions = props.compressors.map(item => item.extensions).flat()
  const noCompressors = !props.compressors.length

  const toggleAboutModal = () => {
    props.setAppState({
      showAbout: true
    })
  }

  return (
    <div className="component-start">
      <div className="drag-tip-area">
        <div className="drag-shape"></div>
        <div className="drag-shape-mask"></div>
        <div className="drag-tip">
          {noCompressors ? <span>无可用转换插件</span> : <span>拖拽图片至此窗口</span>}
          <small>{acceptImageExtensions.filter((ext, index, exts) => index === exts.indexOf(ext)).join('/')}</small>
        </div>
      </div>
      {noCompressors ? null : (
        <a onClick={props.onRequestPickFile} className="pick-enrty"><i className="mdi mdi-plus"></i></a>
      )}
      <div className="processing-spinner"></div>
    </div>
  )

})