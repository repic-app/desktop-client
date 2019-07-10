import React from 'react'
import './styles.scss'

export default class extends React.PureComponent {

  state = {}

  componentDidMount () {
    const inputInitialValues = {}

    this.props.plugin.options.forEach(item => {
      item.type === 'input' && item.value && (inputInitialValues[`input-${item.name}`] = item.value)
    })
    this.setState(inputInitialValues)
  }

  handleInput = (event) => {
    const { name, value } = event.target
    this.setState({ [`input-${name}`]: value })
  }

  handleConfirmInput = (event) => {
    const { name } = event.currentTarget
    const value = this.state[`input-${name}`]
    this.props.onChange({
      name: this.props.plugin.name,
      optionName: name,
      optionValue: value
    })
  }

  renderOptionField = (optionItem) => {

    switch (optionItem.type) {
    case 'input':
      return (
        <div className="field input-group">
          <input {...optionItem.props} type="text" name={optionItem.name} value={this.state[`input-${optionItem.name}`] || ''} onChange={this.handleInput} />
          <button name={optionItem.name} onClick={this.handleConfirmInput} className="button button-sm button-default">确定</button>
        </div>
      )
    default:
      return null
    }

  }
 
  render () {

    const { title, options } = this.props.plugin

    return (
      <div className="component-plugin-options">
        <div className="header">{title}参数设置</div>
        <div className="content">
          <ul className="options">
            {options.map((item) => (
              <li key={item.name}>
                <label className="label">{item.label}</label>
                {this.renderOptionField(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )

  }

}