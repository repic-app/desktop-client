import React, { useState } from 'react'
import remote from 'helpers/remote'
import { formatJJMa } from 'utils/base'
import './styles.scss'

export default React.memo(({ appState, setAppState }) => {

  const [ inputedJJMa, setJJMa ] = useState('')

  const handleRevokeJJMa = () => {
    remote.dialog.showMessageBox({
      type: 'warning',
      message: '确定要撤销激活吗？',
      detail: '部分功能将会受限，并返还激活码使用次数',
      defaultId: 1,
      buttons: ['确定', '取消'],
    }, (index) => {
      console.log(index)
      if (index === 0) {
        setAppState({ jjma: null })
      }
    })
  }

  const handleInputJJMa = (event) => {
    setJJMa(event.currentTarget.value)
  }

  const handleApplyJJMa = () => {
    if (inputedJJMa[0] === 'A') {
      remote.dialog.showErrorBox('激活失败', '激活码无效')
    } else {
      setAppState({ jjma: inputedJJMa })
      remote.dialog.showMessageBox({
        type: 'info',
        message: '激活成功！',
        detail: '全部功能已解锁，该激活码还可使用1次',
        defaultId: 0,
        buttons: ['确定']
      })
    }
  }

  return (
    <div className="component-about">
      <div className="app-icon" />
      <h2 className="app-name">
        <span>Repic <small>v0.0.3</small></span>
      </h2>
      <h3 className="app-description">一个好用的图片压缩工具</h3>
      {appState.jjma ? (
        <div className="register-info">
          <h6 className="caption">
            <span className="text-success">已使用下列序列号激活</span>
            <a href="javascript:void(0);" onClick={handleRevokeJJMa} className="button-revoke"><i className="mdi mdi-alert"></i> 撤销激活</a>
          </h6>
          <div className="registration-code">
            <div className="code-note">
              <b>感谢使用！</b>
              <span>{formatJJMa(appState.jjma)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="register-info">
          <h6 className="caption">
            <span className="text-warning">激活以解除功能限制</span>
            <a href="javascript:void(0);" className="button-get-key"><i className="mdi mdi-key"></i> 获取激活码</a>
          </h6>
          <div className="register-form">
            <input value={inputedJJMa} onChange={handleInputJJMa} type="text" maxLength="20" placeholder="请输入20位激活码" />
            <button onClick={handleApplyJJMa} disabled={inputedJJMa.length !== 20} className="button button-sm button-primary button-apply-key">激活</button>
          </div>
        </div>
      )}
    </div>
  )

})