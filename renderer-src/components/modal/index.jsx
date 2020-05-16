import './styles.scss'
import React from 'react'
import ReactDOM from 'react-dom'

class Modal extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = { visible: false }
    this.hostNode = document.createElement('div')
  }

  componentDidMount() {
    document.body.appendChild(this.hostNode)

    if (this.props.active) {
      setTimeout(() => {
        this.setState({ visible: true })
      }, 10)
    }
  }

  componentWillUnmount() {
    document.body.removeChild(this.hostNode)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      setTimeout(() => {
        this.setState({ visible: true })
      }, 0)
    }
  }

  close = () => {
    this.setState({ visible: false })
  }

  handleMaskClick = () => {
    this.props.closeOnBlur &&this.handleClose(this.props.onWillClose && this.props.onWillClose('mask-close'))
  }

  externalRequestClose = () => {
    this.handleClose(this.props.onWillClose && this.props.onWillClose('external-close'))
  }

  handleCloseButtonClick = () => {
    this.handleClose(this.props.onWillClose && this.props.onWillClose('button-close'))
  }

  hanleCancelButtonClick = () => {
    this.handleClose(this.props.onCancel && this.props.onCancel('button-cancel'))
  }

  hanleConfirmButtonClick = () => {
    this.handleClose(this.props.onConfirm && this.props.onConfirm('button-confirm'))
  }

  handleClose = (expression) => {
    if (expression !== false) {
      this.close()
    }
  }

  handleTransitionEnd = () => {
    if (!this.state.visible) {
      this.props.onClose && this.props.onClose()
    } else {
      this.props.onOpen && this.props.onOpen()
    }
  }

  render() {
    if (!this.props.active) {
      return null
    }

    const { width, height, footerAddon } = this.props

    return ReactDOM.createPortal(
      <div
        className={`component-modal ${this.props.className} ${
          this.state.visible ? 'visible' : ''
        }`}>
        <div className="modal-mask" onClick={this.handleMaskClick}></div>
        <div
          className="modal-content"
          onTransitionEnd={this.handleTransitionEnd}
          style={{ width, height }}>
          {this.props.title ? (
            <header className="header">
              <h5 className="caption">{this.props.title}</h5>
              {this.props.showClose ? (
                <button onClick={this.handleCloseButtonClick} className="button-close">
                  {this.props.closeText}
                </button>
              ) : null}
            </header>
          ) : null}
          <div className="body">{this.props.children}</div>
          {this.props.showFooter ? (
            <footer className="footer">
              <div className="left-content">{footerAddon}</div>
              <div className="buttons">
                {this.props.showConfirm ? (
                  <button
                    onClick={this.hanleConfirmButtonClick}
                    className="button button-md button-primary button-confirm">
                    {this.props.confirmText}
                  </button>
                ) : null}
                {this.props.showCancel ? (
                  <button
                    onClick={this.hanleCancelButtonClick}
                    className="button button-md button-default button-cancel">
                    {this.props.cancelText}
                  </button>
                ) : null}
              </div>
            </footer>
          ) : null}
        </div>
      </div>,
      this.hostNode
    )
  }
}

Modal.defaultProps = {
  className: '',
  width: 'auto',
  height: 'auto',
  title: null,
  active: false,
  showCancel: true,
  showConfirm: true,
  showClose: false,
  showFooter: true,
  closeText: <i className="icon-x"></i>,
  cancelText: '取消',
  confirmText: '确认',
  footerAddon: null,
  closeOnBlur: false,
}

export const showModal = ({ onClose, ...props }) => {
  const hostNode = document.createElement('div')
  document.body.appendChild(hostNode)

  const handleClose = source => {
    const result = onClose ? onClose(source) : true

    if (result !== false) {
      ReactDOM.unmountComponentAtNode(hostNode)
      document.body.removeChild(hostNode)
    }

    return result
  }

  ReactDOM.render(<Modal onClose={handleClose} {...props} active={true} />, hostNode)
}

export const confirm = props => {
  return showModal({
    width: 400,
    showClose: false,
    ...props,
    className: 'confirm-modal',
    children: <div className="modal-confirm-content">{props.content}</div>,
  })
}

export const alert = props => {
  return showModal({
    width: 400,
    showClose: false,
    ...props,
    className: 'alert-modal',
    showCancel: false,
    children: <div className="modal-alert-content">{props.content}</div>,
  })
}

export default Modal
