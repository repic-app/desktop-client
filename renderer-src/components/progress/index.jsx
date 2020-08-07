import React from 'react'
import './styles.scss'

export default React.memo((props) => {
  const radius = 22
  const circlePerimeter = 2 * 3.141592654 * radius
  const dasharray = circlePerimeter * props.progress + ' ' + circlePerimeter

  return (
    <svg className="component-progress-circle">
      <circle className="circle" cx={radius + 1} cy={radius + 1} r={radius} strokeWidth="1" />
      <circle
        className="played"
        cx={radius + 1}
        cy={radius + 1}
        r={radius}
        strokeWidth="1"
        strokeDasharray={dasharray}
      />
    </svg>
  )
})
