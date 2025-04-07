import type { LanderState } from './types';

export const LANDER_WIDTH = 30;
export const LANDER_HEIGHT = 40;

// Initial lander properties (excluding position)
export const INITIAL_LANDER_STATE: Omit<LanderState, 'x' | 'y'> = {
  width: LANDER_WIDTH,
  height: LANDER_HEIGHT,
  angle: 0,
  velocityX: 0,
  velocityY: 0,
  fuel: 100,
  thrusting: false,
  landed: false,
  crashed: false,
};

// Physics
export const GRAVITY = 0.001;
export const THRUST_FORCE = 0.05;
export const ROTATION_THRUST = 0.08; // Radians per update cycle
export const MAX_SAFE_LANDING_SPEED = 5; // m/s
export const MAX_SAFE_LANDING_ANGLE_DEG = 10; // degrees
export const FUEL_CONSUMPTION_RATE = 0.1; // fuel units per update cycle

// Terrain & Landing Zone
export const TERRAIN_SEGMENTS = 20;
export const LANDING_ZONE_WIDTH = 100; // pixels
export const LANDING_ZONE_HEIGHT_OFFSET = 5; // pixels above terrain Y

// Input Mapping
export const INPUT_MAP = {
    ArrowLeft: 'left',
    a: 'left',
    A: 'left',
    ArrowRight: 'right',
    d: 'right',
    D: 'right',
    ArrowUp: 'thrust',
    w: 'thrust',
    W: 'thrust',
    ' ': 'thrust',
} as const;

export type KeyInput = keyof typeof INPUT_MAP;
