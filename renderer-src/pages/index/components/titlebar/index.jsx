import React, { useRef, useEffect } from 'react'
import Modal from 'components/modal'
import Switch from 'components/switch'
import remote from 'helpers/remote'
import event from 'helpers/events'
import { openLink, openFolder, openCacheFolder } from 'utils/base'
import Preferences from '../preferences'
import About from '../about'
import './styles.scss'

const aboutModalTitle = (
  <div className="text-with-icon">
    <i className="mdi mdi-info"></i>
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

export default React.memo(({ preferences, appState, setAppState }) => {

  const dropdownRef = useRef(null)
  const preferencesModalRef = useRef(null)

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
    dropdownRef.current.handleCloseButtonClick()
    setAppState({
      showPreferences: true
    })
  }

  const toggleAboutModal = () => {
    dropdownRef.current.handleCloseButtonClick()
    setAppState({
      showAbout: true
    })
  }

  const openSavePath = () => {
    openFolder(preferences.autoSavePath)
  }

  useEffect(() => {

    event.on('request-open-plugin-settings', () => {
      togglePreferencesModal()
      preferencesModalRef.current.setTabIndex(2)
    })
  }, [])

  return (
    <div className="component-title-bar">
      <div className="app-title">
        <span>Repic</span>
      </div>
      <a href="javascript:void(0);" onClick={toggleDropdownMenu} className="button-toggle-dropdown"><i className="mdi mdi-settings"></i></a>
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
        width={440}
        active={appState.showPreferences}
        onClose={hidePreferencesModal}
        showConfirm={false}
        cancelText="关闭"
      >
        <Preferences ref={preferencesModalRef} />
      </Modal>
      <Modal
        width={440}
        active={appState.showAbout}
        onClose={hideAboutModal}
        showConfirm={false}
        footerAddon={copyRightText}
        cancelText="关闭"
      >
        <About appState={appState} setAppState={setAppState} />
      </Modal>
    </div>
  )

})