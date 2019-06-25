import React from 'react'
import remote from 'helpers/remote'
import Switch from 'components/switch'
import Select from 'components/select'
import APPContext from 'store/index'
import { openPluginFolder } from 'utils/base'
import './styles.scss'

const similarExtensions = ['jpeg']

const mapExtensionsAndCompressors = (compressors) => {

  const supportedExtensions = {}

  compressors.forEach(item => {

    item.extensions.filter(ext => !similarExtensions.includes(ext)).forEach(ext => {

      supportedExtensions[ext] = supportedExtensions[ext] || {
        compressors: [],
        defaultComprssor: null
      }

      supportedExtensions[ext].compressors.push({
        name: item.name,
        title: item.title,
      })

      if (item.defaultFor && item.defaultFor.includes(ext)) {
        supportedExtensions[ext].defaultComprssor = item.name
      }

    })
  })

  return Object.keys(supportedExtensions).map(key => {
    return {
      extension: key,
      ...supportedExtensions[key]
    }
  })
}

const requestPickSaveFolder = (preferences, setPreferences) => {

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

const setDefaultCompressorForExtension = (plugins, extension, compressorName) => {

  return plugins.map(item => {

    let { defaultFor = [] } = item 

    if (item.name === compressorName) {
      defaultFor.push(extension)
    } else {
      defaultFor = defaultFor.filter(ext => ext !== extension)
    }

    return {
      ...item,
      defaultFor: defaultFor.filter((ext, index, array) => index === array.indexOf(ext))
    }
  })
}

const setPluginState = (plugins, name, state) => {

  return plugins.map(item => {
    return item.name === name ? { ...item, ...state } : item
  })
}

export default class extends React.PureComponent {

  static contextType = APPContext

  state = {
    tabIndex: 0
  }

  setTabIndex = (event) => {

    const tabIndex = typeof event === 'number' ? event : event.currentTarget.dataset.index * 1
    this.setState({ tabIndex })
  }

  handleChange = (value, name) => {
    this.context.setPreferences({ [name]: value })
  }

  handleDefaultCompressorChange = (value, name) => {
    this.context.ssetPlugins(setDefaultCompressorForExtension(this.context.plugins, name, value))
  }

  togglePluginDisabled = (event) => {

    const { name, disabled } = event.currentTarget.dataset

    this.context.setPlugins(setPluginState(this.context.plugins, name, {
      disabled: disabled !== 'true'
    }))
  }

  pickSaveFolder = () => {
    requestPickSaveFolder(this.context.preferences, this.context.setPreferences)
  }

  render () {

    const { tabIndex } = this.state
    const { appState, preferences, plugins, compressors } = this.context
    const taskNotEmpty = appState.taskList.length > 0
    const extensionCompressors = mapExtensionsAndCompressors(compressors)

    return (
      <div className="component-preferences">
        <div className="tab-header">
          <a href="javascript:void(0);" data-index="0" data-active={tabIndex === 0} className="tab-button button-common" onClick={this.setTabIndex}><span>通用设定</span></a>
          <a href="javascript:void(0);" data-index="1" data-active={tabIndex === 1} className="tab-button button-compress" onClick={this.setTabIndex}><span>压缩参数</span></a>
          <a href="javascript:void(0);" data-index="2" data-active={tabIndex === 2} className="tab-button button-plugin" onClick={this.setTabIndex}><span>插件管理</span></a>
        </div>
        <div className="tab-content">
          <div className="tab-item" data-index="0" data-active={tabIndex === 0}>
            <div className="option-group">
              <label className="label">外观</label>
              <div className="option">
                <Select value={`${preferences.theme}`} name="theme" onChange={this.handleChange} >
                  <option value="dark" key={0}>深色主题</option>
                  <option value="light" key={1}>浅色主题</option>
                  <option value="auto" key={2}>跟随系统</option>
                </Select>
              </div>
            </div>
            <div className="option-group">
              <label className="label">显示缩略图</label>
              <div className="option">
                <Switch checked={preferences.showThumb} name="showThumb" onChange={this.handleChange} />
              </div>
            </div>
            <div className="option-group">
              <label className="label">并行压缩数量</label>
              <div className="option">
                <Select value={`${preferences.parallelTaskCount}`} name="parallelTaskCount" onChange={this.handleChange} >
                  <option value="1" key={0}>1</option>
                  <option value="3" key={1}>3</option>
                  <option value="5" key={2}>5</option>
                  <option value="8" key={3}>8</option>
                  <option value="10" key={4}>10</option>
                </Select>
              </div>
            </div>
            <div className="option-group">
              <label className="label">启动后置顶</label>
              <div className="option">
                <Switch checked={preferences.stickyOnLaunch} name="stickyOnLaunch" onChange={this.handleChange} />
              </div>
            </div>
            <div className="option-group">
              <label className="label">操作音效</label>
              <div className="option">
                <Switch checked={preferences.soundEffects} name="soundEffects" onChange={this.handleChange} />
              </div>
            </div>
          </div>
          <div className="tab-item" data-index="1" data-active={tabIndex === 1}>
            <div className="option-group">
              <label className="label"><b>指定各类文件的压缩插件</b></label>
            </div>
            <div className="options-table extensions-table">
              <table>
                <thead>
                  <tr>
                    <th width="55%">扩展名</th>
                    <th width="45%">压缩插件</th>
                  </tr>
                </thead>
                <tbody>
                  {extensionCompressors.map(item => (
                    <tr key={item.extension}>
                      <td>{item.extension}</td>
                      <td>
                        <Select
                          disabled={item.compressors.length <= 1}
                          value={item.defaultComprssor || item.compressors[0].name}
                          name={item.extension}
                          onChange={this.handleDefaultCompressorChange}
                        >
                          {item.compressors.map(({ name, title }) => (
                            <option value={name} key={name}>{title}</option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="option-group">
              <label className="label text-with-icon">
                <span>压缩质量</span>
                <small>仅部分插件支持此选项</small>
              </label>
              <div className="option">
                <Select value={`${preferences.outputQuality}`} name="outputQuality" onChange={this.handleChange}>
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
                <Switch checked={preferences.overrideOrigin} name="overrideOrigin" onChange={this.handleChange} />
              </div>
            </div>
            <div className="option-group" data-disabled={taskNotEmpty || preferences.overrideOrigin}>
              <label className="label">
                <span>压缩后保存到</span>
                <small title={preferences.autoSavePath}>{preferences.autoSavePath}</small>
              </label>
              <div className="option">
                <button onClick={this.pickSaveFolder} className="button button-xs button-default">更改</button>
              </div>
            </div>
          </div>
          <div className="tab-item" data-index="2" data-active={tabIndex === 2}>
            <div className="option-group">
              <label className="label"><b>安装插件来扩展程序能力</b></label>
            </div>
            <div className="options-table plugins-table">
              <table>
                <tbody>
                  {plugins.map(plugin => (
                    <tr key={plugin.name}>
                      <td>
                        <h5 className="caption">
                          <span className="title">{plugin.title}{plugin.disabled ? <small> [已停用]</small> : null}</span>
                          <div className="operates">
                            <a
                              href="javascript:void(0);"
                              className="button button-xs button-default button-toggle-disabled"
                              data-name={plugin.name}
                              data-disabled={!!plugin.disabled}
                              onClick={this.togglePluginDisabled}
                            >{plugin.disabled ? '启用' : '停用'}</a>
                            {plugin.isBuiltinPlugin ? null : (
                              <a
                                href="javascript:void(0);"
                                className="button button-xs button-default button-uninstall"
                                data-name={plugin.name}
                              >卸载</a>
                            )}
                          </div>
                        </h5>
                        <p className="description">{plugin.description}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="plugin-entry">
              <a href="javascript:void(0);" className="button-open-plugin-folder" onClick={openPluginFolder}>打开插件目录</a>
            </div>
          </div>
        </div>
      </div>
    )

  }

}