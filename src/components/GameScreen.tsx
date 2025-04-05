import { useRef, useState, useCallback } from 'react';
import type { LanderState, Point, GameInputState } from '../types';
import { GameCanvas } from './GameCanvas';
import GameUI from './GameUI';
import AngleIndicator from './AngleIndicator';
import Controls from './Controls';

interface GameScreenProps {
  onGameOver: (status: 'landed' | 'crashed', finalLander: LanderState) => void;
}

/** Renders the active game view (Canvas, UI, Controls). */
export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  // Ref to hold current input state, passed to GameCanvas & Controls
  const inputStateRef = useRef<GameInputState>({
    left: false, right: false, thrust: false,
  });

  // State to hold data from GameCanvas needed for UI components
  const [uiState, setUiState] = useState<{ lander: LanderState | null; terrain: Point[] }>({
      lander: null,
      terrain: []
  });

  // Callback for GameCanvas to update the UI state
  const handleProvideStateForUI = useCallback((lander: LanderState, terrain: Point[]) => {
      setUiState({ lander, terrain });
  }, []); // setUiState is stable

  // Handlers for Controls to update the input ref
  const handleButtonPress = useCallback((action: keyof GameInputState) => {
    inputStateRef.current[action] = true;
  }, []);

  const handleButtonRelease = useCallback((action: keyof GameInputState) => {
    inputStateRef.current[action] = false;
  }, []);

  return (
    <>
      {/* Render UI only when lander state is available */}
      {uiState.lander && uiState.terrain.length > 0 && (
          <GameUI lander={uiState.lander} terrain={uiState.terrain} />
      )}
      {uiState.lander && <AngleIndicator angle={uiState.lander.angle} />}

      <GameCanvas
        inputStateRef={inputStateRef}
        onGameOver={onGameOver}
        provideStateForUI={handleProvideStateForUI}
      />

      <Controls onPress={handleButtonPress} onRelease={handleButtonRelease} />
    </>
  );
};

export default GameScreen;
