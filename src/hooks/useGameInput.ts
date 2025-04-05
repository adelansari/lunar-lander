import { useEffect, useCallback, useRef } from 'react';
import type { GameInputState } from '../types';
import { INPUT_MAP, KeyInput } from '../constants';

interface UseGameInputReturn {
    inputStateRef: React.RefObject<GameInputState>;
    handleButtonPress: (action: keyof GameInputState) => void;
    handleButtonRelease: (action: keyof GameInputState) => void;
}

/** Manages keyboard/touch input state via a ref and returns handlers. */
export function useGameInput(): UseGameInputReturn {
  // Ref stores current input state without causing re-renders
  const inputStateRef = useRef<GameInputState>({
    left: false,
    right: false,
    thrust: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return; // Ignore browser key repeat
    const action = INPUT_MAP[e.key as KeyInput];
    if (action) {
      inputStateRef.current[action] = true;
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const action = INPUT_MAP[e.key as KeyInput];
    if (action) {
      inputStateRef.current[action] = false;
      e.preventDefault();
    }
  }, []);

  // Handlers for on-screen buttons to modify the ref state
  const handleButtonPress = useCallback((action: keyof GameInputState) => {
      inputStateRef.current[action] = true;
  }, []);

  const handleButtonRelease = useCallback((action: keyof GameInputState) => {
      inputStateRef.current[action] = false;
  }, []);

  // Effect to add/remove global event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Prevent default touch actions (scrolling, zooming) in the game area
    const preventDefaultTouch = (e: TouchEvent | Event) => {
        if (e.type.startsWith('touch')) {
             e.preventDefault();
        }
    };
    // Use passive: false to ensure preventDefault works reliably
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    document.addEventListener('touchend', preventDefaultTouch, { passive: false });
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu); // Prevent long-press menu

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('touchmove', preventDefaultTouch);
      document.removeEventListener('touchend', preventDefaultTouch);
      document.removeEventListener('contextmenu', preventContextMenu);
      // Reset ref state on cleanup
      inputStateRef.current = { left: false, right: false, thrust: false };
    };
  }, [handleKeyDown, handleKeyUp]); // Rerun effect if handlers change identity

  return { inputStateRef, handleButtonPress, handleButtonRelease };
}
