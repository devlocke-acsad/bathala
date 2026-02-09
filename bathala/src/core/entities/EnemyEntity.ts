/**
 * EnemyEntity - Runtime enemy instance with behavior methods
 * 
 * Bridges EnemyConfig (static data) → Enemy (runtime combat state)
 * Encapsulates all enemy behavior: damage, healing, status effects, AI resolution
 * 
 * @module core/entities/EnemyEntity
 * 
 * @example
 * ```typescript
 * import { EnemyEntity } from '../../core/entities/EnemyEntity';
 * import { getEnemy } from '../../data/enemies/registry';
 * 
 * const config = getEnemy('tikbalang_scout')!;
 * const enemy = EnemyEntity.fromConfig(config, { healthMultiplier: 1.2 });
 * 
 * enemy.takeDamage(25); // applies block first
 * enemy.applyStatus('weak', 2);
 * const action = enemy.getNextAction(); // reads from attack pattern
 * ```
 */

import { Enemy, EnemyIntent, StatusEffect, CombatEntity } from '../types/CombatTypes';
import { EnemyConfig, BossConfig, isBossConfig } from '../types/EnemyTypes';
import { StatusEffectManager } from '../managers/StatusEffectManager';

// =============================================================================
// TYPES
// =============================================================================

/**
 * DDA-driven scaling options applied when spawning an enemy
 */
export interface EnemyScalingOptions {
  /** Health multiplier from DDA (e.g., 0.8 = -20%, 1.15 = +15%) */
  healthMultiplier?: number;
  /** Damage multiplier from DDA */
  damageMultiplier?: number;
  /** Static HP tier multiplier (common=8, elite=6, boss=6) */
  tierHealthMultiplier?: number;
  /** Static damage tier multiplier (common=3, elite=3, boss=3) */
  tierDamageMultiplier?: number;
}

/**
 * Result of taking damage, for UI feedback
 */
export interface DamageResult {
  /** Damage absorbed by block */
  blockedDamage: number;
  /** Damage that hit HP */
  hpDamage: number;
  /** Block remaining after hit */
  remainingBlock: number;
  /** HP remaining after hit */
  remainingHealth: number;
  /** Whether the enemy died */
  isDead: boolean;
  /** Whether overkill occurred */
  overkill: number;
}

/**
 * Result of an enemy action resolution
 */
export interface ActionResult {
  /** The action string from the pattern */
  action: string;
  /** Human-readable description */
  description: string;
  /** Damage dealt (if attack) */
  damage?: number;
  /** Block gained (if defend) */
  blockGained?: number;
  /** Status effect applied */
  statusEffect?: { id: string; stacks: number; target: 'self' | 'player' };
  /** Whether the action was skipped (e.g., stunned) */
  skipped?: boolean;
  /** Skip reason */
  skipReason?: string;
}

// =============================================================================
// DEFAULT SCALING
// =============================================================================

const DEFAULT_TIER_HEALTH: Record<string, number> = {
  common: 8,
  elite: 6,
  boss: 6,
};

const DEFAULT_TIER_DAMAGE: Record<string, number> = {
  common: 3,
  elite: 3,
  boss: 3,
};

// =============================================================================
// ENEMY ENTITY
// =============================================================================

/**
 * EnemyEntity - Living, mutable enemy instance for combat
 * 
 * Created from an EnemyConfig (static data) with optional DDA scaling.
 * All combat behavior flows through this class.
 */
export class EnemyEntity {
  // === Identity ===
  public readonly id: string;
  public readonly configId: string;
  public readonly name: string;
  public readonly tier: string;
  public readonly chapter: number;
  public readonly combatSpriteKey: string;
  public readonly overworldSpriteKey: string;
  public readonly scale: number;

  // === Combat Stats (mutable) ===
  public maxHealth: number;
  public currentHealth: number;
  public block: number;
  public damage: number;

  // === Combat Behavior ===
  public readonly attackPattern: string[];
  public readonly attackPatternType: string;
  public readonly abilities: string[];
  public currentPatternIndex: number;
  public halfHealthTriggered: boolean;

  // === Status Effects ===
  public statusEffects: StatusEffect[];

  // === Elemental ===
  public readonly elementalWeakness: string | null;
  public readonly elementalResistance: string | null;

