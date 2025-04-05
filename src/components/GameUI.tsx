import { Lander, LandingZone } from '../game/types';

const GameUI = ({ lander, landingZone }: { lander: Lander; landingZone: LandingZone }) => {
    const calculateAltitude = () => {
        return Math.sqrt(
            (lander.x - landingZone.x) ** 2 + (lander.y - landingZone.y) ** 2
        ).toFixed(0);
    };

    return (
        <div className="game-ui">
            <div className="ui-panel">
                <div className="ui-title">ALTITUDE</div>
                <div className="ui-value">{calculateAltitude()}m</div>
            </div>
            <div className="ui-panel">
                <div className="ui-title">VELOCITY</div>
                <div className="ui-value">
                    {Math.sqrt(lander.velocityX ** 2 + lander.velocityY ** 2).toFixed(1)}m/s
                </div>
            </div>
            <div className="ui-panel">
                <div className="ui-title">FUEL</div>
                <div className="ui-value">{Math.floor(lander.fuel)}%</div>
                <div
                    className="fuel-bar"
                    style={{ width: `${lander.fuel}%` }}
                />
            </div>
        </div>
    );
};

export default GameUI;