/**
 * Combat Types for Bathala - Card-based combat system
 * Based on poker hands with elemental modifications
 */

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";
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
  | "royal_flush";

export interface HandEvaluation {
  type: HandType;
  baseValue: number;
  elementalBonus: number;
  totalValue: number;
  description: string;
}

export interface CombatEntity {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  block: number;
  statusEffects: StatusEffect[];
}

export interface Player extends CombatEntity {
  energy: number;
  maxEnergy: number;
  hand: PlayingCard[];
  deck: PlayingCard[];
  discardPile: PlayingCard[];
  drawPile: PlayingCard[];
}

export interface Enemy extends CombatEntity {
  intent: EnemyIntent;
  damage: number;
  attackPattern: string[];
  currentPatternIndex: number;
}

export interface EnemyIntent {
  type: "attack" | "defend" | "buff" | "debuff" | "unknown";
  value: number;
  description: string;
  icon: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  duration: number;
  value: number;
  description: string;
}

export interface CombatAction {
  type: "play_hand" | "discard" | "end_turn";
  cards?: PlayingCard[];
  target?: string;
}

export interface CombatState {
  phase: "player_turn" | "enemy_turn" | "game_over";
  turn: number;
  player: Player;
  enemy: Enemy;
  selectedCards: PlayingCard[];
  lastAction: CombatAction | null;
}
