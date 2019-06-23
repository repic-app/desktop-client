import React, { useState, useContext } from 'react'
import remote from 'helpers/remote'
import Switch from 'components/switch'
import Select from 'components/select'
import APPContext from 'store/index'
import './styles.scss'

export default React.memo(() => {

  const { appState, preferences, setPreferences } = useContext(APPContext)
  const [ tabIndex, _setTabIndex ] = useState(0)

  const setTabIndex = (event) => {
    _setTabIndex(event.currentTarget.dataset.index * 1)
  }

  const handleChange = (value, name) => {
    setPreferences({ [name]: value })
  }

  const requestPickSaveFolder = () => {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: '选择存储文件夹',
      buttonLabel: '选择此文件夹',
      defaultPath: preferences.autoSavePath,
      properties: ['openDirectory', 'createDirectory'],
    }, (filePaths) => {
      if (filePaths && filePaths[0]) {
        setPreferences({
          autoSavePath: filePaths[0]
        })
      }
    })
  }

  const taskNotEmpty = appState.taskList.length > 0

  return (
    <div className="component-preferences">
      <div className="tab-header">
        <a href="javascript:void(0);" data-index="0" data-active={tabIndex === 0} className="tab-button button-common" onClick={setTabIndex}><span>通用设定</span></a>
        <a href="javascript:void(0);" data-index="1" data-active={tabIndex === 1} className="tab-button button-compress" onClick={setTabIndex}><span>压缩参数</span></a>
        <a href="javascript:void(0);" data-index="2" data-active={tabIndex === 2} className="tab-button button-plugin" onClick={setTabIndex}><span>插件管理</span></a>
      </div>
      <div className="tab-content">
        <div className="tab-item" data-index="0" data-active={tabIndex === 0}>
          <div className="option-group" data-disabled={!appState.jjma}>
            <label className="label">外观</label>
            <div className="option">
              <Select value={`${preferences.theme}`} name="theme" onChange={handleChange} >
                <option value="dark" key={0}>深色主题</option>
                <option value="light" key={1}>浅色主题</option>
                <option value="auto" key={2}>跟随系统</option>
              </Select>
            </div>
          </div>
          <div className="option-group" data-disabled={!appState.jjma}>
            <label className="label">显示缩略图</label>
            <div className="option">
              <Switch checked={preferences.showThumb} name="showThumb" onChange={handleChange} />
            </div>
          </div>
          <div className="option-group" data-disabled={!appState.jjma}>
            <label className="label">并行压缩数量</label>
            <div className="option">
              <Select value={`${preferences.parallelTaskCount}`} name="parallelTaskCount" onChange={handleChange} >
                <option value="1" key={0}>1</option>
                <option value="3" key={1}>3</option>
                <option value="5" key={2}>5</option>
                <option value="8" key={3}>8</option>
                <option value="10" key={4}>10</option>
              </Select>
            </div>
          </div>
          <div className="option-group" data-disabled={!appState.jjma}>
            <label className="label">启动后置顶</label>
            <div className="option">
              <Switch checked={preferences.stickyOnLaunch} name="stickyOnLaunch" onChange={handleChange} />
            </div>
          </div>
          <div className="option-group">
            <label className="label">操作音效</label>
            <div className="option">
              <Switch checked={preferences.soundEffects} name="soundEffects" onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="tab-item" data-index="1" data-active={tabIndex === 1}>
          <div className="option-group">
            <label className="label"><b>指定各类文件的压缩插件</b></label>
          </div>
          <div className="options-table">
            <table>
              <thead>
                <tr>
                  <th width="55%">扩展名</th>
                  <th width="45%">压缩插件</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>.jpg/.jpeg</td>
                  <td>
                    <Select>
                      <option value="1" key={0}>CompressorJS</option>
                      <option value="2" key={1}>TinyPNG</option>
                    </Select>
                  </td>
                </tr>
                <tr>
                  <td>.png</td>
                  <td>
                    <Select>
                      <option value="1" key={0}>Pngquant</option>
                      <option value="2" key={1}>TinyPNG</option>
                    </Select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="option-group">
            <label className="label text-with-icon">
              <span>压缩质量</span>
              <small>仅部分插件支持此选项</small>
            </label>
            <div className="option">
              <Select value={`${preferences.outputQuality}`} name="outputQuality" onChange={handleChange}>
                <option value="0.3" key={0}>极低</option>
                <option value="0.5" key={1}>低</option>
                <option value="0.6" key={2}>中</option>
                <option value="0.8" key={3}>高</option>
                <option value="1" key={4}>极高</option>
              </Select>
            </div>
          </div>
          <div className="option-group" data-disabled={taskNotEmpty}>
            <label className="label">压缩后覆盖原图</label>
            <div className="option">
              <Switch checked={preferences.overrideOrigin} name="overrideOrigin" onChange={handleChange} />
            </div>
          </div>
          <div className="option-group" data-disabled={taskNotEmpty || preferences.overrideOrigin}>
            <label className="label">
              <span>压缩后保存到</span>
              <small title={preferences.autoSavePath}>{preferences.autoSavePath}</small>
            </label>
            <div className="option">
              <button onClick={requestPickSaveFolder} className="button button-xs button-default">更改</button>
            </div>
          </div>
          {/* <div className="option-group">
            <label className="label">尝试修正图片方向</label>
            <div className="option">
              <Switch checked={preferences.tryFixOrientation} name="tryFixOrientation" onChange={handleChange} />
            </div>
          </div>
          <div className="option-group">
            <label className="label text-with-icon">
              <span>抹除图片元信息</span>
              <i className="icon-help-circle" title="仅部分图片格式支持此选项"></i>
            </label>
            <div className="option">
              <Switch checked={preferences.stripMetedata} name="stripMetedata" onChange={handleChange} />
            </div>
          </div> */}
        </div>
        <div className="tab-item" data-index="2" data-active={tabIndex === 2}>
          <div className="option-group">
            <label className="label"><b>安装插件来扩展程序能力</b></label>
          </div>
          <div className="options-table plugins-table">
            <table>
              <tbody>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>CompressorJS</span>
                    </h5>
                    <p className="description">用于压缩jpg与webp格式的图片</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>PNGQuant</span>
                    </h5>
                    <p className="description">用于压缩png格式的图片，压缩速度快、压缩率高，但是出图质量欠佳</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>TinyPNG</span>
                    </h5>
                    <p className="description">用于压缩png格式的图片，压缩率高、出图质量高，但是需要自行配置API Key，每月仅可使用500次且无法离线使用</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>Gifsicle</span>
                    </h5>
                    <p className="description">用于压缩gif格式的图片</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>Svgo</span>
                    </h5>
                    <p className="description">用于压缩svg格式的图片，可能会更改出图尺寸和造成内容失真</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="name">
                      <span>GhostScript</span>
                    </h5>
                    <p className="description">用于压缩pdf文件</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

})