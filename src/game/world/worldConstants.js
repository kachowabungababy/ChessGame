// GBA Grid & Movement Constants

export const TILE = 16;
export const GBA_W = 240;
export const GBA_H = 160;
export const WALK_MS = 180; // ~Emerald walk speed
export const TURN_MS = 90; // Turn-in-place duration before first step
export const FOLLOW_DISTANCE = 1;

export const DIRS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const tileToPx = (t) => t * TILE + TILE / 2;
