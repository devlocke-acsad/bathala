import {
  PlayingCard,
  HandType,
  HandEvaluation,
  Rank,
  Element,
  Player,
} from "../core/types/CombatTypes";
import { DamageCalculator } from "./DamageCalculator";

/**
 * HandEvaluator - Evaluates poker hands and calculates damage
 * Core mechanic for Bathala's combat system with Balatro-inspired calculations
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

  /**
   * Evaluate a hand of cards and return complete damage calculation
   */
  static evaluateHand(cards: PlayingCard[], action: "attack" | "defend" | "special", player: Player | null = null): HandEvaluation {
    if (cards.length === 0) {
      return {
        type: "high_card",
        baseValue: 0,
        handBonus: 0,
        handMultiplier: 1,
        elementalBonus: 0,
        totalValue: 0,
        description: "No cards played",
        breakdown: ["No cards played"],
      };
    }

    // Check if player has Echo of the Ancestors relic to enable Five of a Kind
    let enableFiveOfAKind = false;
    if (player) {
      enableFiveOfAKind = player.relics.some((r: any) => r.id === "echo_ancestors");
    }
    
    let handType = this.determineHandType(cards, enableFiveOfAKind);
    
    // Apply Babaylan's Talisman effect: Hand is considered one tier higher
    if (player) {
      handType = this.applyBabaylansTalismanEffect(handType, player);
    }
    
    // Use DamageCalculator for the new calculation system
    const calculation = DamageCalculator.calculate(
      cards,
      handType,
      action,
      player || undefined,
      [] // Relic bonuses will be added in Combat.ts
    );

    return {
      type: handType,
      baseValue: calculation.baseValue,
      handBonus: calculation.handBonus,
      handMultiplier: calculation.handMultiplier,
      elementalBonus: calculation.elementalBonus,
      totalValue: calculation.finalValue,
      description: this.getHandDescription(handType, cards),
      breakdown: calculation.breakdown,
    };
  }

  /**
   * Determine the poker hand type
   */
  private static determineHandType(cards: PlayingCard[], enableFiveOfAKind: boolean = false): HandType {
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

    if (counts[0] === 5) {
      // Only return Five of a Kind if the Echo of the Ancestors relic is active
      if (enableFiveOfAKind) return "five_of_a_kind";
      // Otherwise, it's still a Four of a Kind, but with an extra card
      return "four_of_a_kind";
    }
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
   * Apply the Babaylan's Talisman effect: Hand is considered one tier higher
   */
  private static applyBabaylansTalismanEffect(handType: HandType, player: any): HandType {
    // Check if player has Babaylan's Talisman relic
    const hasBabaylansTalisman = player.relics.some((r: any) => r.id === "babaylans_talisman");
    
    if (!hasBabaylansTalisman) {
      return handType;
    }

    // Only apply if it would result in a valid hand type
    const handRankings: Record<HandType, number> = {
      "high_card": 1,
      "pair": 2,
      "two_pair": 3,
      "three_of_a_kind": 4,
      "straight": 5,
      "flush": 6,
      "full_house": 7,
      "four_of_a_kind": 8,
      "straight_flush": 9,
      "royal_flush": 10,
      "five_of_a_kind": 11
    };

    // Create a reverse mapping from ranking to hand type
    const reverseRankings: Record<number, HandType> = {
      1: "high_card",
      2: "pair",
      3: "two_pair",
      4: "three_of_a_kind",
      5: "straight",
      6: "flush",
      7: "full_house",
      8: "four_of_a_kind",
      9: "straight_flush",
      10: "royal_flush",
      11: "five_of_a_kind"
    };

    const currentRank = handRankings[handType];
    const nextRank = Math.min(currentRank + 1, 11); // Cap at 11 for five_of_a_kind
    return reverseRankings[nextRank] || handType;
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