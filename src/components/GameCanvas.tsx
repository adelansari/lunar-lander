import { useEffect, useRef, useState } from 'react';
import { Lander, TerrainPoint, LandingZone } from '../game/types';
import { GAME_CONSTANTS } from '../game/constants';

const GameCanvas = () => {
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
    const animationRef = useRef<number>();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.key]: true }));
        const handleKeyUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.key]: false }));

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} />;
};

export default GameCanvas;