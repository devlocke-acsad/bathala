/**
 * Core Types Module - Centralized Type Exports
 * Single import point for all game type definitions
 * 
 * @module types
 * @description
 * This index file provides a convenient single import point for all core types.
 * 
 * @example
 * // Instead of multiple imports:
 * // import { Player } from './CombatTypes';
 * // import { ActConfig } from './ActTypes';
 * // import { EnemyConfig } from './EnemyTypes';
 * 
 * // Use single import:
 * import { Player, ActConfig, EnemyConfig } from '../core/types';
 */

// === Combat Types ===
// Card-based combat system types
export * from './CombatTypes';

// === Map Types ===
// Node-based map navigation types
export * from './MapTypes';

// === Act Types ===
// Multi-act/chapter configuration types
export * from './ActTypes';

// === Enemy Types ===
// NPC and enemy configuration types
export * from './EnemyTypes';

// === World Generator Types ===
// Procedural generation interface and types
export * from './IWorldGenerator';
