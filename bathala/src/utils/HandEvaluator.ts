import {
  PlayingCard,
  HandType,
  HandEvaluation,
  Rank,
  Element,
} from "../core/types/CombatTypes";

/**
 * HandEvaluator - Evaluates poker hands and applies elemental bonuses
 * Core mechanic for Bathala's combat system
 */
export class HandEvaluator {
  private static readonly RANK_VALUES: Record<Rank, number> = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    "10": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2,
  };

  private static readonly HAND_BASE_VALUES: Record<HandType, number> = {
    high_card: 5,
    pair: 10,
    two_pair: 20,
    three_of_a_kind: 30,
    straight: 40,
    flush: 50,
    full_house: 70,
    four_of_a_kind: 100,
    straight_flush: 150,
    royal_flush: 200,
  };

  /**
   * Evaluate a hand of cards and return damage value
   */
  static evaluateHand(cards: PlayingCard[]): HandEvaluation {
    if (cards.length === 0) {
      return {
        type: "high_card",
        baseValue: 0,
        elementalBonus: 0,
        totalValue: 0,
        description: "No cards played",
      };
    }

    const handType = this.determineHandType(cards);
    const baseValue = this.HAND_BASE_VALUES[handType];
    const elementalBonus = this.calculateElementalBonus(cards, handType);
    const totalValue = baseValue + elementalBonus;

    return {
      type: handType,
      baseValue,
      elementalBonus,
      totalValue,
      description: this.getHandDescription(handType, cards),
    };
  }

  /**
   * Determine the poker hand type
   */
  private static determineHandType(cards: PlayingCard[]): HandType {
    if (cards.length === 1) return "high_card";

    const ranks = cards.map((card) => card.rank);
    const suits = cards.map((card) => card.suit);
    const rankCounts = this.countRanks(ranks);
    const isFlush = this.isFlush(suits);
    const isStraight = this.isStraight(ranks);

    // Check for special combinations
    if (isStraight && isFlush) {
      if (this.isRoyalFlush(ranks)) return "royal_flush";
      return "straight_flush";
    }

    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    if (counts[0] === 4) return "four_of_a_kind";
    if (counts[0] === 3 && counts[1] === 2) return "full_house";
    if (isFlush) return "flush";
    if (isStraight) return "straight";
    if (counts[0] === 3) return "three_of_a_kind";
    if (counts[0] === 2 && counts[1] === 2) return "two_pair";
    if (counts[0] === 2) return "pair";

    return "high_card";
  }

  /**
   * Calculate elemental bonuses based on card elements
   */
  private static calculateElementalBonus(
    cards: PlayingCard[],
    handType: HandType
  ): number {
    const elementCounts = this.countElements(cards);
    let bonus = 0;

    // Fire: +2 damage per fire card
    bonus += (elementCounts.fire || 0) * 2;

    // Water: +1 block per water card (defensive)
    // Note: Block is handled separately in combat logic

    // Earth: +1 damage per earth card, +2 if 3+ earth cards
    const earthCount = elementCounts.earth || 0;
    bonus += earthCount;
    if (earthCount >= 3) bonus += 2;

    // Air: Double damage if all cards are air
    if (elementCounts.air === cards.length && cards.length > 1) {
      bonus += this.HAND_BASE_VALUES[handType]; // Double the base value
    }

    return bonus;
  }

  /**
   * Count occurrences of each rank
   */
  private static countRanks(ranks: Rank[]): Record<string, number> {
    const counts: Record<string, number> = {};
    ranks.forEach((rank) => {
      counts[rank] = (counts[rank] || 0) + 1;
    });
    return counts;
  }

  /**
   * Count occurrences of each element
   */
  private static countElements(cards: PlayingCard[]): Record<Element, number> {
    const counts: Record<Element, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      neutral: 0,
    };
    cards.forEach((card) => {
      counts[card.element]++;
    });
    return counts;
  }

  /**
   * Check if all cards are the same suit
   */
  private static isFlush(suits: string[]): boolean {
    return suits.length > 1 && suits.every((suit) => suit === suits[0]);
  }

  /**
   * Check if cards form a straight
   */
  private static isStraight(ranks: Rank[]): boolean {
    if (ranks.length < 5) return false;

    const values = ranks
      .map((rank) => this.RANK_VALUES[rank])
      .sort((a, b) => a - b);

    // Check for consecutive values
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) return false;
    }

    return true;
  }

  /**
   * Check if hand is a royal flush (A, K, Q, J, 10)
   */
  private static isRoyalFlush(ranks: Rank[]): boolean {
    const royalRanks = ["A", "K", "Q", "J", "10"];
    return (
      ranks.length === 5 && ranks.every((rank) => royalRanks.includes(rank))
    );
  }

  /**
   * Get human-readable description of the hand
   */
  private static getHandDescription(
    handType: HandType,
    cards: PlayingCard[]
  ): string {
    const elementCounts = this.countElements(cards);
    const dominantElement =
      Object.entries(elementCounts)
        .filter(([_, count]) => count > 0)
        .sort(([_, a], [__, b]) => b - a)[0]?.[0] || "neutral";

    const handNames: Record<HandType, string> = {
      high_card: "High Card",
      pair: "Pair",
      two_pair: "Two Pair",
      three_of_a_kind: "Three of a Kind",
      straight: "Straight",
      flush: "Flush",
      full_house: "Full House",
      four_of_a_kind: "Four of a Kind",
      straight_flush: "Straight Flush",
      royal_flush: "Royal Flush",
    };

    return `${handNames[handType]} (${dominantElement})`;
  }
}
