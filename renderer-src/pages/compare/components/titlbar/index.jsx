import React from 'react'
import Select from 'components/select'
import './styles.scss'

export default React.memo(props => {
  const resetView = () => {
    props.applyZoom(1)
  }

  const updateScale = scale => {
    props.applyZoom(scale * 1, 0.5, 0.5, false, false)
  }

  const zoomIn = () => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, false), 0.5, 0.5, false, false)
  }

  const zoomOut = () => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, true), 0.5, 0.5, false, false)
  }

  return (
    <div className="component-compare-title-bar">
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
        <Select className="zoom-scale-select" value={props.viewState.scale} onChange={updateScale}>
          <option value={props.viewState.scale}>{(props.viewState.scale * 100).toFixed(0)}%</option>
          <option value="0.5">50%</option>
          <option value="0.7">70%</option>
          <option value="1">100%</option>
          <option value="1.5">150%</option>
          <option value="2.5">250%</option>
          <option value="4">400%</option>
          <option value="8">800%</option>
          <option value="12">1200%</option>
          <option value="16">1600%</option>
        </Select>
      </div>
    </div>
  )
})
