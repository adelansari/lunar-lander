import { useState } from 'react'
import Game from './components/Game'
import StartScreen from './components/StartScreen'
import Instructions from './components/Instructions'
import './index.css'

const App = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="game-container">
      {gameStarted ? (
        <Game onGameOver={() => setGameStarted(false)} />
      ) : (
        <StartScreen
          onStart={() => setGameStarted(true)}
          onShowInstructions={() => setShowInstructions(true)}
        />
      )}
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}
    </div>
  )
}

export default App
