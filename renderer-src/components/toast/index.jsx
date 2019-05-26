import React from 'react'
import ReactDOM from 'react-dom'
import './styles.scss'

let toastQueueHostNode = null

const toastIcons = {
  'info': 'icon-alert-circle',
  'success': 'icon-check-circle',
  'error': 'icon-x-circle',
  'warning': 'icon-alert-triangle'
}

const getToastContent = (type, text) => {

  return (
    <div className="text-with-icon">
      <i className={toastIcons[type]}></i>
      <span>{text}</span>
    </div>
  )

}

class Toast extends React.PureComponent {

  state = { visible: false }

  componentDidMount () {
    setTimeout(() => this.setState({ visible: true }), 0)
    this.props.autoHide && setTimeout(() => this.setState({ visible: false }), this.props.autoHide)
  }

  handleTransitionEnd = () => {
    !this.state.visible && this.props.onDestory && this.props.onDestory()
  }

  render () {

    return (
      <div className={`component-toast ${this.props.className} ${this.state.visible ? 'visible' : ''}`}>
        {this.props.withMask ? <div className="toast-mask"></div> : null}
        <div onTransitionEnd={this.handleTransitionEnd} className="toast-content"><span className="toast-text">{this.props.text}</span></div>
      </div>
    )

  }

}

Toast.defaultProps = {
  className: '',
  autoHide: 0,
  text: '',
  withMask: false
}

Toast.info = (text, autoHide, withMask = false) => showToast({ text: getToastContent('info', text), autoHide, withMask, className: 'info' })
Toast.success = (text, autoHide, withMask = false) => showToast({ text: getToastContent('success', text), autoHide, withMask, className: 'success' })
Toast.error = (text, autoHide, withMask = false) => showToast({ text: getToastContent('error', text), autoHide, withMask, className: 'error' })
Toast.warning = (text, autoHide, withMask = false) => showToast({ text: getToastContent('warning', text), autoHide, withMask, className: 'warning' })

export const showToast = ({ onDestory, autoHide, ...props }) => {

  if (!toastQueueHostNode) {
    toastQueueHostNode = document.createElement('div')
    toastQueueHostNode.className = 'component-toast-queue-container'
    document.body.appendChild(toastQueueHostNode)
  }

  const toastHostNode = document.createElement('div')

  toastHostNode.className = 'component-toast-container'
  toastQueueHostNode.appendChild(toastHostNode)

  const destoryToast = () => {
    onDestory && onDestory()
    ReactDOM.unmountComponentAtNode(toastHostNode)
    toastQueueHostNode.removeChild(toastHostNode)
  }

  autoHide = typeof autoHide === 'undefined' ? 3000 : autoHide
  ReactDOM.render(<Toast onDestory={destoryToast} autoHide={autoHide} {...props}/>, toastHostNode)

}

export default Toast