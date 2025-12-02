import {
  PlayingCard,
  HandType,
  Rank,
  Player,
  StatusEffect,
  Suit,
  Enemy,
} from "../core/types/CombatTypes";
import { ElementalAffinitySystem } from "../core/managers/ElementalAffinitySystem";

/**
 * DamageCalculator - Balatro-inspired damage calculation system
 * Separates damage calculation logic from combat scene for better modularity
 */

export interface DamageCalculation {
  baseValue: number;          // Sum of all card values
  handBonus: number;          // Bonus from hand type
  handMultiplier: number;     // Multiplier from hand type
  elementalBonus: number;     // Bonus from dominant element
  elementalMultiplier: number; // Multiplier from elemental weakness/resistance (0.75, 1.0, or 1.5)
  statusBonus: number;        // Bonus from status effects (Strength/Dexterity)
  relicBonuses: { name: string; amount: number }[];
  subtotal: number;           // (baseValue + handBonus + elementalBonus + statusBonus)
  finalValue: number;         // subtotal × handMultiplier × elementalMultiplier
  breakdown: string[];        // Human-readable breakdown
}

export class DamageCalculator {
  /**
   * Card rank values for base damage calculation
   * Similar to Balatro's chip values
   */
  private static readonly CARD_VALUES: Record<Rank, number> = {
    "1": 6,        // Ace = 6 (reduced from 11)
    "2": 2,
    "3": 2,
    "4": 3,
    "5": 3,
    "6": 4,
    "7": 4,
    "8": 5,
    "9": 5,
    "10": 6,
    "Mandirigma": 6,  // Jack equivalent
    "Babaylan": 7,    // Queen equivalent
    "Datu": 7,        // King equivalent
  };

  /**
   * Hand type bonuses and multipliers
   * Balanced for higher numbers to make individual cards matter
   */
  private static readonly HAND_BONUSES: Record<
    HandType,
    { bonus: number; multiplier: number }
  > = {
    high_card: { bonus: 0, multiplier: 1 },
    pair: { bonus: 3, multiplier: 1.2 },
    two_pair: { bonus: 6, multiplier: 1.3 },
    three_of_a_kind: { bonus: 10, multiplier: 1.5 },
    straight: { bonus: 12, multiplier: 1.6 },
    flush: { bonus: 15, multiplier: 1.7 },
    full_house: { bonus: 20, multiplier: 2 },
    four_of_a_kind: { bonus: 25, multiplier: 2.2 },
    straight_flush: { bonus: 35, multiplier: 2.5 },
    royal_flush: { bonus: 40, multiplier: 2.8 },
    five_of_a_kind: { bonus: 38, multiplier: 2.6 },
  };

