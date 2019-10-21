import React from 'react'
import Task from '../task'
import './styles.scss'

export default React.memo((props) => {
  return (
    <ul className="component-task-list">
      {props.appState.taskList.map(item => (
        <Task key={item.id} preferences={props.preferences} task={item} onRecompress={() => props.onRecompress(item)} onRestore={() => props.onRestore(item)} />
      ))}
    </ul>
  )
})