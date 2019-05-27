import React, { useContext, useState } from 'react'
import TitleBar from './components/titlebar'
import Start from './components/start'
import TaskList from './components/tasklist'
import { playSound } from 'helpers/sound'
import { createTasks, executeTasks, restoreTask } from 'helpers/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
import './styles.scss'

const defaultPageState = {
  isDraggingOver: false
}

let dragEventTriggerCount = 0

export default () => {

  const [ pageState, _setPageState ] = useState(defaultPageState)
  const { appState, setAppState, getAppState } = useContext(APPContext)

  const setPageState = (changePageState) => {
    _setPageState({ ...pageState, ...changePageState })
  }

  const handleTaskUpdate = (taskItem) => {

    console.log(taskItem)

    const { taskItems: latestTaskItems } = getAppState()
    const nextTaskItems = latestTaskItems.map(item => {
      return item.id === taskItem.id ? taskItem : item
    })

    setAppState({
      taskItems: executeTasks(nextTaskItems, handleTaskUpdate)
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

    const { taskItems: latestTaskItems } = getAppState()
    const newTaskItems = createTasks(files, latestTaskItems)
  
    if (!appState.taskItems.length) {
      await sleep(1000)
    }

    if (!newTaskItems.length) {
      playSound('ERROR')
    }

    const nextTaskItems = [
      ...appState.taskItems,
      ...newTaskItems
    ]

    if (!nextTaskItems.length) {
      await sleep(300)
      handleDragCancel()
      return false
    }

    dragEventTriggerCount > 0 && dragEventTriggerCount --

    setAppState({
      taskItems: executeTasks(nextTaskItems, handleTaskUpdate)
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
    console.log(Buffer.from(task.file))
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
        data-empty={appState.taskItems.length === 0}
      >
        <Start appState={appState} setAppState={setAppState} />
        <TaskList appState={appState} onRestore={handleRestore} />
      </div>
    </div>
  )

}