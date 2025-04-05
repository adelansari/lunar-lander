import React from 'react'

interface GameUIProps {
  altitude: number
  velocity: number
  fuel: number
}

const GameUI: React.FC<GameUIProps> = ({ altitude, velocity, fuel }) => {
  return (
    <div className="game-ui">
      <div className="ui-panel">
        <div className="ui-title">ALTITUDE</div>
        <div className="ui-value">{altitude}m</div>
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
    </div>
  )
}

export default GameUI
