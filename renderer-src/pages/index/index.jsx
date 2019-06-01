import React, { useContext, useState } from 'react'
import TitleBar from './components/titlebar'
import Start from './components/start'
import TaskList from './components/tasklist'
import { playSound } from 'helpers/sound'
import { appendTasks, executeTasks, restoreTask } from 'helpers/task'
import Modal from 'components/modal'
import Preferences from './components/preferences'
import About from './components/about'
import { openLink, openCacheFolder } from 'utils/base'
import { taskStatus } from 'constants/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
import './styles.scss'

const defaultPageState = {
  isDraggingOver: false
}

const preferencesModalTitle = (
  <div className="text-with-icon">
    <i className="icon-settings"></i>
    <span>参数设置</span>
  </div>
)

const aboutModalTitle = (
  <div className="text-with-icon">
    <i className="icon-info"></i>
    <span>关于REPIC</span>
  </div>
)

const cacheDirEntry = (
  <a onClick={openCacheFolder} className="cache-dir-entry text-with-icon">
    <i className="icon-folder"></i>
    <span>查看缓存目录</span>
  </a>
)

const copyRightText = (
  <div className="app-copyright">
    <span>&copy;2019</span>
    <a onClick={openLink} href="https://repic.app">Repic.app</a>
    <span> 版权所有</span>
  </div>
)

let dragEventTriggerCount = 0

export default () => {

  const [ pageState, _setPageState ] = useState(defaultPageState)
  const { appState, preferences, setAppState, getAppState, updateProgress } = useContext(APPContext)

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
    }, updateProgress)

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
      setAppState({
        taskList: executeTasks(nextTaskList, handleTaskUpdate, handleThumbCreate)
      }, updateProgress)
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
    setAppState({
      taskList: getAppState('taskList').map(item => {
        return item.id === task.id ? { ...item, ...restoreTask(task) } : item
      })
    })
  }

  const handleRecompress = (task) => {
    setAppState({
      taskList: executeTasks(getAppState('taskList').map(item => {
        return item.id === task.id ? { ...item, status: taskStatus.PENDING } : item
      }), handleTaskUpdate, handleThumbCreate)
    }, updateProgress)
  }

  const handleRestoreAll = (taskList) => {
    setAppState({ taskList })
  }

  const handleRecompressAll = (taskList) => {
    setAppState({
      taskList: executeTasks(taskList, handleTaskUpdate, handleThumbCreate)
    }, updateProgress)
  }

  const hidePreferencesModal = () => {
    setAppState({
      showPreferences: false
    })
  }

  const hideAboutModal = () => {
    setAppState({
      showAbout: false
    })
  }

  return (
    <div className="app-page page-index">
      <TitleBar
        appState={appState}
        setAppState={setAppState}
        onRestoreAll={handleRestoreAll}
        onRecompressAll={handleRecompressAll}
      />
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
        <Start
          appState={appState}
          setAppState={setAppState}
        />
        <TaskList
          appState={appState}
          preferences={preferences}
          onRestore={handleRestore}
          onRecompress={handleRecompress}
        />
      </div>
      <Modal
        title={preferencesModalTitle}
        width={380}
        active={appState.showPreferences}
        onClose={hidePreferencesModal}
        showConfirm={false}
        footerAddon={cacheDirEntry}
        cancelText="关闭"
      >
        <Preferences />
      </Modal>
      <Modal
        title={aboutModalTitle}
        width={380}
        active={appState.showAbout}
        onClose={hideAboutModal}
        showConfirm={false}
        footerAddon={copyRightText}
        cancelText="关闭"
      >
        <About />
      </Modal>
    </div>
  )

}