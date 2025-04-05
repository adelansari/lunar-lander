import type { LanderState, Point } from '../types';

interface GameUIProps {
  lander: LanderState;
  terrain: Point[];
}

/** Displays Altitude, Velocity, and Fuel panels. */
const GameUI: React.FC<GameUIProps> = ({ lander, terrain }) => {

   // Calculates altitude based on terrain directly below the lander
   const calculateAltitude = (): number => {
        if (!terrain || terrain.length < 2 || !lander) return 0;

        const landerBottomY = lander.y + lander.height / 2;
        let terrainYBelow = window.innerHeight;

        for (let i = 0; i < terrain.length - 1; i++) {
            const segStart = terrain[i];
            const segEnd = terrain[i + 1];
            const minX = Math.min(segStart.x, segEnd.x);
            const maxX = Math.max(segStart.x, segEnd.x);

            if (lander.x >= minX && lander.x <= maxX) {
                 if (segEnd.x === segStart.x) {
                     terrainYBelow = Math.max(segStart.y, segEnd.y);
                 } else {
                     const t = (lander.x - segStart.x) / (segEnd.x - segStart.x);
                     const clampedT = Math.max(0, Math.min(1, t));
                     terrainYBelow = segStart.y + clampedT * (segEnd.y - segStart.y);
                 }
                 break;
            }
        }
         const altitude = Math.max(0, terrainYBelow - landerBottomY);
         return Math.floor(altitude);
    };

  const velocity = Math.sqrt(lander.velocityX ** 2 + lander.velocityY ** 2);
  const altitude = calculateAltitude();
  const fuelPercentage = Math.max(0, Math.floor(lander.fuel));

  // Determine fuel bar style
  let fuelBarStyle: React.CSSProperties = { width: `${fuelPercentage}%` };
  if (fuelPercentage < 20) fuelBarStyle.background = 'var(--danger-color)';
  else if (fuelPercentage < 50) fuelBarStyle.background = 'linear-gradient(90deg, var(--danger-color), #f7b733)';
  else fuelBarStyle.background = 'linear-gradient(90deg, var(--danger-color), var(--secondary-color))';

  return (
    <div className="game-ui">
      <div className="ui-panel">
        <div className="ui-title">ALTITUDE</div>
        <div className="ui-value">{altitude}m</div>
      </div>
      <div className="ui-panel">
        <div className="ui-title">VELOCITY</div>
        <div className="ui-value">{velocity.toFixed(1)}m/s</div>
      </div>
      <div className="ui-panel">
        <div className="ui-title">FUEL</div>
        <div className="ui-value">{fuelPercentage}%</div>
        <div className="fuel-bar" style={fuelBarStyle}></div>
      </div>
    </div>
  );
};

export default GameUI;
