import electron from 'electron'
import React, { useContext, useState, useEffect } from 'react'
import Modal from 'components/modal'
import Preferences from './components/preferences'
import About from './components/about'
import TaskItem from './components/taskitem'
// import Toast from 'components/toast'
import { playSound } from 'helpers/sound'
import { createTasks, executeTasks } from 'helpers/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
// import events from 'helpers/events'
import './styles.scss'

// const { getAPPData, setAPPData } = electron.remote.require('./storage')
const defaultPageState = {
  isDraggingOver: false
}

let dragEventTriggerCount = 0

const preferencesModalTitle = (
  <div className="text-with-icon">
    <i className="icon-settings"></i>
    <span>参数设置</span>
  </div>
)

const aboutModalTitle = (
  <div className="text-with-icon">
    <i className="icon-info"></i>
    <span>关于皮克压缩机</span>
  </div>
)

export default () => {

  const [ pageState, _setPageState ] = useState(defaultPageState)
  const { appState, setAppState, getAppState } = useContext(APPContext)

  console.log('app state context changed')
  console.log(appState)

  const setPageState = (changePageState) => {
    _setPageState({ ...pageState, ...changePageState })
  }

  const toggleSticky = () => {
    electron.remote.getCurrentWindow().setAlwaysOnTop(!appState.isSticky)
    setAppState({ isSticky: !appState.isSticky, taskItems: [] })
  }

  const showPreferencesModal = () => {
    setAppState({
      showPreferences: true
    })
  }

  const hidePreferencesModal = () => {
    setAppState({
      showPreferences: false
    })
  }

  const showAboutModal = () => {
    setAppState({
      showAbout: true
    })
  }

  const hideAboutModal = () => {
    setAppState({
      showAbout: false
    })
  }

  const handleTaskUpdate = (taskItem) => {

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

  return (
    <div className="app-page page-index">
      <div className="title-bar">
        <span className="app-title">皮克压缩机</span>
        <a
          href="javascript:void(0);"
          onClick={toggleSticky}
          className={`button button-small button-${appState.isSticky ? 'primary' : 'default'} toggle-sticky text-with-icon`}
        >
          <i className="icon-chevrons-up"></i>
          <span>置顶</span>
        </a>
      </div>
      <div
        onDragEnter={handleDragEnter}
        onDragExit={handleDragCancel}
        onDragEnd={handleDragCancel}
        onDragOver={handleDragOver}
        onDrop={handleDragDrop}
        onDragLeave={handleDragCancel}
        className="index-content"
        data-empty={appState.taskItems.length === 0}
      >
        <div className="empty-task">
          <div className="machine-frame" data-active={pageState.isDraggingOver}>
            <div className="meter-mask" />
            <span className="indicator" />
            <div className="photo-wrap">
              <div className="photo" />
            </div>
          </div>
          <div className="drag-tip">
            <span>拖拽图片至此窗口以开始压缩</span>
            <small>支持JPG/PNG/GIF格式</small>
          </div>
          <div className="foot-links">
            <a href="javascript:void(0);" onClick={showPreferencesModal} className="settings-entry text-with-icon">
              <i className="icon-settings"></i>
              <span>参数设置</span>
            </a>
            <a href="javascript:void(0);" onClick={showAboutModal} className="about-entry text-with-icon">
              <i className="icon-info"></i>
              <span>关于皮克</span>
            </a>
          </div>
        </div>
        <div className="task-list">
          {appState.taskItems.map(item => (
            <TaskItem key={item.id} taskData={item} />
          ))}
        </div>
      </div>
      <Modal
        title={preferencesModalTitle}
        width={360}
        active={appState.showPreferences}
        onClose={hidePreferencesModal}
        showConfirm={false}
        cancelText="关闭"
      >
        <Preferences />
      </Modal>
      <Modal
        title={aboutModalTitle}
        width={360}
        active={appState.showAbout}
        onClose={hideAboutModal}
        showConfirm={false}
        cancelText="关闭"
      >
        <About />
      </Modal>
    </div>
  )

}