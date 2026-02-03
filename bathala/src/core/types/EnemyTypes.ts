/**
 * Enemy/NPC Types for Bathala
 * Defines configuration structures for enemies and combat entities
 * 
 * @module EnemyTypes
 * @description Foundation types for the Enemy class system (future NPC refactoring)
 * 
 * Content Creator Usage:
 * - Writers: Edit dialogue fields, add lore
 * - Artists: Reference spriteKey conventions
 * - Designers: Modify stats, abilities, behaviors
 * 
 * @see CombatTypes.Enemy for runtime enemy instance
 */

import { Element } from './CombatTypes';

/**
 * Enemy tier - determines encounter difficulty and rewards
 * 
 * @type {string}
 * @description
 * - common: Standard enemies, low rewards
 * - elite: Stronger enemies, better rewards (60% relic drop chance)
 * - boss: Act bosses, guaranteed rewards (100% relic drop)
 */
export type EnemyTier = 'common' | 'elite' | 'boss';

/**
 * Control type for combat entities
 * Enables future multi-entity support (e.g., summoned allies)
 * 
 * @type {string}
 */
export type ControlType = 'human' | 'ai_ally' | 'ai_enemy';

/**
 * Team affiliation for combat targeting
 * 
 * @type {string}
 */
export type Team = 'player' | 'enemy' | 'neutral';

/**
 * Pathing behavior types for overworld movement
 * Defines how enemies move and pursue the player
 * 
 * @type {string}
 * @description
 * - chase: Direct pursuit toward player
 * - ambush: Wait in hiding, then burst toward player when in range
 * - wander: Random movement within an area
 * - patrol: Fixed route movement
 * - stationary: Does not move, waits for player approach
 */
export type PathingType = 
  | 'chase'     // Direct pursuit
  | 'ambush'    // Wait then burst
  | 'wander'    // Random movement
  | 'patrol'    // Fixed route
  | 'stationary'; // Don't move

/**
 * Attack pattern types
 * Defines the combat behavior style
 * 
 * @type {string}
 */
export type AttackPatternType =
  | 'aggressive'   // High damage, low defense
  | 'defensive'    // High block, counter-attacks
  | 'tactical'     // Mixed, responds to player actions
  | 'support'      // Buffs self or allies
  | 'debuffer'     // Applies status effects
  | 'berserker'    // Gets stronger as health drops
  | 'adaptive';    // Changes pattern based on situation

/**
 * Configuration for an enemy type
 * Content creators edit these to add/modify enemies
 * 
 * @interface EnemyConfig
 * @example
 * export const TIKBALANG_SCOUT: EnemyConfig = {
 *   id: 'tikbalang_scout',
 *   name: 'Tikbalang Scout',
 *   tier: 'common',
 *   chapter: 1,
 *   baseHealth: 28,
 *   baseDamage: 8,
 *   attackPatternType: 'tactical',
 *   attackPattern: ['attack', 'attack', 'defend', 'buff'],
 *   abilities: ['confuse_targeting'],
 *   pathingType: 'wander',
 *   detectionRange: 5,
 *   activeAtNight: true,
 *   activeAtDay: true,
 *   spriteKey: 'chap1/tikbalang_scout',
 *   elementalWeakness: 'fire',
 *   elementalResistance: null,
 *   dialogueIntro: "Lost in my paths, seer? False one's whispers guide!",
 *   dialogueDefeat: "My tricks... unravel...",
 *   dialogueSpare: "Spare me: Tikbalang were forest protectors...",
 *   dialogueSlay: "End me—my essence feeds shadow!",
 *   loreOrigin: "Tagalog, mountain tricksters",
 *   loreReference: "Aswang Project – Horse-headed deceivers"
 * };
 */
export interface EnemyConfig {
  // === Identity ===
  
  /** Unique identifier (lowercase_snake_case) */
  readonly id: string;
  
  /** Display name */
  readonly name: string;
  
  /** Enemy tier (common/elite/boss) */
  readonly tier: EnemyTier;
  
  /** Which act/chapter this enemy appears in (1, 2, or 3) */
  readonly chapter: number;
  
  // === Combat Stats ===
  
  /** Base health points (scaled by DDA) */
  readonly baseHealth: number;
  
  /** Base damage per attack (scaled by DDA) */
  readonly baseDamage: number;
  
  // === Combat Behavior ===
  
  /** Type of attack pattern */
  readonly attackPatternType: AttackPatternType;
  
  /** Sequence of actions in combat */
  readonly attackPattern: readonly string[];
  
  /** Special ability IDs this enemy can use */
  readonly abilities?: readonly string[];
  
  // === Elemental ===
  
  /** Element this enemy is weak to (takes 1.5× damage) */
  readonly elementalWeakness: Element | null;
  
  /** Element this enemy resists (takes 0.75× damage) */
  readonly elementalResistance: Element | null;
  
  // === Overworld Behavior ===
  
  /** Movement/pursuit behavior type */
  readonly pathingType: PathingType;
  
  /** Detection range in tiles */
  readonly detectionRange: number;
  
  /** Whether this enemy spawns/is active at night */
  readonly activeAtNight: boolean;
  
  /** Whether this enemy spawns/is active during day */
  readonly activeAtDay: boolean;
  
  /** Movement speed multiplier (1.0 = normal) */
  readonly speedMultiplier?: number;
  
  // === Visuals (for Artists) ===
  
