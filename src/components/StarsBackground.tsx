import React, { useState, useEffect, JSX } from 'react';

const StarsBackground: React.FC = () => {
    const [stars, setStars] = useState<JSX.Element[]>([]);

    // Generate stars only once on mount
    useEffect(() => {
        const newStars: JSX.Element[] = [];
        for (let i = 0; i < 100; i++) {
            const size = Math.random() * 3 + 1;
            const style: React.CSSProperties = {
                width: `${size}px`, height: `${size}px`,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animationDuration: `${1 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
            };
            newStars.push(<div key={i} className="star" style={style}></div>);
        }
        setStars(newStars);
    }, []);

    return <div className="stars">{stars}</div>;
};

export default StarsBackground;
