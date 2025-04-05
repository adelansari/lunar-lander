import { useEffect, useState, useRef, useCallback } from 'react';
import { GameContainer } from './components/GameContainer';
import { StartScreen } from './components/StartScreen';
import { EndScreen } from './components/EndScreen';
import { GameUI } from './components/GameUI';
import { Instructions } from './components/Instructions';
import { Controls } from './components/Controls';
import { AngleIndicator } from './components/AngleIndicator';
import { StarsBackground } from './components/StarsBackground';
import { useGameLoop } from './hooks/useGameLoop';
import { useTerrain } from './hooks/useTerrain';
import { useLander } from './hooks/useLander';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import type { TerrainPoint, LandingZone, Lander } from './types/game';

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [beaconPulse, setBeaconPulse] = useState(0);
  
  // Initialize game objects and state
  const { terrain, landingZone, generateTerrain } = useTerrain();
  const { 
    lander, 
    resetLander, 
    updateLander,
    checkCollision
  } = useLander(terrain, landingZone);
  
  // Keyboard controls
  const { keys, handleKeyDown, handleKeyUp } = useKeyboardControls();
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    generateTerrain(canvasRef.current?.width || window.innerWidth);
    resetLander();
  };
  
  // Restart the game
  const restartGame = () => {
    generateTerrain(canvasRef.current?.width || window.innerWidth);
    resetLander();
    setGameStarted(true);
  };
  
  // Game loop
  useGameLoop({
    enabled: gameStarted && !lander.crashed && !lander.landed,
    onUpdate: (delta) => {
      updateLander(delta, keys);
      checkCollision();
      
      // Update beacon pulse animation
      setBeaconPulse(prev => (prev + 0.02) % (Math.PI * 2));
      
      // Render game
      renderGame();
    }
  });
  
  // Draw game elements on canvas
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw terrain
    drawTerrain(ctx, terrain);
    
    // Draw landing zone
    drawLandingZone(ctx, landingZone, beaconPulse);
    
    // Draw lander
    drawLander(ctx, lander);
    
    // Draw altitude marker
    if (!lander.landed && !lander.crashed) {
      drawAltitudeMarker(ctx, lander);
      
      // Draw distance indicator to landing zone when far away
      drawDistanceIndicator(ctx, lander, landingZone);
    }
  }, [terrain, landingZone, lander, beaconPulse]);
  
  // Draw terrain on canvas
  const drawTerrain = (ctx: CanvasRenderingContext2D, terrain: TerrainPoint[]) => {
    if (terrain.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height);
    
    for (let i = 0; i < terrain.length; i++) {
      ctx.lineTo(terrain[i].x, terrain[i].y);
    }
    
    ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
    ctx.lineTo(0, ctx.canvas.height);
    ctx.fillStyle = '#4a4e69';
    ctx.fill();
    ctx.strokeStyle = '#3a3e59';
    ctx.stroke();
  };
  
  // Draw landing zone on canvas
  const drawLandingZone = (ctx: CanvasRenderingContext2D, landingZone: LandingZone, beaconPulse: number) => {
    const landingCenterX = landingZone.x + landingZone.width / 2;
    const landingCenterY = landingZone.y;
    
    // Landing zone glow effect
    ctx.beginPath();
    ctx.moveTo(landingZone.x, landingZone.y);
    ctx.lineTo(landingZone.x + landingZone.width, landingZone.y);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
    ctx.stroke();
    
    // Landing zone platform
    ctx.beginPath();
    ctx.moveTo(landingZone.x, landingZone.y);
    ctx.lineTo(landingZone.x + landingZone.width, landingZone.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff64';
    ctx.stroke();
    
    // Landing zone markings (stripes)
    for (let x = landingZone.x; x < landingZone.x + landingZone.width; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, landingZone.y);
      ctx.lineTo(x + 8, landingZone.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff64';
      ctx.stroke();
    }
    
    // Pulse beacon at landing zone
    const pulseSize = 8 + Math.sin(beaconPulse) * 5;
    ctx.beginPath();
    ctx.arc(landingCenterX, landingCenterY - 8, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 100, 0.3)';
    ctx.fill();
    
    // Beacon center
    ctx.beginPath();
    ctx.arc(landingCenterX, landingCenterY - 8, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff64';
    ctx.fill();
    
    // Beacon light beam
    const beamHeight = 30 + Math.sin(beaconPulse * 2) * 10;
    const gradient = ctx.createLinearGradient(
      landingCenterX, landingCenterY - 8, 
      landingCenterX, landingCenterY - 8 - beamHeight
    );
    gradient.addColorStop(0, 'rgba(0, 255, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(landingCenterX - 3, landingCenterY - 8, 6, -beamHeight);
    
    // Landed flag (visible when approaching)
    if (Math.abs(lander.y - landingCenterY) < 200) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(landingCenterX, landingCenterY - 25, 2, -15);
      ctx.fillStyle = '#00ff64';
      ctx.fillRect(landingCenterX + 2, landingCenterY - 25, 12, -10);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('LZ', landingCenterX + 4, landingCenterY - 32);
    }
    
    // Draw angle guide at landing zone when close
    if (Math.abs(lander.y - landingCenterY) < 300 && Math.abs(lander.x - landingCenterX) < 300) {
      const guideSize = 40 + Math.sin(beaconPulse * 4) * 5;
      
      ctx.save();
      ctx.translate(landingCenterX, landingCenterY);
      
      // Safe angle zone (green)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-guideSize * Math.sin(0.17), -guideSize * Math.cos(0.17));
      ctx.lineTo(guideSize * Math.sin(0.17), -guideSize * Math.cos(0.17));
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.fill();
      
      // Center line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -guideSize);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
      
      ctx.restore();
    }
  };
  
  // Draw lander on canvas
  const drawLander = (ctx: CanvasRenderingContext2D, lander: Lander) => {
    ctx.save();
    ctx.translate(lander.x, lander.y);
    ctx.rotate(lander.angle);
    
    // Lander base
    ctx.fillStyle = '#333';
    ctx.fillRect(-lander.width/2, -lander.height/2, lander.width, lander.height);
    
    // Lander window
    ctx.fillStyle = '#6495ed';
    ctx.beginPath();
    ctx.arc(0, -5, lander.width/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Thruster flame
    if (lander.thrusting) {
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.moveTo(-lander.width/4, lander.height/2);
      ctx.lineTo(lander.width/4, lander.height/2);
      ctx.lineTo(0, lander.height/2 + 20 + Math.random() * 10);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // Draw altitude marker on canvas
  const drawAltitudeMarker = (ctx: CanvasRenderingContext2D, lander: Lander) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(lander.x, ctx.canvas.height * 0.7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(lander.x, ctx.canvas.height * 0.7 + 5);
    ctx.lineTo(lander.x, lander.y - lander.height/2 - 5);
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  
  // Draw distance indicator to landing zone
  const drawDistanceIndicator = (ctx: CanvasRenderingContext2D, lander: Lander, landingZone: LandingZone) => {
    const landingCenterX = landingZone.x + landingZone.width / 2;
    const landingCenterY = landingZone.y;
    
    if (Math.abs(lander.x - landingCenterX) > 200 || lander.y < landingCenterY - 300) {
      const arrowX = lander.x > landingCenterX ? ctx.canvas.width - 20 : 20;
      const arrowDir = lander.x > landingCenterX ? -1 : 1;
      
      ctx.font = '12px Orbitron';
      ctx.fillStyle = '#00ff64';
      ctx.fillText('LAND HERE', arrowX + (arrowDir * 30), 50);
      
      ctx.beginPath();
      ctx.moveTo(arrowX, 40);
      ctx.lineTo(arrowX + (arrowDir * 15), 50);
      ctx.lineTo(arrowX, 60);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ff64';
      ctx.stroke();
      
      const distance = Math.floor(Math.sqrt(
        Math.pow(lander.x - landingCenterX, 2) + 
        Math.pow(lander.y - landingCenterY, 2)
      ));
      
      ctx.fillText(`${distance}m`, arrowX + (arrowDir * 30), 70);
    }
  };
  
  // Setup event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
      if (gameStarted) {
        generateTerrain(canvasRef.current.width);
        resetLander();
      }
      
      renderGame();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gameStarted, generateTerrain, resetLander, renderGame]);
  
  return (
    <GameContainer>
      <StarsBackground />
      
      <GameUI lander={lander} />
      
      <AngleIndicator angle={lander.angle} />
      
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      <Controls
        keys={keys}
        onThrustDown={() => keys['ArrowUp'] = true}
        onThrustUp={() => keys['ArrowUp'] = false}
        onLeftDown={() => keys['ArrowLeft'] = true}
        onLeftUp={() => keys['ArrowLeft'] = false}
        onRightDown={() => keys['ArrowRight'] = true}
        onRightUp={() => keys['ArrowRight'] = false}
      />
      
      <StartScreen 
        visible={!gameStarted}
        onStart={startGame}
        onShowInstructions={() => setShowInstructions(true)}
      />
      
      <EndScreen
        visible={lander.crashed || lander.landed}
        success={lander.landed}
        velocity={Math.sqrt(lander.velocityX * lander.velocityX + lander.velocityY * lander.velocityY)}
        angle={lander.angle * (180 / Math.PI)}
        onRestart={restartGame}
      />
      
      <Instructions
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </GameContainer>
  );
}; 