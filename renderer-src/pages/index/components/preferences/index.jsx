import React from 'react'
import remote, { requireRemote } from 'helpers/remote'
import Switch from 'components/switch'
import Select from 'components/select'
import Modal from 'components/modal'
import PluginOptions from '../pluginoptions'
import Updater from '../updater'
import APPContext from 'store/index'
import events from 'helpers/events'
import { openPluginFolder, openLink } from 'utils/base'
import packageJson from '../../../../../package.json'
import './styles.scss'

const similarExtensions = ['jpeg']
const { fetchPlugins, installPlugin, uninstallPlugin } = requireRemote('./helpers/plugin')

const mapExtensionsAndCompressors = (compressors) => {
  const supportedExtensions = {}

  compressors.forEach((item) => {
    item.extensions
      .filter((ext) => !similarExtensions.includes(ext))
      .forEach((ext) => {
        supportedExtensions[ext] = supportedExtensions[ext] || {
          compressors: [],
          defaultComprssor: null,
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

  return Object.keys(supportedExtensions).map((key) => {
    return {
      extension: key,
      ...supportedExtensions[key],
    }
  })
}

const requestPickSaveFolder = (preferences, setPreferences) => {
  remote.dialog
    .showOpenDialog(remote.getCurrentWindow(), {
      title: '选择存储文件夹',
      buttonLabel: '选择此文件夹',
      defaultPath: preferences.autoSavePath,
      properties: ['openDirectory', 'createDirectory'],
    })
    .then(({ filePaths }) => {
      if (filePaths && filePaths[0]) {
        setPreferences({
          autoSavePath: filePaths[0],
        })
      }
    })
}

const setDefaultCompressorForExtension = (plugins, extension, compressorName) => {
  return plugins.map((item) => {
    let { defaultFor = [] } = item

    if (item.name === compressorName) {
      defaultFor.push(extension)
    } else {
      defaultFor = defaultFor.filter((ext) => ext !== extension)
    }

    return {
      ...item,
      defaultFor: defaultFor.filter((ext, index, array) => index === array.indexOf(ext)),
    }
  })
}

const setPluginState = (plugins, name, state) => {
  return plugins.map((item) => {
    return item.name === name ? { ...item, ...state } : item
  })
}

const setPluginOption = (plugins, name, optionName, optionValue) => {
  return plugins.map((item) => {
    return item.name === name
      ? {
          ...item,
          options: item.options.map((subItem) => {
            return subItem.name === optionName ? { ...subItem, value: optionValue } : subItem
          }),
        }
      : item
  })
}

const themes = [
  {
    key: 'light',
    title: '浅色主题',
  },
  {
    key: 'dark',
    title: '深色主题',
  },
  {
    key: 'auto',
    title: '跟随系统',
  },
]

const parallelTaskCounts = [1, 3, 5, 8, 10]

export default class extends React.PureComponent {
  static contextType = APPContext

  state = {
    tabIndex: 0,
    thridPartPlugins: [],
    showPluginOptionsModal: false,
    selectedPlugin: null,
  }

  setTabIndex = (event) => {
    const tabIndex = typeof event === 'number' ? event : event.currentTarget.dataset.index * 1
    this.setState({ tabIndex })
  }

  handleOptionChange = (value, name) => {
    this.context.setPreferences({ [name]: value })
  }

  handleDefaultCompressorChange = (value, name) => {
    this.context.setPlugins(setDefaultCompressorForExtension(this.context.plugins, name, value))
  }

  togglePluginDisabled = (event) => {
    const { name, disabled } = event.currentTarget.dataset

    this.context.setPlugins(
      setPluginState(this.context.plugins, name, {
        disabled: disabled !== 'true',
      })
    )
  }

  handlePluginOptionChange = ({ name, optionName, optionValue }) => {
    this.context.setPlugins(setPluginOption(this.context.plugins, name, optionName, optionValue))
  }

  pickSaveFolder = () => {
    requestPickSaveFolder(this.context.preferences, this.context.setPreferences)
  }

  installPlugin = (event) => {
    const { name, url } = event.currentTarget.dataset

    this.context.setAppState({
      installingPlugins: [...this.context.appState.installingPlugins, name],
    })

    installPlugin(name, url)
      .then((pluginData) => {
        if (pluginData.postinstallFn) {
          try {
            const wrappedPostinstallFn = new Function(`return ${pluginData.postinstallFn}`)
            wrappedPostinstallFn()({
              pluginData,
              openLink,
              showMessageBox: remote.dialog.showMessageBox,
              showPluginOptions: () => this.showPluginOptionsModal(name),
            })
          } catch (error) {
            console.warn(`插件${name}的postinstall执行失败`)
            console.warn(error)
          }
        }
        this.context.setAppState({
          installingPlugins: this.context.appState.installingPlugins.filter(
            (item) => item !== name
          ),
        })
        events.emit('request-update-plugins')
      })
      .catch((error) => {
        console.log(error)
        this.context.setAppState({
          installingPlugins: this.context.appState.installingPlugins.filter(
            (item) => item !== name
          ),
        })
      })
  }

  uninstallPlugin = (event) => {
    const { name } = event.currentTarget.dataset

    remote.dialog
      .showMessageBox({
        type: 'warning',
        message: '确定要卸载此插件吗？',
        detail: '你可以在任何时候重新安装此插件',
        defaultId: 1,
        buttons: ['确定', '取消'],
      })
      .then(({ response: index }) => {
        if (index === 0) {
          uninstallPlugin(name).then(() => {
            events.emit('request-update-plugins')
          })
        }
      })
  }

  showPluginOptionsModal = (event) => {
    const name = typeof event === 'string' ? event : event.currentTarget.dataset.name
    const selectedPlugin = this.context.plugins.find((item) => item.name === name)
    if (selectedPlugin) {
      this.setState({ showPluginOptionsModal: true, selectedPlugin })
    }
  }

  hidePluginOptionsModal = () => {
    this.setState({ showPluginOptionsModal: false })
  }

  componentDidUpdate(_, prevState) {
    if (prevState.tabIndex !== this.state.tabIndex && this.state.tabIndex === 2) {
      events.emit('request-update-plugins')
      fetchPlugins()
        .then((res) => {
          if (res && res.plugins) {
            this.setState({ thridPartPlugins: res.plugins })
          }
        })
        .catch(() => {
          console.log('插件获取失败')
        })
    }
  }

  render() {
    const { tabIndex, thridPartPlugins, showPluginOptionsModal, selectedPlugin } = this.state
    const { appState, preferences, plugins, compressors } = this.context
    const taskNotEmpty = appState.taskList.length > 0
    const extensionCompressors = mapExtensionsAndCompressors(compressors)
    const uninstalledPlugins = thridPartPlugins.filter(
      (item) => !plugins.find((subItem) => subItem.name === item.name)
    )
    const { installingPlugins } = appState

    return (
      <div className="component-preferences">
        <div className="tab-header">
          <button
            data-index="0"
            data-active={tabIndex === 0}
            className="tab-button button-common"
            onClick={this.setTabIndex}>
            <span>通用</span>
          </button>
          <button
            data-index="1"
            data-active={tabIndex === 1}
            className="tab-button button-compress"
            onClick={this.setTabIndex}>
            <span>压缩</span>
          </button>
          <button
            data-index="2"
            data-active={tabIndex === 2}
            className="tab-button button-plugin"
            onClick={this.setTabIndex}>
            <span>插件</span>
          </button>
          <button
            data-index="3"
            data-active={tabIndex === 3}
            className="tab-button button-about"
            onClick={this.setTabIndex}>
            <span>关于</span>
          </button>
        </div>
        <div className="tab-content">
          <div className="tab-item" data-index="0" data-active={tabIndex === 0}>
            <div className="option-group">
              <label className="label">外观</label>
              <div className="option">
                <Select
                  value={`${preferences.theme}`}
                  name="theme"
                  onChange={this.handleOptionChange}>
                  {themes.map((item) => (
                    <option value={item.key} key={item.key}>
                      {item.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="option-group">
              <label className="label">启动后置顶</label>
              <div className="option">
                <Switch
                  checked={preferences.stickyOnLaunch}
                  name="stickyOnLaunch"
                  onChange={this.handleOptionChange}
                />
              </div>
            </div>
            <div className="divider"></div>
            <div className="option-group">
              <label className="label">显示缩略图</label>
              <div className="option">
                <Switch
                  checked={preferences.showThumb}
                  name="showThumb"
                  onChange={this.handleOptionChange}
                />
              </div>
            </div>
            <div className="option-group">
              <label className="label">并行任务数量</label>
              <div className="option">
                <Select
                  value={`${preferences.parallelTaskCount}`}
                  name="parallelTaskCount"
                  onChange={this.handleOptionChange}>
                  {parallelTaskCounts.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          <div className="tab-item" data-index="1" data-active={tabIndex === 1}>
            <div className="option-group">
              <label className="label">
                <b>指定各类文件的压缩插件</b>
              </label>
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
                  {extensionCompressors.map((item) => (
                    <tr key={item.extension}>
                      <td>{item.extension}</td>
                      <td>
                        <Select
                          disabled={item.compressors.length < 1}
                          value={item.defaultComprssor || item.compressors[0].name}
                          name={item.extension}
                          onChange={this.handleDefaultCompressorChange}>
                          {item.compressors.map(({ name, title }) => (
                            <option value={name} key={name}>
                              {title}
                            </option>
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
                <Select
                  value={`${preferences.outputQuality}`}
                  name="outputQuality"
                  onChange={this.handleOptionChange}>
                  <option value="0.3" key={0}>
                    极低
                  </option>
                  <option value="0.5" key={1}>
                    低
                  </option>
                  <option value="0.6" key={2}>
                    中
                  </option>
                  <option value="0.8" key={3}>
                    高
                  </option>
                  <option value="1" key={4}>
                    极高
                  </option>
                </Select>
              </div>
            </div>
            <div className="option-group" data-disabled={taskNotEmpty}>
              <label className="label">压缩后覆盖原文件</label>
              <div className="option">
                <Switch
                  checked={preferences.overrideOrigin}
                  name="overrideOrigin"
                  onChange={this.handleOptionChange}
                />
              </div>
            </div>
            <div
              className="option-group"
              data-disabled={taskNotEmpty || preferences.overrideOrigin}>
              <label className="label">
                <span>压缩后保存到</span>
                <small title={preferences.autoSavePath}>{preferences.autoSavePath}</small>
              </label>
              <div className="option">
                <button onClick={this.pickSaveFolder} className="button button-xs button-default">
                  更改
                </button>
              </div>
            </div>
          </div>
          <div className="tab-item" data-index="2" data-active={tabIndex === 2}>
            <div className="option-group">
              <label className="label">
                <b>安装插件来扩展程序能力</b>
              </label>
            </div>
            <div className="options-table plugins-table">
              <div className="table-wrapper">
                <table>
                  <tbody>
                    {plugins.map((plugin) => (
                      <tr key={plugin.name}>
                        <td>
                          <h5 className="caption">
                            <span className="title">
                              {plugin.title}
                              {plugin.disabled ? <small> [已停用]</small> : null}
                            </span>
                            <div className="operates">
                              {plugin.options ? (
                                <a
                                  href="javascript:void(0);"
                                  className="button button-xs button-default button-options"
                                  data-name={plugin.name}
                                  onClick={this.showPluginOptionsModal}>
                                  设置
                                </a>
                              ) : null}
                              <a
                                href="javascript:void(0);"
                                className="button button-xs button-default button-toggle-disabled"
                                data-name={plugin.name}
                                data-disabled={!!plugin.disabled}
                                onClick={this.togglePluginDisabled}>
                                {plugin.disabled ? '启用' : '停用'}
                              </a>
                              {plugin.isBuiltinPlugin ? null : (
                                <a
                                  href="javascript:void(0);"
                                  className="button button-xs button-default button-uninstall"
                                  data-name={plugin.name}
                                  onClick={this.uninstallPlugin}>
                                  卸载
                                </a>
                              )}
                            </div>
                          </h5>
                          <p className="description">{plugin.description}</p>
                        </td>
                      </tr>
                    ))}
                    {uninstalledPlugins.map((plugin) => (
                      <tr key={plugin.name}>
                        <td>
                          <h5 className="caption">
                            <span className="title">{plugin.title}</span>
                            <div className="operates">
                              {installingPlugins.includes(plugin.name) ? (
                                <span>安装中</span>
                              ) : (
                                <a
                                  href="javascript:void(0);"
                                  className="button button-xs button-default button-uninstall"
                                  data-name={plugin.name}
                                  data-url={plugin.downloadURL}
                                  onClick={this.installPlugin}>
                                  安装
                                </a>
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
            </div>
            <div className="plugin-entry">
              <a href="javascript:void(0);" className="text-with-icon" onClick={openPluginFolder}>
                <i className="mdi mdi-folder"></i>
                <span>打开插件目录</span>
              </a>
            </div>
          </div>
          <div className="tab-item" data-index="3" data-active={tabIndex === 3}>
            <div className="section-about">
              <div className="app-icon" />
              <h2 className="app-name">
                <span>
                  Repic <small>v{packageJson.version}</small>
                </span>
              </h2>
              <h3 className="app-description">一个好用的图片压缩工具</h3>
              <Updater />
            </div>
          </div>
        </div>
        <Modal
          className="plugin-options-modal"
          width={440}
          active={showPluginOptionsModal}
          onClose={this.hidePluginOptionsModal}
          showConfirm={false}
          cancelText="关闭">
          <PluginOptions plugin={selectedPlugin} onChange={this.handlePluginOptionChange} />
        </Modal>
      </div>
    )
  }
}