  /**
   * Elemental bonuses based on card count of dominant element
   * Rewards building elemental synergies
   */
  private static readonly ELEMENTAL_BONUSES: Record<number, number> = {
    0: 0,    // No cards of dominant element
    1: 1,    // 1 card: +1 bonus
    2: 3,    // 2 cards: +3 bonus
    3: 6,    // 3 cards: +6 bonus
    4: 10,   // 4 cards: +10 bonus
    5: 15,   // 5 cards (pure element): +15 bonus
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
   * Calculate elemental bonus based on dominant suit count
   * Only applies to Special attacks to maintain balance
   */
  static calculateElementalBonus(cards: PlayingCard[], actionType: "attack" | "defend" | "special"): number {
    // Elemental bonuses only apply to Special actions
    if (actionType !== "special") {
      return 0;
    }

    if (cards.length === 0) return 0;

    // Count cards per suit
    const suitCounts: Record<Suit, number> = {
      Apoy: 0,
      Tubig: 0,
      Lupa: 0,
      Hangin: 0,
    };

    cards.forEach((card) => {
      suitCounts[card.suit]++;
    });

    // Get the dominant suit count
    const maxCount = Math.max(...Object.values(suitCounts));

    return this.ELEMENTAL_BONUSES[maxCount] || 0;
  }

  /**
   * Calculate complete damage for an action
   * @param cards - Cards being played
   * @param handType - Evaluated poker hand type
   * @param actionType - Type of action (attack/defend/special)
   * @param player - Player entity (for status effects and relics)
   * @param enemy - Enemy entity (for elemental affinity calculations)
   * @param relicBonuses - Additional relic bonuses to include
   */
  static calculate(
    cards: PlayingCard[],
    handType: HandType,
    actionType: "attack" | "defend" | "special",
    player?: Player,
    enemy?: Enemy,
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

    // 3. Calculate elemental bonus (only for Special actions)
    const elementalBonus = this.calculateElementalBonus(cards, actionType);
    if (elementalBonus > 0) {
      breakdown.push(`Elemental: +${elementalBonus}`);
    }

    // 4. Calculate status effect bonuses
    let statusBonus = 0;
    let hasWeakDebuff = false;
    if (player) {
      // For attack actions, add Strength bonus
      if (actionType === "attack") {
        const strength = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Strength"
        );
        if (strength) {
          statusBonus += strength.value * 3; // Each stack adds 3 base value (reduced from 5)
          breakdown.push(`Strength: +${strength.value * 3}`);
        }
        
        // Check for Weak debuff (reduces Attack damage by 50%)
        const weak = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Weak"
        );
        if (weak) {
          hasWeakDebuff = true;
        }
      }
      // For defend actions, add Dexterity bonus
      else if (actionType === "defend") {
        const dexterity = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Dexterity"
        );
        if (dexterity) {
          statusBonus += dexterity.value * 3; // Each stack adds 3 base value (reduced from 5)
          breakdown.push(`Dexterity: +${dexterity.value * 3}`);
        }
      }
    }

    // 5. Calculate subtotal (before multiplier)
    let subtotal = baseValue + handBonus + elementalBonus + statusBonus;

    // Add relic bonuses to subtotal (they get multiplied too)
    const totalRelicBonus = relicBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    if (totalRelicBonus > 0) {
      subtotal += totalRelicBonus;
      relicBonuses.forEach(bonus => {
        breakdown.push(`${bonus.name}: +${bonus.amount}`);
      });
    }

    breakdown.push(`Subtotal: ${subtotal}`);

    // 6. Apply multiplier
    let finalValue = Math.floor(subtotal * handMultiplier);
    breakdown.push(`Multiplier: ×${handMultiplier}`);

    // 7. Apply action type modifiers
    if (actionType === "defend") {
      // Defense is slightly less efficient to maintain balance
      finalValue = Math.floor(finalValue * 0.8);
      breakdown.push(`Defense Modifier: ×0.8`);
    } else if (actionType === "special") {
      // Special deals less direct damage but has elemental effects
      finalValue = Math.floor(finalValue * 0.6);
      breakdown.push(`Special Modifier: ×0.6`);
    }
    
    // 8. Apply Weak debuff (reduces Attack damage by 50%)
    if (hasWeakDebuff && actionType === "attack") {
      finalValue = Math.floor(finalValue * 0.5);
      breakdown.push(`⚠️ Weak: ×0.5`);
    }

    // 9. Apply elemental weakness/resistance multiplier (after DDA adjustments)
    let elementalMultiplier = 1.0;
    if (enemy && enemy.elementalAffinity) {
      const dominantElement = ElementalAffinitySystem.getDominantElement(cards);
      elementalMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        dominantElement,
        enemy.elementalAffinity
      );
      
      // Add breakdown text for elemental multipliers
      if (elementalMultiplier !== 1.0) {
        const elementIcon = dominantElement ? ElementalAffinitySystem.getElementIcon(dominantElement) : '';
        if (elementalMultiplier === 1.5) {
          breakdown.push(`${elementIcon} Weakness: ×1.5`);
        } else if (elementalMultiplier === 0.75) {
          breakdown.push(`${elementIcon} Resistance: ×0.75`);
        }
        finalValue = Math.floor(finalValue * elementalMultiplier);
      }
    }

    breakdown.push(`Final: ${finalValue}`);

    return {
      baseValue,
      handBonus,
      handMultiplier,
      elementalBonus,
      elementalMultiplier,
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
