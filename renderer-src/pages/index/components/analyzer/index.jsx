import React, { useState } from 'react'
import { taskStatus } from 'constants/task'
import { openFolder, formatSize, formateOptimizedRate } from 'utils/base'
import { cleanTempFiles, restoreTasks, reexecuteTasks } from 'helpers/task'
import './styles.scss'

const analyzeTask = (taskList) => {
  return taskList.reduce(
    (result, task) => {
      if (task.status === taskStatus.COMPLETE) {
        result.totalOriginalSize += task.originalSize
        result.totalOptimizedSize += task.optimizedSize
      }
      result.counts[task.status] += 1
      return result
    },
    {
      counts: {
        [taskStatus.CREATING]: 0,
        [taskStatus.PENDING]: 0,
        [taskStatus.PROCESSING]: 0,
        [taskStatus.COMPLETE]: 0,
        [taskStatus.FAIL]: 0,
        [taskStatus.RESTORED]: 0,
      },
      totalOptimizedSize: 0,
      totalOriginalSize: 0,
    }
  )
}

export default React.memo(
  ({
    appState,
    preferences,
    setAppState,
    onClear,
    onRecompressAll,
    onRestoreAll,
    onRequestPickFile,
  }) => {
    const [clearing, setClearing] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [recompressing, setRecompressing] = useState(false)

    const { taskList, taskAllFinished } = appState
    const taskResult = analyzeTask(taskList)

    const requestClear = () => {
      setClearing(true)
      setAppState(
        {
          taskList: [],
          taskProgress: -1,
          taskAllFinished: false,
        },
        async () => {
          onClear()
          await cleanTempFiles()
          setClearing(false)
        }
      )
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
    const recompressDisabled =
      recompressing ||
      !appState.taskList.length ||
      !taskAllFinished ||
      !taskResult.counts[taskStatus.RESTORED]
    const restoreDisabled =
      restoring ||
      !appState.taskList.length ||
      !taskAllFinished ||
      !(taskResult.counts[taskStatus.COMPLETE] + taskResult.counts[taskStatus.FAIL])

    const totalOptimizedSize = formatSize(
      taskResult.totalOriginalSize - taskResult.totalOptimizedSize
    )
    const totalOptimizedRate =
      taskResult.totalOriginalSize > 0
        ? taskResult.totalOptimizedSize / taskResult.totalOriginalSize
        : 1
    const optimizeRateTextColor = formateOptimizedRate((1 - totalOptimizedRate) * 100)

    return (
      <div className="component-task-analyzer" data-visible={taskList.length > 0}>
        <div
          className="progress-bar"
          data-completed={appState.taskAllFinished}
          data-visible={appState.taskProgress > 0}
          style={{ width: `${appState.taskProgress * 100}%` }}
        />
        <div className="content">
          <div className="analyze-text">
            {taskAllFinished ? (
              <b className="count">{taskResult.counts[taskStatus.COMPLETE]}个文件压缩成功</b>
            ) : (
              <b className="count">已压缩{taskResult.counts[taskStatus.COMPLETE]}个文件</b>
            )}
            <span className="size">
              体积共减少
              <span>
                {((1 - totalOptimizedRate) * 100).toFixed(2)}%({totalOptimizedSize})
              </span>
            </span>
          </div>
          <div className="operates">
            {preferences.overrideOrigin ? (
              <>
                <button disabled={restoreDisabled} className="button" onClick={requestRestoreAll}>
                  <i className="mdi mdi-undo-variant"></i>
                </button>
                <button
                  disabled={recompressDisabled}
                  className="button"
                  onClick={requestRecompressAll}>
                  <i className="mdi mdi-redo-variant"></i>
                </button>
              </>
            ) : (
              <button className="button" onClick={openSavePath}>
                <i className="mdi mdi-folder-open"></i>
              </button>
            )}
            <>
              <button disabled={clearDisabled} className="button" onClick={requestClear}>
                <i className="mdi mdi-notification-clear-all"></i>
              </button>
            </>
          </div>
        </div>
      </div>
    )
  }
)
