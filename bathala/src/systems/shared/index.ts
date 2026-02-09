/**
 * Shared systems barrel export.
 *
 * Re-exports every cross-scene utility so consumers can do:
 *   import { SceneTransitionController, CursorManager, … } from '../systems/shared';
 *
 * @module systems/shared
 */

export { SceneTransitionController } from './SceneTransitionController';
export { CursorManager } from './CursorManager';
export type { CursorStyle } from './CursorManager';
export { FloatingTextPool } from './FloatingTextPool';
export type { FloatingTextOptions } from './FloatingTextPool';
export { CardSpritePool } from './CardSpritePool';
export type { PooledCard } from './CardSpritePool';
export { MusicLifecycleSystem } from './MusicLifecycleSystem';
export { InputSystem } from './InputSystem';
