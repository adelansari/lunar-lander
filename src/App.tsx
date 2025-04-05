import { useState, useCallback, useEffect } from 'react';
import './index.css';
import type { LanderState } from './types';
import StarsBackground from './components/StarsBackground';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import InstructionsPopup from './components/InstructionsPopup';
import GameScreen from './components/GameScreen'; // Import the new GameScreen
// Import useGameInput hook to set up global listeners
import { useGameInput } from './hooks/useGameInput';

type Screen = 'start' | 'playing' | 'landed' | 'crashed';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [finalLanderState, setFinalLanderState] = useState<LanderState | null>(null);

  // Initialize global input listeners from the hook.
  // We don't need the returned values here in App, just the effect setup.
  useGameInput();

  // Function to start the game
  const handleStartGame = useCallback(() => {
    setCurrentScreen('playing');
    setShowInstructions(false);
  }, []);

  // Function called when game ends (landed or crashed)
  const handleGameOver = useCallback((status: 'landed' | 'crashed', finalLander: LanderState) => {
    setFinalLanderState(finalLander); // Store final state for EndScreen
    setCurrentScreen(status); // Update screen state
  }, []);

  // Function to restart the game
  const handleRestartGame = useCallback(() => {
    setFinalLanderState(null); // Clear previous final state
    setCurrentScreen('playing'); // Switch back to playing screen
  }, []);

  // Functions for instruction popup visibility
  const handleShowHelp = useCallback(() => { setShowInstructions(true); }, []);
  const handleCloseHelp = useCallback(() => { setShowInstructions(false); }, []);

  // Generate a unique key for GameScreen only when switching to 'playing'
  // This forces a remount and reset of the GameScreen and GameCanvas state
  const gameScreenKey = currentScreen === 'playing' ? `game-${Date.now()}` : 'game-screen';

  return (
    <div className="game-container">
      {/* Render stars background always */}
      <StarsBackground />

      {/* Conditionally render screen components */}
      {currentScreen === 'start' && (
        <StartScreen onStart={handleStartGame} onShowHelp={handleShowHelp} />
      )}

      {currentScreen === 'playing' && (
        // Use the key prop to ensure GameScreen remounts on restart
        <GameScreen key={gameScreenKey} onGameOver={handleGameOver} />
      )}

      {/* Show EndScreen only if landed/crashed and final state exists */}
      {(currentScreen === 'landed' || currentScreen === 'crashed') && finalLanderState && (
        <EndScreen
          status={currentScreen}
          lander={finalLanderState}
          onRestart={handleRestartGame}
        />
      )}

      {/* Show Instructions Popup if state is true */}
      {showInstructions && <InstructionsPopup onClose={handleCloseHelp} />}
    </div>
  );
}

export default App;
