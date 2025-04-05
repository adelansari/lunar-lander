import { useCallback, useState, useEffect, useRef } from 'react';
import type { Lander, TerrainPoint, LandingZone, KeysState } from '../types/game';

export const useLander = (terrain: TerrainPoint[], landingZone: LandingZone) => {
  // Server-side rendering check
  const [isClient, setIsClient] = useState(false);
  const initialized = useRef(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [lander, setLander] = useState<Lander>({
    x: 0,
    y: 0,
    width: 30,
    height: 40,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    rotationSpeed: 0,
    fuel: 100,
    thrusting: false,
    crashed: false,
    landed: false
  });

  // Constants
  const gravity = 0.0015;
  const thrust = 0.05;
  const rotationThrust = 0.08;

  // Reset lander to starting position
  const resetLander = useCallback(() => {
    if (!isClient) return;
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
    
    setLander({
      x: screenWidth / 2,
      y: 50,
      width: 30,
      height: 40,
      angle: 0,
      velocityX: 0,
      velocityY: 0,
      rotationSpeed: 0,
      fuel: 100,
      thrusting: false,
      crashed: false,
      landed: false
    });
    
    initialized.current = true;
  }, [isClient]);

  // Update lander position and physics
  const updateLander = useCallback((delta: number, keys: KeysState) => {
    if (!isClient || !initialized.current) return;
    
    setLander(prev => {
      // Skip if crashed or landed
      if (prev.crashed || prev.landed) return prev;

      // Apply rotation controls (no auto-stabilization)
      let rotationSpeed = 0;
      if (keys['ArrowLeft'] || keys['a']) {
        rotationSpeed = -rotationThrust;
      } else if (keys['ArrowRight'] || keys['d']) {
        rotationSpeed = rotationThrust;
      } else {
        rotationSpeed = 0;
      }

      // Calculate new angle
      let angle = prev.angle + rotationSpeed * delta;
      
      // Angle normalization
      if (angle < -Math.PI) {
        angle = 2 * Math.PI + angle;
      } else if (angle >= Math.PI) {
        angle = angle - 2 * Math.PI;
      }

      // Apply thrust if up is pressed and there's fuel
      let velocityX = prev.velocityX;
      let velocityY = prev.velocityY;
      let fuel = prev.fuel;
      let thrusting = false;

      if ((keys['ArrowUp'] || keys['w']) && fuel > 0) {
        thrusting = true;
        fuel -= 0.1 * delta;
        if (fuel < 0) fuel = 0;
        
        // Calculate thrust vector based on angle
        const thrustX = Math.sin(angle) * thrust * delta;
        const thrustY = -Math.cos(angle) * thrust * delta;
        
        velocityX += thrustX;
        velocityY += thrustY;
      }
      
      // Apply gravity
      velocityY += gravity * delta;
      
      // Update position
      let x = prev.x + velocityX * delta;
      let y = prev.y + velocityY * delta;
      
      // Boundary checks
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
      
      if (x < 0) {
        x = 0;
        velocityX *= -0.5; // Bounce off edge
      } else if (x > screenWidth) {
        x = screenWidth;
        velocityX *= -0.5; // Bounce off edge
      }

      return {
        ...prev,
        x,
        y,
        angle,
        velocityX,
        velocityY,
        rotationSpeed,
        fuel,
        thrusting
      };
    });
  }, [isClient]);

  // Check for collision with terrain
  const checkCollision = useCallback(() => {
    if (!isClient || !initialized.current || terrain.length === 0) return false;
    
    // Check if lander is below terrain at any point
    for (let i = 0; i < terrain.length - 1; i++) {
      const seg = terrain[i];
      const nextSeg = terrain[i + 1];
      
      // Skip if lander is not between these two segments
      if (lander.x + lander.width/2 < seg.x || lander.x - lander.width/2 > nextSeg.x) {
        continue;
      }
      
      // Linear interpolation to find terrain height at lander's x position
      const t = (lander.x - seg.x) / (nextSeg.x - seg.x);
      const terrainY = seg.y + t * (nextSeg.y - seg.y);
      
      // Check if lander has collided with terrain
      if (lander.y + lander.height/2 >= terrainY) {
        // Check if this is the landing zone
        const inLandingZone = 
          lander.x >= landingZone.x && 
          lander.x <= landingZone.x + landingZone.width;
        
        const velocity = Math.sqrt(lander.velocityX * lander.velocityX + lander.velocityY * lander.velocityY);
        const angleDegrees = Math.abs(lander.angle * (180 / Math.PI));
        
        if (inLandingZone && velocity < 5 && angleDegrees < 10) {
          // Successful landing
          setLander(prev => ({ ...prev, landed: true }));
        } else {
          // Crash
          setLander(prev => ({ ...prev, crashed: true }));
        }
        
        return true;
      }
    }
    return false;
  }, [isClient, terrain, landingZone, lander]);

  return { lander, resetLander, updateLander, checkCollision };
}; 