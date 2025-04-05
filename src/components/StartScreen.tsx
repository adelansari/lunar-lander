import { FC } from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="start-screen" id="startScreen">
      <h1 className="title">LUNAR LANDER</h1>
      <p className="subtitle">
        Navigate your spacecraft to the moon's surface. Control your descent carefully to avoid crashing.
        Every thruster burst uses fuel - manage it wisely!
      </p>
      <button className="start-btn" onClick={onStart}>START MISSION</button>
    </div>
  );
};

export default StartScreen;