import { useState, useCallback } from "react";
import "./index.css";
import type { LanderState, GameAttempt, BestTime } from "./types";
import StarsBackground from "./components/StarsBackground";
import StartScreen from "./components/StartScreen";
import EndScreen from "./components/EndScreen";
import InstructionsPopup from "./components/InstructionsPopup";
import GameScreen from "./components/GameScreen";
import { useGameInput } from "./hooks/useGameInput";
import { radToDeg } from "./helpers";

type Screen = "start" | "playing" | "landed" | "crashed";
const HISTORY_KEY = "lunarLanderHistory";
const BEST_TIMES_KEY = "lunarLanderBestTimes";
const MAX_HISTORY = 5;
const MAX_BEST_TIMES = 3; // Store top 3 best times

// --- LocalStorage Helper Functions ---
const loadAttempts = (): GameAttempt[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const attempts = JSON.parse(stored) as GameAttempt[];
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
    const updatedAttempts = [newAttempt, ...attempts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedAttempts));
  } catch (error) {
    console.error("Error saving game attempt:", error);
  }
};

// NEW: Helpers for Best Times
const loadBestTimes = (): BestTime[] => {
  try {
    const stored = localStorage.getItem(BEST_TIMES_KEY);
    if (stored) {
      const times = JSON.parse(stored) as BestTime[];
      return Array.isArray(times) ? times : [];
    }
  } catch (error) {
    console.error("Error loading best times:", error);
  }
  return [];
};

const saveBestTime = (timeMs: number): void => {
  try {
    const times = loadBestTimes();
    const newBestTime: BestTime = { timestamp: Date.now(), time: timeMs };
    // Add new time, sort fastest first, keep only MAX_BEST_TIMES
    const updatedTimes = [...times, newBestTime]
      .sort((a, b) => a.time - b.time) // Sort ascending by time
      .slice(0, MAX_BEST_TIMES);
    localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(updatedTimes));
  } catch (error) {
    console.error("Error saving best time:", error);
  }
};
// ---

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("start");
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [finalLanderState, setFinalLanderState] = useState<LanderState | null>(
    null
  );

  const { inputStateRef, handleButtonPress, handleButtonRelease } =
    useGameInput();

  // --- Screen Transition Handlers ---
  const handleStartGame = useCallback(() => {
    setCurrentScreen("playing");
    setShowInstructions(false);
  }, []);

  const handleGameOver = useCallback(
    (
      status: "landed" | "crashed",
      finalLander: LanderState,
      elapsedTime?: number
    ) => {
      setFinalLanderState(finalLander);
      setCurrentScreen(status);
      const now = Date.now();

      // Save general attempt history
      const attempt: GameAttempt = {
        id: now,
        timestamp: now,
        status: status,
        velocity: Math.sqrt(
          finalLander.velocityX ** 2 + finalLander.velocityY ** 2
        ),
        angle: Math.abs(radToDeg(finalLander.angle)),
        fuel: Math.max(0, Math.floor(finalLander.fuel)),
      };
      saveAttempt(attempt);

      // Save best time only if landed successfully and time is provided
      if (status === "landed" && elapsedTime !== undefined) {
        saveBestTime(elapsedTime);
      }
    },
    []
  );

  const handleRestartGame = useCallback(() => {
    setFinalLanderState(null);
    setCurrentScreen("playing");
  }, []);

  // --- Instructions Popup Handlers ---
  const handleShowHelp = useCallback(() => {
    setShowInstructions(true);
  }, []);
  const handleCloseHelp = useCallback(() => {
    setShowInstructions(false);
  }, []);

  // Generate a unique key for GameScreen to force remount on restart
  const gameScreenKey =
    currentScreen === "playing" ? `game-${Date.now()}` : "game-screen";

  return (
    <div className="game-container">
      <StarsBackground />

      {/* Conditional Screen Rendering */}
      {currentScreen === "start" && (
        <StartScreen onStart={handleStartGame} onShowHelp={handleShowHelp} />
      )}

      {currentScreen === "playing" && (
        <GameScreen
          key={gameScreenKey}
          onGameOver={handleGameOver}
          inputStateRef={inputStateRef}
          handleButtonPress={handleButtonPress}
          handleButtonRelease={handleButtonRelease}
        />
      )}

      {(currentScreen === "landed" || currentScreen === "crashed") &&
        finalLanderState && (
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
