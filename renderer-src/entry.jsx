import 'assets/scss/_base.scss'
import React from 'react'
import remote, { electron } from 'helpers/remote'
import { HashRouter, Route } from 'react-router-dom'
import { requireRemote } from 'helpers/remote'
import { getCompareViewWindow } from 'helpers/compare'
import IndexPage from 'pages/index'
import ComparePage from 'pages/compare'

const { getAPPData } = requireRemote('./helpers/storage')
const isWindows = navigator.userAgent.toLowerCase().indexOf('windows nt') !== -1

if (isWindows) {
  document.body.classList.add('system-windows')
}

const updateAppTheme = () => {
  const { theme } = getAPPData('preferences')
  const compareViewWindow = getCompareViewWindow()

  if (theme === 'auto' && remote.systemPreferences && remote.systemPreferences.isDarkMode) {
    if (remote.systemPreferences.isDarkMode()) {
      document.body.dataset.theme = 'dark'
    } else {
      document.body.dataset.theme = 'light'
    }
  } else if (theme === 'dark') {
    document.body.dataset.theme = 'dark'
  } else {
    document.body.dataset.theme = 'light'
  }

  compareViewWindow && compareViewWindow.webContents.send('user-change-app-theme', theme)
}

updateAppTheme()

export default class extends React.PureComponent {
  componentDidMount() {
    if (remote.systemPreferences && remote.systemPreferences.subscribeNotification) {
      remote.systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        updateAppTheme
      )
    }

    remote.getCurrentWindow().setSheetOffset(39)
    electron.ipcRenderer.on('user-change-app-theme', updateAppTheme)
  }

  render() {
    return (
      <HashRouter>
        <Route path="/" exact component={() => <IndexPage onUpdateAppTheme={updateAppTheme} />} />
        <Route path="/compare" exact component={ComparePage} />
      </HashRouter>
    )
  }
}
