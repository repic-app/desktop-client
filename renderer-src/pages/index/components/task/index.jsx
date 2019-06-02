import React from 'react'
import { formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus, tasktStatusIcons, taskStatusTexts } from 'constants/task'
import { openCompareView } from 'helpers/compare'
import './styles.scss'

const DescriptionText = React.memo((task) => {

  const optimizeRateTextColor = formateOptimizedRate(task.optimizedRate)

  if (task.status === taskStatus.COMPLETE) {
    return (
      <span className="description-text text-with-icon">
        {/* <i className={`icon-arrow-down optimize-rate ${optimizeRateTextColor}`}></i> */}
        <span className={optimizeRateTextColor}><b>{task.optimizedRate.toFixed(2)}%</b></span>&ensp;
        <span>{formatSize(task.originalSize)}</span>
        <i className="icon-arrow-right"></i>
        <span>{formatSize(task.optimizedSize)}</span>
      </span>
    )
  }

  return <span className="description-text">{taskStatusTexts[task.status]}</span>

})

export default React.memo((props) => {

  const requestCompareView = () => {
    openCompareView(`${location.href}compare`, props.task)
  }

  return (
    <div className="component-task-item"  data-status={props.task.status}>
      <span className="status-icon">
        <i className={tasktStatusIcons[props.task.status]} />
      </span>
      {props.preferences.showThumb ? (
        props.task.thumbUrl ? (
          <img className="thumb" src={props.task.thumbUrl} />
        ) : (
          <i className="thumb thumb-holder icon-image" />
        )
      ) : null}
      <div className="meta">
        <span className="name" title={props.task.file.name}>{props.task.file.name}</span>
        <DescriptionText
          status={props.task.status}
          originalSize={props.task.originalSize}
          optimizedSize={props.task.optimizedSize}
          optimizedRate={props.task.optimizedRate}
        />
      </div>
      <div className="operates">
        <a href="javascript:void(0);" className="button button-default button-restore" onClick={props.onRestore}><i className="icon-corner-up-left"></i></a>
        <a href="javascript:void(0);" className="button button-default button-compare" onClick={requestCompareView}><i className="icon-eye"></i></a>
        <a href="javascript:void(0);" className="button button-default button-recompress" onClick={props.onRecompress}><i className="icon-repeat"></i></a>
      </div>
    </div>
  )

})