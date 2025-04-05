import type { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
}

export const GameContainer = ({ children }: GameContainerProps) => {
  return (
    <div className="relative w-full h-screen flex flex-col justify-between overflow-hidden">
      {children}
    </div>
  );
}; 