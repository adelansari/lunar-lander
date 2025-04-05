import React from 'react'

interface InstructionsProps {
  onClose: () => void
}

const Instructions: React.FC<InstructionsProps> = ({ onClose }) => {
  return (
    <div className="instructions">
      <h2>Lunar Lander Instructions</h2>
      <p><strong>Objective:</strong> Land safely on the moon's surface at a speed below 5m/s.</p>
      <p><strong>Controls:</strong></p>
      <p>• Arrow Left/Right or A/D keys to rotate</p>
      <p>• Arrow Up or W key to fire thrusters</p>
      <p>Or use the touch controls on mobile</p>
      <p><strong>Landing Requirements:</strong></p>
      <p>• Velocity below 5m/s</p>
      <p>• Angle within ±10° (Upright position)</p>
      <p>• Land on the marked platform</p>
      <p><strong>Note:</strong> Each thruster burst uses fuel. When you run out, you have no control!</p>
      <button className="close-btn" onClick={onClose}>
        UNDERSTOOD
      </button>
    </div>
  )
}

export default Instructions
