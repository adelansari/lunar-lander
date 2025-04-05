export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

export const radToDeg = (radians: number): number => radians * (180 / Math.PI);

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(value, max));
};
