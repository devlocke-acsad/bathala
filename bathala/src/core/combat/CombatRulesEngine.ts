/**
 * CombatRulesEngine - Single source of truth for combat rule constants
 *
 * Centralises all numeric constants, hand rankings, elemental rules, and
 * status effect interactions so they are queryable from anywhere without
 * importing the giant Combat.ts scene.
 *
 * @module core/combat/CombatRulesEngine
 */

import type {
  HandType,
  Rank,
  Suit,
  CombatActionType,
} from '../../core/types/CombatTypes';

// =============================================================================
// HAND RANKINGS
// =============================================================================

export interface HandRankData {
  /** Flat bonus added to subtotal */
  bonus: number;
  /** Multiplier applied to subtotal */
  multiplier: number;
  /** Minimum number of cards required to form this hand */
  minCards: number;
  /** Human-readable name */
  displayName: string;
  /** Ordinal rank (higher = stronger) */
  rank: number;
}

const HAND_RANK_TABLE: Record<HandType, HandRankData> = {
  high_card:        { bonus: 0,  multiplier: 1.0, minCards: 1, displayName: 'High Card',        rank: 0  },
  pair:             { bonus: 3,  multiplier: 1.2, minCards: 2, displayName: 'Pair',              rank: 1  },
  two_pair:         { bonus: 6,  multiplier: 1.3, minCards: 4, displayName: 'Two Pair',          rank: 2  },
  three_of_a_kind:  { bonus: 10, multiplier: 1.5, minCards: 3, displayName: 'Three of a Kind',   rank: 3  },
  straight:         { bonus: 12, multiplier: 1.6, minCards: 5, displayName: 'Straight',          rank: 4  },
  flush:            { bonus: 15, multiplier: 1.7, minCards: 5, displayName: 'Flush',             rank: 5  },
  full_house:       { bonus: 20, multiplier: 2.0, minCards: 5, displayName: 'Full House',        rank: 6  },
  four_of_a_kind:   { bonus: 25, multiplier: 2.2, minCards: 4, displayName: 'Four of a Kind',    rank: 7  },
  five_of_a_kind:   { bonus: 38, multiplier: 2.6, minCards: 5, displayName: 'Five of a Kind',    rank: 8  },
  straight_flush:   { bonus: 35, multiplier: 2.5, minCards: 5, displayName: 'Straight Flush',    rank: 9  },
  royal_flush:      { bonus: 40, multiplier: 2.8, minCards: 5, displayName: 'Royal Flush',       rank: 10 },
};

// =============================================================================
// CARD VALUES
// =============================================================================

const CARD_CHIP_VALUES: Record<Rank, number> = {
  '1': 6, '2': 2, '3': 2, '4': 3, '5': 3,
  '6': 4, '7': 4, '8': 5, '9': 5, '10': 6,
  Mandirigma: 6, Babaylan: 7, Datu: 7,
};

// =============================================================================
// ELEMENTAL TABLE
// =============================================================================

export interface ElementalData {
  displayName: string;
  icon: string;
  /** Status effect applied when used as Special */
  specialEffect: string;
  specialStacks: number;
  specialDescription: string;
  /** Action modifier for Special actions */
  specialDamageMultiplier: number;
}

const ELEMENTAL_TABLE: Record<Suit, ElementalData> = {
  Apoy: {
    displayName: 'Apoy (Fire)',
    icon: '🔥',
    specialEffect: 'poison',
    specialStacks: 3,
    specialDescription: 'Burn — 3 stacks (6 damage/turn)',
    specialDamageMultiplier: 0.6,
  },
  Tubig: {
    displayName: 'Tubig (Water)',
    icon: '💧',
    specialEffect: 'frail',
    specialStacks: 2,
    specialDescription: 'Frail — 50% block reduction',
    specialDamageMultiplier: 0.6,
  },
  Lupa: {
    displayName: 'Lupa (Earth)',
    icon: '🌿',
    specialEffect: 'vulnerable',
    specialStacks: 1,
    specialDescription: 'Vulnerable — take 50% more damage',
    specialDamageMultiplier: 0.6,
  },
  Hangin: {
    displayName: 'Hangin (Air)',
    icon: '💨',
    specialEffect: 'weak',
    specialStacks: 2,
    specialDescription: 'Weak — 50% damage reduction',
    specialDamageMultiplier: 0.6,
  },
};

// =============================================================================
// ACTION MODIFIERS
// =============================================================================

const ACTION_MODIFIERS: Record<CombatActionType, number> = {
  attack: 1.0,
  defend: 0.8,
  special: 0.6,
};

// =============================================================================
// STATUS EFFECT CONSTANTS
// =============================================================================

export interface StatusEffectRule {
  id: string;
  name: string;
  emoji: string;
  type: 'buff' | 'debuff';
  /** Per-stack multiplier (e.g. Weak = -0.25 per stack) */
  perStackMultiplier: number;
  /** Max stacks (0 = unlimited) */
  maxStacks: number;
  /** Ticks at start or end of turn */
  timing: 'start_of_turn' | 'end_of_turn' | 'immediate';
}

