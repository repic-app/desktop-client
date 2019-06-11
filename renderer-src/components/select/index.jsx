import React from 'react'
import './styles.scss'

const Select = (props) => {

  const {
    size,
    className,
    value,
    onChange,
    children,
    ...restProps
  } = props

  const handleChange = (event) => {
    onChange && onChange(event.target.value, props.name, event)
  }

  return (
    <div className={`component-select size-${size} ${className}`}>
      <select className="b-box" value={value} onChange={handleChange} {...restProps}>
        {children}
      </select>
      <i className="icon mdi mdi-menu-down"></i>
    </div>
  )

}

Select.defaultProps = {
  size: 'small',
  className: ''
}

export default React.memo(Select)