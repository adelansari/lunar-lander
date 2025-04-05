interface StartScreenProps {
  visible: boolean;
  onStart: () => void;
  onShowInstructions: () => void;
}

export const StartScreen = ({ visible, onStart, onShowInstructions }: StartScreenProps) => {
  if (!visible) return null;
  
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex flex-col justify-center items-center z-20 transition-opacity duration-500">
      <h1 className="font-['Press_Start_2P'] text-5xl text-[var(--secondary-color)] shadow-[0_0_10px_var(--secondary-color)] mb-8 text-center md:text-6xl">
        LUNAR LANDER
      </h1>
      
      <p className="text-lg mb-12 text-center max-w-[600px] leading-relaxed px-4">
        Navigate your spacecraft to the moon's surface. Control your descent carefully to avoid crashing. 
        Every thruster burst uses fuel - manage it wisely!
      </p>
      
      <button 
        onClick={onStart}
        className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] border-none text-white py-4 px-8 text-lg rounded-full cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(37,117,252,0.6)] font-bold"
      >
        START MISSION
      </button>
      
      <button
        onClick={onShowInstructions}
        className="absolute top-4 right-4 bg-white/20 border-none text-white w-10 h-10 rounded-full text-xl cursor-pointer z-20"
        aria-label="Instructions"
      >
        ?
      </button>
    </div>
  );
}; 