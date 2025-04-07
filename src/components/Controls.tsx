import React from 'react';
import type { GameInputState } from '../types';

interface ControlsProps {
  onPress: (action: keyof GameInputState) => void;
  onRelease: (action: keyof GameInputState) => void;
}

/** Renders on-screen buttons and calls onPress/onRelease handlers. */
export const Controls: React.FC<ControlsProps> = ({ onPress, onRelease }) => {
    // Prevent default and stop propagation on button events
    const handleInteraction = (e: React.TouchEvent | React.MouseEvent, action: keyof GameInputState, isPress: boolean) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up
        if (isPress) {
            onPress(action);
        } else {
            onRelease(action);
        }
    };

    return (
        <div className="controls">
            {/* Left Button */}
            <button className="control-btn left"
                onTouchStart={(e) => handleInteraction(e, 'left', true)}
                onTouchEnd={(e) => handleInteraction(e, 'left', false)}
                onMouseDown={(e) => handleInteraction(e, 'left', true)}
                onMouseUp={(e) => handleInteraction(e, 'left', false)}
                onMouseLeave={() => onRelease('left')}> {/* MouseLeave only needs release */}
                ↑ {/* Rotated via CSS */}
             </button>
            {/* Thrust Button */}
            <button className="control-btn" id="thrustBtn"
                onTouchStart={(e) => handleInteraction(e, 'thrust', true)}
                onTouchEnd={(e) => handleInteraction(e, 'thrust', false)}
                onMouseDown={(e) => handleInteraction(e, 'thrust', true)}
                onMouseUp={(e) => handleInteraction(e, 'thrust', false)}
                onMouseLeave={() => onRelease('thrust')}>
                ↑
            </button>
            {/* Right Button */}
            <button className="control-btn right"
                onTouchStart={(e) => handleInteraction(e, 'right', true)}
                onTouchEnd={(e) => handleInteraction(e, 'right', false)}
                onMouseDown={(e) => handleInteraction(e, 'right', true)}
                onMouseUp={(e) => handleInteraction(e, 'right', false)}
                onMouseLeave={() => onRelease('right')}>
                 ↑ {/* Rotated via CSS */}
            </button>
        </div>
    );
};

export default Controls;