const STATUS_RULES: Record<string, StatusEffectRule> = {
  strength:   { id: 'strength',   name: 'Strength',   emoji: '💪', type: 'buff',   perStackMultiplier: 3,    maxStacks: 99, timing: 'immediate' },
  weak:       { id: 'weak',       name: 'Weak',       emoji: '😰', type: 'debuff', perStackMultiplier: -0.25, maxStacks: 3,  timing: 'immediate' },
  vulnerable: { id: 'vulnerable', name: 'Vulnerable', emoji: '🎯', type: 'debuff', perStackMultiplier: 0.50,  maxStacks: 1,  timing: 'immediate' },
  frail:      { id: 'frail',      name: 'Frail',      emoji: '🦴', type: 'debuff', perStackMultiplier: -0.25, maxStacks: 4,  timing: 'immediate' },
  poison:     { id: 'poison',     name: 'Burn',       emoji: '🔥', type: 'debuff', perStackMultiplier: 2,     maxStacks: 99, timing: 'start_of_turn' },
  regeneration: { id: 'regeneration', name: 'Regeneration', emoji: '💚', type: 'buff', perStackMultiplier: 2, maxStacks: 99, timing: 'start_of_turn' },
  plated_armor: { id: 'plated_armor', name: 'Plated Armor', emoji: '🛡️', type: 'buff', perStackMultiplier: 1, maxStacks: 99, timing: 'end_of_turn' },
  ritual:     { id: 'ritual',     name: 'Ritual',     emoji: '🕯️', type: 'buff',   perStackMultiplier: 1,    maxStacks: 99, timing: 'end_of_turn' },
};

// =============================================================================
// COMBAT CONSTANTS
// =============================================================================

const COMBAT_CONSTANTS = {
  /** Cards drawn at start of each turn */
  HAND_SIZE: 8,
  /** Max cards in a played hand */
  MAX_PLAYED: 5,
  /** Default discard charges per turn */
  DEFAULT_DISCARD_CHARGES: 3,
  /** Max discards per turn */
  MAX_DISCARDS_PER_TURN: 3,
  /** Damage cap */
  MAX_DAMAGE: 9999,
  /** Starting player HP */
  DEFAULT_PLAYER_HP: 120,
  /** Delay (ms) before enemy turn after player action */
  ENEMY_TURN_DELAY_MS: 1000,
  /** Delay (ms) between enemy action and next player turn */
  PLAYER_TURN_DELAY_MS: 1500,
} as const;

// =============================================================================
// PUBLIC API
// =============================================================================

export class CombatRulesEngine {
  // ---- Hand rankings --------------------------------------------------------
  static getHandRank(handType: HandType): HandRankData {
    return HAND_RANK_TABLE[handType];
  }

  static getAllHandRanks(): Record<HandType, HandRankData> {
    return { ...HAND_RANK_TABLE };
  }

  static isHandBetterThan(a: HandType, b: HandType): boolean {
    return HAND_RANK_TABLE[a].rank > HAND_RANK_TABLE[b].rank;
  }

  static getHandDisplayName(handType: HandType): string {
    return HAND_RANK_TABLE[handType].displayName;
  }

  // ---- Card values ----------------------------------------------------------
  static getCardChipValue(rank: Rank): number {
    return CARD_CHIP_VALUES[rank] ?? 0;
  }

  // ---- Elements -------------------------------------------------------------
  static getElementData(suit: Suit): ElementalData {
    return ELEMENTAL_TABLE[suit];
  }

  static getAllElements(): Record<Suit, ElementalData> {
    return { ...ELEMENTAL_TABLE };
  }

  // ---- Action modifiers -----------------------------------------------------
  static getActionModifier(action: CombatActionType): number {
    return ACTION_MODIFIERS[action] ?? 1.0;
  }

  // ---- Status effects -------------------------------------------------------
  static getStatusRule(effectId: string): StatusEffectRule | undefined {
    return STATUS_RULES[effectId];
  }

  static getAllStatusRules(): Record<string, StatusEffectRule> {
    return { ...STATUS_RULES };
  }

  // ---- Combat constants -----------------------------------------------------
  static get HAND_SIZE(): number { return COMBAT_CONSTANTS.HAND_SIZE; }
  static get MAX_PLAYED(): number { return COMBAT_CONSTANTS.MAX_PLAYED; }
  static get DEFAULT_DISCARD_CHARGES(): number { return COMBAT_CONSTANTS.DEFAULT_DISCARD_CHARGES; }
  static get MAX_DISCARDS_PER_TURN(): number { return COMBAT_CONSTANTS.MAX_DISCARDS_PER_TURN; }
  static get MAX_DAMAGE(): number { return COMBAT_CONSTANTS.MAX_DAMAGE; }
  static get DEFAULT_PLAYER_HP(): number { return COMBAT_CONSTANTS.DEFAULT_PLAYER_HP; }
  static get ENEMY_TURN_DELAY_MS(): number { return COMBAT_CONSTANTS.ENEMY_TURN_DELAY_MS; }
  static get PLAYER_TURN_DELAY_MS(): number { return COMBAT_CONSTANTS.PLAYER_TURN_DELAY_MS; }
}
