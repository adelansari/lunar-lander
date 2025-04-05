import { useEffect, useRef } from 'react';
import type { GameLoopOptions } from '../types/game';

export const useGameLoop = ({ enabled, onUpdate }: GameLoopOptions): void => {
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Normalize delta to ~16ms frames
      onUpdate(delta / 16);
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, onUpdate]);
}; 