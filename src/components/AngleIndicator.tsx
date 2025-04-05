import React from 'react'

interface AngleIndicatorProps {
  angle: number
}

const AngleIndicator: React.FC<AngleIndicatorProps> = ({ angle }) => {
  const angleDegrees = Math.round(angle)
  const pointerPos = ((angleDegrees + 90) / 180) * 200
  let angleClass = 'angle-value'
  if (Math.abs(angleDegrees) < 5) {
    angleClass = 'angle-perfect'
  } else if (Math.abs(angleDegrees) < 10) {
    angleClass = 'angle-warning'
  } else if (Math.abs(angleDegrees) < 20) {
    angleClass = 'angle-danger'
  } else {
    angleClass = 'angle-danger'
  }
  return (
    <div className="angle-indicator">
      <div className="angle-meter">
        <div className="warning-zone"></div>
        <div className="safe-zone"></div>
        <div
          className="angle-pointer"
          style={{ transform: `translateX(${pointerPos}%) translateX(-50%)` }}
        ></div>
      </div>
      <div className="angle-status">
        <span>-90°</span>
        <span className={angleClass}>{angleDegrees}°</span>
        <span>+90°</span>
      </div>
    </div>
  )
}

export default AngleIndicator
