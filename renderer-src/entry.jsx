import 'assets/scss/_base.scss'
import React from 'react'
import remote, { electron } from 'helpers/remote'
import { HashRouter, Route } from 'react-router-dom'
import { requireRemote } from 'helpers/remote'
import { getCompareViewWindow } from 'helpers/compare'
import IndexPage from 'pages/index'
import ComparePage from 'pages/compare'

// const { getAPPData } = requireRemote('./helpers/storage')
const isWindows = navigator.userAgent.toLowerCase().indexOf('windows nt') !== -1

export default class extends React.PureComponent {

  updateAppTheme = () => {

    // const { theme } = getAPPData('preferences')
    const theme = 'dark'

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
  }

  render () {
    return (
      <HashRouter>
        <div className="page-container">
          <Route path="/" exact component={() => <IndexPage onUpdateAppTheme={this.updateAppTheme} />} />
          <Route path="/compare" exact component={ComparePage} />
        </div>
      </HashRouter>
    )
  }
}