  // === Dialogue ===
  public readonly dialogueIntro: string;
  public readonly dialogueDefeat: string;
  public readonly dialogueSpare: string;
  public readonly dialogueSlay: string;
  public readonly dialogueHalfHealth: string;

  // === Lore ===
  public readonly loreOrigin: string;
  public readonly loreReference: string;
  public readonly loreDescription: string;

  // === Boss-specific ===
  public readonly isBoss: boolean;
  public readonly phases: BossConfig['phases'] | null;
  public currentPhase: number;
  public readonly signatureMechanic: string | null;
  public readonly arenaModifiers: BossConfig['arenaModifiers'] | null;
  public readonly bossMusic: string | null;

  // === Internal ===
  private static _idCounter = 0;

  private constructor(config: EnemyConfig, scaledHealth: number, scaledDamage: number) {
    this.id = EnemyEntity.generateId(config.name);
    this.configId = config.id;
    this.name = config.name;
    this.tier = config.tier;
    this.chapter = config.chapter;
    this.combatSpriteKey = config.combatSpriteKey;
    this.overworldSpriteKey = config.overworldSpriteKey;
    this.scale = config.scale ?? 1.0;

    this.maxHealth = scaledHealth;
    this.currentHealth = scaledHealth;
    this.block = 0;
    this.damage = scaledDamage;

    this.attackPattern = [...config.attackPattern];
    this.attackPatternType = config.attackPatternType;
    this.abilities = config.abilities ? [...config.abilities] : [];
    this.currentPatternIndex = 0;
    this.halfHealthTriggered = false;

    this.statusEffects = [];

    this.elementalWeakness = config.elementalWeakness;
    this.elementalResistance = config.elementalResistance;

    this.dialogueIntro = config.dialogueIntro ?? '';
    this.dialogueDefeat = config.dialogueDefeat ?? '';
    this.dialogueSpare = config.dialogueSpare ?? '';
    this.dialogueSlay = config.dialogueSlay ?? '';
    this.dialogueHalfHealth = config.dialogueHalfHealth ?? '';

    this.loreOrigin = config.loreOrigin ?? '';
    this.loreReference = config.loreReference ?? '';
    this.loreDescription = config.loreDescription ?? '';

    // Boss-specific
    if (isBossConfig(config)) {
      this.isBoss = true;
      this.phases = config.phases;
      this.currentPhase = 1;
      this.signatureMechanic = config.signatureMechanic ?? null;
      this.arenaModifiers = config.arenaModifiers ?? null;
      this.bossMusic = config.bossMusic ?? null;
    } else {
      this.isBoss = false;
      this.phases = null;
      this.currentPhase = 0;
      this.signatureMechanic = null;
      this.arenaModifiers = null;
      this.bossMusic = null;
    }
  }

  // ===========================================================================
  // FACTORY
  // ===========================================================================

  /**
   * Create an EnemyEntity from an EnemyConfig
   * Applies tier-based HP/DMG scaling + optional DDA multipliers
   */
  static fromConfig(config: EnemyConfig, options?: EnemyScalingOptions): EnemyEntity {
    const tierHpMul = options?.tierHealthMultiplier ?? DEFAULT_TIER_HEALTH[config.tier] ?? 8;
    const tierDmgMul = options?.tierDamageMultiplier ?? DEFAULT_TIER_DAMAGE[config.tier] ?? 3;
    const ddaHpMul = options?.healthMultiplier ?? 1.0;
    const ddaDmgMul = options?.damageMultiplier ?? 1.0;

    const scaledHealth = Math.round(config.baseHealth * tierHpMul * ddaHpMul);
    const scaledDamage = Math.round(config.baseDamage * tierDmgMul * ddaDmgMul);

    return new EnemyEntity(config, scaledHealth, scaledDamage);
  }

