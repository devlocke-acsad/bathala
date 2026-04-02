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

// Audio systems
export {
  AudioSystem,
  MusicSystem,
  MusicLifecycleSystem,
  ACTION_AUDIO_PROFILE,
  ACT_AUDIO_PROFILES,
  SCENE_AUDIO_PROFILES,
  UI_AUDIO_PROFILE,
} from './audio';
export type {
  AudioAsset,
  SceneMusicConfig,
  SoundConfig,
  SceneAudioProfile,
  ActAudioProfile,
  UIAudioProfile,
  ActionAudioProfile,
} from './audio';

// Shared / cross-scene utilities
export {
  SceneTransitionController,
  CursorManager,
  FloatingTextPool,
  CardSpritePool,
  InputSystem,
} from './shared';
export type {
  CursorStyle,
  FloatingTextOptions,
  PooledCard,
} from './shared';
