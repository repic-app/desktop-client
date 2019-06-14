import 'assets/scss/_base.scss'
import React from 'react'
import remote, { electron } from 'helpers/remote'
import { HashRouter, Route } from 'react-router-dom'
import { requireRemote } from 'helpers/remote'
import { getCompareViewWindow } from 'helpers/compare'
import { taskStatus } from 'constants/task'
import APPContext from 'store/index'
import IndexPage from 'pages/index'
import ComparePage from 'pages/compare'

const { setAPPData, getAPPData } = requireRemote('./helpers/storage')
const isWindows = navigator.userAgent.toLowerCase().indexOf('windows nt') !== -1

const defaultAppState = {
  isSticky: false,
  taskList: [],
  taskProgress: -1,
  taskAllFinished: false,
  showSettingsDropdown: false,
  showAbout: false,
  showPreferences: false
}

export default class extends React.PureComponent {

  state = {
    appState: defaultAppState,
    preferences: getAPPData('preferences')
  }

  setAppState = (changedAppState, callback) => {

    this.setState({
      appState: {
        ...this.state.appState,
        ...changedAppState
      }
    }, callback)

  }

  getAppState = (stateName) => {
    return stateName ? this.state.appState[stateName] : this.state.appState
  }

  setPreferences = (changedPreferences) => {

    const nextPreferences = { ...this.state.preferences, ...changedPreferences }

    this.setState({ preferences: nextPreferences }, () => {
      setAPPData('preferences', nextPreferences)
      if (changedPreferences.theme) {
        this.updateAppTheme()
      }
    })

  }

  updateProgress = () => {

    const currentTask = this.getAppState('taskList')
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

  updateAppTheme = () => {

    const { theme } = getAPPData('preferences')

    if (theme === 'auto') {
      if (remote.systemPreferences.isDarkMode()) {
        document.body.classList.remove('light-style')
      } else {
        document.body.classList.add('light-style')
      }
    } else if (theme === 'dark') {
      document.body.classList.remove('light-style')
    } else if (theme === 'light') {
      document.body.classList.add('light-style')
    }

    const compareViewWindow = getCompareViewWindow()
    compareViewWindow && compareViewWindow.webContents.send('user-change-app-theme', theme)

  }

  componentDidMount () {

    if (isWindows) {
      document.body.classList.add('system-windows')
    } else {
      this.updateAppTheme()
    }

    remote.systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      this.updateAppTheme
    )

    electron.ipcRenderer.on('user-change-app-theme', () => {
      this.updateAppTheme()
    })

    if (this.state.preferences.stickyOnLaunch) {
      remote.getCurrentWindow().setAlwaysOnTop(true)
      this.setAppState({ isSticky: true })
    }

  }

  render () {

    const { appState, preferences } = this.state
    const { setAppState, getAppState, setPreferences, updateProgress } = this

    return (
      <HashRouter>
        <APPContext.Provider value={{ appState, setAppState, getAppState, preferences, setPreferences, updateProgress }}>
          <div className="page-container">
            <Route path="/" exact component={IndexPage} />
            <Route path="/compare" exact component={ComparePage} />
          </div>
        </APPContext.Provider>
      </HashRouter>
    )

  }

}