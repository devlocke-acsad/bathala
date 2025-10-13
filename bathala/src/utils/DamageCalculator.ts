import {
  PlayingCard,
  HandType,
  Rank,
  Player,
  StatusEffect,
} from "../core/types/CombatTypes";

/**
 * DamageCalculator - Balatro-inspired damage calculation system
 * Separates damage calculation logic from combat scene for better modularity
 */

export interface DamageCalculation {
  baseValue: number;          // Sum of all card values
  handBonus: number;          // Bonus from hand type
  handMultiplier: number;     // Multiplier from hand type
  statusBonus: number;        // Bonus from status effects (Strength/Dexterity)
  relicBonuses: { name: string; amount: number }[];
  subtotal: number;           // (baseValue + handBonus + statusBonus)
  finalValue: number;         // subtotal × handMultiplier
  breakdown: string[];        // Human-readable breakdown
}

export class DamageCalculator {
  /**
   * Card rank values for base damage calculation
   * Similar to Balatro's chip values
   */
  private static readonly CARD_VALUES: Record<Rank, number> = {
    "1": 11,        // Ace = 11 (like in Balatro)
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "Mandirigma": 10,  // Jack equivalent
    "Babaylan": 10,    // Queen equivalent
    "Datu": 10,        // King equivalent
  };

  /**
   * Hand type bonuses and multipliers
   * Balanced for higher numbers to make individual cards matter
   */
  private static readonly HAND_BONUSES: Record<
    HandType,
    { bonus: number; multiplier: number }
  > = {
    high_card: { bonus: 5, multiplier: 1 },
    pair: { bonus: 10, multiplier: 2 },
    two_pair: { bonus: 20, multiplier: 2 },
    three_of_a_kind: { bonus: 30, multiplier: 3 },
    straight: { bonus: 30, multiplier: 4 },
    flush: { bonus: 35, multiplier: 4 },
    full_house: { bonus: 40, multiplier: 4 },
    four_of_a_kind: { bonus: 60, multiplier: 7 },
    straight_flush: { bonus: 100, multiplier: 8 },
    royal_flush: { bonus: 100, multiplier: 8 },
    five_of_a_kind: { bonus: 120, multiplier: 12 },
  };

  /**
   * Calculate base value from all cards in hand
   */
  static calculateBaseValue(cards: PlayingCard[]): number {
    return cards.reduce((sum, card) => {
      return sum + this.CARD_VALUES[card.rank];
    }, 0);
  }

  /**
   * Calculate complete damage for an action
   * @param cards - Cards being played
   * @param handType - Evaluated poker hand type
   * @param actionType - Type of action (attack/defend/special)
   * @param player - Player entity (for status effects and relics)
   * @param relicBonuses - Additional relic bonuses to include
   */
  static calculate(
    cards: PlayingCard[],
    handType: HandType,
    actionType: "attack" | "defend" | "special",
    player?: Player,
    relicBonuses: { name: string; amount: number }[] = []
  ): DamageCalculation {
    const breakdown: string[] = [];

    // 1. Calculate base value from cards
    const baseValue = this.calculateBaseValue(cards);
    breakdown.push(`Cards: ${baseValue}`);

    // 2. Get hand bonus and multiplier
    const handData = this.HAND_BONUSES[handType];
    const handBonus = handData.bonus;
    const handMultiplier = handData.multiplier;
    breakdown.push(`Hand Bonus: +${handBonus}`);

    // 3. Calculate status effect bonuses
    let statusBonus = 0;
    if (player) {
      // For attack actions, add Strength bonus
      if (actionType === "attack") {
        const strength = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Strength"
        );
        if (strength) {
          statusBonus += strength.value * 5; // Each stack adds 5 base value
          breakdown.push(`Strength: +${strength.value * 5}`);
        }
      }
      // For defend actions, add Dexterity bonus
      else if (actionType === "defend") {
        const dexterity = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Dexterity"
        );
        if (dexterity) {
          statusBonus += dexterity.value * 5; // Each stack adds 5 base value
          breakdown.push(`Dexterity: +${dexterity.value * 5}`);
        }
      }
    }

    // 4. Calculate subtotal (before multiplier)
    let subtotal = baseValue + handBonus + statusBonus;

    // Add relic bonuses to subtotal (they get multiplied too)
    const totalRelicBonus = relicBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    if (totalRelicBonus > 0) {
      subtotal += totalRelicBonus;
      relicBonuses.forEach(bonus => {
        breakdown.push(`${bonus.name}: +${bonus.amount}`);
      });
    }

    breakdown.push(`Subtotal: ${subtotal}`);

    // 5. Apply multiplier
    let finalValue = Math.floor(subtotal * handMultiplier);
    breakdown.push(`Multiplier: ×${handMultiplier}`);

    // 6. Apply action type modifiers
    if (actionType === "defend") {
      // Defense is slightly less efficient to maintain balance
      finalValue = Math.floor(finalValue * 0.8);
      breakdown.push(`Defense Modifier: ×0.8`);
    } else if (actionType === "special") {
      // Special deals less direct damage but has elemental effects
      finalValue = Math.floor(finalValue * 0.6);
      breakdown.push(`Special Modifier: ×0.6`);
    }

    breakdown.push(`Final: ${finalValue}`);

    return {
      baseValue,
      handBonus,
      handMultiplier,
      statusBonus,
      relicBonuses,
      subtotal,
      finalValue,
      breakdown,
    };
  }

  /**
   * Get card value for display purposes
   */
  static getCardValue(rank: Rank): number {
    return this.CARD_VALUES[rank];
  }

  /**
   * Get hand bonus data for display purposes
   */
  static getHandBonusData(handType: HandType): { bonus: number; multiplier: number } {
    return this.HAND_BONUSES[handType];
  }
}
