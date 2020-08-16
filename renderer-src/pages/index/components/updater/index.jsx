import React, { useState, useEffect, useCallback } from 'react'
import remote, { electron, requireRemote } from 'helpers/remote'
import './styles.scss'

export default React.memo(() => {
  const [updateStatus, setUpdateStatus] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleUpdateEvent = useCallback((_, data) => {
    setUpdateStatus(data.status)
    if (data.status !== 0) {
      remote.dialog.showMessageBox({
        type: data.status === -1 ? 'warning' : 'info',
        message: data.msg,
        defaultId: 1,
        buttons: ['确定'],
      })
    }
  }, [])

  const handleCheckUpdates = useCallback(() => {
    electron.ipcRenderer.send('checkForUpdate')
  }, [])

  const handleDownloadProgress = useCallback((data) => {
    console.log(data)
  }, [])

  useEffect(() => {
    electron.ipcRenderer.on('update-event', handleUpdateEvent)
    electron.ipcRenderer.on('update-download-progress', handleDownloadProgress)
    return () => {
      electron.ipcRenderer.off('update-event', handleUpdateEvent)
      electron.ipcRenderer.off('update-download-progress', handleDownloadProgress)
    }
  })

  if (progress > 0) {
    return (
      <div className="component-app-updater">
        <div className="progress">
          <div style={{ width: `${progress * 100}%` }}></div>
        </div>
        <span className="tip">正在下载更新{`${progress * 100}%`}</span>
      </div>
    )
  }

  if (updateStatus === 0) {
    return (
      <div className="component-app-updater">
        <button readOnly className="button button-sm button-default">
          正在检查更新
        </button>
      </div>
    )
  }

  return (
    <div className="component-app-updater">
      <button onClick={handleCheckUpdates} className="button button-sm button-default">
        检查更新
      </button>
    </div>
  )
})
