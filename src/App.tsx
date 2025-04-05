import { useState } from 'react'
import GameCanvas from './components/GameCanvas'
import GameUI from './components/GameUI'
import AngleIndicator from './components/AngleIndicator'
import StartScreen from './components/StartScreen'
import EndScreen from './components/EndScreen'
import Instructions from './components/Instructions'
import './index.css'

export interface GameStats {
  altitude: number
  velocity: number
  fuel: number
  angle: number
}

const App = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    altitude: 1000,
    velocity: 0,
    fuel: 100,
    angle: 0,
  })
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const handleGameOver = (message: string) => {
    setGameOverMessage(message)
    setGameStarted(false)
  }

  const handleRestart = () => {
    setGameOverMessage('')
    setGameStarted(true)
  }

  return (
    <div className="game-container">
      {gameStarted && (
        <>
          <GameCanvas onUpdateStats={setGameStats} onGameOver={handleGameOver} />
          <GameUI 
            altitude={gameStats.altitude} 
            velocity={gameStats.velocity} 
            fuel={gameStats.fuel} 
          />
          <AngleIndicator angle={gameStats.angle} />
        </>
      )}
      {!gameStarted && !gameOverMessage && (
        <StartScreen 
          onStart={() => setGameStarted(true)} 
          onShowInstructions={() => setShowInstructions(true)} 
        />
      )}
      {gameOverMessage && <EndScreen message={gameOverMessage} onRestart={handleRestart} />}
      {showInstructions && <Instructions onClose={() => setShowInstructions(false)} />}
    </div>
  )
}

export default App
