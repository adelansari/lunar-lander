import { radToDeg } from '../helpers';
import { MAX_SAFE_LANDING_ANGLE_DEG } from '../constants';

interface AngleIndicatorProps {
    angle: number; // Radians
}

/** Displays the lander's angle indicator meter. */
const AngleIndicator: React.FC<AngleIndicatorProps> = ({ angle }) => {
    const angleDegrees = Math.round(radToDeg(angle));
    const clampedDegrees = Math.max(-90, Math.min(90, angleDegrees));
    const pointerPercent = ((clampedDegrees + 90) / 180) * 100;

    // Determine CSS class for angle value text based on safety
    let angleStatusClass = 'angle-value';
    if (Math.abs(angleDegrees) <= 5) angleStatusClass = 'angle-perfect';
    else if (Math.abs(angleDegrees) <= MAX_SAFE_LANDING_ANGLE_DEG) angleStatusClass = 'angle-warning';
    else angleStatusClass = 'angle-danger';

    return (
        <div className="angle-indicator">
            <div className="angle-meter">
                <div className="warning-zone"></div>
                <div className="safe-zone"></div>
                <div
                    className="angle-pointer"
                    style={{ left: `${pointerPercent}%` }}
                 ></div>
            </div>
            <div className="angle-status">
                <span>-90°</span>
                <span className={angleStatusClass}>{angleDegrees}°</span>
                <span>+90°</span>
            </div>
        </div>
    );
};

export default AngleIndicator;
