import React, { useCallback } from 'react'
import remote from 'helpers/remote'

import './styles.scss'

const handleMinimize = () => {
  remote.getCurrentWindow().minimize()
}

const handleClose = () => {
  remote.getCurrentWindow().close()
}

export default React.memo((props) => {
  const resetView = () => {
    props.applyZoom(1)
  }

  const zoomIn = useCallback(() => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, false), 0.5, 0.5, false, false)
  }, [props.applyZoom, props.calcZoomScale, props.viewState.scale])

  const zoomOut = useCallback(() => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, true), 0.5, 0.5, false, false)
  }, [props.applyZoom, props.calcZoomScale, props.viewState.scale])

  return (
    <div className="component-compare-title-bar">
      <div className="window-buttons">
        <button onClick={handleMinimize} className="button-minimize"></button>
        <button onClick={handleClose} className="button-close"></button>
      </div>
      <span className="app-title">{props.taskData.file.name}</span>
      <div className="window-state">
        <button onClick={resetView} className="button button-center button-xs button-default">
          <i className="mdi mdi-image-filter-center-focus"></i>
        </button>
        <button
          onClick={zoomIn}
          name="zoom-in"
          disabled={props.viewState.scale >= 16}
          className="button button-zoom-in button-xs button-default">
          <i className="mdi mdi-magnify-plus-outline"></i>
        </button>
        <button
          onClick={zoomOut}
          name="zoom-out"
          disabled={props.viewState.scale <= 0.5}
          className="button button-zoom-out button-xs button-default">
          <i className="mdi mdi-magnify-minus-outline"></i>
        </button>
      </div>
    </div>
  )
})
