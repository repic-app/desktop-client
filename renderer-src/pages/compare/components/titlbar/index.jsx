import React from 'react'
import { formateOptimizedRate } from 'utils/base'
import './styles.scss'

export default React.memo((props) => {

  const resetView = () => {
    props.setViewState({
      scale: 1,
      translateX: 0,
      translateY: 0
    })
  }

  const optimizeRateTextColor = formateOptimizedRate(props.taskData.optimizedRate)

  return (
    <div className="component-title-bar">
      <span className="app-title">{props.taskData.file.name}</span>
      <div className="title-bar-operates">
        <div className="window-state">
          <button onClick={resetView} className="button button-center button-xs button-default">
            <i className="icon-crosshair"></i>
          </button>
          <span className="zoom-scale">{(props.viewState.scale * 100).toFixed(0)}%</span>
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