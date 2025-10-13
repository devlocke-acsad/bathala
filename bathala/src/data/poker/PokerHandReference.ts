/**
 * PokerHandReference - Reference data for poker hands in Bathala
 * Similar to Balatro's run info feature, showing how to make each hand
 */

import { HandType } from "../../core/types/CombatTypes";

export interface PokerHandInfo {
  handType: HandType;
  name: string;
  description: string;
  howToMake: string;
  bonus: number;              // Bonus value added to cards
  multiplier: number;         // Multiplier applied to total
  attackValue: number;        // Legacy: kept for display
  defenseValue: number;       // Legacy: kept for display
  specialValue: number;       // Legacy: kept for display
}

export const POKER_HAND_REFERENCE: Record<HandType, PokerHandInfo> = {
  high_card: {
    handType: 'high_card',
    name: 'High Card',
    description: 'The highest card in your hand when no other combination is present.',
    howToMake: 'Simply select a single card with the highest rank. If no other combination is possible, your highest card is used.',
    bonus: 5,
    multiplier: 1,
    attackValue: 5,
    defenseValue: 5,
    specialValue: 5
  },
  pair: {
    handType: 'pair',
    name: 'Pair',
    description: 'Two cards of the same rank.',
    howToMake: 'Select two cards of the same rank (e.g., two 7s, two Mandirigmas).',
    bonus: 10,
    multiplier: 2,
    attackValue: 10,
    defenseValue: 10,
    specialValue: 10
  },
  two_pair: {
    handType: 'two_pair',
    name: 'Two Pair',
    description: 'Two different pairs of the same rank.',
    howToMake: 'Select four cards that form two pairs (e.g., two 5s and two Datu).',
    bonus: 20,
    multiplier: 2,
    attackValue: 20,
    defenseValue: 20,
    specialValue: 20
  },
  three_of_a_kind: {
    handType: 'three_of_a_kind',
    name: 'Three of a Kind',
    description: 'Three cards of the same rank.',
    howToMake: 'Select three cards of the same rank (e.g., three 8s, three Babaylan).',
    bonus: 30,
    multiplier: 3,
    attackValue: 30,
    defenseValue: 30,
    specialValue: 30
  },
  straight: {
    handType: 'straight',
    name: 'Straight',
    description: 'Five cards in sequence of different suits.',
    howToMake: 'Select five cards in consecutive rank order (e.g., 3, 4, 5, 6, 7 or Mandirigma, Babaylan, Datu).',
    bonus: 30,
    multiplier: 4,
    attackValue: 30,
    defenseValue: 30,
    specialValue: 30
  },
  flush: {
    handType: 'flush',
    name: 'Flush',
    description: 'Five cards of the same suit but not in sequence.',
    howToMake: 'Select five cards that all share the same suit (e.g., five Apoy cards).',
    bonus: 35,
    multiplier: 4,
    attackValue: 35,
    defenseValue: 35,
    specialValue: 35
  },
  full_house: {
    handType: 'full_house',
    name: 'Full House',
    description: 'Three of a kind combined with a pair.',
    howToMake: 'Select three cards of one rank and two cards of another rank (e.g., three 6s and two Mandirigmas).',
    bonus: 40,
    multiplier: 4,
    attackValue: 40,
    defenseValue: 40,
    specialValue: 40
  },
  four_of_a_kind: {
    handType: 'four_of_a_kind',
    name: 'Four of a Kind',
    description: 'Four cards of the same rank.',
    howToMake: 'Select four cards of the same rank (e.g., four 10s, four Datu).',
    bonus: 60,
    multiplier: 7,
    attackValue: 60,
    defenseValue: 60,
    specialValue: 60
  },
  straight_flush: {
    handType: 'straight_flush',
    name: 'Straight Flush',
    description: 'Five cards in sequence of the same suit.',
    howToMake: 'Select five cards of the same suit in consecutive rank order (e.g., 5, 6, 7, 8, 9 all of Apoy).',
    bonus: 100,
    multiplier: 8,
    attackValue: 100,
    defenseValue: 100,
    specialValue: 100
  },
  royal_flush: {
    handType: 'royal_flush',
    name: 'Royal Flush',
    description: 'The highest straight flush: 1, Mandirigma, Babaylan, Datu, 10 of the same suit.',
    howToMake: 'Select the five highest consecutive cards of the same suit (1, Mandirigma, Babaylan, Datu, 10 all of the same suit).',
    bonus: 100,
    multiplier: 8,
    attackValue: 100,
    defenseValue: 100,
    specialValue: 100
  },
  five_of_a_kind: {
    handType: 'five_of_a_kind',
    name: 'Five of a Kind',
    description: 'Five cards of the same rank.',
    howToMake: 'Select five cards of the same rank (e.g., five 7s, five Babaylan).',
    bonus: 120,
    multiplier: 12,
    attackValue: 120,
    defenseValue: 120,
    specialValue: 120
  }
};

export const POKER_HAND_LIST: PokerHandInfo[] = Object.values(POKER_HAND_REFERENCE);