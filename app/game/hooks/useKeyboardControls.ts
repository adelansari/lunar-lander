import { useCallback, useState } from 'react';
import type { KeysState } from '../types/game';

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState<KeysState>({});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prevKeys => ({
      ...prevKeys,
      [e.key]: true
    }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prevKeys => ({
      ...prevKeys,
      [e.key]: false
    }));
  }, []);

  return { keys, handleKeyDown, handleKeyUp };
}; 