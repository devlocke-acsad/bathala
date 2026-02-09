/**
 * Core module barrel export.
 *
 * Provides a single import point for all core subsystems:
 *   import { CombatStateMachine, EnemyEntity, RelicEffectRegistry, … } from '../core';
 *
 * @module core
 */

// Combat systems
export {
  CombatStateMachine,
  CombatResolver,
  EnemyAIController,
  CombatLogger,
  CombatRulesEngine,
} from './combat';
export type {
  CombatPhase,
  ActionResolution,
  CombatEventKind,
  CombatMetrics,
} from './combat';

// Entities
export { EnemyEntity, PlayerEntity } from './entities';
export type { DamageResult, PlayerDamageResult } from './entities';

// Registries
export {
  RelicEffectRegistry,
  RELIC_IDS,
  StatusEffectRegistry,
  STATUS_IDS,
} from './registries';
export type {
  RelicId,
  RelicTiming,
  RelicEffectDescriptor,
  StatusId,
  EffectTiming,
  EffectCategory,
  StatusEffectEntry,
} from './registries';
