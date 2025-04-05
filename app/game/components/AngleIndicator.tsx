interface AngleIndicatorProps {
  angle: number;
}

export const AngleIndicator = ({ angle }: AngleIndicatorProps) => {
  // Convert angle from radians to degrees
  const angleDegrees = Math.round(angle * (180 / Math.PI));
  
  // Calculate position for the angle pointer
  const pointerPos = (angleDegrees + 90) / 180 * 100;
  
  // Determine angle status color
  let angleClass = '';
  if (Math.abs(angleDegrees) < 5) {
    angleClass = 'text-green-400 font-bold';
  } else if (Math.abs(angleDegrees) < 10) {
    angleClass = 'text-yellow-400 font-bold';
  } else if (Math.abs(angleDegrees) < 20) {
    angleClass = 'text-red-400 font-bold';
  } else {
    angleClass = 'text-red-400 font-bold';
  }

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-60 h-16 bg-black/70 rounded-lg flex flex-col justify-center items-center z-10 pointer-events-none border border-white/10">
      <div className="relative w-50 h-5 bg-white/10 rounded-lg mb-1 overflow-hidden">
        {/* Warning zone (yellow) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-30 h-full bg-yellow-500/10"></div>
        
        {/* Safe zone (green) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-15 h-full bg-green-500/30"></div>
        
        {/* Angle pointer */}
        <div 
          className="absolute top-0 left-0 w-1 h-full bg-white" 
          style={{ transform: `translateX(${pointerPos}%)` }}
        ></div>
      </div>
      
      <div className="flex w-50 justify-between mt-1 text-xs">
        <span>-90°</span>
        <span className={angleClass}>{angleDegrees}°</span>
        <span>+90°</span>
      </div>
    </div>
  );
}; 