import { useEffect, useState } from 'react';
import type { Lander, TerrainPoint } from '../types/game';

interface GameUIProps {
  lander: Lander;
  terrain: TerrainPoint[];
}

export const GameUI = ({ lander, terrain }: GameUIProps) => {
  // Calculate velocity
  const velocity = Math.sqrt(lander.velocityX * lander.velocityX + lander.velocityY * lander.velocityY);
  
  // Set up client-side only values
  const [altitude, setAltitude] = useState(0);
  
  // Update altitude on client side only - now using terrain for a more accurate calculation
  useEffect(() => {
    if (terrain.length === 0) return;
    
    const calculateAltitude = () => {
      // Calculate altitude to nearest terrain point (more accurate)
      let minAltitude = Infinity;
      
      for (let i = 0; i < terrain.length; i++) {
        const dist = Math.sqrt(
          Math.pow(lander.x - terrain[i].x, 2) + 
          Math.pow(lander.y - terrain[i].y, 2)
        );
        if (dist < minAltitude) {
          minAltitude = dist;
        }
      }
      
      setAltitude(minAltitude);
    };
    
    calculateAltitude();
    
    // Update altitude when lander position changes
    const intervalId = setInterval(calculateAltitude, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [lander.x, lander.y, terrain]);
  
  // Get fuel percentage rounded down
  const fuelPercentage = Math.floor(lander.fuel);
  
  // Determine fuel bar color based on remaining fuel
  const fuelBarColor = lander.fuel < 20 
    ? 'bg-[var(--danger-color)]' 
    : lander.fuel < 50 
      ? 'bg-gradient-to-r from-[var(--danger-color)] to-[#f7b733]'
      : 'bg-gradient-to-r from-[var(--danger-color)] to-[var(--secondary-color)]';

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-10 pointer-events-none">
      <div className="bg-black/70 rounded-lg p-3 shadow-md border border-white/10">
        <div className="text-xs text-[var(--secondary-color)] mb-1">ALTITUDE</div>
        <div className="text-xl font-bold">{Math.floor(altitude)}m</div>
      </div>
      
      <div className="bg-black/70 rounded-lg p-3 shadow-md border border-white/10">
        <div className="text-xs text-[var(--secondary-color)] mb-1">VELOCITY</div>
        <div className="text-xl font-bold">{velocity.toFixed(1)}m/s</div>
      </div>
      
      <div className="bg-black/70 rounded-lg p-3 shadow-md border border-white/10">
        <div className="text-xs text-[var(--secondary-color)] mb-1">FUEL</div>
        <div className="text-xl font-bold">{fuelPercentage}%</div>
        <div className={`h-1 rounded mt-1 ${fuelBarColor}`} style={{ width: `${lander.fuel}%` }}></div>
      </div>
    </div>
  );
}; 