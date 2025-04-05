import { useCallback, useState, useEffect, useRef } from 'react';
import type { Lander, TerrainPoint, LandingZone, KeysState } from '../types/game';

export const useLander = (terrain: TerrainPoint[], landingZone: LandingZone) => {
  // Server-side rendering check
  const [isClient, setIsClient] = useState(false);
  const initialized = useRef(false);
  const frameTimeRef = useRef<number | null>(null);
  const landerRef = useRef<Lander>({
    x: 0,
    y: 0,
    width: 30,
    height: 40,
    angle: 0,
    velocityX: 0,
    velocityY: 0.1, // Start with a small downward velocity
    rotationSpeed: 0,
    fuel: 100,
    thrusting: false,
    crashed: false,
    landed: false
  });
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // State to trigger renders - refs for actual logic
  const [lander, setLander] = useState<Lander>(landerRef.current);

  // Constants - match the original values exactly
  const gravity = 0.0015;
  const thrust = 0.05;
  const rotationThrust = 0.08;

  // Reset lander to starting position
  const resetLander = useCallback(() => {
    if (!isClient) return;
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
    
    // Update both ref and state
    const newLander = {
      x: screenWidth / 2,
      y: 50,
      width: 30,
      height: 40,
      angle: 0,
      velocityX: 0,
      velocityY: 0, // Start with no velocity, just like the original
      rotationSpeed: 0,
      fuel: 100,
      thrusting: false,
      crashed: false,
      landed: false
    };
    
    landerRef.current = newLander;
    setLander(newLander);
    
    initialized.current = true;
    frameTimeRef.current = null;
    
    console.log("Lander reset to:", newLander.x.toFixed(1), newLander.y.toFixed(1));
  }, [isClient]);

  // Update lander position and physics
  const updateLander = useCallback((delta: number, keys: KeysState) => {
    if (!isClient || !initialized.current) return;
    
    // Skip if crashed or landed
    if (landerRef.current.crashed || landerRef.current.landed) return;

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
    let angle = landerRef.current.angle + rotationSpeed * delta;
    
    // Angle normalization - match the original code exactly
    if (angle < -Math.PI) {
      angle = 2 * Math.PI + angle;
    } else if (angle >= Math.PI) {
      angle = angle - 2 * Math.PI;
    }

    // Apply thrust if up is pressed and there's fuel
    let velocityX = landerRef.current.velocityX;
    let velocityY = landerRef.current.velocityY;
    let fuel = landerRef.current.fuel;
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
    
    // Apply gravity - use the exact formula from the original
    velocityY += gravity * delta;
    
    // Update position
    let x = landerRef.current.x + velocityX * delta;
    let y = landerRef.current.y + velocityY * delta;
    
    // Boundary checks
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
    
    if (x < 0) {
      x = 0;
      velocityX *= -0.5; // Bounce off edge
    } else if (x > screenWidth) {
      x = screenWidth;
      velocityX *= -0.5; // Bounce off edge
    }

    // Log position every 100 pixels
    if (Math.floor(landerRef.current.y / 100) !== Math.floor(y / 100)) {
      console.log(`Lander at: ${y.toFixed(1)}, velocityY: ${velocityY.toFixed(3)}, gravity per frame: ${(gravity * delta).toFixed(5)}`);
    }

    // Update ref
    landerRef.current = {
      ...landerRef.current,
      x,
      y,
      angle,
      velocityX,
      velocityY,
      rotationSpeed,
      fuel,
      thrusting
    };
    
    // Update state to trigger rerender
    setLander(landerRef.current);
  }, [isClient]);

  // Check for collision with terrain
  const checkCollision = useCallback(() => {
    if (!isClient || !initialized.current || terrain.length === 0) return false;
    
    const currentLander = landerRef.current;
    
    // Check if lander is below terrain at any point
    for (let i = 0; i < terrain.length - 1; i++) {
      const seg = terrain[i];
      const nextSeg = terrain[i + 1];
      
      // Skip if lander is not between these two segments
      if (currentLander.x + currentLander.width/2 < seg.x || 
          currentLander.x - currentLander.width/2 > nextSeg.x) {
        continue;
      }
      
      // Linear interpolation to find terrain height at lander's x position
      const t = (currentLander.x - seg.x) / (nextSeg.x - seg.x);
      const terrainY = seg.y + t * (nextSeg.y - seg.y);
      
      // Check if lander has collided with terrain
      if (currentLander.y + currentLander.height/2 >= terrainY) {
        // Check if this is the landing zone
        const inLandingZone = 
          currentLander.x >= landingZone.x && 
          currentLander.x <= landingZone.x + landingZone.width;
        
        const velocity = Math.sqrt(
          currentLander.velocityX * currentLander.velocityX + 
          currentLander.velocityY * currentLander.velocityY
        );
        const angleDegrees = Math.abs(currentLander.angle * (180 / Math.PI));
        
        console.log(`Collision! Velocity: ${velocity.toFixed(2)}, Angle: ${angleDegrees.toFixed(1)}°, In landing zone: ${inLandingZone}`);
        
        if (inLandingZone && velocity < 5 && angleDegrees < 10) {
          // Successful landing
          const landedLander = { ...currentLander, landed: true };
          landerRef.current = landedLander;
          setLander(landedLander);
          console.log("Successful landing!");
        } else {
          // Crash
          const crashedLander = { ...currentLander, crashed: true };
          landerRef.current = crashedLander;
          setLander(crashedLander);
          console.log("Crash! Reason:", 
            velocity >= 5 ? "Too fast! " : "",
            angleDegrees >= 10 ? "Bad angle! " : "",
            !inLandingZone ? "Missed landing zone! " : ""
          );
        }
        
        return true;
      }
    }
    return false;
  }, [isClient, terrain, landingZone]);

  return { lander, resetLander, updateLander, checkCollision };
}; 