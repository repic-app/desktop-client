import React, { useState, useRef } from 'react'
import Modal from 'components/modal'
import Switch from 'components/switch'
import remote from 'helpers/remote'
import { openLink, openCacheFolder, openFolder, formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus } from 'constants/task'
import { cleanTempFiles, restoreTasks, reexecuteTasks } from 'helpers/task'
import Preferences from '../preferences'
import About from '../about'
import './styles.scss'

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
    <i className="mdi mdi-folder-remove"></i>
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

const analyzeTask = (taskList) => {

  return taskList.reduce((result, task) => {
    if (task.status === taskStatus.COMPLETE) {
      result.totalOriginalSize += task.originalSize
      result.totalOptimizedSize += task.optimizedSize
    }
    result.counts[task.status] += 1
    return result
  }, {
    counts: {
      [taskStatus.CREATING]: 0,
      [taskStatus.PENDING]: 0,
      [taskStatus.PROCESSING]: 0,
      [taskStatus.COMPLETE]: 0,
      [taskStatus.FAIL]: 0,
      [taskStatus.RESTORED]: 0
    },
    totalOptimizedSize: 0,
    totalOriginalSize: 0
  })

}

const formatStatusText = (data) => {

  const totalOptimizedRate = (1 - data.totalOptimizedSize / data.totalOriginalSize) * 100
  const optimizeRateTextColor = formateOptimizedRate(totalOptimizedRate)

  return (
    <span className="description-text text-with-icon">
      <b>已节省空间 <span className={optimizeRateTextColor}>{formatSize(data.totalOriginalSize - data.totalOptimizedSize)} | {totalOptimizedRate.toFixed(2)}%</span></b>
    </span>
  )

}

export default React.memo(({ preferences, appState, setAppState, onRestoreAll, onRecompressAll }) => {

  const dropdownRef = useRef(null)
  const [ clearing, setClearing ] = useState(false)
  const [ restoring, setRestoring ] = useState(false)
  const [ recompressing, setRecompressing ] = useState(false)

  const { taskList, taskProgress, taskAllFinished } = appState
  const taskResult = taskAllFinished ? analyzeTask(taskList) : {}

  const toggleSticky = () => {
    remote.getCurrentWindow().setAlwaysOnTop(!appState.isSticky)
    setAppState({ isSticky: !appState.isSticky })
  }

  const toggleDropdownMenu = () => {

    if (appState.showSettingsDropdown && dropdownRef) {
      dropdownRef.current.handleCloseButtonClick()
    } else {
      setAppState({
        showSettingsDropdown: !appState.showSettingsDropdown
      })
    }

  }

  const hideSettingsDropdown = () => {
    setAppState({
      showSettingsDropdown: false
    })
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

  const togglePreferencesModal = () => {
    setAppState({
      showPreferences: true
    })
  }

  const toggleAboutModal = () => {
    setAppState({
      showAbout: true
    })
  }

  const requestClear = () => {
    setClearing(true)
    setAppState({
      taskList: [],
      taskProgress: -1,
      taskAllFinished: false,
    }, async () => {
      await cleanTempFiles()
      setClearing(false)
    })
  }

  const requestRecompressAll = async () => {
    setRecompressing(true)
    onRecompressAll(await reexecuteTasks(appState.taskList))
    setRecompressing(false)
  }

  const requestRestoreAll = async () => {
    setRestoring(true)
    onRestoreAll(await restoreTasks(appState.taskList))
    setRestoring(false)
  }

  const openSavePath = () => {
    openFolder(preferences.autoSavePath)
  }

  const clearDisabled = clearing || !appState.taskList.length || !taskAllFinished
  const recompressDisabled = recompressing || !appState.taskList.length || !taskAllFinished || !taskResult.counts[taskStatus.RESTORED]
  const restoreDisabled = restoring || !appState.taskList.length || !taskAllFinished || !(taskResult.counts[taskStatus.COMPLETE] + taskResult.counts[taskStatus.FAIL])

  return (
    <div className="component-title-bar">
      <span className="app-title">Repic</span>
      <div className="title-bar-operates">
        <a href="javascript:void(0);" onClick={toggleDropdownMenu} className="button-toggle-dropdown"><i className="mdi mdi-settings"></i></a>
      </div>
      <Modal
        className="dropdown-modal"
        width={150}
        ref={dropdownRef}
        active={appState.showSettingsDropdown}
        onClose={hideSettingsDropdown}
        showFooter={false}
        closeOnBlur={true}
      >
        <ul className="dropdown-menu">
          <li>
            <Switch className="switch-sticky" label="置顶窗口" onChange={toggleSticky} checked={appState.isSticky} />
          </li>
          <li onClick={togglePreferencesModal}>
            <span className="label">
              <span>偏好设置</span>
            </span>
            <i className="mdi mdi-chevron-right"></i>
          </li>
          <li onClick={openSavePath}>
            <span className="label">
              <span>输出目录</span>
            </span>
            <i className="mdi mdi-chevron-right"></i>
          </li>
          <li onClick={toggleAboutModal}>
            <span className="label">
              <span>关于Repic</span>
            </span>
            <i className="mdi mdi-chevron-right"></i>
          </li>
        </ul>
      </Modal>
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

})