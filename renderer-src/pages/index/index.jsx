import React, { useContext, useState } from 'react'
import TitleBar from './components/titlebar'
import Start from './components/start'
import TaskList from './components/tasklist'
import { playSound } from 'helpers/sound'
import { appendTasks, executeTasks, restoreTask } from 'helpers/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
import './styles.scss'

const defaultPageState = {
  isDraggingOver: false
}

let dragEventTriggerCount = 0

export default () => {

  const [ pageState, _setPageState ] = useState(defaultPageState)
  const { appState, preferences, setAppState, getAppState } = useContext(APPContext)

  const setPageState = (changePageState) => {
    _setPageState({ ...pageState, ...changePageState })
  }

  const handleThumbCreate = (taskId, thumbUrl) => {

    setAppState({
      taskList: getAppState('taskList').map(item => {
        return item.id === taskId ? { ...item, thumbUrl } : item
      })
    })

  }

  const handleTaskUpdate = (task) => {

    const nextTaskList = getAppState('taskList').map(item => {
      return item.id === task.id ? { ...item, ...task } : item
    })

    setAppState({
      taskList: executeTasks(nextTaskList, handleTaskUpdate, handleThumbCreate)
    })

  }

  const handleDragEnter = (event) => {

    if (dragEventTriggerCount === 0) {
      playSound('INSERT_PHOTO')
    }

    dragEventTriggerCount ++
    setPageState({ isDraggingOver: true })

    event.preventDefault()
    event.stopPropagation()

  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDragDrop = async (event) => {

    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer.files
    const currentTaskList = getAppState('taskList')
    const nextTaskList = appendTasks(currentTaskList, files)

    if (nextTaskList.length === currentTaskList.length) {
      playSound('ERROR')
    }

    if (!nextTaskList.length) {
      handleDragCancel()
      return false
    }

    dragEventTriggerCount > 0 && dragEventTriggerCount --

    setAppState({
      taskList: nextTaskList
    }, async () => {
      if (!currentTaskList.length) {
        await sleep(500)
      }
      executeTasks(nextTaskList, handleTaskUpdate, handleThumbCreate)
    })

  }

  const handleDragCancel = (event) => {

    dragEventTriggerCount > 0 && dragEventTriggerCount --

    if (dragEventTriggerCount === 0) {
      playSound('INSERT_PHOTO')
      setPageState({ isDraggingOver: false })
    }

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

  }

  const handleRestore = (task) => {

    const restoredTask = restoreTask(task)

    if (!restoredTask) {
      return false
    }

    setAppState({
      taskList: getAppState('taskList').map(item => {
        return item.id === task.id ? { ...item, ...restoredTask } : item
      })
    })

  }

  return (
    <div className="app-page page-index">
      <TitleBar appState={appState} setAppState={setAppState} />
      <div
        className="index-content"
        onDragEnter={handleDragEnter}
        onDragExit={handleDragCancel}
        onDragEnd={handleDragCancel}
        onDragOver={handleDragOver}
        onDrop={handleDragDrop}
        onDragLeave={handleDragCancel}
        data-dragging-over={pageState.isDraggingOver}
        data-empty={appState.taskList.length === 0}
      >
        <Start appState={appState} setAppState={setAppState} />
        <TaskList appState={appState} preferences={preferences} onRestore={handleRestore} />
      </div>
    </div>
  )

}