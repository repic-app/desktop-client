import React, { useState } from 'react'
import Switch from 'components/switch'
import remote from 'helpers/remote'
import { openFolder, formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus } from 'constants/task'
import { cleanTempFiles, restoreTasks, reexecuteTasks } from 'helpers/task'
import './styles.scss'

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

  const [ clearing, setClearing ] = useState(false)
  const [ restoring, setRestoring ] = useState(false)
  const [ recompressing, setRecompressing ] = useState(false)

  const { taskList, taskProgress, taskAllFinished } = appState
  const taskResult = taskAllFinished ? analyzeTask(taskList) : {}

  const toggleSticky = () => {
    remote.getCurrentWindow().setAlwaysOnTop(!appState.isSticky)
    setAppState({ isSticky: !appState.isSticky })
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
        <div className="system-buttons">
          <button onClick={togglePreferencesModal} disabled={appState.showAbout || appState.showPreferences} title="参数设置" className="button button-xs button-default button-perferences"><i className="icon-settings"></i></button>
          <button onClick={toggleAboutModal} disabled={appState.showPreferences || appState.showAbout} title="关于Repic" className="button button-xs button-default button-about"><i className="icon-info"></i></button>
        </div>
        <div className="app-status" data-show-progress={taskProgress >= 0}>
          <div className="inner">
            <span className="app-status-text">
              {taskAllFinished && taskResult.counts[taskStatus.COMPLETE] ? formatStatusText(taskResult) : '准备就绪'}
            </span>
            <progress className="app-progress-bar" value={taskProgress} />
          </div>
        </div>
        {preferences.overrideOrigin ? (
          <div className="task-buttons">
            <button onClick={requestClear} disabled={clearDisabled} title="清空列表" className="button button-xs button-default button-clear-task"><i className="icon-trash-2"></i></button>
            <button onClick={requestRecompressAll} disabled={recompressDisabled} title="全部重压" className="button button-xs button-default button-recompress-all"><i className="icon-repeat"></i></button>
            <button onClick={requestRestoreAll} disabled={restoreDisabled} title="全部还原" className="button button-xs button-default button-restore-all"><i className="icon-corner-up-left"></i></button>
          </div>
        ) : (
          <div className="task-buttons">
            <button onClick={requestClear} disabled={clearDisabled} title="清空列表" className="button button-xs button-default button-clear-task"><i className="icon-trash-2"></i></button>
            <button onClick={openSavePath} title={'打开"保存文件夹"'} className="button button-xs button-default button-open-sava-path"><i className="icon-folder"></i></button>
          </div>
        )}
      </div>
      <Switch className="switch-sticky" label="置顶" onChange={toggleSticky} checked={appState.isSticky} />
    </div>
  )

})