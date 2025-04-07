import { useState, useEffect } from 'react';
import type { GameAttempt, LanderState } from '../types';
import { radToDeg } from '../helpers';
import { MAX_SAFE_LANDING_ANGLE_DEG, MAX_SAFE_LANDING_SPEED } from '../constants';

interface EndScreenProps {
  status: 'landed' | 'crashed';
  lander: LanderState; // Final lander state for stats
  onRestart: () => void;
}

const HISTORY_KEY = 'lunarLanderHistory'; // Key for localStorage

const loadAttempts = (): GameAttempt[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const attempts = JSON.parse(stored) as GameAttempt[];
      return Array.isArray(attempts) ? attempts : [];
    }
  } catch (error) {
    console.error("Error loading game history:", error);
  }
  return [];
};

/** Renders the screen shown after the game ends. */
const EndScreen: React.FC<EndScreenProps> = ({ status, lander, onRestart }) => {
  const [history, setHistory] = useState<GameAttempt[]>([]);

  useEffect(() => {
    setHistory(loadAttempts());
  }, []);

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
    else scoreText += " - Missed the landing zone?";
  }

  // Helper to format timestamp
  const formatTimestamp = (ts: number): string => {
    return new Date(ts).toLocaleString(undefined, { // Use locale default format
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }


  return (
    <div className="end-screen">
      {/* Main Outcome */}
      <h2 className={messageClass}>{message}</h2>
      <p className="landing-score">{scoreText}</p>
      <button className="start-btn" onClick={onRestart}>TRY AGAIN</button>

      {/* History Table */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>Recent Attempts</h3>
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Vel (m/s)</th>
                <th>Angle (°)</th>
                <th>Fuel (%)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{formatTimestamp(attempt.timestamp)}</td>
                  <td className={attempt.status === 'landed' ? 'success-text' : 'crash-text'}>
                    {attempt.status === 'landed' ? 'Landed' : 'Crashed'}
                  </td>
                  <td>{attempt.velocity.toFixed(1)}</td>
                  <td>{attempt.angle.toFixed(1)}</td>
                  <td>{attempt.fuel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EndScreen;
