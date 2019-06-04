import React from 'react'
import { formateOptimizedRate } from 'utils/base'
import Select from 'components/select'
import './styles.scss'

export default React.memo((props) => {

  const resetView = () => {
    props.applyZoom(1)
  }

  const updateScale = (scale) => {
    props.applyZoom(scale * 1, 0.5, 0.5, false, false)
  }

  const zoomIn = () => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, false), 0.5, 0.5, false, false)
  }

  const zoomOut = () => {
    props.applyZoom(props.calcZoomScale(props.viewState.scale, true), 0.5, 0.5, false, false)
  }

  const optimizeRateTextColor = formateOptimizedRate(props.taskData.optimizedRate)

  return (
    <div className="component-compare-title-bar">
      <span className="app-title">{props.taskData.file.name}</span>
      <div className="title-bar-operates">
        <div className="window-state">
          <button onClick={resetView} className="button button-center button-xs button-default">
            <i className="icon-crosshair"></i>
          </button>
          <button onClick={zoomIn} name="zoom-in" disabled={props.viewState.scale >= 16} className="button button-zoom-in button-xs button-default">
            <i className="icon-zoom-in"></i>
          </button>
          <button onClick={zoomOut} name="zoom-out" disabled={props.viewState.scale <= 0.5} className="button button-zoom-out button-xs button-default">
            <i className="icon-zoom-out"></i>
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
        <span className="task-analyze text-with-icon">
          <b className={optimizeRateTextColor}>{props.taskData.optimizedRate.toFixed(2)}%</b>
          <span>{props.taskData.formatedOriginalSize}</span>
          <i className="icon-arrow-right"></i>
          <span>{props.taskData.formatedOptimizedSize}</span>
        </span>
        <div className="operates">
          {/* <button className="button button-restore button-xs button-default text-with-icon">
            <i className="icon-corner-up-left"></i>
            <span>还原</span>
          </button> */}
          {/* <button className="button button-prev button-xs button-default">
            <i className="icon-arrow-left"></i>
          </button>
          <button className="button button-next button-xs button-default">
            <i className="icon-arrow-right"></i>
          </button> */}
        </div>
      </div>
    </div>
  )

})