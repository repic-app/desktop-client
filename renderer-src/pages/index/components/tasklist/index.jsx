import React from 'react'
import TaskItem from '../taskitem'
import './styles.scss'

export default React.memo((props) => {

  return (
    <ul className="component-task-list">
      {props.appState.taskItems.map(item => (
        <TaskItem key={item.id} taskData={item} onRestore={() => props.onRestore(item)} />
      ))}
    </ul>
  )

})