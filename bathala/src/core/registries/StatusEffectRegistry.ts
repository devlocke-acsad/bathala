/**
 * StatusEffectRegistry - Read-only queryable registry for status effects.
 *
 * Mirrors the definitions that StatusEffectManager registers at runtime but
 * in a **static, import-time-available** form.  This lets UI components
 * (tooltips, previews, DDA) reason about effects without calling
 * `StatusEffectManager.initialize()` first.
 *
 * StatusEffectManager remains the canonical runtime owner (apply/tick/remove).
 * This registry is the *reference catalogue*.
 *
 * @module core/registries/StatusEffectRegistry
 */

// ── Types ─────────────────────────────────────────────────────────────

export type EffectTiming = 'start_of_turn' | 'end_of_turn' | 'on_apply' | 'persistent';
export type EffectCategory = 'buff' | 'debuff';

export interface StatusEffectEntry {
  id: string;
  name: string;
  category: EffectCategory;
  emoji: string;
  timing: EffectTiming;
  stackable: boolean;
  maxStacks?: number;
  /** Per-stack multiplier used in damage/block calculations. */
  perStackValue: number;
  /** Human-readable description for tooltips. */
  description: string;
}

// ── Effect ID Constants ───────────────────────────────────────────────

export const STATUS_IDS = {
  POISON: 'poison',
  WEAK: 'weak',
  PLATED_ARMOR: 'plated_armor',
  REGENERATION: 'regeneration',
  STRENGTH: 'strength',
  VULNERABLE: 'vulnerable',
  FRAIL: 'frail',
  RITUAL: 'ritual',
} as const;

export type StatusId = (typeof STATUS_IDS)[keyof typeof STATUS_IDS];

// ── Registry Data ─────────────────────────────────────────────────────

const ENTRIES: ReadonlyMap<StatusId, StatusEffectEntry> = new Map<StatusId, StatusEffectEntry>([
  [STATUS_IDS.POISON, {
    id: STATUS_IDS.POISON,
    name: 'Poison',
    category: 'debuff',
    emoji: '☠️',
    timing: 'start_of_turn',
    stackable: true,
    perStackValue: 2,
    description: 'Deals 2 damage per stack at start of turn, then loses 1 stack.',
  }],

  [STATUS_IDS.WEAK, {
    id: STATUS_IDS.WEAK,
    name: 'Weak',
    category: 'debuff',
    emoji: '💫',
    timing: 'persistent',
    stackable: true,
    maxStacks: 3,
    perStackValue: 0.25,
    description: 'Attack actions deal 25% less damage per stack.',
  }],

  [STATUS_IDS.PLATED_ARMOR, {
    id: STATUS_IDS.PLATED_ARMOR,
    name: 'Plated Armor',
    category: 'buff',
    emoji: '🛡️',
    timing: 'start_of_turn',
    stackable: true,
    perStackValue: 3,
    description: 'Grants 3 block per stack at start of turn, then loses 1 stack.',
  }],

  [STATUS_IDS.REGENERATION, {
    id: STATUS_IDS.REGENERATION,
    name: 'Regeneration',
    category: 'buff',
    emoji: '💚',
    timing: 'start_of_turn',
    stackable: true,
    perStackValue: 2,
    description: 'Heals 2 HP per stack at start of turn, then loses 1 stack.',
  }],

  [STATUS_IDS.STRENGTH, {
    id: STATUS_IDS.STRENGTH,
    name: 'Strength',
    category: 'buff',
    emoji: '⚔️',
    timing: 'persistent',
    stackable: true,
    perStackValue: 3,
    description: '+3 damage per stack on attack actions.',
  }],

  [STATUS_IDS.VULNERABLE, {
    id: STATUS_IDS.VULNERABLE,
    name: 'Vulnerable',
    category: 'debuff',
    emoji: '🎯',
    timing: 'persistent',
    stackable: false,
    perStackValue: 0.5,
    description: 'Takes 50% more damage from all sources.',
  }],

  [STATUS_IDS.FRAIL, {
    id: STATUS_IDS.FRAIL,
    name: 'Frail',
    category: 'debuff',
    emoji: '🦴',
    timing: 'persistent',
    stackable: true,
    maxStacks: 3,
    perStackValue: 0.25,
    description: 'Defend actions grant 25% less block per stack.',
  }],

  [STATUS_IDS.RITUAL, {
    id: STATUS_IDS.RITUAL,
    name: 'Ritual',
    category: 'buff',
    emoji: '🕯️',
    timing: 'end_of_turn',
    stackable: true,
    perStackValue: 1,
    description: 'At end of turn, gain Strength equal to Ritual stacks.',
  }],
]);

// ── Public API ────────────────────────────────────────────────────────

export class StatusEffectRegistry {
  /** Get a status effect entry by ID. */
  static get(id: StatusId | string): StatusEffectEntry | undefined {
    return ENTRIES.get(id as StatusId);
  }

  /** All registered status effect entries. */
  static getAll(): StatusEffectEntry[] {
    return [...ENTRIES.values()];
  }

  /** All buffs. */
  static getBuffs(): StatusEffectEntry[] {
    return [...ENTRIES.values()].filter(e => e.category === 'buff');
  }

  /** All debuffs. */
  static getDebuffs(): StatusEffectEntry[] {
    return [...ENTRIES.values()].filter(e => e.category === 'debuff');
  }

  /** All effects with a given timing. */
  static getByTiming(timing: EffectTiming): StatusEffectEntry[] {
    return [...ENTRIES.values()].filter(e => e.timing === timing);
  }

  /** Check if a given ID is a known status effect. */
  static isValid(id: string): boolean {
    return ENTRIES.has(id as StatusId);
  }

  /** Human-readable name for a status ID, with fallback. */
  static nameOf(id: string): string {
    return ENTRIES.get(id as StatusId)?.name ?? id;
  }

  /** Emoji for a status ID, with fallback. */
  static emojiOf(id: string): string {
    return ENTRIES.get(id as StatusId)?.emoji ?? '❓';
  }

  /**
   * Calculate the effective value of a status for `stacks` at current level.
   * E.g. Poison with 3 stacks → 6 damage, Weak with 2 stacks → 0.5 (50%) reduction.
   */
  static effectiveValue(id: string, stacks: number): number {
    const entry = ENTRIES.get(id as StatusId);
    if (!entry) return 0;
    return entry.perStackValue * stacks;
  }
}
