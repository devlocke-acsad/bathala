/**
 * Act/Chapter Types for Bathala
 * Defines configuration structures for multi-act support
 * 
 * @module ActTypes
 * @description Enables extensible act system per GDD v5.8.14.25
 * 
 * Design Principles:
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depend on abstractions, not concrete implementations
 * - Immutable configurations: readonly properties prevent accidental modification
 */

import { Suit } from './CombatTypes';

/**
 * Generator types for world generation strategies
 * Each act can use a different generation method
 * 
 * @enum {string}
 * @example
 * // Act 1 uses maze generation
 * const config: ActConfig = {
 *   generatorType: GeneratorType.MAZE,
 *   // ...
 * };
 */
export enum GeneratorType {
  /** Act 1: Forest maze (current implementation) */
  MAZE = 'maze',
  /** Act 2: Island chains connected by bridges (future) */
  ARCHIPELAGO = 'archipelago',
  /** Act 3: Floating platforms (future) */
  SKY_ISLANDS = 'sky_islands',
  /** Tutorial/Prologue: Linear progression */
  LINEAR = 'linear',
}

/**
 * Visual and elemental theme configuration for an act
 * Defines the look and feel of each chapter
 * 
 * @interface ActTheme
 * @example
 * const forestTheme: ActTheme = {
 *   primaryElements: ['Lupa', 'Hangin'],
 *   colorPalette: {
 *     primary: 0x2d4a3e,    // Forest green
 *     secondary: 0x1a2f25,  // Dark foliage
 *     accent: 0x77888C      // Mist grey
 *   }
 * };
 */
export interface ActTheme {
  /** Primary elemental focus (e.g., Lupa/Hangin for Act 1) */
  readonly primaryElements: readonly Suit[];
  /** Color palette for UI and visual theming */
  readonly colorPalette: {
    readonly primary: number;   // Main color (hex)
    readonly secondary: number; // Secondary color (hex)
    readonly accent: number;    // Accent color (hex)
  };
}

/**
 * Generator-specific configuration options
 * Extensible for different generation strategies
 * 
 * @interface GeneratorConfig
 */
export interface GeneratorConfig {
  /** Random seed for reproducible generation */
  readonly seed?: number;
  /** Size of each chunk in tiles */
  readonly chunkSize?: number;
  /** Path width for maze generation */
  readonly pathWidth?: number;
  /** Chance for room generation (0-1) */
  readonly roomChance?: number;
  /** Additional generator-specific options */
  readonly [key: string]: unknown;
}

/**
 * Complete configuration for a game Act/Chapter
 * Immutable to prevent accidental modification during runtime
 * 
 * Content creators can define new acts by implementing this interface.
 * 
 * @interface ActConfig
 * @example
 * // Define Act 1 configuration
 * export const ACT1_CONFIG: ActConfig = {
 *   id: 1,
 *   name: "Chapter 1",
 *   subtitle: "The Corrupted Ancestral Forests",
 *   theme: forestTheme,
 *   generatorType: GeneratorType.MAZE,
 *   generatorConfig: { chunkSize: 32, pathWidth: 1, roomChance: 0.15 },
 *   commonEnemyIds: ['tikbalang_scout', 'balete_wraith', ...],
 *   eliteEnemyIds: ['tawong_lipod', 'mangangaway'],
 *   bossId: 'kapre_shade',
 *   eventIds: ['anito_shrine', 'balete_vision', ...],
 *   relicIds: ['tikbalangs_hoof', 'balete_root', ...],
 *   backgroundKey: 'forest_bg',
 *   musicKey: 'overworld_ambient',
 *   requiredCyclesToBoss: 5,
 *   actionsPerCycle: 100
 * };
 */
export interface ActConfig {
  /** Unique identifier for the act (1, 2, 3, etc.) */
  readonly id: number;
  
  /** Display name (e.g., "Chapter 1") */
  readonly name: string;
  
  /** Subtitle/description (e.g., "The Corrupted Ancestral Forests") */
  readonly subtitle: string;
  
  /** Visual and elemental theme */
  readonly theme: ActTheme;
  
  // === Generation ===
  
  /** Type of world generation to use */
  readonly generatorType: GeneratorType;
  
  /** Configuration passed to the generator */
  readonly generatorConfig: GeneratorConfig;
  
  // === Content References ===
  // Using IDs instead of full objects for decoupling
  
  /** IDs of common enemies that spawn in this act */
  readonly commonEnemyIds: readonly string[];
  
  /** IDs of elite enemies that spawn in this act */
  readonly eliteEnemyIds: readonly string[];
  
  /** ID of the boss for this act */
  readonly bossId: string;
  
  /** IDs of events available in this act */
  readonly eventIds: readonly string[];
  
  /** IDs of relics that can drop in this act */
  readonly relicIds: readonly string[];
  
  // === Assets ===
  
  /** Background image key for overworld */
  readonly backgroundKey: string;
  
  /** Music track key for overworld */
  readonly musicKey: string;
  
  /** Optional ambient sound keys */
  readonly ambientSounds?: readonly string[];
  
  // === Progression ===
  
  /** Number of day/night cycles before boss spawns (default: 5) */
  readonly requiredCyclesToBoss: number;
  
  /** Actions per full cycle (day + night, default: 100) */
  readonly actionsPerCycle: number;
}

/**
 * Minimal act info for UI display and selection
 * Used when full config is not needed
 * 
 * @interface ActInfo
 */
export interface ActInfo {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly unlocked: boolean;
  readonly completed: boolean;
}

/**
 * Act transition data passed between scenes
 * 
 * @interface ActTransitionData
 */
export interface ActTransitionData {
  readonly fromActId: number;
  readonly toActId: number;
  readonly reason: 'boss_victory' | 'debug' | 'save_load';
}
