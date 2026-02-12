/**
 * EnemyEntity — Concrete class representing an enemy in combat.
 * Encapsulates all data that was previously split between
 * EnemyConfig (creatures/*.ts) and the runtime Enemy interface.
 *
 * This is the single source of truth for:
 *   - combat stats (health, damage, attack patterns)
 *   - visuals (combatSpriteKey, overworldSpriteKey)
 *   - dialogue (intro, defeat, spare, slay)
 *   - lore (description, origin, reference)
 *   - elemental affinity
 */
import { CombatEntity } from './base/CombatEntity';
import {
  EnemyIntent,
  ElementalAffinity,
  StatusEffect,
} from '../types/CombatTypes';

// ── Supporting types ──────────────────────────────────

export type EnemyTier = 'common' | 'elite' | 'boss';

export interface EnemyDialogue {
  readonly intro: string;
  readonly defeat: string;
  readonly spare: string;
  readonly slay: string;
}

export interface EnemyLore {
  readonly description: string;
  readonly origin: string;
  readonly reference: string;
}

export interface EnemyConfig {
  readonly id: string;
  readonly name: string;
  readonly tier: EnemyTier;
  readonly chapter: number;

  // ── Combat stats ────────────────────────────────────
  readonly maxHealth: number;
  readonly damage: number;
  readonly attackPattern: string[];
  readonly elementalAffinity: ElementalAffinity;
  readonly initialStatusEffects?: StatusEffect[];

  // ── Visuals ─────────────────────────────────────────
  readonly combatSpriteKey: string;
  readonly overworldSpriteKey: string;

  // ── Intent (initial) ────────────────────────────────
  readonly intent: EnemyIntent;

  // ── Dialogue ────────────────────────────────────────
  readonly dialogue: EnemyDialogue;

  // ── Lore ────────────────────────────────────────────
  readonly lore: EnemyLore;
}

// ── EnemyEntity class ─────────────────────────────────

export class EnemyEntity extends CombatEntity {
  /** Enemy tier (common, elite, boss). */
  public readonly tier: EnemyTier;

  /** Chapter/act this enemy belongs to. */
  public readonly chapter: number;

  /** Base damage per attack action. */
  public damage: number;

  /** Ordered list of action types the enemy cycles through. */
  public readonly attackPattern: readonly string[];

  /** Index into attackPattern for the current turn. */
  public currentPatternIndex: number;

  /** Elemental weakness / resistance. */
  public readonly elementalAffinity: ElementalAffinity;

  /** Current intent — visible to the player. */
  public intent: EnemyIntent;

  /** Whether the 50 % health dialogue has fired. */
  public halfHealthTriggered: boolean;

  // ── Visuals ─────────────────────────────────────────

  /** Texture key for the combat scene sprite. */
  public readonly combatSpriteKey: string;

  /** Texture key for the overworld map sprite. */
  public readonly overworldSpriteKey: string;

  // ── Dialogue & Lore ─────────────────────────────────

  public readonly dialogue: EnemyDialogue;
  public readonly lore: EnemyLore;

  // ── Construction ────────────────────────────────────

  constructor(config: EnemyConfig) {
    super(config.id, config.name, config.maxHealth);

    this.tier = config.tier;
    this.chapter = config.chapter;
    this.damage = config.damage;
    this.attackPattern = config.attackPattern;
    this.currentPatternIndex = 0;
    this.elementalAffinity = { ...config.elementalAffinity };
    this.intent = { ...config.intent };
    this.halfHealthTriggered = false;

    this.combatSpriteKey = config.combatSpriteKey;
    this.overworldSpriteKey = config.overworldSpriteKey;

    this.dialogue = config.dialogue;
    this.lore = config.lore;

    // Apply initial status effects (e.g. Tawong Lipod innate Dexterity)
    if (config.initialStatusEffects) {
      for (const effect of config.initialStatusEffects) {
        this.applyStatusEffect(effect);
      }
    }
  }

  // ── Combat hooks ────────────────────────────────────

  onCombatStart(): void {
    this.currentPatternIndex = 0;
    this.halfHealthTriggered = false;
    this.updateIntent();
  }

