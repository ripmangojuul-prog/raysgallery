/**
 * Mutable game state for high-frequency frame updates.
 * Read/written directly in useFrame loops — NOT React state.
 */
export const gameState = {
  position: [0, 1.7, 12],
  rotation: 0,
  isMoving: false,
  bobTimer: 0,
  floatTimer: 0,
}
