export interface Lander {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    velocityX: number;
    velocityY: number;
    rotationSpeed: number;
    fuel: number;
    thrusting: boolean;
    crashed: boolean;
    landed: boolean;
}

export interface TerrainPoint {
    x: number;
    y: number;
}

export interface LandingZone {
    x: number;
    y: number;
    width: number;
}