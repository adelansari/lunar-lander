import { useState } from 'react';
import { GlobalStyles } from './styles/global';
import GameCanvas from './components/GameCanvas';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import { GameStatus } from './game/types';

const App = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('start');

  return (
    <>
      <GlobalStyles />
      {gameStatus === 'start' && (
        <StartScreen onStart={() => setGameStatus('playing')} />
      )}
      
      {gameStatus === 'playing' && (
        <GameCanvas setGameStatus={setGameStatus} />
      )}
      
      {(gameStatus === 'crashed' || gameStatus === 'landed') && (
        <EndScreen 
          status={gameStatus}
          onRestart={() => setGameStatus('playing')}
        />
      )}
    </>
  );
};

export default App;