import React from 'react'
import './styles.scss'

export default React.memo(({ className = '', name, onChange, checked }) => {

  const handleChange = () => {
    onChange && onChange(!checked, name)
  }

  return (
    <div className={`component-switch ${className}`} data-name={name} onClick={handleChange} data-checked={checked} />
  )

})