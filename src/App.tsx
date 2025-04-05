import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import StartScreen from './components/StartScreen';
import { GlobalStyles } from './styles/global';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <>
      <GlobalStyles />
      {!gameStarted ? (
        <StartScreen onStart={() => setGameStarted(true)} />
      ) : (
        <>
          <GameCanvas />
          <GameUI lander={/* pass lander state */} />
        </>
      )}
    </>
  );
};

export default App;