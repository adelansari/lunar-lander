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
      
      // Match original HTML implementation exactly: normalize to ~16ms frames
      onUpdate(delta / 16);
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    console.log("Starting game loop");
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        console.log("Stopping game loop");
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled, onUpdate]);
}; 