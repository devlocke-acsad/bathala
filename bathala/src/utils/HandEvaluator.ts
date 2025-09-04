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
    Datu: 13,
    Babaylan: 12,
    Mandirigma: 11,
    "10": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2,
    "1": 1,
  };

  private static readonly HAND_BONUSES: Record<HandType, { attack: number; defense: number; special: number }> = {
    high_card: { attack: 0, defense: 0, special: 0 },
    pair: { attack: 2, defense: 2, special: 1 },
    two_pair: { attack: 4, defense: 4, special: 2 },
    three_of_a_kind: { attack: 7, defense: 7, special: 3 },
    straight: { attack: 10, defense: 10, special: 4 },
    flush: { attack: 14, defense: 14, special: 5 },
    full_house: { attack: 18, defense: 18, special: 6 },
    four_of_a_kind: { attack: 22, defense: 22, special: 7 },
    straight_flush: { attack: 35, defense: 35, special: 15 },
    five_of_a_kind: { attack: 30, defense: 30, special: 12 },
    royal_flush: { attack: 35, defense: 35, special: 15 }, // Same as straight flush
  };

  /**
   * Evaluate a hand of cards and return damage value
   */
  static evaluateHand(cards: PlayingCard[], action: "attack" | "defend" | "special"): HandEvaluation {
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
    const baseValue = this.HAND_BONUSES[handType][action];
    const totalValue = baseValue; // Elemental bonus is now handled in Combat.ts

    return {
      type: handType,
      baseValue,
      elementalBonus: 0, // No longer calculated here
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

    if (counts[0] === 5) return "five_of_a_kind";
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
    return suits.length === 5 && suits.every((suit) => suit === suits[0]);
  }

  /**
   * Check if cards form a straight
   * Ace can be either low (1) or high (14) but not both
   */
  private static isStraight(ranks: Rank[]): boolean {
    if (ranks.length !== 5) return false;

    // Check if we have an Ace in the hand
    const hasAce = ranks.includes("1");
    
    // Get values treating Ace as low (1)
    const valuesLow = ranks
      .map((rank) => this.RANK_VALUES[rank])
      .sort((a, b) => a - b);

    // Check for consecutive values with Ace as low
    let isStraightLow = true;
    for (let i = 1; i < valuesLow.length; i++) {
      if (valuesLow[i] !== valuesLow[i - 1] + 1) {
        isStraightLow = false;
        break;
      }
    }

    // If it's already a straight with Ace low, return true
    if (isStraightLow) return true;

    // If we have an Ace, also check with Ace as high (14)
    if (hasAce) {
      const valuesHigh = ranks
        .map((rank) => rank === "1" ? 14 : this.RANK_VALUES[rank])
        .sort((a, b) => a - b);

      // Check for consecutive values with Ace as high
      for (let i = 1; i < valuesHigh.length; i++) {
        if (valuesHigh[i] !== valuesHigh[i - 1] + 1) return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Check if hand is a royal flush (A, K, Q, J, 10)
   */
  private static isRoyalFlush(ranks: Rank[]): boolean {
    // Royal flush consists of Ace through 10
    const royalRanks = ["1", "Datu", "Babaylan", "Mandirigma", "10"];
    return (
      ranks.length === 5 && royalRanks.every((rank) => ranks.includes(rank))
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
      five_of_a_kind: "Five of a Kind",
    };

    return `${handNames[handType]} (${dominantElement})`;
  }
}
