import type { LanderState } from '../types';
import { radToDeg } from '../helpers';
import { MAX_SAFE_LANDING_ANGLE_DEG, MAX_SAFE_LANDING_SPEED } from '../constants';

interface EndScreenProps {
  status: 'landed' | 'crashed';
  lander: LanderState; // Final lander state for stats
  onRestart: () => void;
}

/** Renders the screen shown after the game ends. */
const EndScreen: React.FC<EndScreenProps> = ({ status, lander, onRestart }) => {
  // Calculate final stats
  const velocity = Math.sqrt(lander.velocityX ** 2 + lander.velocityY ** 2);
  const angleDegrees = Math.abs(radToDeg(lander.angle));

  // Determine message and score text based on outcome
  let message = '';
  let messageClass = '';
  let scoreText = '';

  if (status === 'landed') {
    message = 'LANDING SUCCESS!';
    messageClass = 'end-message success';
    scoreText = `Final Velocity: ${velocity.toFixed(1)}m/s | Angle: ${angleDegrees.toFixed(1)}°`;
  } else { // Crashed
    message = 'MISSION FAILED';
    messageClass = 'end-message crash';
    scoreText = `Impact Velocity: ${velocity.toFixed(1)}m/s`;
    // Add specific reasons for crash
    if (velocity >= MAX_SAFE_LANDING_SPEED) scoreText += " - Too fast!";
    else if (angleDegrees > MAX_SAFE_LANDING_ANGLE_DEG) scoreText += " - Bad angle!";
    else scoreText += " - Missed LZ?";
  }

  return (
    <div className="end-screen">
      <h2 className={messageClass}>{message}</h2>
      <p className="landing-score">{scoreText}</p>
      <button className="start-btn" onClick={onRestart}>TRY AGAIN</button>
    </div>
  );
};

export default EndScreen;
