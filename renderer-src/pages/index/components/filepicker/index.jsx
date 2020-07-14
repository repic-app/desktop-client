import React, { useState, useCallback } from 'react'
import events from 'helpers/events'
import remote, { requireRemote } from 'helpers/remote'
import { resolveLocalFiles } from 'utils/base'
import './styles.scss'

let dragEventTriggerCount = 0

export const DragWrapper = React.memo((props) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback((event) => {
    dragEventTriggerCount += 1
    setIsDragging(true)
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  const handleDragDrop = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
      dragEventTriggerCount > 0 && (dragEventTriggerCount -= 1)
      props.onChange(event.dataTransfer.files)
    },
    [props.onChange]
  )

  const handleDragCancel = useCallback((event) => {
    dragEventTriggerCount > 0 && (dragEventTriggerCount -= 1)

    if (dragEventTriggerCount === 0) {
      setIsDragging(false)
    }

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  }, [])

  return (
    <div
      className="component-drag-wrapper"
      onDragEnter={handleDragEnter}
      onDragExit={handleDragCancel}
      onDragEnd={handleDragCancel}
      onDragOver={handleDragOver}
      onDrop={handleDragDrop}
      onDragLeave={handleDragCancel}
      data-dragging-over={isDragging}>
      {props.children}
    </div>
  )
})

export const openFilePicker = (compressors, onChange) => {
  if (!compressors.length) {
    remote.dialog
      .showMessageBox({
        type: 'info',
        message: '未启用任何转换插件',
        detail: '是否前往插件管理页来启用转换插件？',
        defaultId: 0,
        buttons: ['是', '否'],
      })
      .then(({ response: index }) => {
        if (index === 0) {
          events.emit('request-open-plugin-settings')
        }
      })
    return false
  }

  remote.dialog
    .showOpenDialog(remote.getCurrentWindow(), {
      title: '选择图片文件',
      filters: [
        {
          name: '图片文件',
          extensions: compressors.map((item) => item.extensions).flat(),
        },
      ],
      properties: ['openFile', 'multiSelections', 'noResolveAliases', 'treatPackageAsDirectory'],
    })
    .then(({ filePaths }) => {
      filePaths && onChange(resolveLocalFiles(filePaths))
    })
}

export default React.memo((props) => {
  const acceptImageExtensions = props.compressors.map((item) => item.extensions).flat()
  const noCompressors = !props.compressors.length

  const handlePickFile = useCallback(() => {
    openFilePicker(props.compressors, props.onChange)
  }, [props.compressors, props.onChange])

  return (
    <div className="component-file-picker" data-visible={props.visible}>
      <div className="drag-tip">
        <div className="icon"></div>
        <div className="text">
          {noCompressors ? <span>无可用转换插件</span> : <span>拖拽文件至此窗口</span>}
          <small>
            {acceptImageExtensions
              .filter((ext, index, exts) => index === exts.indexOf(ext))
              .join('/')}
          </small>
        </div>
      </div>
      <div className="file-pick-entry">
        <button className="button-pick-files" onClick={handlePickFile}>
          选取文件
        </button>
      </div>
    </div>
  )
})
