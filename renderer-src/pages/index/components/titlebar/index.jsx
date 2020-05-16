import React, { useRef, useCallback, useEffect } from 'react'
import Modal from 'components/modal'
import remote from 'helpers/remote'
import event from 'helpers/events'
import { openLink, openFolder, openCacheFolder } from 'utils/base'
import Preferences from '../preferences'
import './styles.scss'

export default React.memo(({ preferences, appState, setAppState }) => {
  const preferencesModalRef = useRef(null)

  const toggleSticky = useCallback(() => {
    remote.getCurrentWindow().setAlwaysOnTop(!appState.isSticky)
    setAppState({ isSticky: !appState.isSticky })
  }, [appState.isSticky])

  const showPreferencesModal = useCallback(() => {
    setAppState({
      showPreferences: true,
    })
  }, [])

  const hidePreferencesModal = useCallback(() => {
    setAppState({
      showPreferences: false,
    })
  }, [])

  const openSavePath = useCallback(() => {
    openFolder(preferences.autoSavePath)
  }, [])

  useEffect(() => {
    event.on('request-open-plugin-settings', () => {
      showPreferencesModal()
      preferencesModalRef.current.setTabIndex(2)
    })
  }, [])

  return (
    <div className="component-title-bar">
      <div className="app-title">
        <span>Repic App</span>
      </div>
      <div className="buttons">
        <button
          data-active={appState.isSticky}
          onClick={toggleSticky}
          className="button-toggle-sticky">
          <i className="mdi mdi-pin"></i>
        </button>
        <button
          data-disabled={appState.showPreferences}
          onClick={showPreferencesModal}
          className="button-toggle-preferences">
          <i className="mdi mdi-settings"></i>
        </button>
      </div>
      <Modal
        width={440}
        className="preferences-modal"
        active={appState.showPreferences}
        onClose={hidePreferencesModal}
        showConfirm={false}
        cancelText="关闭">
        <Preferences ref={preferencesModalRef} />
      </Modal>
    </div>
  )
})
