import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LanderState, Point, LandingZone, GameStatus, GameInputState } from '../types';
import {
    INITIAL_LANDER_STATE, GRAVITY, THRUST_FORCE, ROTATION_THRUST,
    FUEL_CONSUMPTION_RATE, TERRAIN_SEGMENTS, LANDING_ZONE_WIDTH,
    LANDING_ZONE_HEIGHT_OFFSET, MAX_SAFE_LANDING_SPEED, MAX_SAFE_LANDING_ANGLE_DEG,
    LANDER_WIDTH, LANDER_HEIGHT
} from '../constants';
import { radToDeg, degToRad } from '../helpers';

interface GameCanvasProps {
  inputStateRef: React.RefObject<GameInputState>;
  onGameOver: (status: 'landed' | 'crashed', finalLander: LanderState) => void;
  provideStateForUI: (lander: LanderState, terrain: Point[]) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    inputStateRef,
    onGameOver,
    provideStateForUI
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [lander, setLander] = useState<LanderState | null>(null);
  const [terrain, setTerrain] = useState<Point[]>([]);
  const [landingZone, setLandingZone] = useState<LandingZone | null>(null);
  const [internalGameStatus, setInternalGameStatus] = useState<GameStatus>('playing');

  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const beaconPulseRef = useRef<number>(0);

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
    // Landing Zone
    const lzIndex = Math.floor(TERRAIN_SEGMENTS / 2) + Math.floor(Math.random() * (TERRAIN_SEGMENTS / 4)) - Math.floor(TERRAIN_SEGMENTS / 8);
    const lzTerrainY = newTerrain[lzIndex].y;
    const lzPlatformY = lzTerrainY - LANDING_ZONE_HEIGHT_OFFSET;
    const lzX = newTerrain[lzIndex].x;
    // Flatten terrain near LZ
    for (let i = lzIndex - 2; i <= lzIndex + 2; i++) {
        if (i >= 0 && i < newTerrain.length) {
            const dist = Math.abs(i - lzIndex); const factor = Math.max(0, 1 - dist / 3);
            newTerrain[i].y = lzTerrainY + (newTerrain[i].y - lzTerrainY) * (1 - factor);
        }
    }
    if (lzIndex > 0) newTerrain[lzIndex - 1].y = lzTerrainY;
    newTerrain[lzIndex].y = lzTerrainY;
    if (lzIndex < newTerrain.length - 1) newTerrain[lzIndex + 1].y = lzTerrainY;

