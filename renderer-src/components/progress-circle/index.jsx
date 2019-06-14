import React from 'react'
import './styles.scss'

const sizeRadius = {
  'tiny': 14,
  'small': 23,
  'medium': 29,
  'large': 99
}

export default ({ className, size, strokeWidth = 1, progress }) => {

  const radius = sizeRadius[size] || size
  const circlePerimeter = 2 * 3.141592654 * radius
  const dasharray = circlePerimeter * progress + ' ' + circlePerimeter

  return (
    <svg className={`component-progress-circle ${className}`}>
      <circle className="circle" style={{ strokeWidth }} cx={radius + strokeWidth / 2} cy={radius + strokeWidth / 2} r={radius} strokeWidth="1"></circle>
      <circle className="played" style={{ strokeWidth }} cx={radius + strokeWidth / 2} cy={radius + strokeWidth / 2} r={radius} strokeWidth="1" strokeDasharray={dasharray}></circle>
    </svg>
  )

}