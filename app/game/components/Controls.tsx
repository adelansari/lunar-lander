import type { KeysState } from '../types/game';

interface ControlsProps {
  keys: KeysState;
  setKey: (key: string, value: boolean) => void;
}

export const Controls = ({ keys, setKey }: ControlsProps) => {
  // Direct key modifications for responsive controls
  const handleThrustDown = () => setKey('ArrowUp', true);
  const handleThrustUp = () => setKey('ArrowUp', false);
  const handleLeftDown = () => setKey('ArrowLeft', true);
  const handleLeftUp = () => setKey('ArrowLeft', false);
  const handleRightDown = () => setKey('ArrowRight', true);
  const handleRightUp = () => setKey('ArrowRight', false);

  return (
    <div className="absolute bottom-5 w-full flex justify-center gap-8 z-10">
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 transform rotate-[-90deg] ${
          keys['ArrowLeft'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={handleLeftDown}
        onMouseUp={handleLeftUp}
        onTouchStart={handleLeftDown}
        onTouchEnd={handleLeftUp}
        onTouchCancel={handleLeftUp}
        aria-label="Rotate Left"
      >
        ↑
      </button>
      
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 ${
          keys['ArrowUp'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={handleThrustDown}
        onMouseUp={handleThrustUp}
        onTouchStart={handleThrustDown}
        onTouchEnd={handleThrustUp}
        onTouchCancel={handleThrustUp}
        aria-label="Thrust"
      >
        ↑
      </button>
      
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 transform rotate-90 ${
          keys['ArrowRight'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={handleRightDown}
        onMouseUp={handleRightUp}
        onTouchStart={handleRightDown}
        onTouchEnd={handleRightUp}
        onTouchCancel={handleRightUp}
        aria-label="Rotate Right"
      >
        ↑
      </button>
    </div>
  );
}; 