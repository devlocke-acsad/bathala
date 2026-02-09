/**
 * Systems module barrel export.
 *
 * Provides a single import point for all game systems:
 *   import { TurnSystem, DayNightController, FloatingTextPool, … } from '../systems';
 *
 * @module systems
 */

// Combat systems
export {
  TurnSystem,
  TurnPhase,
  CardSelectionSystem,
  RewardSystem,
  EnemySelectionSystem,
  ChapterProgressionSystem,
  ActContentProvider,
} from './combat';
export type {
  CardSelectionState,
  RewardInput,
  CombatReward,
  RewardEnemyTier,
  ProgressionResult,
  BossChapterMapping,
} from './combat';

// World / Overworld systems
export {
  EventSelectionSystem,
  DayNightController,
  NodeInteractionController,
  ChapterIndicatorController,
  OverworldHUD,
} from './world';

// Shared / cross-scene utilities
export {
  SceneTransitionController,
  CursorManager,
  FloatingTextPool,
  CardSpritePool,
  MusicLifecycleSystem,
  InputSystem,
} from './shared';
export type {
  CursorStyle,
  FloatingTextOptions,
  PooledCard,
} from './shared';
