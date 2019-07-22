import React from 'react'
import TitleBar from './components/titlebar'
import Start from './components/start'
import TaskList from './components/tasklist'
import TaskAnalyzer from './components/analyzer'
import { playSound } from 'helpers/sound'
import events from 'helpers/events'
import remote, { requireRemote } from 'helpers/remote'
import { appendTasks, executeTasks, restoreTask } from 'helpers/task'
import { resolveLocalFiles } from 'utils/base'
import { taskStatus } from 'constants/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
import './styles.scss'

const { checkRegistrationAPI } = requireRemote('./helpers/registration')
const { registerPlugins, updateRegisteredPlugins } = requireRemote('./helpers/plugin')
const { setAPPData, getAPPData } = requireRemote('./helpers/storage')

const defaultPageState = {
  isDraggingOver: false
}

const defaultAppState = {
  isSticky: false,
  taskList: [],
  taskProgress: -1,
  jjma: null,
  taskAllFinished: false,
  showSettingsDropdown: false,
  showAbout: false,
  showPreferences: false,
  installingPlugins: []
}

let dragEventTriggerCount = 0

export default class extends React.PureComponent {

  static contextType = APPContext

  state = {
    pageState: defaultPageState,
    appState: defaultAppState,
    preferences: getAPPData('preferences'),
    plugins: [],
    compressors: [],
    foo: 1
  }

  getContextValue = () => ({
    appState: this.state.appState,
    preferences: this.state.preferences,
    plugins: this.state.plugins,
    compressors: this.state.compressors,
    setAppState: this.setAppState,
    setPreferences: this.setPreferences,
    updateProgress: this.updateProgress,
    setPlugins: this.setPlugins
  })

  setAppState = (changedAppState, callback) => {

    this.setState({
      appState: {
        ...this.state.appState,
        ...changedAppState
      }
    }, callback)

  }

  setPreferences = (changedPreferences) => {

    const nextPreferences = { ...this.state.preferences, ...changedPreferences }

    this.setState({ preferences: nextPreferences }, () => {
      setAPPData('preferences', nextPreferences)
      if (changedPreferences.theme) {
        this.props.onUpdateAppTheme()
      }
    })

  }

  updateProgress = () => {

    const { taskList: currentTask } = this.state.appState
    const completedTaskCount = currentTask.filter(item => {
      return [
        taskStatus.COMPLETE,
        taskStatus.FAIL,
        taskStatus.RESTORED,
      ].includes(item.status)
    }).length

    let taskProgress = completedTaskCount / currentTask.length
    const taskAllFinished = taskProgress === 1
    taskProgress >= 1 && (taskProgress = -1)

    this.setAppState({ taskProgress, taskAllFinished })
    try {
      remote.getCurrentWindow().setProgressBar(taskProgress)
    } catch {
      // ...
    }

  }

  setPlugins = (plugins) => {

    const compressors = plugins.filter(item => !item.disabled && item.type === 'compressor')

    this.setState({ plugins, compressors }, () => {
      updateRegisteredPlugins(plugins)
      setAPPData('plugins', plugins.map(({ name, title, type, accepts, extensions, defaultFor, disabled, options }) => ({ name, title, type, accepts, extensions, defaultFor, disabled, options })))
    })

  }

  async checkRegistration () {

    const registration = await checkRegistrationAPI()

    if (registration) {
      this.setAppState({ jjma: registration.jjma })
    }

  }

  handleThumbCreate = (taskId, thumbUrl) => {

    this.setAppState({
      taskList: this.state.appState.taskList.map(item => {
        return item.id === taskId ? { ...item, thumbUrl } : item
      })
    })

  }

  handleTaskUpdate = (task) => {

    const nextTaskList = this.state.appState.taskList.map(item => {
      return item.id === task.id ? { ...item, ...task } : item
    })

    this.setAppState({
      taskList: executeTasks(nextTaskList, this.handleTaskUpdate, this.handleThumbCreate)
    }, this.updateProgress)

  }

  handleDragEnter = (event) => {

    if (dragEventTriggerCount === 0) {
      playSound('INSERT_PHOTO')
    }

    dragEventTriggerCount ++
    this.setState({ isDraggingOver: true })

    event.preventDefault()
    event.stopPropagation()

  }

  handleDragOver = (event) => {
    event.preventDefault()
  }

  handleDragDrop = async (event) => {

    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer.files
    const currentTaskList = this.state.appState.taskList
    const nextTaskList = appendTasks(currentTaskList, [].map.call(files, file => ({ file, path: file.path })))

    if (nextTaskList.length === currentTaskList.length) {
      playSound('ERROR')
    }

    if (!nextTaskList.length) {
      this.handleDragCancel()
      return false
    }

    dragEventTriggerCount > 0 && dragEventTriggerCount --

    this.setAppState({
      taskList: nextTaskList
    }, async () => {
      if (!currentTaskList.length) {
        await sleep(500)
      }
      this.setAppState({
        taskList: executeTasks(nextTaskList, this.handleTaskUpdate, this.handleThumbCreate)
      }, this.updateProgress)
    })

  }

