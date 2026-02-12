/**
 * CombatEntity — Abstract base for anything that participates in combat.
 * Shared by Player and Enemy. Owns health, block, status effects.
 *
 * @abstract
 */
import { GameEntity } from './GameEntity';
import { StatusEffect } from '../../types/CombatTypes';

export abstract class CombatEntity extends GameEntity {
  // ── Health ──────────────────────────────────────────
  public maxHealth: number;
  public currentHealth: number;

  // ── Defense ─────────────────────────────────────────
  public block: number;

  // ── Status Effects ──────────────────────────────────
  public statusEffects: StatusEffect[];

  // ── Position (optional, used on the overworld) ──────
  public x?: number;
  public y?: number;

  protected constructor(
    id: string,
    name: string,
    maxHealth: number,
    currentHealth?: number,
  ) {
    super(id, name);
    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth ?? maxHealth;
    this.block = 0;
    this.statusEffects = [];
  }

  // ── Health helpers ──────────────────────────────────

  /** True when currentHealth ≤ 0. */
  get isDead(): boolean {
    return this.currentHealth <= 0;
  }

  /** Percentage of health remaining (0-100). */
  get healthPercent(): number {
    return this.maxHealth > 0
      ? Math.round((this.currentHealth / this.maxHealth) * 100)
      : 0;
  }

  /**
   * Apply damage after accounting for block.
   * @returns actual HP lost.
   */
  takeDamage(amount: number): number {
    if (amount <= 0) return 0;

    let remaining = amount;

    // Consume block first
    if (this.block > 0) {
      const blocked = Math.min(this.block, remaining);
      this.block -= blocked;
      remaining -= blocked;
    }

    // Apply remaining to HP
    const hpLost = Math.min(this.currentHealth, remaining);
    this.currentHealth -= hpLost;
    return hpLost;
  }

  /**
   * Heal HP, clamped to maxHealth.
   * @returns actual HP gained.
   */
  heal(amount: number): number {
    if (amount <= 0) return 0;
    const before = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    return this.currentHealth - before;
  }

  /** Add block. */
  gainBlock(amount: number): void {
    if (amount > 0) this.block += amount;
  }

  // ── Status Effect helpers ───────────────────────────

  /** Check if the entity has a specific status effect. */
  hasStatusEffect(effectId: string): boolean {
    return this.statusEffects.some(e => e.id === effectId);
  }

  /** Get a status effect by id, or undefined. */
  getStatusEffect(effectId: string): StatusEffect | undefined {
    return this.statusEffects.find(e => e.id === effectId);
  }

  /** Add or stack a status effect. */
  applyStatusEffect(effect: StatusEffect): void {
    const existing = this.getStatusEffect(effect.id);
    if (existing) {
      existing.value += effect.value;
    } else {
      this.statusEffects.push({ ...effect });
    }
  }

  /** Remove a status effect by id. */
  removeStatusEffect(effectId: string): void {
    this.statusEffects = this.statusEffects.filter(e => e.id !== effectId);
  }

  /** Clear all status effects. */
  clearStatusEffects(): void {
    this.statusEffects = [];
  }

  // ── Abstract combat hooks ───────────────────────────

  /** Called at the start of a combat encounter. */
  abstract onCombatStart(): void;

  /** Called at the start of this entity's turn. */
  abstract onTurnStart(): void;

  /** Called at the end of this entity's turn. */
  abstract onTurnEnd(): void;

  // ── Serialisation ───────────────────────────────────

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: this.statusEffects.map(e => ({ ...e })),
    };
  }
}
