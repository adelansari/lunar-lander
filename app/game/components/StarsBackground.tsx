import { useEffect, useState } from 'react';

interface Star {
  id: number;
  size: number;
  top: string;
  left: string;
  duration: string;
}

export const StarsBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    const starsArray: Star[] = [];

    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 3;
      const star: Star = {
        id: i,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${1 + Math.random() * 4}s`
      };
      starsArray.push(star);
    }

    setStars(starsArray);
  }, []);

  if (!isClient) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-[1]">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle bg-white/80"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}; 