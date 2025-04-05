import { useCallback, useState, useRef } from 'react';
import type { KeysState } from '../types/game';

export const useKeyboardControls = () => {
  // Use a ref for keys to prevent re-renders during rapid key presses
  const keysRef = useRef<KeysState>({});
  // State for components that need to respond to key changes
  const [keys, setKeys] = useState<KeysState>({});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Use both ref and state for different purposes
    keysRef.current = { ...keysRef.current, [e.key]: true };
    setKeys(keysRef.current);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    // Use both ref and state for different purposes
    keysRef.current = { ...keysRef.current, [e.key]: false };
    setKeys(keysRef.current);
  }, []);

  // Function to directly modify keys (for touch controls)
  const setKey = useCallback((key: string, value: boolean) => {
    keysRef.current = { ...keysRef.current, [key]: value };
    setKeys(keysRef.current);
  }, []);

  return { keys: keysRef.current, setKey, handleKeyDown, handleKeyUp };
}; 