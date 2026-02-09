/**
 * Core Entities Module
 * Runtime entity classes with encapsulated behavior
 * 
 * @module core/entities
 * @description
 * EnemyEntity: Bridges EnemyConfig (static data) → runtime combat enemy with behavior methods
 * PlayerEntity: Wraps Player data with card management, damage, healing, status effect methods
 * 
 * @see EnemyTypes for configuration interfaces
 * @see CombatTypes for runtime data shapes
 */

export { EnemyEntity } from './EnemyEntity';
export type { EnemyScalingOptions, DamageResult, ActionResult } from './EnemyEntity';
export { PlayerEntity } from './PlayerEntity';
export type { PlayerDamageResult } from './PlayerEntity';
