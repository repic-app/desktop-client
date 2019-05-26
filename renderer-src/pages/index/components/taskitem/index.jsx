import React from 'react'
import { tasktStatusIcons, taskStatusTexts } from 'constants/task'
import './styles.scss'

export default React.memo(({ taskData }) => {

  return (
    <div className="component-task-item" data-status={taskData.status}>
      <span className="status-icon">
        <i className={tasktStatusIcons[taskData.status]} />
      </span>
      <img className="thumb" src={`file://${taskData.file.path}`} />
      <div className="meta">
        <span className="name">{taskData.file.name}</span>
        <span className="description-text">{taskStatusTexts[taskData.status]}</span>
      </div>
      <div className="operates">
        <a href="javascript:void(0);" className="button button-restore"><i className="icon-corner-up-left"></i></a>
        <a href="javascript:void(0);" className="button button-compare"><i className="icon-eye"></i></a>
        <a href="javascript:void(0);" className="button button-recompress"><i className="icon-repeat"></i></a>
      </div>
    </div>
  )

})