import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Progress from 'components/progress'
import { openFilePicker } from '../filepicker'
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

export default React.memo((props) => {
  const [clearing, setClearing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [recompressing, setRecompressing] = useState(false)

  const { taskList, progress, taskAllFinished } = props.appState
  const taskResult = useMemo(() => analyzeTask(taskList), [taskList])

  const handlePickFile = useCallback(() => {
    openFilePicker(props.compressors, props.onPickFile)
  }, [props.compressors, props.onPickFile])

  const requestClear = useCallback(() => {
    setClearing(true)
    props.setAppState(
      {
        taskList: [],
        taskProgress: -1,
        taskAllFinished: false,
      },
      () => {
        props.onClear()
        cleanTempFiles().then(() => {
          setClearing(false)
        })
      }
    )
  }, [props.setAppState, props.onClear])

  const requestRecompressAll = useCallback(() => {
    setRecompressing(true)
    reexecuteTasks(taskList).then((res) => {
      props.onRecompressAll(res)
      setRecompressing(false)
    })
  }, [props.onRecompressAll, taskList])

  const requestRestoreAll = useCallback(() => {
    setRestoring(true)
    restoreTasks(taskList).then((res) => {
      props.onRestoreAll(res)
      setRestoring(false)
    })
  }, [props.onRestoreAll, taskList])

  const openSavePath = useCallback(() => {
    openFolder(props.preferences.autoSavePath)
  }, [props.preferences.autoSavePath])

  const clearDisabled = clearing || !taskList.length || !taskAllFinished
  const recompressDisabled =
    recompressing || !taskList.length || !taskAllFinished || !taskResult.counts[taskStatus.RESTORED]
  const restoreDisabled =
    restoring ||
    !taskList.length ||
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
    <div className="component-task-bar" data-visible={!!taskList.length}>
      <div className="task-bar-inner">
        <Progress progress={progress} />
        <div className="file-pick-entry">
          <button onClick={handlePickFile} className="button-pick-files"></button>
        </div>
        <div className="meta">
          {taskAllFinished ? (
            <span className="count">{taskResult.counts[taskStatus.COMPLETE]}个项目压缩完成</span>
          ) : (
            <span className="count">
              已压缩({taskResult.counts[taskStatus.COMPLETE]}个项目，共{taskList.length}个项目
            </span>
          )}
          <span className="analyze">
            体积共减少
            <span className={`text-${optimizeRateTextColor}`}>
              {((1 - totalOptimizedRate) * 100).toFixed(2)}%
            </span>
            ({totalOptimizedSize})
          </span>
        </div>
        <div className="operates">
          {props.preferences.overrideOrigin ? (
            <>
              <button disabled={restoreDisabled} className="button" onClick={requestRestoreAll}>
                <i className="mdi mdi-restore"></i>
              </button>
              <button
                disabled={recompressDisabled}
                className="button invert"
                onClick={requestRecompressAll}>
                <i className="mdi mdi-restore"></i>
              </button>
            </>
          ) : (
            <button className="button" onClick={openSavePath}>
              <i className="mdi mdi-folder-open"></i>
            </button>
          )}
          <>
            <button disabled={clearDisabled} className="button" onClick={requestClear}>
              <i className="icon icon-x"></i>
            </button>
          </>
        </div>
      </div>
    </div>
  )
})