  onTurnStart(): void {
    this.updateIntent();
  }

  onTurnEnd(): void {
    this.advancePattern();
  }

  // ── Pattern helpers ─────────────────────────────────

  /** Get the current action from the attack pattern. */
  get currentAction(): string {
    return this.attackPattern[this.currentPatternIndex % this.attackPattern.length];
  }

  /** Advance to the next step in the attack pattern. */
  advancePattern(): void {
    this.currentPatternIndex =
      (this.currentPatternIndex + 1) % this.attackPattern.length;
    this.updateIntent();
  }

  /**
   * Synchronise the public `intent` field with the current pattern step.
   * Handles all action types used across Acts 1-3 creature configs.
   */
  updateIntent(): void {
    const action = this.currentAction;
    switch (action) {
      case 'attack':
        this.intent = { type: 'attack', value: this.damage, description: `Attacks for ${this.damage} damage`, icon: '†' };
        break;
      case 'defend':
        this.intent = { type: 'defend', value: 5, description: 'Gains 5 block', icon: '⛨' };
        break;
      case 'strengthen':
        this.intent = { type: 'buff', value: 2, description: 'Gains 2 Strength', icon: '💪' };
        break;
      case 'weaken':
        this.intent = { type: 'debuff', value: 1, description: 'Applies 1 Weak', icon: '⚠️' };
        break;
      case 'poison':
        this.intent = { type: 'debuff', value: 2, description: 'Applies 2 Poison', icon: '☠️' };
        break;
      case 'stun':
      case 'charm':
        this.intent = { type: 'debuff', value: 1, description: 'Stuns (Skip turn)', icon: '💫' };
        break;
      case 'confuse':
      case 'disrupt_draw':
      case 'fear':
        this.intent = { type: 'debuff', value: 1, description: 'Stuns (Skip turn)', icon: '💫' };
        break;
      case 'charge':
      case 'wait':
        this.intent = { type: 'defend', value: 3, description: 'Prepares (3 block)', icon: '⏳' };
        break;
      default:
        this.intent = { type: 'attack', value: this.damage, description: `Special Attack (${this.damage})`, icon: '†' };
    }
  }

  // ── Compatibility adapter ───────────────────────────

  /**
   * Convert this class instance to the legacy `Omit<Enemy, 'id'>` shape
   * so existing systems (Combat.ts, etc.) keep working during migration.
   */
  toLegacyEnemy(): Record<string, unknown> {
    return {
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: this.statusEffects.map(e => ({ ...e })),
      intent: { ...this.intent },
      damage: this.damage,
      attackPattern: [...this.attackPattern],
      currentPatternIndex: this.currentPatternIndex,
      halfHealthTriggered: this.halfHealthTriggered,
      elementalAffinity: { ...this.elementalAffinity },
    };
  }

  // ── Clone / factory helper ──────────────────────────

  /** Create a fresh runtime instance from the same config (new HP, etc.). */
  clone(): EnemyEntity {
    return new EnemyEntity({
      id: this.id,
      name: this.name,
      tier: this.tier,
      chapter: this.chapter,
      maxHealth: this.maxHealth,
      damage: this.damage,
      attackPattern: [...this.attackPattern],
      elementalAffinity: { ...this.elementalAffinity },
      initialStatusEffects: this.statusEffects.map(e => ({ ...e })),
      combatSpriteKey: this.combatSpriteKey,
      overworldSpriteKey: this.overworldSpriteKey,
      intent: { ...this.intent },
      dialogue: this.dialogue,
      lore: this.lore,
    });
  }

  // ── Serialisation ───────────────────────────────────

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      tier: this.tier,
      chapter: this.chapter,
      damage: this.damage,
      attackPattern: [...this.attackPattern],
      currentPatternIndex: this.currentPatternIndex,
      elementalAffinity: { ...this.elementalAffinity },
      combatSpriteKey: this.combatSpriteKey,
      overworldSpriteKey: this.overworldSpriteKey,
      dialogue: this.dialogue,
      lore: this.lore,
    };
  }
}
