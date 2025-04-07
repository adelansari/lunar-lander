import { useState, useEffect, useRef, useCallback } from 'react';
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
  const gameOverHandledRef = useRef<boolean>(false);

  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const beaconPulseRef = useRef<number>(0); // Used for LZ pulsing effect

  // --- Terrain Generation ---
  const generateTerrain = useCallback((canvasWidth: number, canvasHeight: number) => {
    const newTerrain: Point[] = []; const segmentWidth = canvasWidth / TERRAIN_SEGMENTS; let currentHeight = canvasHeight * 0.7;
    for (let i = 0; i <= TERRAIN_SEGMENTS; i++) { const x = i * segmentWidth; let y = currentHeight; if (i > 0 && i < TERRAIN_SEGMENTS) { const heightChange = canvasHeight * 0.1; y += (Math.random() * heightChange * 2 - heightChange); y = Math.max(canvasHeight * 0.5, Math.min(canvasHeight * 0.9, y)); } newTerrain.push({ x, y }); currentHeight = y; }
    const lzIndex = Math.floor(TERRAIN_SEGMENTS / 2) + Math.floor(Math.random() * (TERRAIN_SEGMENTS / 4)) - Math.floor(TERRAIN_SEGMENTS / 8); const lzTerrainY = newTerrain[lzIndex].y; const lzPlatformY = lzTerrainY - LANDING_ZONE_HEIGHT_OFFSET; const lzX = newTerrain[lzIndex].x;
    for (let i = lzIndex - 2; i <= lzIndex + 2; i++) { if (i >= 0 && i < newTerrain.length) { const dist = Math.abs(i - lzIndex); const factor = Math.max(0, 1 - dist / 3); newTerrain[i].y = lzTerrainY + (newTerrain[i].y - lzTerrainY) * (1 - factor); } }
    if (lzIndex > 0) newTerrain[lzIndex - 1].y = lzTerrainY; newTerrain[lzIndex].y = lzTerrainY; if (lzIndex < newTerrain.length - 1) newTerrain[lzIndex + 1].y = lzTerrainY;
    setTerrain(newTerrain); setLandingZone({ x: lzX, y: lzPlatformY, width: LANDING_ZONE_WIDTH });
  }, []);

  // --- Lander Initialization ---
  const initializeLander = useCallback((canvasWidth: number) => {
    const landerData: LanderState = { width: LANDER_WIDTH, height: LANDER_HEIGHT, angle: 0, velocityX: 0, velocityY: 0, fuel: 100, thrusting: false, landed: false, crashed: false, x: canvasWidth / 2, y: 50, };
    setLander(landerData); gameOverHandledRef.current = false;
  }, []);

  // --- Canvas Setup & Resize ---
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; ctxRef.current = canvas.getContext('2d');
    const { innerWidth, innerHeight } = window; canvas.width = innerWidth; canvas.height = innerHeight;
    generateTerrain(innerWidth, innerHeight); initializeLander(innerWidth); lastTimeRef.current = 0;
  }, [generateTerrain, initializeLander]);

  useEffect(() => {
    setupCanvas(); window.addEventListener('resize', setupCanvas);
    return () => { window.removeEventListener('resize', setupCanvas); if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; };
  }, [setupCanvas]);


  // --- Physics Update ---
  const update = useCallback((delta: number) => {
    if (!lander || gameOverHandledRef.current || !inputStateRef.current) return;
    const input = inputStateRef.current; let nextLander = { ...lander }; let rotationSpeed = 0;
    if (input.left) rotationSpeed = -ROTATION_THRUST; else if (input.right) rotationSpeed = ROTATION_THRUST;
    nextLander.angle += rotationSpeed * delta; nextLander.angle = (nextLander.angle + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    nextLander.thrusting = input.thrust && nextLander.fuel > 0;
    if (nextLander.thrusting) { nextLander.fuel = Math.max(0, nextLander.fuel - FUEL_CONSUMPTION_RATE * delta); const angleRad = nextLander.angle; const thrustX = Math.sin(angleRad) * THRUST_FORCE * delta; const thrustY = -Math.cos(angleRad) * THRUST_FORCE * delta; nextLander.velocityX += thrustX; nextLander.velocityY += thrustY; }
    nextLander.velocityY += GRAVITY * delta; nextLander.x += nextLander.velocityX * delta; nextLander.y += nextLander.velocityY * delta;
    const canvasWidth = canvasRef.current?.width ?? window.innerWidth; if (nextLander.x < 0) nextLander.x = canvasWidth; if (nextLander.x > canvasWidth) nextLander.x = 0;
    let collisionStatus: GameStatus | null = null;
    if (terrain.length > 1) {
        for (let i = 0; i < terrain.length - 1; i++) {
            const segStart = terrain[i]; const segEnd = terrain[i + 1]; const landerLeft = nextLander.x - nextLander.width / 2; const landerRight = nextLander.x + nextLander.width / 2; const segMinX = Math.min(segStart.x, segEnd.x); const segMaxX = Math.max(segStart.x, segEnd.x); if (landerRight < segMinX || landerLeft > segMaxX) continue;
            let terrainY; if (segEnd.x === segStart.x) terrainY = Math.max(segStart.y, segEnd.y); else { const t = (nextLander.x - segStart.x) / (segEnd.x - segStart.x); const clampedT = Math.max(0, Math.min(1, t)); terrainY = segStart.y + clampedT * (segEnd.y - segStart.y); }
            if (nextLander.y + nextLander.height / 2 >= terrainY) {
                const velocity = Math.sqrt(nextLander.velocityX ** 2 + nextLander.velocityY ** 2); const angleDegrees = Math.abs(radToDeg(nextLander.angle)); const isOverLandingZone = landingZone && nextLander.x >= landingZone.x && nextLander.x <= landingZone.x + landingZone.width && Math.abs(terrainY - (landingZone.y + LANDING_ZONE_HEIGHT_OFFSET)) < 10;
                if (isOverLandingZone && velocity < MAX_SAFE_LANDING_SPEED && angleDegrees < MAX_SAFE_LANDING_ANGLE_DEG) { collisionStatus = 'landed'; nextLander.y = terrainY - nextLander.height / 2; nextLander.velocityX = 0; nextLander.velocityY = 0; nextLander.angle = 0; } else { collisionStatus = 'crashed'; }
                nextLander.landed = collisionStatus === 'landed'; nextLander.crashed = collisionStatus === 'crashed'; break;
            }
        }
    }
    setLander(nextLander); provideStateForUI(nextLander, terrain);
    if (collisionStatus && !gameOverHandledRef.current) { gameOverHandledRef.current = true; onGameOver(collisionStatus, nextLander); }
  }, [lander, terrain, landingZone, inputStateRef, onGameOver, provideStateForUI]);


  // --- Drawing Logic ---
  const draw = useCallback(() => {
    const ctx = ctxRef.current; const canvas = canvasRef.current;
    if (!ctx || !canvas || !lander) return; // Ensure everything is ready
    const { width: canvasWidth, height: canvasHeight } = canvas;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // --- Draw Terrain ---
    if (terrain.length > 1) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, canvasHeight);
      terrain.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(canvasWidth, canvasHeight); ctx.closePath();
      ctx.fillStyle = '#4a4e69'; ctx.fill(); ctx.strokeStyle = '#3a3e59'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }

    // --- Draw Landing Zone ---
    if (landingZone) {
        ctx.save();
        const lz = landingZone;
        const landingCenterX = lz.x + lz.width / 2;
        // Use the platform's Y for drawing elements on it
        const landingCenterY = lz.y;
        // Use the terrain's Y for placing the base rect
        const lzTerrainY = landingCenterY + LANDING_ZONE_HEIGHT_OFFSET;

        // 1. Draw Solid Platform Base (like original fillRect)
        ctx.fillStyle = '#00ff64'; // Green platform color
        ctx.fillRect(lz.x, lzTerrainY, lz.width, 5); // Draw on the terrain line

        // 2. Draw Pulsing Beacon Circle (like original arc)
        beaconPulseRef.current = (beaconPulseRef.current + 0.05) % (Math.PI * 2); // Update pulse
        const beaconPulseSize = 3 + Math.sin(beaconPulseRef.current) * 2; // Size pulse 1-5
        const beaconPulseOpacity = 0.5 + Math.sin(beaconPulseRef.current) * 0.2; // Opacity pulse 0.3-0.7
        ctx.beginPath();
        ctx.arc(landingCenterX, landingCenterY, beaconPulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 100, ${beaconPulseOpacity})`; // Pulsing green/opacity
        ctx.fill();

        // 3. Draw Vertical Guideline (like original lineTo)
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)'; // Faint green line
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(landingCenterX, landingCenterY); // Start at platform center Y
        ctx.lineTo(landingCenterX, landingCenterY - 50); // Extend upwards
        ctx.stroke();

        ctx.restore();
    }

    // --- Draw Lander ---
    ctx.save(); ctx.translate(lander.x, lander.y); ctx.rotate(lander.angle);
    ctx.fillStyle = '#cccccc'; ctx.fillRect(-lander.width / 2, -lander.height / 2, lander.width, lander.height); // Body
    ctx.fillStyle = '#6495ed'; ctx.beginPath(); ctx.arc(0, -lander.height / 4, lander.width / 3.5, 0, Math.PI * 2); ctx.fill(); // Cockpit
    ctx.strokeStyle = '#999999'; ctx.lineWidth = 2; const legLength = lander.height * 0.4, legSpread = lander.width * 0.4; // Legs
    ctx.beginPath(); ctx.moveTo(-lander.width / 2, lander.height / 2); ctx.lineTo(-lander.width / 2 - legSpread, lander.height / 2 + legLength); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lander.width / 2, lander.height / 2); ctx.lineTo(lander.width / 2 + legSpread, lander.height / 2 + legLength); ctx.stroke();
    if (lander.thrusting) { /* Flame */ ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.7 + Math.random() * 0.3})`; ctx.beginPath(); const flameLength = lander.height * 0.5 + Math.random() * 10; ctx.moveTo(-lander.width / 4, lander.height / 2); ctx.lineTo(lander.width / 4, lander.height / 2); ctx.lineTo(0, lander.height / 2 + flameLength); ctx.closePath(); ctx.fill(); }
    if (lander.crashed) { /* Crash */ ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; ctx.beginPath(); ctx.arc(0, 0, lander.width * (1 + Math.random() * 0.5), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();

    // --- Draw Altitude Marker (NEW) ---
    if (terrain.length > 1) {
        let terrainYBelow = canvasHeight; // Default to bottom
        for (let i = 0; i < terrain.length - 1; i++) {
            const segStart = terrain[i]; const segEnd = terrain[i + 1];
            const minX = Math.min(segStart.x, segEnd.x); const maxX = Math.max(segStart.x, segEnd.x);
            if (lander.x >= minX && lander.x <= maxX) {
                if (segEnd.x === segStart.x) terrainYBelow = Math.max(segStart.y, segEnd.y);
                else { const t = (lander.x - segStart.x) / (segEnd.x - segStart.x); const clampedT = Math.max(0, Math.min(1, t)); terrainYBelow = segStart.y + clampedT * (segEnd.y - segStart.y); }
                break;
            }
        }
        // Draw dashed line from lander bottom to terrain below
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]); // 4 pixels on, 4 pixels off
        ctx.moveTo(lander.x, lander.y + lander.height / 2); // Bottom center of lander
        ctx.lineTo(lander.x, terrainYBelow); // Point on terrain directly below
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Faint white dashed line
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore(); // Restore line dash setting
    }


    // --- Draw Distance Indicator ---
    if (landingZone) {
        const lz = landingZone;
        const landingCenterX = lz.x + lz.width / 2;
        const landingCenterY = lz.y; // Use platform Y for distance calculation target

        // Condition from original HTML
        const showIndicator = Math.abs(lander.x - landingCenterX) > 200 || lander.y < landingCenterY - 300;

        if (showIndicator) {
            ctx.save();
            // Arrow position at edge of screen
            const arrowX = lander.x > landingCenterX ? canvasWidth - 20 : 20;
            const arrowDir = lander.x > landingCenterX ? -1 : 1; // Direction arrow points (-1 left, 1 right)
            const arrowY = 50; // Fixed Y position near top

            // Draw Arrow Shape
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - 10); // Top point
            ctx.lineTo(arrowX + (arrowDir * 15), arrowY); // Middle point (tip)
            ctx.lineTo(arrowX, arrowY + 10); // Bottom point
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00ff64';
            ctx.stroke();

            // Draw Text ("LAND HERE" and distance)
            ctx.font = '12px Orbitron';
            ctx.fillStyle = '#00ff64';
            ctx.textAlign = arrowDir === 1 ? 'left' : 'right';
            const textX = arrowX + (arrowDir * (arrowDir === 1 ? 20 : -20));
            ctx.fillText('LAND HERE', textX, arrowY);

            const distance = Math.floor(Math.sqrt(
                Math.pow(lander.x - landingCenterX, 2) +
                Math.pow(lander.y - landingCenterY, 2)
            ));
            ctx.fillText(`${distance}m`, textX, arrowY + 20); // Distance below "LAND HERE"

            ctx.restore();
        }
    }

  }, [lander, terrain, landingZone]);


  useEffect(() => {
    let isActive = true;
    const loop = (timestamp: number) => {
      if (!isActive) return; const currentTime = performance.now();
      if (!lastTimeRef.current) lastTimeRef.current = currentTime; const elapsed = currentTime - lastTimeRef.current; lastTimeRef.current = currentTime;
      const delta = elapsed > 0 ? Math.min(elapsed / 16, 3) : 0;
      if (delta > 0 && !gameOverHandledRef.current) { update(delta); } draw();
      if (isActive && !gameOverHandledRef.current) { animationFrameIdRef.current = requestAnimationFrame(loop); } else { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; }
    };
    lastTimeRef.current = 0; gameOverHandledRef.current = false; animationFrameIdRef.current = requestAnimationFrame(loop);
    return () => { isActive = false; if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); animationFrameIdRef.current = null; };
  }, [update, draw]);

  return <canvas ref={canvasRef} id="gameCanvas" />;
};

export default GameCanvas;
