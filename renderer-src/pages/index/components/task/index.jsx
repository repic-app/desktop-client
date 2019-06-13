import React from 'react'
import { locateFile, formatSize, formateOptimizedRate } from 'utils/base'
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
        <i className="mdi mdi-arrow-right"></i>
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

  const requestLocationImage = () => {
    locateFile(props.task.optimizedPath)
  }

  return (
    <li className="component-task-item"  data-status={props.task.status}>
      <span className="status-icon">
        <i className={tasktStatusIcons[props.task.status]} />
      </span>
      {props.preferences.showThumb ? (
        props.task.thumbUrl ? (
          <img className="thumb" src={props.task.thumbUrl} />
        ) : (
          <i className="thumb thumb-holder mdi mdi-image" />
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
      {props.preferences.overrideOrigin ? (
        <div className="operates">
          <a href="javascript:void(0);" className="button button-restore" onClick={props.onRestore}>还原</a>
          <a href="javascript:void(0);" className="button button-recompress" onClick={props.onRecompress}>重压</a>
          <a href="javascript:void(0);" className="button button-compare" onClick={requestCompareView}>对比</a>
        </div>
      ) : (
        <div className="operates">
          <a href="javascript:void(0);" className="button button-restore" onClick={requestLocationImage}>查看</a>
          <a href="javascript:void(0);" className="button button-compare" onClick={requestCompareView}>对比</a>
        </div>
      )}
    </li>
  )

})