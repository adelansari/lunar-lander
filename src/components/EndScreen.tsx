import { FC } from 'react';

interface EndScreenProps {
    status: 'crashed' | 'landed';
    onRestart: () => void;
}

const EndScreen: FC<EndScreenProps> = ({ status, onRestart }) => {
    return (
        <div className="end-screen">
            <h2 className={`end-message ${status}`}>
                {status === 'landed' ? 'LANDING SUCCESS!' : 'MISSION FAILED'}
            </h2>
            <button className="start-btn" onClick={onRestart}>TRY AGAIN</button>
        </div>
    );
};

export default EndScreen;