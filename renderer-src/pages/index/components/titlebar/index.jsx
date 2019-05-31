import React, { useContext } from 'react'
import Switch from 'components/switch'
import remote from 'helpers/remote'
import APPContext from 'store/index'
import { formatSize, formateOptimizedRate } from 'utils/base'
import { taskStatus } from 'constants/task'
import './styles.scss'

const analyzeTask = (taskList) => {

  return taskList.reduce((result, task) => {
    if (task.status === taskStatus.COMPLETE) {
      result.count += 1
      result.totalOriginalSize += task.originalSize
      result.totalOptimizedSize += task.optimizedSize
    }
    return result
  }, {
    count: 0,
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

export default React.memo((props) => {

  const toggleSticky = () => {
    remote.getCurrentWindow().setAlwaysOnTop(!props.appState.isSticky)
    props.setAppState({ isSticky: !props.appState.isSticky, taskList: [], taskAllFinished: false })
  }

  const { appState } = useContext(APPContext)
  const { taskList, taskProgress, taskAllFinished } = appState
  const taskResult = taskAllFinished ? analyzeTask(taskList) : {}

  return (
    <div className="component-title-bar">
      <span className="app-title">Repic</span>
      <div className="app-status" data-show-progress={taskProgress >= 0}>
        <div className="inner">
          <span className="app-status-text">
            {taskAllFinished && taskResult.count ? formatStatusText(taskResult) : '准备就绪'}
          </span>
          <progress className="app-progress-bar" value={taskProgress} />
        </div>
      </div>
      <Switch className="switch-sticky" label="置顶" onChange={toggleSticky} checked={props.appState.isSticky} />
    </div>
  )

})