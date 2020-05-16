import React from 'react'
import { locateFile, formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus, taskStatusTexts } from 'constants/task'
import { openCompareView } from 'helpers/compare'
import './styles.scss'

const imageTypePattern = /image\/(jpg|png|webp|jpeg)/

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

  const requestLocationImage = () => {
    locateFile(props.task.optimizedPath)
  }

  const taskFileIsImage = imageTypePattern.test(props.task.file.type)
  const restoreDisabled = props.task.status !== taskStatus.COMPLETE
  const recompressDisabled = props.task.status !== taskStatus.RESTORED
  const compareDisabled = !taskFileIsImage || props.task.status !== taskStatus.COMPLETE

  const requestCompareView = () => {
    !compareDisabled && openCompareView(`${location.href}compare`, props.task)
  }

  return (
    <li className="component-task-item" data-status={props.task.status}>
      <span className="status-icon"><i data-status={props.task.status} /></span>
      {props.preferences.showThumb ? (
        props.task.thumbUrl ? (
          <div className="thumb" onClick={handleThumbClick}>
            {props.task.status === taskStatus.COMPLETE ? <img src={`file://${props.task.optimizedPath || props.task.path}`} className="optimized-image"/> : null}
            <img className="thumb-image" src={props.task.thumbUrl} />
          </div>
        ) : (
          <span className="fake-thumb">{props.task.ext}</span>
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
          <a href="javascript:void(0);" data-disabled={restoreDisabled} className="button button-restore" onClick={props.onRestore}>
            <i className="mdi mdi-restore"></i>
          </a>
          <a href="javascript:void(0);" data-disabled={recompressDisabled} className="button button-recompress" onClick={props.onRecompress}>
            <i className="mdi mdi-restore invert-x"></i>
          </a>
          <a href="javascript:void(0);" data-disabled={compareDisabled} className="button button-compare" onClick={requestCompareView}>
            <i className="mdi mdi-compare"></i>
          </a>
        </div>
      ) : (
        <div className="operates">
          <a href="javascript:void(0);" data-disabled={restoreDisabled} className="button button-reveal" onClick={requestLocationImage}>
            <i className="mdi mdi-folder-outline"></i>
          </a>
          <a href="javascript:void(0);" data-disabled={compareDisabled} className="button button-compare" onClick={requestCompareView}>
            <i className="mdi mdi-compare"></i>
          </a>
        </div>
      )}
    </li>
  )
})