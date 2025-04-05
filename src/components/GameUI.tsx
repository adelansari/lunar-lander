import React from 'react'

interface GameUIProps {
  altitude?: number
  velocity?: number
  fuel?: number
  angle?: number
}

const GameUI: React.FC<GameUIProps> = ({
  altitude = 1000,
  velocity = 0,
  fuel = 100,
  angle = 0,
}) => {
  return (
    <div className="game-ui">
      <div className="ui-panel">
        <div className="ui-title">ALTITUDE</div>
        <div className="ui-value">{Math.floor(altitude)}m</div>
      </div>
      <div className="ui-panel">
        <div className="ui-title">VELOCITY</div>
        <div className="ui-value">{velocity.toFixed(1)}m/s</div>
      </div>
      <div className="ui-panel">
        <div className="ui-title">FUEL</div>
        <div className="ui-value">{Math.floor(fuel)}%</div>
        <div className="fuel-bar" style={{ width: `${fuel}%` }}></div>
      </div>
      <div className="angle-indicator">
        <div className="angle-meter">
          <div className="warning-zone"></div>
          <div className="safe-zone"></div>
          <div
            className="angle-pointer"
            style={{ transform: `translateX(${((angle + 90) / 180) * 200}%) translateX(-50%)` }}
          ></div>
        </div>
        <div className="angle-status">
          <span>-90°</span>
          <span className="angle-value">{angle}°</span>
          <span>+90°</span>
        </div>
      </div>
    </div>
  )
}

export default GameUI
