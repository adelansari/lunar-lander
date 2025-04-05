import React from 'react'

interface EndScreenProps {
  message: string
  onRestart: () => void
}

const EndScreen: React.FC<EndScreenProps> = ({ message, onRestart }) => {
  return (
    <div className="end-screen">
      <h2 className="end-message">{message}</h2>
      <button className="start-btn" onClick={onRestart}>
        TRY AGAIN
      </button>
    </div>
  )
}

export default EndScreen
