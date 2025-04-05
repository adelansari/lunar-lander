import { useState } from 'react'
import Game from './components/Game'
import GameUI from './components/GameUI'
import StartScreen from './components/StartScreen'
import './index.css'

const App = () => {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="game-container">
      {gameStarted && (
        <>
          <Game />
          <GameUI />
        </>
      )}
      {!gameStarted && <StartScreen onStart={() => setGameStarted(true)} />}
    </div>
  )
}

export default App
