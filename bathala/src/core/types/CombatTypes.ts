/**
 * Combat Types for Bathala - Card-based combat system
 * Based on poker hands with elemental modifications
 */

import { Potion } from "../../data/potions";
import { EnemyEntity } from '../entities/EnemyEntity';

export type Suit = "Apoy" | "Tubig" | "Lupa" | "Hangin";
export type Rank =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Mandirigma"
  | "Babaylan"
  | "Datu";
export type Element = "fire" | "water" | "earth" | "air" | "neutral";

export interface PlayingCard {
  id: string;
  rank: Rank;
  suit: Suit;
  element: Element;
  selected: boolean;
  playable: boolean;
}

export type HandType =
  | "high_card"
  | "pair"
  | "two_pair"
  | "three_of_a_kind"
  | "straight"
  | "flush"
  | "full_house"
  | "four_of_a_kind"
  | "straight_flush"
  | "royal_flush"
  | "five_of_a_kind";

export interface HandEvaluation {
  type: HandType;
  baseValue: number;           // Sum of card values
  handBonus: number;            // Bonus from hand type
  handMultiplier: number;       // Multiplier from hand type
  elementalBonus: number;       // Bonus from dominant element
  totalValue: number;           // Final calculated value
  description: string;
  breakdown?: string[];         // Optional breakdown for display
}

export interface CombatEntity {
  id: string;
  name: string;
  x?: number;
  y?: number;
  maxHealth: number;
  currentHealth: number;
  block: number;
  statusEffects: StatusEffect[];
}

export interface Player extends CombatEntity {
  hand: PlayingCard[];
  deck: PlayingCard[];
  discardPile: PlayingCard[];
  drawPile: PlayingCard[];
  playedHand: PlayingCard[];
  landasScore: number; // Landas system (Conquest, Balance, Mercy)
  ginto: number; // Currency for basic items
  diamante: number; // Premium currency for rare items
  relics: Relic[];
  potions: Potion[]; // Carried potions (max 3)
  discardCharges: number; // Available discard charges
  maxDiscardCharges: number; // Maximum discard charges per combat
  
  // Educational System Tracking
  educationalProgress?: {
    valuesLearned: Record<string, number>; // Map of FilipinoValue -> count
    regionsEncountered: Record<string, number>; // Map of RegionalOrigin -> count
    culturalKnowledgeScore: number;
    achievements: string[];
  };
}

/**
 * @deprecated Use EnemyEntity class from core/entities/EnemyEntity instead.
 * Kept for backward compatibility with test mocks. All runtime enemy state
 * should go through EnemyEntity which owns its own combat lifecycle.
 */
export interface Enemy extends CombatEntity {
  intent: EnemyIntent;
  damage: number;
  attackPattern: string[];
  currentPatternIndex: number;
  halfHealthTriggered?: boolean; // For 50% health dialogue trigger
  elementalAffinity: ElementalAffinity;  // Elemental weakness and resistance
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Mythological background / narrative flavour text */
  lore?: string;
  /** Asset key for the relic sprite (e.g. "relic_earthwardens_plate") */
  spriteKey?: string;
}

export interface EnemyIntent {
  type: "attack" | "defend" | "buff" | "debuff" | "unknown";
  value: number;
  description: string;
  icon: string;
}

export interface ElementalAffinity {
  weakness: Element | null;  // Takes 1.5× damage from this element
  resistance: Element | null; // Takes 0.75× damage from this element
}

export interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  value: number;  // Stack count (removed duration)
  description: string;
  emoji: string;
  source?: {
    type: 'relic' | 'enemy' | 'card' | 'other';
    id: string;      // Relic ID or enemy name
    icon: string;    // Emoji or sprite key
  };
}

export interface StatusEffectTriggerResult {
  effectName: string;
  targetName: string;
  value: number;
  message: string;  // For floating text display
}

export type CombatActionType = "attack" | "defend" | "special";

export interface CombatAction {
  type: "play_hand" | "discard" | "end_turn" | CombatActionType;
  cards?: PlayingCard[];
  target?: string;
}

export interface CombatState {
  phase:
    | "player_turn"
    | "enemy_turn"
    | "game_over"
    | "action_selection"
    | "post_combat";
  turn: number;
  player: Player;
  enemy: EnemyEntity;
  selectedCards: PlayingCard[];
  lastAction: CombatAction | null;
}

export type Landas = "Conquest" | "Balance" | "Mercy";

export interface PostCombatReward {
  ginto: number;
  diamante: number;
  healthHealing: number;
  bonusEffect?: string;
  relics?: any[]; // Optional array of relics that can be dropped
  relicDropChance?: number; // Chance (0-1) for a relic to drop (e.g., 0.6 = 60%)
}

export interface CreatureDialogue {
  name: string;
  spareDialogue: string;
  killDialogue: string;
  spareReward: PostCombatReward;
  killReward: PostCombatReward;
}

/**
 * Chapter/Act type definition
 */
export type Chapter = 1 | 2 | 3;

/**
 * Visual theme configuration for each chapter
 */
export interface ChapterTheme {
  overlayColor: number;      // Hex color for tint (e.g., 0x4A90E2)
  overlayAlpha: number;       // Transparency (0-1)
  particleEffect?: string;    // Optional particle system identifier
  ambientSound?: string;      // Optional ambient audio key
}