    setTerrain(newTerrain);
    setLandingZone({ x: lzX, y: lzPlatformY, width: LANDING_ZONE_WIDTH });
  }, []);

  // --- Lander Initialization ---
  const initializeLander = useCallback((canvasWidth: number) => {
    const landerData: LanderState = {
        width: LANDER_WIDTH,
        height: LANDER_HEIGHT,
        angle: INITIAL_LANDER_STATE.angle,
        velocityX: INITIAL_LANDER_STATE.velocityX,
        velocityY: INITIAL_LANDER_STATE.velocityY,
        fuel: INITIAL_LANDER_STATE.fuel,
        thrusting: INITIAL_LANDER_STATE.thrusting,
        landed: INITIAL_LANDER_STATE.landed,
        crashed: INITIAL_LANDER_STATE.crashed,
        x: canvasWidth / 2,
        y: 50, // Initial Y position
    };
    setLander(landerData);
  }, []);


  // --- Canvas Setup & Resize ---
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    // Reset game state on canvas setup/resize
    generateTerrain(innerWidth, innerHeight);
    initializeLander(innerWidth);
    setInternalGameStatus('playing');
    lastTimeRef.current = 0;
  }, [generateTerrain, initializeLander]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => {
      window.removeEventListener('resize', setupCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [setupCanvas]);


  // --- Physics Update ---
  const update = useCallback((delta: number) => {
    if (!lander || internalGameStatus !== 'playing' || !inputStateRef.current) return;

    const input = inputStateRef.current;
    let nextLander = { ...lander };
    let rotationSpeed = 0;

    // Input -> Rotation
    if (input.left) rotationSpeed = -ROTATION_THRUST;
    else if (input.right) rotationSpeed = ROTATION_THRUST;
    nextLander.angle += rotationSpeed * delta;
    nextLander.angle = (nextLander.angle + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // Normalize angle

    // Input -> Thrust
    nextLander.thrusting = input.thrust && nextLander.fuel > 0;
    if (nextLander.thrusting) {
      nextLander.fuel = Math.max(0, nextLander.fuel - FUEL_CONSUMPTION_RATE * delta);
      const thrustX = Math.sin(nextLander.angle) * THRUST_FORCE * delta;
      const thrustY = -Math.cos(nextLander.angle) * THRUST_FORCE * delta;
      nextLander.velocityX += thrustX;
      nextLander.velocityY += thrustY;
    }

    // Apply Gravity
    nextLander.velocityY += GRAVITY * delta;

    // Update Position
    nextLander.x += nextLander.velocityX * delta;
    nextLander.y += nextLander.velocityY * delta;

    // Boundary Wrap (X-axis)
    const canvasWidth = canvasRef.current?.width ?? window.innerWidth;
    if (nextLander.x < 0) nextLander.x = canvasWidth;
    if (nextLander.x > canvasWidth) nextLander.x = 0;

    // --- Collision Detection ---
    let newStatus: GameStatus | null = null;
    if (terrain.length > 1) {
        for (let i = 0; i < terrain.length - 1; i++) {
            const segStart = terrain[i]; const segEnd = terrain[i + 1];
            const landerLeft = nextLander.x - nextLander.width / 2;
            const landerRight = nextLander.x + nextLander.width / 2;
            const segMinX = Math.min(segStart.x, segEnd.x);
            const segMaxX = Math.max(segStart.x, segEnd.x);
            if (landerRight < segMinX || landerLeft > segMaxX) continue;

            let terrainY;
            if (segEnd.x === segStart.x) terrainY = Math.max(segStart.y, segEnd.y);
            else {
                const t = (nextLander.x - segStart.x) / (segEnd.x - segStart.x);
                const clampedT = Math.max(0, Math.min(1, t));
                terrainY = segStart.y + clampedT * (segEnd.y - segStart.y);
            }

            // Check collision
            if (nextLander.y + nextLander.height / 2 >= terrainY) {
                const velocity = Math.sqrt(nextLander.velocityX ** 2 + nextLander.velocityY ** 2);
                const angleDegrees = Math.abs(radToDeg(nextLander.angle));
                const isOverLandingZone = landingZone &&
                    nextLander.x >= landingZone.x && nextLander.x <= landingZone.x + landingZone.width &&
                    Math.abs(terrainY - (landingZone.y + LANDING_ZONE_HEIGHT_OFFSET)) < 10;

                // Determine outcome
                if (isOverLandingZone && velocity < MAX_SAFE_LANDING_SPEED && angleDegrees < MAX_SAFE_LANDING_ANGLE_DEG) {
                    newStatus = 'landed';
                    nextLander.y = terrainY - nextLander.height / 2;
                    nextLander.velocityX = 0; nextLander.velocityY = 0; nextLander.angle = 0;
                } else {
                    newStatus = 'crashed';
                }
                nextLander.landed = newStatus === 'landed';
                nextLander.crashed = newStatus === 'crashed';
                break; // Collision detected
            }
        }
    }

    // Update React state
    setLander(nextLander);
    if (newStatus) {
        setInternalGameStatus(newStatus);
        onGameOver(newStatus, nextLander); // Notify parent
    }
    provideStateForUI(nextLander, terrain); // Update UI state

  }, [lander, terrain, landingZone, internalGameStatus, inputStateRef, onGameOver, provideStateForUI]);


  // --- Drawing Logic ---
  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !lander) return;
    const { width: canvasWidth, height: canvasHeight } = canvas;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw Terrain
    if (terrain.length > 1) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, canvasHeight);
      terrain.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.lineTo(canvasWidth, canvasHeight); ctx.closePath();
      ctx.fillStyle = '#4a4e69'; ctx.fill();
      ctx.strokeStyle = '#3a3e59'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
    // Draw Landing Zone Platform
    if (landingZone) {
        ctx.save(); const lz = landingZone;
        beaconPulseRef.current = (beaconPulseRef.current + 0.05) % (Math.PI * 2);
        const pulseFactor = Math.sin(beaconPulseRef.current);
        ctx.beginPath(); ctx.moveTo(lz.x, lz.y); ctx.lineTo(lz.x + lz.width, lz.y);
        ctx.lineWidth = 4 + pulseFactor * 1.5;
        ctx.strokeStyle = `rgba(0, 255, 100, ${0.6 + pulseFactor * 0.2})`;
        ctx.lineCap = 'round'; ctx.stroke();
        ctx.restore();
    }
    // Draw Lander
    ctx.save(); ctx.translate(lander.x, lander.y); ctx.rotate(lander.angle);
    ctx.fillStyle = '#cccccc'; ctx.fillRect(-lander.width / 2, -lander.height / 2, lander.width, lander.height); // Body
    ctx.fillStyle = '#6495ed'; ctx.beginPath(); ctx.arc(0, -lander.height / 4, lander.width / 3.5, 0, Math.PI * 2); ctx.fill(); // Cockpit
    ctx.strokeStyle = '#999999'; ctx.lineWidth = 2; const legLength = lander.height * 0.4, legSpread = lander.width * 0.4; // Legs
    ctx.beginPath(); ctx.moveTo(-lander.width / 2, lander.height / 2); ctx.lineTo(-lander.width / 2 - legSpread, lander.height / 2 + legLength); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lander.width / 2, lander.height / 2); ctx.lineTo(lander.width / 2 + legSpread, lander.height / 2 + legLength); ctx.stroke();
    if (lander.thrusting) { // Flame
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.7 + Math.random() * 0.3})`; ctx.beginPath(); const flameLength = lander.height * 0.5 + Math.random() * 10;
        ctx.moveTo(-lander.width / 4, lander.height / 2); ctx.lineTo(lander.width / 4, lander.height / 2); ctx.lineTo(0, lander.height / 2 + flameLength); ctx.closePath(); ctx.fill();
    }
    if (lander.crashed) { // Crash
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; ctx.beginPath(); ctx.arc(0, 0, lander.width * (1 + Math.random() * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

  }, [lander, terrain, landingZone]);


  // --- Game Loop ---
  useEffect(() => {
    let isActive = true;

    const loop = (timestamp: number) => {
      if (!isActive) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 16.67;
      lastTimeRef.current = timestamp;

      if (internalGameStatus === 'playing') {
          const clampedDelta = Math.min(delta, 3); // Prevent large jumps
          update(clampedDelta);
      }
      draw();

      if (isActive && internalGameStatus === 'playing') {
        animationFrameIdRef.current = requestAnimationFrame(loop);
      } else {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
      }
    };

    if (internalGameStatus === 'playing') {
        lastTimeRef.current = 0;
        animationFrameIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      isActive = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [internalGameStatus, update, draw]);

  return <canvas ref={canvasRef} id="gameCanvas" />;
};

export default GameCanvas;
