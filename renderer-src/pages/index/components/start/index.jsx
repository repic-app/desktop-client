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
        {noCompressors ? null : (
          <a onClick={props.onRequestPickFile} className="pick-enrty">选择文件</a>
        )}
      </div>
      {props.appState.jjma ? null : (
        <a href="javascript:void(0);" onClick={toggleAboutModal} className="unlock-entry text-warning text-with-icon"><i className="mdi mdi-lock"/><span>请激活以解锁完整功能</span></a>
      )}
    </div>
  )

})