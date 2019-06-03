import React, { useState, useEffect } from 'react'
import { electron } from 'helpers/remote'
import { formatSize } from 'utils/base'
import TitleBar from './components/titlbar'
import './styles.scss'

const defaultViewState = {
  scale: 1,
  scaleOriginX: 0.5,
  scaleOriginY: 0.5,
  translateX: 0,
  translateY: 0,
  indecatorOffset: 0
}

const getImageStyle = (viewState) => {
  return {
    transform: `translateX(${viewState.translateX}px) translateY(${viewState.translateY}px) scale(${viewState.scale})`,
    transformOrigin: `${viewState.scaleOriginX * 100}% ${viewState.scaleOriginY * 100}%`
  }
}

const updateZoomScale = (currentScale, isZoomIn) => {

  const stepValue = currentScale > 1 ? 0.2 : 0.05

  return isZoomIn ? (
    currentScale - stepValue < 0.5 ? 0.5 : currentScale - stepValue
  ) : (
    currentScale + stepValue > 16 ? 16 : currentScale + stepValue
  )

}

let mouseDragging = false
let mouseDragStart = { x: 0, y: 0 }
let mouseDragOffset = { x: 0, y: 0 }

export default React.memo(() => {

  const [ taskData, setTaskData ] = useState(null)
  const [ viewState, _setViewState ] = useState(defaultViewState)

  const setViewState = (changedViewState) => {
    _setViewState({
      ...viewState,
      ...changedViewState
    })
  }

  const handleMouseDown = (event) => {
    mouseDragging = true
    mouseDragOffset.x = viewState.translateX
    mouseDragOffset.y = viewState.translateY
    mouseDragStart.x = event.clientX
    mouseDragStart.y = event.clientY
  }

  const handleMouseMove = (event) => {
    if (!mouseDragging) {
      setViewState({ indecatorOffset: event.clientX })
    } else {
      setViewState({
        indecatorOffset: event.clientX,
        translateX: mouseDragOffset.x + event.clientX - mouseDragStart.x,
        translateY: mouseDragOffset.y + event.clientY - mouseDragStart.y
      })
    }
  }

  const handleMouseWheel = (event) => {
    !mouseDragging && setViewState({
      scale: updateZoomScale(viewState.scale, event.deltaY > 0)
    })
  }

  const handleMouseUp = () => {
    mouseDragging = false
  }

  const handleMouseLeave = () => {
    mouseDragging = false
  }

  const updateTaskData = (_, nextTaskData) => {
    !taskData || nextTaskData.id !== taskData.id && setViewState({
      scale: 1,
      translateX: 0,
      translateY: 0
    })
    setTaskData({
      ...taskData,
      ...nextTaskData,
      formatedOriginalSize: formatSize(nextTaskData.originalSize || 0),
      formatedOptimizedSize: formatSize(nextTaskData.optimizedSize || 0)
    })
  }

  useEffect(() => {
    document.title = '压缩效果对比'
    electron.ipcRenderer.on('load-task-data', updateTaskData)
    return () => {
      electron.ipcRenderer.off('load-task-data', updateTaskData)
    }
  }, [])

  if (!taskData) {
    return <div className="page-compare loading"></div>
  }

  const imageStyle = getImageStyle(viewState)

  const originalImagePath = taskData.optimizedPath ? taskData.file.path : taskData.backupPath
  const optimizedImagePath = taskData.optimizedPath ? taskData.optimizedPath : taskData.file.path

  return (
    <div className="page-compare">
      <TitleBar
        taskData={taskData}
        viewState={viewState}
        setViewState={setViewState}
      />
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleMouseWheel}
        className="view-container"
      >
        <div className="view-core">
          <div className="original-image" style={{width: viewState.indecatorOffset}}>
            <div className="image-out-wrapper">
              <div className="image-wrapper">
                {originalImagePath ? (
                  <img className="image" style={imageStyle} src={`file://${originalImagePath}`}/>
                ) : null}
              </div>
            </div>
            <span className="label-before">压缩前 {taskData.formatedOriginalSize}</span>
            <span className="label-after">压缩后 {taskData.formatedOptimizedSize}</span>
          </div>
          <div className="compressed-image">
            <div className="image-wrapper">
              {optimizedImagePath ? (
                <img className="image" style={imageStyle} src={`file://${optimizedImagePath}`}/>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

})