  handleDragCancel = (event) => {

    dragEventTriggerCount > 0 && dragEventTriggerCount --

    if (dragEventTriggerCount === 0) {
      playSound('INSERT_PHOTO')
      this.setState({ isDraggingOver: false })
    }

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

  }

  handlePickedFile = (files) => {

    const currentTaskList = this.state.appState.taskList
    const nextTaskList = appendTasks(currentTaskList, files)

    if (nextTaskList.length === currentTaskList.length) {
      playSound('ERROR')
    }

    if (!nextTaskList.length) {
      return false
    }

    this.setAppState({
      taskList: nextTaskList
    }, async () => {
      if (!currentTaskList.length) {
        await sleep(800)
      }
      this.setAppState({
        taskList: executeTasks(nextTaskList, this.handleTaskUpdate, this.handleThumbCreate)
      }, this.updateProgress)
    })

  }

  handleRequestPickFile = () => {

    if (!this.state.compressors.length) {
      remote.dialog.showMessageBox({
        type: 'info',
        message: '未启用任何转换插件',
        detail: '是否前往插件管理页来启用转换插件？',
        defaultId: 0,
        buttons: ['是', '否'],
      }, (index) => {
        if (index === 0) {
          events.emit('request-open-plugin-settings')
        }
      })
      return false
    }

    remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: '选择图片文件',
      filters: [
        {
          name: '图片文件',
          extensions: this.state.compressors.map(item => item.extensions).flat()
        }
      ],
      properties: ['openFile', 'multiSelections', 'noResolveAliases', 'treatPackageAsDirectory'],
    }, (filePaths) => {
      filePaths && this.handlePickedFile(resolveLocalFiles(filePaths))
    })

  }

  handleRestore = (task) => {
    this.setAppState({
      taskList: this.state.appState.taskList.map(item => {
        return item.id === task.id ? { ...item, ...restoreTask(task) } : item
      })
    })
  }

  handleRecompress = (task) => {
    this.setAppState({
      taskList: executeTasks(this.state.appState.taskList.map(item => {
        return item.id === task.id ? { ...item, status: taskStatus.PENDING } : item
      }), this.handleTaskUpdate, this.handleThumbCreate)
    }, this.updateProgress)
  }

  handleClear = () => {
    this.setState({ isDraggingOver: false })
  }

  handleRestoreAll = (taskList) => {
    this.setAppState({ taskList })
  }

  handleRecompressAll = (taskList) => {
    this.setAppState({
      taskList: executeTasks(taskList, this.handleTaskUpdate, this.handleThumbCreate)
    }, this.updateProgress)
  }

  initializePlugins () {
    const plugins = registerPlugins()
    const compressors = plugins.filter(item => !item.disabled && item.type === 'compressor')
    this.setState({ plugins, compressors })
  }

  componentDidMount () {

    if (this.state.preferences.stickyOnLaunch) {
      remote.getCurrentWindow().setAlwaysOnTop(true)
      this.setAppState({ isSticky: true })
    }

    this.checkRegistration()
    this.initializePlugins()

    events.on('request-update-plugins', () => {
      this.initializePlugins()
    })

    if (getAPPData('showPluginInstallTip', false)) {
      setTimeout(() => {
        remote.dialog.showMessageBox({
          type: 'info',
          message: '是否安装压缩插件？',
          detail: '程序仅内置jpg和webp图片压缩功能，安装压缩插件后可压缩更多格式的文件',
          defaultId: 0,
          buttons: ['安装插件', '取消'],
        }, (index) => {
          setAPPData('showPluginInstallTip', false)
          if (index === 0) {
            events.emit('request-open-plugin-settings')
          }
        })
      }, 1000)
    }

  }

  render () {

    const { appState, preferences, compressors } = this.state

    return (
      <div className="app-page page-index">
        <APPContext.Provider value={this.getContextValue()}>
          <TitleBar
            appState={appState}
            preferences={preferences}
            setAppState={this.setAppState}
          />
          <div
            className="index-content"
            onDragEnter={this.handleDragEnter}
            onDragExit={this.handleDragCancel}
            onDragEnd={this.handleDragCancel}
            onDragOver={this.handleDragOver}
            onDrop={this.handleDragDrop}
            onDragLeave={this.handleDragCancel}
            data-dragging-over={this.state.isDraggingOver}
            data-empty={appState.taskList.length === 0}
          >
            <Start
              appState={appState}
              compressors={compressors}
              setAppState={this.setAppState}
              onRequestPickFile={this.handleRequestPickFile}
            />
            <TaskList
              appState={appState}
              preferences={preferences}
              onRestore={this.handleRestore}
              onRecompress={this.handleRecompress}
            />
            <div className="footer">
              <button onClick={this.handleRequestPickFile} className="button-pick-files"></button>
              <div data-active={appState.taskList.length && !appState.taskAllFinished} className="processing-spinner" />
              <TaskAnalyzer
                appState={appState}
                preferences={preferences}
                setAppState={this.setAppState}
                onClear={this.handleClear}
                onRestoreAll={this.handleRestoreAll}
                onRecompressAll={this.handleRecompressAll}
                onRequestPickFile={this.handleRequestPickFile}
              />
            </div>
          </div>
        </APPContext.Provider>
      </div>
    )

  }

}