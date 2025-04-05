import { MAX_SAFE_LANDING_ANGLE_DEG, MAX_SAFE_LANDING_SPEED } from '../constants';

interface StartScreenProps {
  onStart: () => void;
  onShowHelp: () => void;
}

/** Renders the initial screen before the game starts. */
const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowHelp }) => (
  <div className="start-screen">
    <h1 className="title">LUNAR LANDER</h1>
    <p className="subtitle">
        Land safely on the green platform. Watch your speed (&lt;{MAX_SAFE_LANDING_SPEED}m/s)
        and angle (&lt;{MAX_SAFE_LANDING_ANGLE_DEG}°). Use thrusters wisely to conserve fuel.
    </p>
    <button className="start-btn" onClick={onStart}>START MISSION</button>
    <button className="help-btn" onClick={onShowHelp}>?</button>
  </div>
);

export default StartScreen;