  /**
   * Generate a unique combat ID for an enemy instance
   */
  static generateId(name: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${++EnemyEntity._idCounter}`;
  }

  // ===========================================================================
  // DAMAGE & HEALING
  // ===========================================================================

  /**
   * Apply damage to this enemy (block absorbs first)
   */
  takeDamage(amount: number): DamageResult {
    const effectiveAmount = Math.max(0, Math.round(amount));
    let blockedDamage = 0;
    let hpDamage = 0;

    if (this.block > 0) {
      blockedDamage = Math.min(this.block, effectiveAmount);
      this.block -= blockedDamage;
      hpDamage = effectiveAmount - blockedDamage;
    } else {
      hpDamage = effectiveAmount;
    }

    this.currentHealth = Math.max(0, this.currentHealth - hpDamage);

    return {
      blockedDamage,
      hpDamage,
      remainingBlock: this.block,
      remainingHealth: this.currentHealth,
      isDead: this.currentHealth <= 0,
      overkill: Math.max(0, effectiveAmount - blockedDamage - (this.currentHealth + hpDamage)),
    };
  }

  /**
   * Heal the enemy (capped at maxHealth)
   */
  heal(amount: number): number {
    const before = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + Math.max(0, amount));
    return this.currentHealth - before;
  }

  /**
   * Add block to this enemy
   */
  addBlock(amount: number): void {
    this.block += Math.max(0, amount);
  }

  /**
   * Reset block to zero (called at start of enemy turn typically)
   */
  resetBlock(): void {
    this.block = 0;
  }

  // ===========================================================================
  // STATUS EFFECTS
  // ===========================================================================

  /**
   * Apply a status effect to this enemy
   */
  applyStatus(effectId: string, stacks: number): void {
    StatusEffectManager.applyStatusEffect(this.toCombatEntity(), effectId, stacks);
  }

  /**
   * Check if this enemy has a specific status effect
   */
  hasStatus(effectId: string): boolean {
    return this.statusEffects.some(e => e.id === effectId);
  }

  /**
   * Get the stack count of a status effect
   */
  getStatusStacks(effectId: string): number {
    return this.statusEffects.find(e => e.id === effectId)?.value ?? 0;
  }

  /**
   * Remove a specific status effect
   */
  removeStatus(effectId: string): void {
    this.statusEffects = this.statusEffects.filter(e => e.id !== effectId);
  }

  /**
   * Clear all status effects
   */
  clearAllStatus(): void {
    this.statusEffects = [];
  }

  // ===========================================================================
  // COMBAT AI
  // ===========================================================================

  /**
   * Get the next action from the attack pattern
   * Does NOT advance the pattern index — call advancePattern() after execution
   */
  getNextAction(): string {
    return this.attackPattern[this.currentPatternIndex % this.attackPattern.length];
  }

  /**
   * Advance the pattern index to the next action
   */
  advancePattern(): void {
    this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPattern.length;
  }

  /**
   * Get the current intent for UI display
   */
  getCurrentIntent(): EnemyIntent {
    const action = this.getNextAction();
    return EnemyEntity.actionToIntent(action, this.damage, this.name);
  }

  /**
   * Check if enemy should trigger half-health dialogue
   */
  checkHalfHealthTrigger(): boolean {
    if (this.halfHealthTriggered) return false;
    if (this.currentHealth <= this.maxHealth / 2) {
      this.halfHealthTriggered = true;
      return true;
    }
    return false;
  }

  // ===========================================================================
  // BOSS MECHANICS
  // ===========================================================================

  /**
   * Check and transition boss phase based on current health
   * @returns The new phase number if transitioned, null otherwise
   */
  checkPhaseTransition(): number | null {
    if (!this.isBoss || !this.phases) return null;

    const healthPercent = this.currentHealth / this.maxHealth;
    for (const phase of this.phases) {
      if (phase.id > this.currentPhase && healthPercent <= phase.healthThreshold) {
        this.currentPhase = phase.id;
        // Update attack pattern to phase-specific pattern
        this.attackPattern.length = 0;
        this.attackPattern.push(...phase.attackPattern);
        this.currentPatternIndex = 0;
        return phase.id;
      }
    }
    return null;
  }

  /**
   * Get current boss phase config
   */
  getCurrentPhaseConfig(): BossConfig['phases'][number] | null {
    if (!this.isBoss || !this.phases) return null;
    return this.phases.find(p => p.id === this.currentPhase) ?? null;
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  /** Whether the enemy is alive */
  get isAlive(): boolean {
    return this.currentHealth > 0;
  }

  /** Whether the enemy is dead */
  get isDead(): boolean {
    return this.currentHealth <= 0;
  }

  /** Health as a percentage (0-1) */
  get healthPercent(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }

  /** Whether enemy is stunned (skip turn) */
  get isStunned(): boolean {
    return this.hasStatus('stunned') || this.hasStatus('stun');
  }

  /** Whether enemy is weak (reduced attack damage) */
  get isWeak(): boolean {
    return this.hasStatus('weak');
  }

  /** Get effective damage (after Weak/Strength modifiers) */
  get effectiveDamage(): number {
    let dmg = this.damage;
    // Strength bonus
    const strengthStacks = this.getStatusStacks('strength');
    if (strengthStacks > 0) {
      dmg += strengthStacks * 3;
    }
    // Weak penalty
    if (this.isWeak) {
      dmg = Math.floor(dmg * 0.75);
    }
    return Math.max(0, dmg);
  }

  // ===========================================================================
  // CONVERSION
  // ===========================================================================

  /**
   * Convert to the legacy Enemy interface for backward compatibility
   * Used during transition — existing CombatUI code expects Enemy shape
   */
  toEnemy(): Enemy {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: [...this.statusEffects],
      intent: this.getCurrentIntent(),
      damage: this.damage,
      attackPattern: [...this.attackPattern],
      currentPatternIndex: this.currentPatternIndex,
      halfHealthTriggered: this.halfHealthTriggered,
      elementalAffinity: {
        weakness: (this.elementalWeakness as any) ?? null,
        resistance: (this.elementalResistance as any) ?? null,
      },
    };
  }

  /**
   * Convert to CombatEntity for StatusEffectManager compatibility
   */
  toCombatEntity(): CombatEntity {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: this.statusEffects,
    };
  }

  /**
   * Sync mutable state from a CombatEntity back into this entity
   * Used after StatusEffectManager modifies the entity in-place
   */
  syncFromCombatEntity(entity: CombatEntity): void {
    this.currentHealth = entity.currentHealth;
    this.block = entity.block;
    this.statusEffects = entity.statusEffects;
  }

  // ===========================================================================
  // STATIC HELPERS
  // ===========================================================================

  /**
   * Convert an action string to an EnemyIntent for UI display
   */
  static actionToIntent(action: string, baseDamage: number, name: string): EnemyIntent {
    switch (action) {
      case 'attack':
        return { type: 'attack', value: baseDamage, description: `${name} attacks`, icon: '†' };
      case 'defend':
        return { type: 'defend', value: 5, description: `${name} defends`, icon: '⛨' };
      case 'strengthen':
        return { type: 'buff', value: 2, description: `${name} gains Strength`, icon: '💪' };
      case 'poison':
        return { type: 'debuff', value: 2, description: `${name} poisons`, icon: '☠️' };
      case 'weaken':
        return { type: 'debuff', value: 1, description: `${name} weakens`, icon: '⚠️' };
      case 'stun':
        return { type: 'debuff', value: 2, description: `${name} stuns`, icon: '💫' };
      case 'confuse':
      case 'disrupt_draw':
      case 'fear':
      case 'confuse_targeting':
        return { type: 'debuff', value: 1, description: `${name} disrupts`, icon: '⚠️' };
      case 'charge':
      case 'wait':
        return { type: 'defend', value: 3, description: `${name} prepares`, icon: '⏳' };
      // Boss-specific
      case 'curse_card':
        return { type: 'debuff', value: 1, description: `${name} curses cards`, icon: '🃏' };
      case 'mimic_element':
        return { type: 'buff', value: 1, description: `${name} mimics element`, icon: '🎭' };
      case 'hex_reversal':
        return { type: 'debuff', value: 1, description: `${name} reverses fates`, icon: '🔄' };
      case 'smoke_attack':
        return { type: 'attack', value: baseDamage, description: `${name} smoke attacks`, icon: '💨' };
      case 'summon_minion':
      case 'summon_smoke_minion':
        return { type: 'buff', value: 1, description: `${name} summons`, icon: '👻' };
      case 'aoe_burn':
        return { type: 'attack', value: baseDamage, description: `${name} burns all`, icon: '🔥' };
      default:
        return { type: 'attack', value: baseDamage, description: `${name} attacks`, icon: '†' };
    }
  }
}
