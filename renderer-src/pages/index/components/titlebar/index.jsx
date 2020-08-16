import React, { useRef, useCallback, useEffect } from 'react'
import Modal from 'components/modal'
import remote from 'helpers/remote'
import event from 'helpers/events'
import { openLink, openFolder, openCacheFolder } from 'utils/base'
import Preferences from '../preferences'
import './styles.scss'

const handleMinimize = () => {
  remote.getCurrentWindow().minimize()
}

const handleClose = () => {
  remote.getCurrentWindow().close()
}

const openOfficialSite = () => {
  openLink('https://repic.app')
}

const officialSiteEntry = (
  <a onClick={openOfficialSite} className="official-site-entry">
    repic.app &copy; 2020
  </a>
)

export default React.memo(({ preferences, appState, setAppState }) => {
  const modalRef = useRef(null)
  const preferencesRef = useRef(null)

  const toggleSticky = useCallback(() => {
    remote.getCurrentWindow().setAlwaysOnTop(!appState.isSticky)
    setAppState({ isSticky: !appState.isSticky })
  }, [appState.isSticky])

  const togglePreferencesModal = useCallback(
    (showPreferences) => {
      const nextShowPreferences =
        typeof showPreferences === 'boolean' ? showPreferences : !appState.showPreferences
      if (nextShowPreferences && !appState.showPreferences) {
        setAppState({
          showPreferences: true,
        })
      } else if (!nextShowPreferences && appState.showPreferences) {
        modalRef.current.externalRequestClose()
      }
    },
    [appState.showPreferences]
  )

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
      togglePreferencesModal(true)
      preferencesRef.current.setTabIndex(2)
    })
  }, [])

  return (
    <div className="component-title-bar">
      <div className="window-buttons">
        <button onClick={handleMinimize} className="button-minimize"></button>
        <button onClick={handleClose} className="button-close"></button>
      </div>
      <div className="app-title">
        <span>Repic App</span>
      </div>
      <div className="option-buttons">
        <button
          data-active={appState.isSticky}
          onClick={toggleSticky}
          className="button-toggle-sticky">
          <i className="mdi mdi-pin"></i>
        </button>
        <button onClick={togglePreferencesModal} className="button-toggle-preferences">
          <i className="mdi mdi-settings"></i>
        </button>
      </div>
      <Modal
        width={440}
        ref={modalRef}
        className="preferences-modal"
        active={appState.showPreferences}
        onClose={hidePreferencesModal}
        footerAddon={officialSiteEntry}
        showConfirm={false}
        cancelText="关闭">
        <Preferences ref={preferencesRef} />
      </Modal>
    </div>
  )
})
