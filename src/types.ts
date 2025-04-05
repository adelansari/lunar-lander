export interface Point {
    x: number;
    y: number;
}

// Define LanderState based on INITIAL_LANDER_STATE and added x, y
export interface LanderState {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number; // Radians
    velocityX: number;
    velocityY: number;
    fuel: number;
    thrusting: boolean;
    landed: boolean;
    crashed: boolean;
}


export interface LandingZone {
    x: number;
    y: number; // Top Y coordinate of the platform
    width: number;
}

export type GameStatus = 'start' | 'playing' | 'landed' | 'crashed';

// Input state managed by useGameInput ref
export interface GameInputState {
    left: boolean;
    right: boolean;
    thrust: boolean;
}
