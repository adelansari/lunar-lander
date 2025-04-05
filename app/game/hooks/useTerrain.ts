import { useCallback, useState, useEffect, useRef } from 'react';
import type { TerrainPoint, LandingZone } from '../types/game';

export const useTerrain = () => {
  // Server-side rendering check
  const [isClient, setIsClient] = useState(false);
  const terrainGenerated = useRef(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [terrain, setTerrain] = useState<TerrainPoint[]>([]);
  const [landingZone, setLandingZone] = useState<LandingZone>({
    x: 0,
    y: 0,
    width: 80
  });

  const generateTerrain = useCallback((terrainWidth: number) => {
    if (!isClient) return;
    
    // Only generate terrain once unless explicitly regenerated
    if (terrainGenerated.current && terrain.length > 0) return;
    
    const segments = 20;
    const segmentWidth = terrainWidth / segments;
    const newTerrain: TerrainPoint[] = [];
    
    // Get canvas height approximation
    const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
    let prevHeight = canvasHeight * 0.7;
    
    // Generate random terrain height at each segment
    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth;
      
      // Add some randomness but smooth transitions
      let height;
      if (i === 0 || i === segments) {
        height = prevHeight;
      } else {
        const maxChange = canvasHeight * 0.1;
        height = prevHeight + (Math.random() * maxChange * 2 - maxChange);
        height = Math.max(canvasHeight * 0.5, Math.min(canvasHeight * 0.9, height));
      }
      
      newTerrain.push({ x, y: height });
      prevHeight = height;
    }
    
    // Choose a random flat area for landing zone
    const landingSegment = Math.floor(segments/2) + Math.floor(Math.random() * (segments/3));
    const newLandingZone = {
      x: newTerrain[landingSegment].x,
      y: newTerrain[landingSegment].y - 5, // Slightly above terrain
      width: 100
    };
    
    // Flatten a few segments around landing zone
    for (let i = landingSegment - 2; i <= landingSegment + 2; i++) {
      if (i >= 0 && i < newTerrain.length) {
        newTerrain[i].y = newLandingZone.y + 5;
      }
    }
    
    setTerrain(newTerrain);
    setLandingZone(newLandingZone);
    terrainGenerated.current = true;
  }, [isClient, terrain.length]);

  // Function to force regeneration of terrain
  const regenerateTerrain = useCallback((terrainWidth: number) => {
    if (!isClient) return;
    
    terrainGenerated.current = false;
    generateTerrain(terrainWidth);
  }, [isClient, generateTerrain]);

  return { terrain, landingZone, generateTerrain, regenerateTerrain };
}; 