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
  value: number;
  attackValue: number;
  defenseValue: number;
  specialValue: number;
}

export const POKER_HAND_REFERENCE: Record<HandType, PokerHandInfo> = {
  high_card: {
    handType: 'high_card',
    name: 'High Card',
    description: 'The highest card in your hand when no other combination is present.',
    howToMake: 'Simply select a single card with the highest rank. If no other combination is possible, your highest card is used.',
    value: 0,
    attackValue: 0,
    defenseValue: 0,
    specialValue: 0
  },
  pair: {
    handType: 'pair',
    name: 'Pair',
    description: 'Two cards of the same rank.',
    howToMake: 'Select two cards of the same rank (e.g., two 7s, two Mandirigmas).',
    value: 2,
    attackValue: 2,
    defenseValue: 2,
    specialValue: 1
  },
  two_pair: {
    handType: 'two_pair',
    name: 'Two Pair',
    description: 'Two different pairs of the same rank.',
    howToMake: 'Select four cards that form two pairs (e.g., two 5s and two Datu).',
    value: 4,
    attackValue: 4,
    defenseValue: 4,
    specialValue: 2
  },
  three_of_a_kind: {
    handType: 'three_of_a_kind',
    name: 'Three of a Kind',
    description: 'Three cards of the same rank.',
    howToMake: 'Select three cards of the same rank (e.g., three 8s, three Babaylan).',
    value: 7,
    attackValue: 7,
    defenseValue: 7,
    specialValue: 3
  },
  straight: {
    handType: 'straight',
    name: 'Straight',
    description: 'Five cards in sequence of different suits.',
    howToMake: 'Select five cards in consecutive rank order (e.g., 3, 4, 5, 6, 7 or Mandirigma, Babaylan, Datu).',
    value: 10,
    attackValue: 10,
    defenseValue: 10,
    specialValue: 4
  },
  flush: {
    handType: 'flush',
    name: 'Flush',
    description: 'Five cards of the same suit but not in sequence.',
    howToMake: 'Select five cards that all share the same suit (e.g., five Apoy cards).',
    value: 14,
    attackValue: 14,
    defenseValue: 14,
    specialValue: 5
  },
  full_house: {
    handType: 'full_house',
    name: 'Full House',
    description: 'Three of a kind combined with a pair.',
    howToMake: 'Select three cards of one rank and two cards of another rank (e.g., three 6s and two Mandirigmas).',
    value: 18,
    attackValue: 18,
    defenseValue: 18,
    specialValue: 6
  },
  four_of_a_kind: {
    handType: 'four_of_a_kind',
    name: 'Four of a Kind',
    description: 'Four cards of the same rank.',
    howToMake: 'Select four cards of the same rank (e.g., four 10s, four Datu).',
    value: 22,
    attackValue: 22,
    defenseValue: 22,
    specialValue: 7
  },
  straight_flush: {
    handType: 'straight_flush',
    name: 'Straight Flush',
    description: 'Five cards in sequence of the same suit.',
    howToMake: 'Select five cards of the same suit in consecutive rank order (e.g., 5, 6, 7, 8, 9 all of Apoy).',
    value: 35,
    attackValue: 35,
    defenseValue: 35,
    specialValue: 15
  },
  royal_flush: {
    handType: 'royal_flush',
    name: 'Royal Flush',
    description: 'The highest straight flush: 1, Mandirigma, Babaylan, Datu, 10 of the same suit.',
    howToMake: 'Select the five highest consecutive cards of the same suit (1, Mandirigma, Babaylan, Datu, 10 all of the same suit).',
    value: 35,
    attackValue: 35,
    defenseValue: 35,
    specialValue: 15
  },
  five_of_a_kind: {
    handType: 'five_of_a_kind',
    name: 'Five of a Kind',
    description: 'Five cards of the same rank.',
    howToMake: 'Select five cards of the same rank (e.g., five 7s, five Babaylan).',
    value: 30,
    attackValue: 30,
    defenseValue: 30,
    specialValue: 12
  }
};

export const POKER_HAND_LIST: PokerHandInfo[] = Object.values(POKER_HAND_REFERENCE);