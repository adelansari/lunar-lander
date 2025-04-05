import { Lander } from '../game/types';

const GameUI = ({ lander }: { lander: Lander }) => {
  return (
    <div className="game-ui">
      <div className="ui-panel">
        <div className="ui-title">ALTITUDE</div>
        <div className="ui-value">{/* Calculate altitude */}</div>
      </div>
    </div>
  );
};

export default GameUI;