  /** Sprite key - Convention: chap{N}/{enemy_id} */
  readonly spriteKey: string;
  
  /** Optional portrait key for dialogue */
  readonly portraitKey?: string;
  
  /** Scale factor for sprite (default: 1.0) */
  readonly scale?: number;
  
  // === Dialogue (for Writers) ===
  
  /** Dialogue when combat begins */
  readonly dialogueIntro?: string;
  
  /** Dialogue when defeated (before spare/slay choice) */
  readonly dialogueDefeat?: string;
  
  /** Dialogue/lore revealed when spared (Mercy +1) */
  readonly dialogueSpare?: string;
  
  /** Dialogue when slain (Conquest -1) */
  readonly dialogueSlay?: string;
  
  /** Dialogue at 50% health (optional) */
  readonly dialogueHalfHealth?: string;
  
  // === Lore (for Chronicle) ===
  
  /** Cultural origin (e.g., "Tagalog, mountain tricksters") */
  readonly loreOrigin?: string;
  
  /** Reference source (e.g., "Aswang Project") */
  readonly loreReference?: string;
  
  /** Extended lore description */
  readonly loreDescription?: string;
}

/**
 * Boss phase configuration
 * Bosses can have multiple phases with different behaviors
 * 
 * @interface BossPhase
 * @example
 * const phase1: BossPhase = {
 *   id: 1,
 *   healthThreshold: 1.0,  // Starts at full health
 *   attackPattern: ['attack', 'special', 'defend'],
 *   abilities: ['curse_cards'],
 *   dialogue: "Fates reverse at my command!"
 * };
 */
export interface BossPhase {
  /** Phase identifier (1, 2, 3, etc.) */
  readonly id: number;
  
  /** Health percentage to trigger this phase (e.g., 0.5 = 50%) */
  readonly healthThreshold: number;
  
  /** Attack pattern for this phase */
  readonly attackPattern: readonly string[];
  
  /** Abilities available in this phase */
  readonly abilities: readonly string[];
  
  /** Dialogue when entering this phase */
  readonly dialogue?: string;
  
  /** Optional visual effect on phase transition */
  readonly transitionEffect?: string;
  
  /** Stat modifiers for this phase */
  readonly modifiers?: {
    readonly damageMultiplier?: number;
    readonly defenseMultiplier?: number;
    readonly speedMultiplier?: number;
  };
}

/**
 * Boss-specific configuration
 * Extends EnemyConfig with multi-phase support and special mechanics
 * 
 * @interface BossConfig
 * @extends EnemyConfig
 * @example
 * export const MANGANGAWAY_CONFIG: BossConfig = {
 *   id: 'mangangaway',
 *   name: 'Mangangaway',
 *   tier: 'boss',
 *   chapter: 1,
 *   baseHealth: 120,
 *   baseDamage: 12,
 *   // ... other EnemyConfig fields
 *   phases: [
 *     { id: 1, healthThreshold: 1.0, attackPattern: [...], abilities: [...] },
 *     { id: 2, healthThreshold: 0.5, attackPattern: [...], abilities: [...] }
 *   ],
 *   signatureMechanic: 'hex_of_reversal',
 *   arenaModifiers: { ... }
 * };
 */
export interface BossConfig extends EnemyConfig {
  /** Always 'boss' for BossConfig */
  readonly tier: 'boss';
  
  /** Boss combat phases */
  readonly phases: readonly BossPhase[];
  
  /** Signature mechanic ID (e.g., "hex_of_reversal" for Mangangaway) */
  readonly signatureMechanic?: string;
  
  /** Arena/environment modifiers during boss fight */
  readonly arenaModifiers?: {
    /** Ambient lighting change */
    readonly ambientTint?: number;
    /** Screen shake intensity */
    readonly screenShake?: number;
    /** Special particle effects */
    readonly particles?: string;
  };
  
  /** Music track for boss fight (overrides act music) */
  readonly bossMusic?: string;
}

/**
 * Enemy spawn configuration for overworld
 * Defines how and where enemies spawn
 * 
 * @interface EnemySpawnConfig
 */
export interface EnemySpawnConfig {
  /** Enemy ID to spawn */
  readonly enemyId: string;
  
  /** Weight for random selection (higher = more common) */
  readonly weight: number;
  
  /** Minimum distance from player spawn */
  readonly minDistanceFromSpawn?: number;
  
  /** Required node types for spawning (empty = anywhere) */
  readonly allowedNodeTypes?: readonly string[];
  
  /** Maximum instances of this enemy in the world */
  readonly maxInstances?: number;
}

/**
 * Enemy pool for an act
 * Used by EnemyManager to select appropriate enemies
 * 
 * @interface EnemyPool
 */
export interface EnemyPool {
  /** Act/chapter this pool belongs to */
  readonly chapter: number;
  
  /** Common enemy spawn configs */
  readonly common: readonly EnemySpawnConfig[];
  
  /** Elite enemy spawn configs */
  readonly elite: readonly EnemySpawnConfig[];
  
  /** Boss config (single boss per act) */
  readonly boss: EnemySpawnConfig;
}

/**
 * Type guard to check if a config is a BossConfig
 * 
 * @param config - EnemyConfig to check
 * @returns true if config is a BossConfig
 */
export function isBossConfig(config: EnemyConfig): config is BossConfig {
  return config.tier === 'boss' && 'phases' in config;
}
