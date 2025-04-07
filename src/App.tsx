import { useState, useCallback, useEffect } from 'react';
import './index.css';
import type { LanderState } from './types';
import StarsBackground from './components/StarsBackground';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import InstructionsPopup from './components/InstructionsPopup';
import GameScreen from './components/GameScreen';
import { useGameInput } from './hooks/useGameInput'; // Hook for setting up global input listeners

type Screen = 'start' | 'playing' | 'landed' | 'crashed';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [finalLanderState, setFinalLanderState] = useState<LanderState | null>(null);

  // Initialize global input listeners (prevents default browser actions)
  useGameInput();

  // --- Screen Transition Handlers ---
  const handleStartGame = useCallback(() => {
    setCurrentScreen('playing');
    setShowInstructions(false);
  }, []);

  const handleGameOver = useCallback((status: 'landed' | 'crashed', finalLander: LanderState) => {
    setFinalLanderState(finalLander);
    setCurrentScreen(status);
  }, []);

  const handleRestartGame = useCallback(() => {
    setFinalLanderState(null);
    setCurrentScreen('playing'); // GameScreen will remount due to key change
  }, []);

  // --- Instructions Popup Handlers ---
  const handleShowHelp = useCallback(() => { setShowInstructions(true); }, []);
  const handleCloseHelp = useCallback(() => { setShowInstructions(false); }, []);

  // Generate a unique key for GameScreen to force remount on restart
  const gameScreenKey = currentScreen === 'playing' ? `game-${Date.now()}` : 'game-screen';

  return (
    <div className="game-container">
      <StarsBackground />

      {/* Conditional Screen Rendering */}
      {currentScreen === 'start' && (
        <StartScreen onStart={handleStartGame} onShowHelp={handleShowHelp} />
      )}

      {currentScreen === 'playing' && (
        <GameScreen key={gameScreenKey} onGameOver={handleGameOver} />
      )}

      {(currentScreen === 'landed' || currentScreen === 'crashed') && finalLanderState && (
        <EndScreen
          status={currentScreen}
          lander={finalLanderState}
          onRestart={handleRestartGame}
        />
      )}

      {/* Instructions Popup */}
      {showInstructions && <InstructionsPopup onClose={handleCloseHelp} />}
    </div>
  );
}

export default App;
