import { useState, useCallback } from 'react';
import './index.css';
import type { LanderState, GameAttempt } from './types';
import StarsBackground from './components/StarsBackground';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import InstructionsPopup from './components/InstructionsPopup';
import GameScreen from './components/GameScreen';
import { useGameInput } from './hooks/useGameInput';
import { radToDeg } from './helpers';

type Screen = 'start' | 'playing' | 'landed' | 'crashed';
const HISTORY_KEY = 'lunarLanderHistory';
const MAX_HISTORY = 5;

// --- LocalStorage Helper Functions ---
const loadAttempts = (): GameAttempt[] => {
  try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
          const attempts = JSON.parse(stored) as GameAttempt[];
          // Basic validation (check if it's an array)
          return Array.isArray(attempts) ? attempts : [];
      }
  } catch (error) {
      console.error("Error loading game history:", error);
  }
  return [];
};

const saveAttempt = (newAttempt: GameAttempt): void => {
  try {
      const attempts = loadAttempts();
      // Add new attempt, sort newest first, keep only MAX_HISTORY
      const updatedAttempts = [newAttempt, ...attempts]
          .sort((a, b) => b.timestamp - a.timestamp) // Ensure sort just in case
          .slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedAttempts));
  } catch (error) {
      console.error("Error saving game attempt:", error);
  }
};
// ---

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [finalLanderState, setFinalLanderState] = useState<LanderState | null>(null);

  const { inputStateRef, handleButtonPress, handleButtonRelease } = useGameInput();

  // --- Screen Transition Handlers ---
  const handleStartGame = useCallback(() => {
    setCurrentScreen('playing');
    setShowInstructions(false);
  }, []);

  const handleGameOver = useCallback((status: 'landed' | 'crashed', finalLander: LanderState) => {
    setFinalLanderState(finalLander);
    setCurrentScreen(status);

    // Create and save the attempt data
    const now = Date.now();
    const attempt: GameAttempt = {
        id: now,
        timestamp: now,
        status: status,
        // Calculate final stats from the passed state (at impact)
        velocity: Math.sqrt(finalLander.velocityX ** 2 + finalLander.velocityY ** 2),
        angle: Math.abs(radToDeg(finalLander.angle)),
        fuel: Math.max(0, Math.floor(finalLander.fuel)),
    };
    saveAttempt(attempt);

  }, []);

  const handleRestartGame = useCallback(() => {
    setFinalLanderState(null);
    setCurrentScreen('playing');
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
        <GameScreen
          key={gameScreenKey}
          onGameOver={handleGameOver}
          inputStateRef={inputStateRef}
          handleButtonPress={handleButtonPress}
          handleButtonRelease={handleButtonRelease}
        />
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
