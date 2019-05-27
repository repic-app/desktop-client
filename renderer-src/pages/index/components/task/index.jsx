import React from 'react'
import { formatSize } from 'utils/base'
import { taskStatus, tasktStatusIcons, taskStatusTexts } from 'constants/task'
import './styles.scss'

const DescriptionText = React.memo((task) => {

  if (task.status === taskStatus.COMPLETE) {
    return (
      <span className="description-text text-with-icon">
        <span>{formatSize(task.originalSize)}</span>
        <i className="icon-arrow-right"></i>
        <span>{formatSize(task.optimizedSize)}</span>
        <i className="icon-arrow-down text-success optimize-rate"></i>
        <span className="text-success"><b>{task.optimizedRate.toFixed(2)}%</b></span>
      </span>
    )
  }

  return <span className="description-text">{taskStatusTexts[task.status]}</span>

})

export default React.memo((props) => {

  return (
    <div className="component-task-item" data-status={props.task.status}>
      <span className="status-icon">
        <i className={tasktStatusIcons[props.task.status]} />
      </span>
      {props.task.thumbUrl ? (
        <img className="thumb" src={props.task.thumbUrl} />
      ) : (
        <i className="thumb thumb-holder icon-image" />
      )}
      <div className="meta">
        <span className="name">{props.task.file.name}</span>
        <DescriptionText
          status={props.task.status}
          originalSize={props.task.originalSize}
          optimizedSize={props.task.optimizedSize}
          optimizedRate={props.task.optimizedRate}
        />
      </div>
      <div className="operates">
        <a href="javascript:void(0);" className="button button-restore" onClick={props.onRestore}><i className="icon-corner-up-left"></i></a>
        <a href="javascript:void(0);" className="button button-compare"><i className="icon-eye"></i></a>
        <a href="javascript:void(0);" className="button button-recompress"><i className="icon-repeat"></i></a>
      </div>
    </div>
  )

})