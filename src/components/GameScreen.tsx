import { useState, useCallback } from 'react';
import type { LanderState, Point, GameInputState } from '../types';
import { GameCanvas } from './GameCanvas';
import GameUI from './GameUI';
import AngleIndicator from './AngleIndicator';
import Controls from './Controls';

interface GameScreenProps {
  onGameOver: (status: 'landed' | 'crashed', finalLander: LanderState) => void;
  inputStateRef: React.RefObject<GameInputState>;
  handleButtonPress: (action: keyof GameInputState) => void;
  handleButtonRelease: (action: keyof GameInputState) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
    onGameOver,
    inputStateRef,
    handleButtonPress,
    handleButtonRelease
}) => {
  const [uiState, setUiState] = useState<{ lander: LanderState | null; terrain: Point[] }>({
      lander: null,
      terrain: []
  });

  const handleProvideStateForUI = useCallback((lander: LanderState, terrain: Point[]) => {
      setUiState({ lander, terrain });
  }, []);

  return (
    <>
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
