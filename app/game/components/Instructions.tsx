interface InstructionsProps {
  visible: boolean;
  onClose: () => void;
}

export const Instructions = ({ visible, onClose }: InstructionsProps) => {
  if (!visible) return null;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 p-8 rounded-lg max-w-[500px] text-center z-30">
      <h2 className="mb-4 text-[var(--secondary-color)] text-2xl">Lunar Lander Instructions</h2>
      
      <div className="space-y-2 mb-6">
        <p><strong>Objective:</strong> Land safely on the moon's surface at a speed below 5m/s.</p>
        
        <p><strong>Controls:</strong></p>
        <p>• Arrow Left/Right or A/D keys to rotate</p>
        <p>• Arrow Up or W key to fire thrusters</p>
        <p>Or use the touch controls on mobile</p>
        
        <p><strong>Landing Requirements:</strong></p>
        <p>• Velocity below 5m/s</p>
        <p>• Angle within ±10° (Upright position)</p>
        <p>• Land on the marked platform</p>
        
        <p><strong>Note:</strong> Each thruster burst uses fuel. When you run out, you have no control!</p>
      </div>
      
      <button 
        onClick={onClose}
        className="mt-4 bg-[var(--secondary-color)] border-none text-white py-2 px-4 rounded cursor-pointer"
      >
        UNDERSTOOD
      </button>
    </div>
  );
}; 