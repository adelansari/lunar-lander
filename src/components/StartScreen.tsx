import React from 'react'

interface StartScreenProps {
  onStart: () => void
  onShowInstructions: () => void
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowInstructions }) => {
  return (
    <div className="start-screen">
      <h1 className="title">LUNAR LANDER</h1>
      <p className="subtitle">
        Navigate your spacecraft to the moon's surface. Control your descent carefully to avoid crashing.
        Every thruster burst uses fuel - manage it wisely!
      </p>
      <button className="start-btn" onClick={onStart}>START MISSION</button>
      <button className="help-btn" onClick={onShowInstructions}>?</button>
    </div>
  )
}

export default StartScreen
