import React from 'react'
import Modal from 'components/modal'
import Preferences from '../preferences'
import About from '../about'
import { openLink, openCacheFolder } from 'utils/base'
import './styles.scss'

const preferencesModalTitle = (
  <div className="text-with-icon">
    <i className="icon-settings"></i>
    <span>参数设置</span>
  </div>
)

const aboutModalTitle = (
  <div className="text-with-icon">
    <i className="icon-info"></i>
    <span>关于REPIC</span>
  </div>
)

const cacheDirEntry = (
  <a onClick={openCacheFolder} className="cache-dir-entry text-with-icon">
    <i className="icon-folder"></i>
    <span>查看缓存目录</span>
  </a>
)

export default React.memo((props) => {

  const showPreferencesModal = () => {
    props.setAppState({
      showPreferences: true
    })
  }

  const hidePreferencesModal = () => {
    props.setAppState({
      showPreferences: false
    })
  }

  const showAboutModal = () => {
    props.setAppState({
      showAbout: true
    })
  }

  const hideAboutModal = () => {
    props.setAppState({
      showAbout: false
    })
  }

  const openDonateUrl = () => {
    openLink('https://margox.cn')
    return false
  }

  return (
    <div className="component-start">
      <div className="photos-folder"></div>
      {/* <div className="machine-frame">
        <span className="indicator" />
        <div className="photo-wrap">
          <div className="photo" />
        </div>
      </div> */}
      <div className="drag-tip">
        <span>拖拽图片至此窗口以开始压缩</span>
        <small>JPG/PNG/WEBP/SVG/GIF</small>
      </div>
      <div className="foot-links">
        <a href="javascript:void(0);" onClick={showPreferencesModal} className="settings-entry text-with-icon">
          <i className="icon-settings"></i>
          <span>参数设置</span>
        </a>
        <a href="javascript:void(0);" onClick={showAboutModal} className="about-entry text-with-icon">
          <i className="icon-info"></i>
          <span>关于Repic</span>
        </a>
      </div>
      <Modal
        title={preferencesModalTitle}
        width={360}
        active={props.appState.showPreferences}
        onClose={hidePreferencesModal}
        showConfirm={false}
        footerAddon={cacheDirEntry}
        cancelText="关闭"
      >
        <Preferences />
      </Modal>
      <Modal
        title={aboutModalTitle}
        width={360}
        active={props.appState.showAbout}
        onClose={hideAboutModal}
        onConfirm={openDonateUrl}
        confirmText="立即激活"
        cancelText="关闭"
      >
        <About />
      </Modal>
    </div>
  )

})