import { useState, useEffect, JSX } from 'react';


const StarsBackground: React.FC = () => {
    const [stars, setStars] = useState<JSX.Element[]>([]);

    // Generate stars only once on component mount
    useEffect(() => {
        const newStars: JSX.Element[] = [];
        // Create 100 star elements with random properties
        for (let i = 0; i < 100; i++) {
            const size = Math.random() * 2 + 0.5; // Random size (0.5px to 2.5px)
            const style: React.CSSProperties = {
                width: `${size}px`, height: `${size}px`,
                left: `${Math.random() * 100}%`, // Random horizontal position
                top: `${Math.random() * 100}%`, // Random vertical position
                // Random animation duration and delay for twinkling effect
                animationDuration: `${1 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 2}s`,
            };
            // Add the star div element to the array
            newStars.push(<div key={i} className="star" style={style}></div>);
        }
        // Set the state with the array of star elements
        setStars(newStars);
    }, []); // Empty dependency array ensures this runs only once

    // Render the container div holding all the stars
    return <div className="stars">{stars}</div>;
};

export default StarsBackground;
