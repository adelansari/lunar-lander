import type { GameInputState } from '../types';

interface ControlsProps {
  onPress: (action: keyof GameInputState) => void;
  onRelease: (action: keyof GameInputState) => void;
}

/** Renders on-screen buttons and calls onPress/onRelease handlers. */
export const Controls: React.FC<ControlsProps> = ({ onPress, onRelease }) => {
    // Prevent default touch/mouse behaviors on buttons
    const preventDefault = (e: React.TouchEvent | React.MouseEvent) => e.preventDefault();

    return (
        <div className="controls">
            {/* Left Button */}
            <button className="control-btn left"
                onTouchStart={(e)=>{preventDefault(e); onPress('left');}}
                onTouchEnd={(e)=>{preventDefault(e); onRelease('left');}}
                onMouseDown={(e)=>{preventDefault(e); onPress('left');}}
                onMouseUp={(e)=>{preventDefault(e); onRelease('left');}}
                onMouseLeave={()=>onRelease('left')}>
                ↑ {/* Rotated via CSS */}
             </button>
            {/* Thrust Button */}
            <button className="control-btn" id="thrustBtn"
                onTouchStart={(e)=>{preventDefault(e); onPress('thrust');}}
                onTouchEnd={(e)=>{preventDefault(e); onRelease('thrust');}}
                onMouseDown={(e)=>{preventDefault(e); onPress('thrust');}}
                onMouseUp={(e)=>{preventDefault(e); onRelease('thrust');}}
                onMouseLeave={()=>onRelease('thrust')}>
                ↑
            </button>
            {/* Right Button */}
            <button className="control-btn right"
                onTouchStart={(e)=>{preventDefault(e); onPress('right');}}
                onTouchEnd={(e)=>{preventDefault(e); onRelease('right');}}
                onMouseDown={(e)=>{preventDefault(e); onPress('right');}}
                onMouseUp={(e)=>{preventDefault(e); onRelease('right');}}
                onMouseLeave={()=>onRelease('right')}>
                 ↑ {/* Rotated via CSS */}
            </button>
        </div>
    );
};

export default Controls;
