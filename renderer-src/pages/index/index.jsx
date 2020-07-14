import React from 'react'
import TitleBar from './components/titlebar'
import FilePicker, { DragWrapper } from './components/filepicker'
import TaskList from './components/tasklist'
import TaskBar from './components/taskbar'
import { playSound } from 'helpers/sound'
import events from 'helpers/events'
import remote, { requireRemote } from 'helpers/remote'
import { appendTasks, executeTasks, restoreTask } from 'helpers/task'
import { taskStatus } from 'constants/task'
import { sleep } from 'utils/base'
import APPContext from 'store/index'
import './styles.scss'

const { checkRegistrationAPI } = requireRemote('./helpers/registration')
const { registerPlugins, updateRegisteredPlugins } = requireRemote('./helpers/plugin')
const { setAPPData, getAPPData } = requireRemote('./helpers/storage')

const defaultPageState = {
  isDraggingOver: false,
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
  installingPlugins: [],
}

export default class extends React.PureComponent {
  static contextType = APPContext

  state = {
    pageState: defaultPageState,
    appState: defaultAppState,
    preferences: getAPPData('preferences'),
    plugins: [],
    compressors: [],
    foo: 1,
  }

  getContextValue = () => ({
    appState: this.state.appState,
    preferences: this.state.preferences,
    plugins: this.state.plugins,
    compressors: this.state.compressors,
    setAppState: this.setAppState,
    setPreferences: this.setPreferences,
    updateProgress: this.updateProgress,
    setPlugins: this.setPlugins,
  })

  setAppState = (changedAppState, callback) => {
    this.setState(
      {
        appState: {
          ...this.state.appState,
          ...changedAppState,
        },
      },
      callback
    )
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
    const completedTaskCount = currentTask.filter((item) => {
      return [taskStatus.COMPLETE, taskStatus.FAIL, taskStatus.RESTORED].includes(item.status)
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
    const compressors = plugins.filter((item) => !item.disabled && item.type === 'compressor')

    this.setState({ plugins, compressors }, () => {
      updateRegisteredPlugins(plugins)
      setAPPData(
        'plugins',
        plugins.map(
          ({ name, title, type, accepts, extensions, defaultFor, disabled, options }) => ({
            name,
            title,
            type,
            accepts,
            extensions,
            defaultFor,
            disabled,
            options,
          })
        )
      )
    })
  }

  async checkRegistration() {
    const registration = await checkRegistrationAPI()

    if (registration) {
      this.setAppState({ jjma: registration.jjma })
    }
  }

  handleThumbCreate = (taskId, thumbUrl) => {
    this.setAppState({
      taskList: this.state.appState.taskList.map((item) => {
        return item.id === taskId ? { ...item, thumbUrl } : item
      }),
    })
  }

  handleTaskUpdate = (task) => {
    const nextTaskList = this.state.appState.taskList.map((item) => {
      return item.id === task.id ? { ...item, ...task } : item
    })

    this.setAppState(
      {
        taskList: executeTasks(nextTaskList, this.handleTaskUpdate, this.handleThumbCreate),
      },
      this.updateProgress
    )
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

    this.setAppState(
      {
        taskList: nextTaskList,
      },
      async () => {
        if (!currentTaskList.length) {
          await sleep(800)
        }
        this.setAppState(
          {
            taskList: executeTasks(nextTaskList, this.handleTaskUpdate, this.handleThumbCreate),
          },
          this.updateProgress
        )
      }
    )
  }

  handleRestore = (task) => {
    this.setAppState({
      taskList: this.state.appState.taskList.map((item) => {
        return item.id === task.id ? { ...item, ...restoreTask(task) } : item
      }),
    })
  }

  handleRecompress = (task) => {
    this.setAppState(
      {
        taskList: executeTasks(
          this.state.appState.taskList.map((item) => {
            return item.id === task.id ? { ...item, status: taskStatus.PENDING } : item
          }),
          this.handleTaskUpdate,
          this.handleThumbCreate
        ),
      },
      this.updateProgress
    )
  }

  handleClear = () => {
    this.setState({ isDraggingOver: false })
  }

  handleRestoreAll = (taskList) => {
    this.setAppState({ taskList })
  }

  handleRecompressAll = (taskList) => {
    this.setAppState(
      {
        taskList: executeTasks(taskList, this.handleTaskUpdate, this.handleThumbCreate),
      },
      this.updateProgress
    )
  }

  initializePlugins() {
    const plugins = registerPlugins()
    const compressors = plugins.filter((item) => !item.disabled && item.type === 'compressor')
    this.setState({ plugins, compressors })
  }

  componentDidMount() {
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
        remote.dialog.showMessageBox(
          {
            type: 'info',
            message: '是否安装压缩插件？',
            detail: '程序仅内置jpg和webp图片压缩功能，安装压缩插件后可压缩更多格式的文件',
            defaultId: 0,
            buttons: ['安装插件', '取消'],
          }.then(({ response: index }) => {
            setAPPData('showPluginInstallTip', false)
            if (index === 0) {
              events.emit('request-open-plugin-settings')
            }
          })
        )
      }, 1000)
    }
  }

  render() {
    const { appState, preferences, compressors } = this.state

    return (
      <div className="app-page page-index">
        <APPContext.Provider value={this.getContextValue()}>
          <TitleBar appState={appState} preferences={preferences} setAppState={this.setAppState} />
          <DragWrapper
            appState={appState}
            compressors={compressors}
            onChange={this.handlePickedFile}>
            <FilePicker
              appState={appState}
              compressors={compressors}
              onChange={this.handlePickedFile}
              visible={!appState.taskList.length}
            />
            <TaskList
              appState={appState}
              preferences={preferences}
              onRestore={this.handleRestore}
              visible={!!appState.taskList.length}
              onRecompress={this.handleRecompress}
            />
          </DragWrapper>
          <TaskBar
            appState={appState}
            setAppState={this.setAppState}
            compressors={compressors}
            preferences={preferences}
            onClear={this.handleClear}
            onPickFile={this.handlePickedFile}
            onRestoreAll={this.handleRestoreAll}
            onRecompressAll={this.handleRecompressAll}
            visible={!!appState.taskList.length}
          />
        </APPContext.Provider>
      </div>
    )
  }
}
