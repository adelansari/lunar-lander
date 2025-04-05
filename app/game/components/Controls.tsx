import type { KeysState } from '../types/game';

interface ControlsProps {
  keys: KeysState;
  onThrustDown: () => void;
  onThrustUp: () => void;
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
}

export const Controls = ({
  keys,
  onThrustDown,
  onThrustUp,
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp
}: ControlsProps) => {
  return (
    <div className="absolute bottom-5 w-full flex justify-center gap-8 z-10">
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 transform rotate-[-90deg] ${
          keys['ArrowLeft'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={onLeftDown}
        onMouseUp={onLeftUp}
        onTouchStart={onLeftDown}
        onTouchEnd={onLeftUp}
        aria-label="Rotate Left"
      >
        ↑
      </button>
      
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 ${
          keys['ArrowUp'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={onThrustDown}
        onMouseUp={onThrustUp}
        onTouchStart={onThrustDown}
        onTouchEnd={onThrustUp}
        aria-label="Thrust"
      >
        ↑
      </button>
      
      <button
        className={`bg-white/15 text-white border-none w-15 h-15 rounded-full text-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-2 border-white/20 transform rotate-90 ${
          keys['ArrowRight'] ? 'bg-white/30 scale-95' : ''
        }`}
        onMouseDown={onRightDown}
        onMouseUp={onRightUp}
        onTouchStart={onRightDown}
        onTouchEnd={onRightUp}
        aria-label="Rotate Right"
      >
        ↑
      </button>
    </div>
  );
}; 