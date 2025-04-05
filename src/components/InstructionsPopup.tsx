// src/components/InstructionsPopup.tsx
import React from 'react';
import { MAX_SAFE_LANDING_ANGLE_DEG, MAX_SAFE_LANDING_SPEED } from '../constants';

interface InstructionsPopupProps {
    onClose: () => void;
}

/** Renders a popup displaying game instructions. */
const InstructionsPopup: React.FC<InstructionsPopupProps> = ({ onClose }) => (
    <div className="instructions">
        <h2>Instructions</h2>
        <p><strong>Objective:</strong> Land safely on the green platform.</p>
        <p><strong>Controls:</strong></p>
        <p>• Arrow Keys / A / D: Rotate</p>
        <p>• Arrow Up / W / Space: Thrust</p>
        <p>• Or use the touch controls</p>
        <p><strong>Safe Landing:</strong></p>
        <p>• Velocity &lt; {MAX_SAFE_LANDING_SPEED}m/s</p>
        <p>• Angle &lt; ±{MAX_SAFE_LANDING_ANGLE_DEG}°</p>
        <p>• On the green landing zone</p>
        <p><strong>Watch your fuel!</strong></p>
        <button className="close-btn" onClick={onClose}>CLOSE</button>
    </div>
);

export default InstructionsPopup;
