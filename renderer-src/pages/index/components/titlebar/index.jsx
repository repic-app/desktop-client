import React from 'react'
import Switch from 'components/switch'
import remote from 'helpers/remote'
import './styles.scss'

export default React.memo((props) => {

  const toggleSticky = () => {
    remote.getCurrentWindow().setAlwaysOnTop(!props.appState.isSticky)
    props.setAppState({ isSticky: !props.appState.isSticky, taskItems: [] })
  }

  return (
    <div className="component-title-bar">
      <span className="app-title">皮克压缩机</span>
      <Switch className="switch-sticky" label="置顶" onChange={toggleSticky} checked={props.appState.isSticky} />
    </div>
  )

})