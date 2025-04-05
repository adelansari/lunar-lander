import { useEffect, useRef, useState, useCallback } from 'react';
import { Lander, TerrainPoint, LandingZone, GameStatus } from '../game/types';
import { GAME_CONSTANTS } from '../game/constants';
import GameUI from './GameUI';
import TouchControls from './TouchControls';

const GameCanvas = ({ setGameStatus }: { setGameStatus: (status: GameStatus) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lander, setLander] = useState<Lander>({
        x: 0, y: 0, width: 30, height: 40,
        angle: 0, velocityX: 0, velocityY: 0,
        rotationSpeed: 0, fuel: GAME_CONSTANTS.INITIAL_FUEL,
        thrusting: false, crashed: false, landed: false
    });
    const [terrain, setTerrain] = useState<TerrainPoint[]>([]);
    const [landingZone, setLandingZone] = useState<LandingZone>({ x: 0, y: 0, width: 80 });
    const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
    const animationRef = useRef<number | undefined>(undefined);
    const lastTime = useRef<number>(0);
    const beaconPulse = useRef<number>(0);

    const generateTerrain = useCallback((canvasWidth: number, canvasHeight: number) => {
        const newTerrain: TerrainPoint[] = [];
        const segmentWidth = canvasWidth / GAME_CONSTANTS.TERRAIN_SEGMENTS;
        let prevHeight = canvasHeight * 0.7;

        for (let i = 0; i <= GAME_CONSTANTS.TERRAIN_SEGMENTS; i++) {
            const x = i * segmentWidth;
            let height = prevHeight;

            if (i > 0 && i < GAME_CONSTANTS.TERRAIN_SEGMENTS) {
                const maxChange = canvasHeight * 0.1;
                height = prevHeight + (Math.random() * maxChange * 2 - maxChange);
                height = Math.max(canvasHeight * 0.5, Math.min(canvasHeight * 0.9, height));
            }

            newTerrain.push({ x, y: height });
            prevHeight = height;
        }

        const landingSegment = Math.floor(GAME_CONSTANTS.TERRAIN_SEGMENTS / 2) +
            Math.floor(Math.random() * (GAME_CONSTANTS.TERRAIN_SEGMENTS / 3));
        const landingZone = {
            x: newTerrain[landingSegment].x,
            y: newTerrain[landingSegment].y - 5,
            width: GAME_CONSTANTS.LANDING_ZONE_WIDTH
        };

        for (let i = landingSegment - 2; i <= landingSegment + 2; i++) {
            if (i >= 0 && i < newTerrain.length) {
                newTerrain[i].y = landingZone.y + 5;
            }
        }

        setTerrain(newTerrain);
        setLandingZone(landingZone);
    }, []);

    const resetLander = useCallback((canvasWidth: number, canvasHeight: number) => {
        setLander({
            x: canvasWidth / 2,
            y: 50,
            width: 30,
            height: 40,
            angle: 0,
            velocityX: 0,
            velocityY: 0,
            rotationSpeed: 0,
            fuel: GAME_CONSTANTS.INITIAL_FUEL,
            thrusting: false,
            crashed: false,
            landed: false
        });
    }, []);

    const checkCollision = useCallback((ctx: CanvasRenderingContext2D, lander: Lander) => {
        for (let i = 0; i < terrain.length - 1; i++) {
            const seg = terrain[i];
            const nextSeg = terrain[i + 1];

            if (lander.x + lander.width / 2 < seg.x || lander.x - lander.width / 2 > nextSeg.x) continue;

            const t = (lander.x - seg.x) / (nextSeg.x - seg.x);
            const terrainY = seg.y + t * (nextSeg.y - seg.y);

            if (lander.y + lander.height / 2 >= terrainY) {
                const inLandingZone = lander.x >= landingZone.x &&
                    lander.x <= landingZone.x + landingZone.width;
                const velocity = Math.sqrt(lander.velocityX ** 2 + lander.velocityY ** 2);
                const angleDegrees = Math.abs(lander.angle * (180 / Math.PI));

                if (inLandingZone && velocity < GAME_CONSTANTS.SAFE_LANDING_SPEED &&
                    angleDegrees < GAME_CONSTANTS.SAFE_ANGLE) {
                    setGameStatus('landed');
                } else {
                    setGameStatus('crashed');
                }
                return true;
            }
        }
        return false;
    }, [terrain, landingZone, setGameStatus]);

    const updateGame = useCallback((delta: number) => {
        setLander(prev => {
            if (prev.crashed || prev.landed) return prev;
            const canvas = canvasRef.current;
            if (!canvas) return prev;

            let newLander = { ...prev };
            beaconPulse.current = (beaconPulse.current + 0.02) % (Math.PI * 2);

            // Rotation
            newLander.rotationSpeed = 0;
            if (keys.ArrowLeft || keys.a) newLander.rotationSpeed = -GAME_CONSTANTS.ROTATION_THRUST;
            if (keys.ArrowRight || keys.d) newLander.rotationSpeed = GAME_CONSTANTS.ROTATION_THRUST;

            // Thrust
            newLander.thrusting = false;
            if ((keys.ArrowUp || keys.w) && newLander.fuel > 0) {
                newLander.thrusting = true;
                newLander.fuel = Math.max(0, newLander.fuel - 0.1 * delta);
                const thrustX = Math.sin(newLander.angle) * GAME_CONSTANTS.THRUST * delta;
                const thrustY = -Math.cos(newLander.angle) * GAME_CONSTANTS.THRUST * delta;
                newLander.velocityX += thrustX;
                newLander.velocityY += thrustY;
            }

            // Update physics
            newLander.angle += newLander.rotationSpeed * delta;
            newLander.velocityY += GAME_CONSTANTS.GRAVITY * delta;
            newLander.x += newLander.velocityX * delta;
            newLander.y += newLander.velocityY * delta;

            // Boundary checks
            newLander.x = Math.max(0, Math.min(canvas.width, newLander.x));
            return newLander;
        });
    }, [keys]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);

        // Draw terrain
        ctx.beginPath();
        ctx.moveTo(0, height);
        terrain.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(width, height);
        ctx.fillStyle = '#4a4e69';
        ctx.fill();

        // Draw lander
        ctx.save();
        ctx.translate(lander.x, lander.y);
        ctx.rotate(lander.angle);
        ctx.fillStyle = '#333';
        ctx.fillRect(-lander.width / 2, -lander.height / 2, lander.width, lander.height);
        if (lander.thrusting) {
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.moveTo(-lander.width / 4, lander.height / 2);
            ctx.lineTo(lander.width / 4, lander.height / 2);
            ctx.lineTo(0, lander.height / 2 + 20 + Math.random() * 10);
            ctx.fill();
        }
        ctx.restore();

        // Draw landing zone
        ctx.beginPath();
        ctx.moveTo(landingZone.x, landingZone.y);
        ctx.lineTo(landingZone.x + landingZone.width, landingZone.y);
        ctx.strokeStyle = '#00ff64';
        ctx.lineWidth = 2;
        ctx.stroke();
    }, [lander, terrain, landingZone]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            generateTerrain(canvas.width, canvas.height);
            resetLander(canvas.width, canvas.height);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const gameLoop = (timestamp: number) => {
            if (!lastTime.current) lastTime.current = timestamp;
            const delta = timestamp - lastTime.current;
            lastTime.current = timestamp;

            if (ctx) {
                updateGame(delta / 16);
                draw(ctx);
                if (checkCollision(ctx, lander)) return;
            }
            animationRef.current = requestAnimationFrame(gameLoop);
        };
        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [draw, updateGame, checkCollision, generateTerrain, resetLander, lander]);

    return (
        <>
            <canvas ref={canvasRef} />
            <GameUI lander={lander} landingZone={landingZone} />
            <TouchControls 
                onControl={(key: string, pressed: boolean) => setKeys(k => ({ ...k, [key]: pressed }))} 
            />
        </>
    );
};

export default GameCanvas;