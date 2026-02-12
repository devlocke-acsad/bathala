/**
 * RelicEntity — Concrete class for permanent passive items (relics).
 * Encapsulates effect hooks that were previously scattered in RelicManager.
 *
 * Each relic defines its trigger points:
 *   - onAcquire, onCombatStart, onTurnStart, onTurnEnd, onHandPlayed
 */
import { ItemEntity } from './ItemEntity';

// Forward-declare a lightweight player shape to avoid circular imports.
// At runtime the actual PlayerEntity is passed.
export interface RelicOwner {
  maxHealth: number;
  currentHealth: number;
  block: number;
  discardCharges: number;
  maxDiscardCharges: number;
  statusEffects: Array<{ id: string; name: string; type: string; value: number; description: string; emoji: string; source?: unknown }>;
  relics: Array<{ id: string }>;
  hasStatusEffect(effectId: string): boolean;
  applyStatusEffect(effect: unknown): void;
  gainBlock(amount: number): void;
  heal(amount: number): number;
}

export type RelicEffectType =
  | 'start_of_combat'
  | 'start_of_turn'
  | 'end_of_turn'
  | 'hand_evaluation'
  | 'after_hand_played'
  | 'passive_combat'
  | 'permanent';

export type RelicTriggerCondition =
  | 'always'
  | 'on_flush'
  | 'on_straight_or_better'
  | 'when_no_block'
  | 'when_enemy_debuffed'
  | 'once_per_combat';

export interface RelicConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly lore?: string;
  readonly spriteKey?: string;
  readonly effectTypes?: RelicEffectType[];
  readonly triggerCondition?: RelicTriggerCondition;
}

export class RelicEntity extends ItemEntity {
  public readonly effectTypes: readonly RelicEffectType[];
  public readonly triggerCondition: RelicTriggerCondition;

  /** Tracks once-per-combat triggers. Reset on combat start. */
  private _usedThisCombat: boolean = false;

  constructor(config: RelicConfig) {
    super(
      config.id,
      config.name,
      config.description,
      config.emoji,
      config.lore ?? '',
      config.spriteKey ?? `relic_${config.id}`,
    );
    this.effectTypes = config.effectTypes ?? [];
    this.triggerCondition = config.triggerCondition ?? 'always';
  }

  // ── Lifecycle hooks (override in subclass or use default no-ops) ────

  /** Called when the relic is first acquired. */
  onAcquire(_owner: RelicOwner): void { /* no-op by default */ }

  /** Called at the start of each combat encounter. */
  onCombatStart(_owner: RelicOwner): void {
    this._usedThisCombat = false;
  }

  /** Called at the start of the owner's turn. */
  onTurnStart(_owner: RelicOwner): void { /* no-op */ }

  /** Called at the end of the owner's turn. */
  onTurnEnd(_owner: RelicOwner): void { /* no-op */ }

  /** Called after a hand is played. */
  onHandPlayed(_owner: RelicOwner, _handType?: string, _cards?: unknown[]): void { /* no-op */ }

  /** Helper to gate once-per-combat effects. */
  protected tryOncePerCombat(): boolean {
    if (this._usedThisCombat) return false;
    this._usedThisCombat = true;
    return true;
  }

  // ── Legacy compat ───────────────────────────────────

  toLegacy(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      emoji: this.emoji,
      lore: this.lore,
      spriteKey: this.spriteKey,
    };
  }

  toJSON(): Record<string, unknown> {
    return this.toLegacy();
  }
}
