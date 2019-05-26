import React from 'react'
import './styles.scss'

const Input = (props) => {

  const {
    label,
    animatedLabel,
    clearable,
    tipText,
    size,
    className,
    required,
    value,
    onChange,
    placeholder,
    ...restProps
  } = props

  const clearValue = () => {
    onChange && onChange('', props.name)
  }

  const handleChange = (event) => {
    onChange && onChange(event.target.value, props.name, event)
  }

  return (
    <div className={`component-input size-${size} ${className} ${animatedLabel ? 'with-animated-label' : 'with-normal-label'}`}>
      <input className="b-box" placeholder={placeholder} value={value} onChange={handleChange} {...restProps}/>
      <label>{required && <span className="text-danger">* </span>}{label}</label>
      {clearable ? (
        <span onClick={clearValue} className="button-clear-input"><i className="icon-x"></i></span>
      ) : null}
      {tipText ? (
        <span className="tip-text">{tipText}</span>
      ) : null}
    </div>
  )

}

Input.defaultProps = {
  size: 'medium',
  className: '',
  placeholder: ' ',
  required: false
}

export default React.memo(Input)