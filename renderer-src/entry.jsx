import 'assets/scss/_base.scss'
import React from 'react'
import remote from 'helpers/remote'
import { HashRouter, Route } from 'react-router-dom'
import { requireRemote } from 'helpers/remote'
import { taskStatus } from 'constants/task'
import APPContext from 'store/index'
import IndexPage from 'pages/index'

const { setAPPData, getAPPData } = requireRemote('./helpers/storage')
const isWindows = navigator.userAgent.toLowerCase().indexOf('windows nt') !== -1

const defaultAppState = {
  isSticky: false,
  taskList: [],
  taskProgress: -1,
  taskAllFinished: false,
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

    this.setState({ preferences: nextPreferences })
    setAPPData('preferences', nextPreferences)

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
    remote.getCurrentWindow().setProgressBar(taskProgress)

  }

  componentDidMount () {

    if (isWindows) {
      document.body.classList.add('system-windows')
    }

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
          </div>
        </APPContext.Provider>
      </HashRouter>
    )

  }

}