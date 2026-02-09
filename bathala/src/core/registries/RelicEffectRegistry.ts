/**
 * RelicEffectRegistry - Centralised, data-driven relic-effect lookup.
 *
 * Replaces the scattered `player.relics.find(r => r.id === "…")` checks in
 * RelicManager with a single registry of effect descriptors.  Each entry
 * declares *what* a relic does and *when* — Combat systems query the registry
 * instead of hard-coding ID strings.
 *
 * The existing RelicManager still owns the mutation logic and is the canonical
 * runtime API; this registry provides the **read-only reference layer** so new
 * systems (CombatResolver, EnemyAIController, UI previews) can reason about
 * relic effects without importing RelicManager.
 *
 * @module core/registries/RelicEffectRegistry
 */

import type { Player } from '../types/CombatTypes';

// ── Relic ID Constants ────────────────────────────────────────────────

/**
 * Canonical relic ID constants.
 * Use these instead of raw string literals everywhere.
 */
export const RELIC_IDS = {
  // ── Act 1: Core ──
  EARTHWARDENS_PLATE: 'earthwardens_plate',
  SWIFT_WIND_AGIMAT: 'swift_wind_agimat',
  UMALAGAD_SPIRIT: 'umalagad_spirit',
  DIWATAS_CROWN: 'diwatas_crown',
  STONE_GOLEM_HEART: 'stone_golem_heart',
  EMBER_FETISH: 'ember_fetish',
  ANCESTRAL_BLADE: 'ancestral_blade',
  SARIMANOK_FEATHER: 'sarimanok_feather',
  LUCKY_CHARM: 'lucky_charm',
  WIND_VEIL: 'wind_veil',
  TIDAL_AMULET: 'tidal_amulet',
  BABAYLANS_TALISMAN: 'babaylans_talisman',

  // ── Act 1: Mythological ──
  TIKBALANGS_HOOF: 'tikbalangs_hoof',
  BALETE_ROOT: 'balete_root',
  SIGBIN_HEART: 'sigbin_heart',
  DUWENDE_CHARM: 'duwende_charm',
  AMOMONGO_CLAW: 'amomongo_claw',
  BUNGISNGIS_GRIN: 'bungisngis_grin',
  KAPRES_CIGAR: 'kapres_cigar',
  MANGANGAWAY_WAND: 'mangangaway_wand',
  TIYANAK_TEAR: 'tiyanak_tear',
} as const;

export type RelicId = (typeof RELIC_IDS)[keyof typeof RELIC_IDS];

// ── Effect Timing ─────────────────────────────────────────────────────

export type RelicTiming =
  | 'on_acquire'
  | 'start_of_combat'
  | 'start_of_turn'
  | 'after_hand_played'
  | 'end_of_turn'
  | 'on_attack'
  | 'on_defend'
  | 'on_special'
  | 'passive';

// ── Effect Descriptor ─────────────────────────────────────────────────

export interface RelicEffectDescriptor {
  relicId: RelicId;
  timing: RelicTiming[];
  /** Human-readable one-liner for UI tooltips. */
  summary: string;
  /** Structured effect tags for programmatic querying. */
  tags: string[];
}

// ── Registry Data ─────────────────────────────────────────────────────

const EFFECTS: ReadonlyMap<RelicId, RelicEffectDescriptor> = new Map<
  RelicId,
  RelicEffectDescriptor
