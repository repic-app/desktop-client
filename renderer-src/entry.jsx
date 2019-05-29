import 'assets/scss/_base.scss'
import React from 'react'
import { HashRouter, Route } from 'react-router-dom'
import { requireRemote } from 'helpers/remote'
import APPContext from 'store/index'
import IndexPage from 'pages/index'

const { setAPPData, getAPPData } = requireRemote('./helpers/storage')
const isWindows = navigator.userAgent.toLowerCase().indexOf('windows nt') !== -1

const defaultAppState = {
  isSticky: false,
  taskList: [],
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

  componentDidMount () {
    isWindows && document.body.classList.add('system-windows')
  }

  render () {

    const { appState, preferences } = this.state
    const { setAppState, getAppState, setPreferences } = this

    return (
      <HashRouter>
        <APPContext.Provider value={{ appState, setAppState, getAppState, preferences, setPreferences }}>
          <div className="page-container">
            <Route path="/" exact component={IndexPage} />
          </div>
        </APPContext.Provider>
      </HashRouter>
    )

  }

}