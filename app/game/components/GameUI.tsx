import type { Lander } from '../types/game';

interface GameUIProps {
  lander: Lander;
}

export const GameUI = ({ lander }: GameUIProps) => {
  // Calculate velocity
  const velocity = Math.sqrt(lander.velocityX * lander.velocityX + lander.velocityY * lander.velocityY);
  
  // Calculate approximate altitude (simplified)
  const altitude = Math.max(0, window.innerHeight - lander.y - lander.height/2 - 50);
  
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