>([
  // ── Act 1: Core relics ──────────────────────────────────────────────

  [RELIC_IDS.EARTHWARDENS_PLATE, {
    relicId: RELIC_IDS.EARTHWARDENS_PLATE,
    timing: ['on_acquire', 'start_of_combat', 'start_of_turn'],
    summary: 'Start combat with 5 block; +1 block each turn.',
    tags: ['block', 'persistent'],
  }],

  [RELIC_IDS.SWIFT_WIND_AGIMAT, {
    relicId: RELIC_IDS.SWIFT_WIND_AGIMAT,
    timing: ['start_of_combat'],
    summary: '+1 discard charge at combat start.',
    tags: ['discard', 'resource'],
  }],

  [RELIC_IDS.UMALAGAD_SPIRIT, {
    relicId: RELIC_IDS.UMALAGAD_SPIRIT,
    timing: ['start_of_combat', 'after_hand_played', 'on_defend'],
    summary: '+2 block per card played; +4 defend bonus.',
    tags: ['block', 'scaling'],
  }],

  [RELIC_IDS.DIWATAS_CROWN, {
    relicId: RELIC_IDS.DIWATAS_CROWN,
    timing: ['start_of_combat', 'on_defend'],
    summary: '+5 block at combat start; +3 defend bonus.',
    tags: ['block', 'persistent'],
  }],

  [RELIC_IDS.STONE_GOLEM_HEART, {
    relicId: RELIC_IDS.STONE_GOLEM_HEART,
    timing: ['on_acquire', 'start_of_combat'],
    summary: '+8 max HP permanently; +2 block at combat start.',
    tags: ['health', 'block'],
  }],

  [RELIC_IDS.EMBER_FETISH, {
    relicId: RELIC_IDS.EMBER_FETISH,
    timing: ['start_of_turn'],
    summary: '+1-2 Strength each turn.',
    tags: ['strength', 'scaling'],
  }],

  [RELIC_IDS.ANCESTRAL_BLADE, {
    relicId: RELIC_IDS.ANCESTRAL_BLADE,
    timing: ['after_hand_played'],
    summary: '+2 Strength when you play a Flush or better.',
    tags: ['strength', 'conditional'],
  }],

  [RELIC_IDS.SARIMANOK_FEATHER, {
    relicId: RELIC_IDS.SARIMANOK_FEATHER,
    timing: ['after_hand_played'],
    summary: '+1 Ginto when you play a Straight or better.',
    tags: ['economy', 'conditional'],
  }],

  [RELIC_IDS.LUCKY_CHARM, {
    relicId: RELIC_IDS.LUCKY_CHARM,
    timing: ['after_hand_played'],
    summary: '+1 Ginto when you play a Straight or better.',
    tags: ['economy', 'conditional'],
  }],

  [RELIC_IDS.WIND_VEIL, {
    relicId: RELIC_IDS.WIND_VEIL,
    timing: ['after_hand_played'],
    summary: '+1 draw on Air cards (handled in Combat).',
    tags: ['draw', 'elemental'],
  }],

  [RELIC_IDS.TIDAL_AMULET, {
    relicId: RELIC_IDS.TIDAL_AMULET,
    timing: ['end_of_turn'],
    summary: '+1 HP per card remaining in hand at end of turn.',
    tags: ['heal', 'scaling'],
  }],

  [RELIC_IDS.BABAYLANS_TALISMAN, {
    relicId: RELIC_IDS.BABAYLANS_TALISMAN,
    timing: ['passive'],
    summary: 'Your poker hand is evaluated one tier higher.',
    tags: ['hand_upgrade', 'passive'],
  }],

  // ── Act 1: Mythological relics ─────────────────────────────────────

  [RELIC_IDS.TIKBALANGS_HOOF, {
    relicId: RELIC_IDS.TIKBALANGS_HOOF,
    timing: ['passive'],
    summary: '+10% dodge chance.',
    tags: ['dodge', 'passive'],
  }],

  [RELIC_IDS.BALETE_ROOT, {
    relicId: RELIC_IDS.BALETE_ROOT,
    timing: ['on_defend'],
    summary: '+2 block per Lupa card played.',
    tags: ['block', 'elemental'],
  }],

  [RELIC_IDS.SIGBIN_HEART, {
    relicId: RELIC_IDS.SIGBIN_HEART,
    timing: ['on_attack'],
    summary: '+3 damage on attack.',
    tags: ['damage', 'flat'],
  }],

  [RELIC_IDS.DUWENDE_CHARM, {
    relicId: RELIC_IDS.DUWENDE_CHARM,
    timing: ['on_defend'],
    summary: '+3 block on defend.',
    tags: ['block', 'flat'],
  }],

  [RELIC_IDS.AMOMONGO_CLAW, {
    relicId: RELIC_IDS.AMOMONGO_CLAW,
    timing: ['on_attack'],
    summary: 'Attacks apply 1 Vulnerable stack.',
    tags: ['debuff', 'vulnerable'],
  }],

  [RELIC_IDS.BUNGISNGIS_GRIN, {
    relicId: RELIC_IDS.BUNGISNGIS_GRIN,
    timing: ['on_attack', 'on_special'],
    summary: '+4-5 damage when enemy is debuffed.',
    tags: ['damage', 'conditional'],
  }],

  [RELIC_IDS.KAPRES_CIGAR, {
    relicId: RELIC_IDS.KAPRES_CIGAR,
    timing: ['on_attack'],
    summary: 'First attack each combat deals double damage.',
    tags: ['damage', 'once_per_combat'],
  }],

  [RELIC_IDS.MANGANGAWAY_WAND, {
    relicId: RELIC_IDS.MANGANGAWAY_WAND,
    timing: ['on_special'],
    summary: '+5 damage on Special actions.',
    tags: ['damage', 'flat'],
  }],

  [RELIC_IDS.TIYANAK_TEAR, {
    relicId: RELIC_IDS.TIYANAK_TEAR,
    timing: ['start_of_turn'],
    summary: '+1 Strength each turn.',
    tags: ['strength', 'scaling'],
  }],
]);

// ── Public API ────────────────────────────────────────────────────────

export class RelicEffectRegistry {
  /** Get the descriptor for a relic by ID. */
  static get(id: RelicId | string): RelicEffectDescriptor | undefined {
    return EFFECTS.get(id as RelicId);
  }

  /** All registered descriptors. */
  static getAll(): RelicEffectDescriptor[] {
    return [...EFFECTS.values()];
  }

  /** All descriptors that fire at a given timing. */
  static getByTiming(timing: RelicTiming): RelicEffectDescriptor[] {
    return [...EFFECTS.values()].filter(e => e.timing.includes(timing));
  }

  /** All descriptors that have a given tag. */
  static getByTag(tag: string): RelicEffectDescriptor[] {
    return [...EFFECTS.values()].filter(e => e.tags.includes(tag));
  }

  /** Does the player own a relic with this ID? */
  static playerHas(player: Player, id: RelicId | string): boolean {
    return player.relics.some(r => r.id === id);
  }

  /**
   * Get all descriptors for relics the player currently owns.
   * Useful for UI: "show all relic effects that fire on_attack".
   */
  static getPlayerEffects(
    player: Player,
    timing?: RelicTiming
  ): RelicEffectDescriptor[] {
    const owned = new Set(player.relics.map(r => r.id));
    let results = [...EFFECTS.values()].filter(e => owned.has(e.relicId));
    if (timing) {
      results = results.filter(e => e.timing.includes(timing));
    }
    return results;
  }
}
