import { useState, useCallback } from 'react';
import type { LanderState, Point, LandingZone, GameStatus, GameInputState } from '../types';
import {
    INITIAL_LANDER_STATE, GRAVITY, THRUST_FORCE, ROTATION_THRUST,
    FUEL_CONSUMPTION_RATE, TERRAIN_SEGMENTS, LANDING_ZONE_WIDTH,
    LANDING_ZONE_HEIGHT_OFFSET, MAX_SAFE_LANDING_SPEED, MAX_SAFE_LANDING_ANGLE_DEG
} from '../constants';
import { radToDeg } from '../helpers';

/**
 * Hook to manage the core game state including lander physics,
 * terrain generation, and collision detection.
 */
export function useGameState(initialStatus: GameStatus = 'start') {
  const [lander, setLander] = useState<LanderState | null>(null);
  const [terrain, setTerrain] = useState<Point[]>([]);
  const [landingZone, setLandingZone] = useState<LandingZone | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(initialStatus);

  // --- Terrain Generation ---
  const generateTerrain = useCallback((canvasWidth: number, canvasHeight: number) => {
    const newTerrain: Point[] = [];
    const segmentWidth = canvasWidth / TERRAIN_SEGMENTS;
    let currentHeight = canvasHeight * 0.7;

    for (let i = 0; i <= TERRAIN_SEGMENTS; i++) {
      const x = i * segmentWidth;
      let y = currentHeight;
      if (i > 0 && i < TERRAIN_SEGMENTS) {
        const heightChange = canvasHeight * 0.1;
        y += (Math.random() * heightChange * 2 - heightChange);
        y = Math.max(canvasHeight * 0.5, Math.min(canvasHeight * 0.9, y));
      }
      newTerrain.push({ x, y });
      currentHeight = y;
    }

    // Create Landing Zone
    const lzIndex = Math.floor(TERRAIN_SEGMENTS / 2) + Math.floor(Math.random() * (TERRAIN_SEGMENTS / 4)) - Math.floor(TERRAIN_SEGMENTS / 8);
    const lzTerrainY = newTerrain[lzIndex].y;
    const lzPlatformY = lzTerrainY - LANDING_ZONE_HEIGHT_OFFSET; // Platform slightly above terrain line
    const lzX = newTerrain[lzIndex].x;

    // Flatten terrain around LZ
    for (let i = lzIndex - 2; i <= lzIndex + 2; i++) {
        if (i >= 0 && i < newTerrain.length) {
            const dist = Math.abs(i - lzIndex);
            const factor = Math.max(0, 1 - dist / 3);
            newTerrain[i].y = lzTerrainY + (newTerrain[i].y - lzTerrainY) * (1 - factor);
        }
    }
    // Ensure exact LZ segments are flat at the original terrain height
    if (lzIndex > 0) newTerrain[lzIndex - 1].y = lzTerrainY;
    newTerrain[lzIndex].y = lzTerrainY;
    if (lzIndex < newTerrain.length - 1) newTerrain[lzIndex + 1].y = lzTerrainY;

    setTerrain(newTerrain);
    setLandingZone({ x: lzX, y: lzPlatformY, width: LANDING_ZONE_WIDTH });

    return { generatedTerrain: newTerrain, generatedLandingZone: { x: lzX, y: lzPlatformY, width: LANDING_ZONE_WIDTH } };
  }, []);

  // --- Lander Initialization ---
  const initializeLander = useCallback((canvasWidth: number) => {
    const newLander: LanderState = {
      ...INITIAL_LANDER_STATE,
      x: canvasWidth / 2,
      y: 50, // Initial height
    };
    setLander(newLander);
    return newLander;
  }, []);

  // --- Game Reset ---
 const resetGame = useCallback((canvasWidth: number, canvasHeight: number) => {
    console.log("Resetting game...");
    generateTerrain(canvasWidth, canvasHeight);
    initializeLander(canvasWidth);
    setGameStatus('playing');
  }, [generateTerrain, initializeLander]);


  // --- Physics Update Function ---
  const updateGameState = useCallback((delta: number, input: GameInputState, canvasWidth: number) => {
    if (!lander || gameStatus !== 'playing') return; // Only update if playing and lander exists

    let nextLander = { ...lander };
    let rotationSpeed = 0;

    // Apply rotation based on input state (continuous check)
    if (input.left) {
      rotationSpeed = -ROTATION_THRUST;
    } else if (input.right) {
      rotationSpeed = ROTATION_THRUST;
    }
    nextLander.angle += rotationSpeed * delta;
    // Normalize angle
    nextLander.angle = (nextLander.angle + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Apply thrust based on input state (continuous check)
    nextLander.thrusting = input.thrust && nextLander.fuel > 0;
    if (nextLander.thrusting) {
      nextLander.fuel -= FUEL_CONSUMPTION_RATE * delta;
      if (nextLander.fuel < 0) nextLander.fuel = 0;

      const thrustX = Math.sin(nextLander.angle) * THRUST_FORCE * delta;
      const thrustY = -Math.cos(nextLander.angle) * THRUST_FORCE * delta; // Y is inverted

      nextLander.velocityX += thrustX;
      nextLander.velocityY += thrustY;
    }

    // Apply gravity
    nextLander.velocityY += GRAVITY * delta;

    // Update position
    nextLander.x += nextLander.velocityX * delta;
    nextLander.y += nextLander.velocityY * delta;

    // Boundary wrap X
    if (nextLander.x < 0) nextLander.x = canvasWidth;
    if (nextLander.x > canvasWidth) nextLander.x = 0;

    // --- Collision Detection ---
    let collisionDetected = false;
    if (terrain.length > 1) {
        for (let i = 0; i < terrain.length - 1; i++) {
            const segStart = terrain[i];
            const segEnd = terrain[i + 1];

            // Basic horizontal overlap check
            const landerLeft = nextLander.x - nextLander.width / 2;
            const landerRight = nextLander.x + nextLander.width / 2;
            const segMinX = Math.min(segStart.x, segEnd.x);
            const segMaxX = Math.max(segStart.x, segEnd.x);
            if (landerRight < segMinX || landerLeft > segMaxX) continue;

            // Interpolate terrain height at lander's X
            let terrainY;
            if (segEnd.x === segStart.x) { // Vertical segment
                terrainY = Math.max(segStart.y, segEnd.y);
            } else {
                const t = (nextLander.x - segStart.x) / (segEnd.x - segStart.x);
                const clampedT = Math.max(0, Math.min(1, t));
                terrainY = segStart.y + clampedT * (segEnd.y - segStart.y);
            }

            // Check for collision (bottom of lander hits terrain)
            if (nextLander.y + nextLander.height / 2 >= terrainY) {
                collisionDetected = true;
                const velocity = Math.sqrt(nextLander.velocityX ** 2 + nextLander.velocityY ** 2);
                const angleDegrees = Math.abs(radToDeg(nextLander.angle));

                const isOverLandingZone = landingZone &&
                    nextLander.x >= landingZone.x &&
                    nextLander.x <= landingZone.x + landingZone.width &&
                    Math.abs(terrainY - (landingZone.y + LANDING_ZONE_HEIGHT_OFFSET)) < 10; // Check if collision Y is near LZ terrain Y

                if (isOverLandingZone && velocity < MAX_SAFE_LANDING_SPEED && angleDegrees < MAX_SAFE_LANDING_ANGLE_DEG) {
                    // Successful Landing
                    nextLander.landed = true;
                    nextLander.crashed = false;
                    nextLander.velocityX = 0;
                    nextLander.velocityY = 0;
                    nextLander.angle = 0;
                    nextLander.y = terrainY - nextLander.height / 2; // Place on surface
                    setGameStatus('landed');
                } else {
                    // Crash
                    nextLander.crashed = true;
                    nextLander.landed = false;
                    setGameStatus('crashed');
                }
                break; // Exit loop after collision
            }
        }
    }

    // Update state only if the game is still marked as 'playing'
    // This prevents state updates after landing/crash detection in the same frame
    if (gameStatus === 'playing') {
       setLander(nextLander);
    }


  }, [lander, terrain, landingZone, gameStatus, setGameStatus]); // Dependencies

  return {
    lander,
    terrain,
    landingZone,
    gameStatus,
    setGameStatus, // Allow external status changes (e.g., from App start button)
    generateTerrain,
    initializeLander,
    updateGameState,
    resetGame,
  };
}

