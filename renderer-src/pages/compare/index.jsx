import React, { useState, useEffect, useRef } from 'react'
import { electron } from 'helpers/remote'
import { formatSize } from 'utils/base'
import TitleBar from './components/titlbar'
import './styles.scss'

const defaultViewState = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  indecatorOffset: 0
}

const getImageStyle = (viewState) => {
  return {
    transform: `translateX(${viewState.translateX}px) translateY(${viewState.translateY}px) scale(${viewState.scale})`
  }
}

const calcZoomScale = (currentScale, isZoomOut) => {

  currentScale = currentScale * 100

  const stepValue = isZoomOut ? (
    currentScale > 100 ? 50 : 10
  ) : (
    currentScale >= 100 ? 50 : 10
  )

  const nextScale = isZoomOut ? (
    currentScale - stepValue < 50 ? 50 : currentScale - stepValue
  ) : (
    currentScale + stepValue > 1600 ? 1600 : currentScale + stepValue
  )

  return nextScale / 100

}

let mouseDragging = false
let mouseDragStart = { x: 0, y: 0 }
let mouseDragOffset = { x: 0, y: 0 }

export default React.memo(() => {

  const imageRef = useRef(null)
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

  const applyZoom = (nextScale, originX = 0.5, originY = 0.5, isMouseEvent = false, resetTranslate = true) => {

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()

    const widthDiff = width / viewState.scale * nextScale - width
    const heightDiff = height / viewState.scale * nextScale - height

    const nextTranslateX = resetTranslate ? 0 : viewState.translateX - widthDiff * (isMouseEvent ? (originX - left) / width : originX)
    const nextTranslateY = resetTranslate ? 0 : viewState.translateY - heightDiff * (isMouseEvent ? (originY - top) / height : originY)

    setViewState({
      translateX: nextTranslateX,
      translateY: nextTranslateY,
      scale: nextScale
    })

  }

  const handleMouseWheel = (event) => {
    !mouseDragging && applyZoom(calcZoomScale(viewState.scale, event.deltaY > 0), event.pageX, event.pageY, true, false)
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
      translateY: 0,
      scaleOriginX: 0.5,
      scaleOriginY: 0.5
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

  const originalImagePath = taskData.optimizedPath ? taskData.path : taskData.backupPath
  const optimizedImagePath = taskData.optimizedPath ? taskData.optimizedPath : taskData.path

  return (
    <div className="page-compare">
      <TitleBar
        taskData={taskData}
        viewState={viewState}
        applyZoom={applyZoom}
        calcZoomScale={calcZoomScale}
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
                  <img
                    ref={imageRef}
                    className="image"
                    style={imageStyle}
                    src={`file://${originalImagePath}`}
                  />
                ) : null}
              </div>
            </div>
            <span className="label-before">压缩前 {taskData.formatedOriginalSize}</span>
            <span className="label-after">压缩后 {taskData.formatedOptimizedSize}</span>
          </div>
          <div className="compressed-image">
            <div className="image-wrapper">
              {optimizedImagePath ? (
                <img
                  className="image"
                  style={imageStyle}
                  src={`file://${optimizedImagePath}`}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

})