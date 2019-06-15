import React from 'react'
import { locateFile, formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus, taskStatusTexts } from 'constants/task'
import { openCompareView } from 'helpers/compare'
import './styles.scss'

const DescriptionText = React.memo((task) => {

  const optimizeRateTextColor = formateOptimizedRate(task.optimizedRate)

  if (task.status === taskStatus.COMPLETE) {
    return (
      <span className="description-text text-with-icon">
        <span className={`text-${optimizeRateTextColor}`}>{task.optimizedRate.toFixed(2)}%</span>&ensp;
        <span>{formatSize(task.originalSize)}</span>
        <i className="mdi mdi-arrow-right"></i>
        <span>{formatSize(task.optimizedSize)}</span>
      </span>
    )
  }

  return <span className="description-text">{taskStatusTexts[task.status]}</span>

})

const handleThumbClick = (event) => {
  event.preventDefault()
}

export default React.memo((props) => {

  const requestCompareView = () => {
    openCompareView(`${location.href}compare`, props.task)
  }

  const requestLocationImage = () => {
    locateFile(props.task.optimizedPath)
  }

  return (
    <li className="component-task-item" data-status={props.task.status}>
      <span className="status-icon"><i data-status={props.task.status} /></span>
      {props.preferences.showThumb ? (
        props.task.thumbUrl ? (
          <div className="thumb">
            {props.task.status === taskStatus.COMPLETE ? <img src={`file://${props.task.optimizedPath || props.task.path}`} className="optimized-image"/> : null}
            <img className="thumb-image" src={props.task.thumbUrl} />
          </div>
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
          <a href="javascript:void(0);" className="button button-restore" onClick={props.onRestore}>
            <i className="mdi mdi-undo-variant"></i>
          </a>
          <a href="javascript:void(0);" className="button button-recompress" onClick={props.onRecompress}>
            <i className="mdi mdi-redo-variant"></i>
          </a>
          <a href="javascript:void(0);" className="button button-compare" onClick={requestCompareView}>
            <i className="mdi mdi-compare"></i>
          </a>
        </div>
      ) : (
        <div className="operates">
          <a href="javascript:void(0);" className="button button-restore" onClick={requestLocationImage}>
            <i className="mdi mdi-folder-open"></i>
          </a>
          <a href="javascript:void(0);" className="button button-compare" onClick={requestCompareView}>
            <i className="mdi mdi-compare"></i>
          </a>
        </div>
      )}
    </li>
  )

})