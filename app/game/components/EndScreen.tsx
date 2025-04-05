interface EndScreenProps {
  visible: boolean;
  success: boolean;
  velocity: number;
  angle: number;
  onRestart: () => void;
}

export const EndScreen = ({ visible, success, velocity, angle, onRestart }: EndScreenProps) => {
  if (!visible) return null;
  
  // Generate message based on landing success or failure
  let message = '';
  let scoreMessage = '';
  
  if (success) {
    message = "LANDING SUCCESS!";
    scoreMessage = `Landing Velocity: ${velocity.toFixed(1)}m/s | Angle: ${Math.abs(angle).toFixed(1)}°`;
  } else {
    message = "MISSION FAILED";
    scoreMessage = `Impact Velocity: ${velocity.toFixed(1)}m/s`;
    
    if (velocity >= 10) {
      scoreMessage += " - You smashed to pieces!";
    } else if (Math.abs(angle) >= 10) {
      scoreMessage += " - Bad landing angle!";
    } else {
      scoreMessage += " - Wrong landing spot!";
    }
  }
  
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex flex-col justify-center items-center z-20 transition-opacity duration-500">
      <h2 className={`text-4xl mb-8 text-center ${success ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
        {message}
      </h2>
      
      <p className="text-xl mb-8 text-center">
        {scoreMessage}
      </p>
      
      <button 
        onClick={onRestart}
        className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] border-none text-white py-4 px-8 text-lg rounded-full cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(37,117,252,0.6)] font-bold"
      >
        TRY AGAIN
      </button>
    </div>
  );
}; 