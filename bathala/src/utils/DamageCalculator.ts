import {
  PlayingCard,
  HandType,
  Rank,
  Player,
  StatusEffect,
  Suit,
  Enemy,
  CombatEntity,
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
    // Validate input
    if (!cards || !Array.isArray(cards)) {
      console.warn('DamageCalculator.calculateBaseValue: Invalid cards array, returning 0');
      return 0;
    }

    return cards.reduce((sum, card) => {
      // Validate card object
      if (!card || !card.rank) {
        console.warn('DamageCalculator.calculateBaseValue: Invalid card object, skipping');
        return sum;
      }

      const cardValue = this.CARD_VALUES[card.rank];
      
      // Validate card value
      if (typeof cardValue !== 'number' || isNaN(cardValue) || !isFinite(cardValue)) {
        console.warn(`DamageCalculator.calculateBaseValue: Invalid card value for rank ${card.rank}, skipping`);
        return sum;
      }

      const newSum = sum + cardValue;
      
      // Check for overflow
      if (!isFinite(newSum)) {
        console.error('DamageCalculator.calculateBaseValue: Sum overflow detected, capping');
        return sum;
      }

      return newSum;
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

    // Validate input
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return 0;
    }

    // Count cards per suit
    const suitCounts: Record<Suit, number> = {
      Apoy: 0,
      Tubig: 0,
      Lupa: 0,
      Hangin: 0,
    };

    cards.forEach((card) => {
      // Validate card object
      if (!card || !card.suit) {
        console.warn('DamageCalculator.calculateElementalBonus: Invalid card object, skipping');
        return;
      }

      if (suitCounts[card.suit] !== undefined) {
        suitCounts[card.suit]++;
      } else {
        console.warn(`DamageCalculator.calculateElementalBonus: Unknown suit: ${card.suit}, skipping`);
      }
    });

    // Get the dominant suit count
    const counts = Object.values(suitCounts);
    
    // Validate counts
    if (counts.some(c => isNaN(c) || !isFinite(c))) {
      console.error('DamageCalculator.calculateElementalBonus: Invalid suit counts, returning 0');
      return 0;
    }

    const maxCount = Math.max(...counts);

    const bonus = this.ELEMENTAL_BONUSES[maxCount] || 0;
    
    // Validate bonus
    if (isNaN(bonus) || !isFinite(bonus)) {
      console.error(`DamageCalculator.calculateElementalBonus: Invalid bonus for count ${maxCount}, returning 0`);
      return 0;
    }

    return bonus;
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

    // Validate inputs
    if (!cards || !Array.isArray(cards)) {
      console.error('DamageCalculator.calculate: Invalid cards array');
      cards = [];
    }

    if (!handType) {
      console.warn('DamageCalculator.calculate: Missing handType, defaulting to high_card');
      handType = 'high_card';
    }

    if (!relicBonuses || !Array.isArray(relicBonuses)) {
      console.warn('DamageCalculator.calculate: Invalid relicBonuses, using empty array');
      relicBonuses = [];
    }

    // 1. Calculate base value from cards
    let baseValue = this.calculateBaseValue(cards);
    
    // Validate base value
    if (isNaN(baseValue) || !isFinite(baseValue)) {
      console.error(`DamageCalculator.calculate: Invalid baseValue: ${baseValue}, defaulting to 0`);
      baseValue = 0;
    }
    
    breakdown.push(`Cards: ${baseValue}`);

    // 2. Get hand bonus and multiplier
    const handData = this.HAND_BONUSES[handType];
    let handBonus = handData?.bonus ?? 0;
    let handMultiplier = handData?.multiplier ?? 1.0;
    
    // Validate hand data
    if (isNaN(handBonus) || !isFinite(handBonus)) {
      console.error(`DamageCalculator.calculate: Invalid handBonus: ${handBonus}, defaulting to 0`);
      handBonus = 0;
    }
    if (isNaN(handMultiplier) || !isFinite(handMultiplier) || handMultiplier <= 0) {
      console.error(`DamageCalculator.calculate: Invalid handMultiplier: ${handMultiplier}, defaulting to 1.0`);
      handMultiplier = 1.0;
    }
    
    breakdown.push(`Hand Bonus: +${handBonus}`);

    // 3. Calculate elemental bonus (only for Special actions)
    let elementalBonus = this.calculateElementalBonus(cards, actionType);
    
    // Validate elemental bonus
    if (isNaN(elementalBonus) || !isFinite(elementalBonus)) {
      console.error(`DamageCalculator.calculate: Invalid elementalBonus: ${elementalBonus}, defaulting to 0`);
      elementalBonus = 0;
    }
    
    if (elementalBonus > 0) {
      breakdown.push(`Elemental: +${elementalBonus}`);
    }

    // 4. Calculate status effect bonuses
    let statusBonus = 0;
    let weakStacks = 0;
    if (player && player.statusEffects) {
      // For attack actions, add Strength bonus
      if (actionType === "attack") {
        const strength = player.statusEffects.find(
          (e: StatusEffect) => e.id === "strength" || e.name === "Strength"
        );
        if (strength && typeof strength.value === 'number' && isFinite(strength.value)) {
          const strengthBonus = strength.value * 3;
          if (isFinite(strengthBonus)) {
            statusBonus += strengthBonus;
            breakdown.push(`Strength: +${strengthBonus}`);
          }
        }
        
        // Check for Weak debuff (reduces Attack damage by 25% per stack)
        const weak = player.statusEffects.find(
          (e: StatusEffect) => e.id === "weak" || e.name === "Weak"
        );
        if (weak && typeof weak.value === 'number' && isFinite(weak.value)) {
          weakStacks = Math.max(0, Math.min(3, weak.value)); // Cap at 3 stacks
        }
      }
      // For defend actions, add Dexterity bonus
      else if (actionType === "defend") {
        const dexterity = player.statusEffects.find(
          (e: StatusEffect) => e.name === "Dexterity"
        );
        if (dexterity && typeof dexterity.value === 'number' && isFinite(dexterity.value)) {
          const dexterityBonus = dexterity.value * 3;
          if (isFinite(dexterityBonus)) {
            statusBonus += dexterityBonus;
            breakdown.push(`Dexterity: +${dexterityBonus}`);
          }
        }
      }
    }

    // Validate status bonus
    if (isNaN(statusBonus) || !isFinite(statusBonus)) {
      console.error(`DamageCalculator.calculate: Invalid statusBonus: ${statusBonus}, defaulting to 0`);
      statusBonus = 0;
    }

    // 5. Calculate subtotal (before multiplier)
    let subtotal = baseValue + handBonus + elementalBonus + statusBonus;

    // Add relic bonuses to subtotal (they get multiplied too)
    let totalRelicBonus = 0;
    relicBonuses.forEach(bonus => {
      if (bonus && typeof bonus.amount === 'number' && isFinite(bonus.amount)) {
        totalRelicBonus += bonus.amount;
        breakdown.push(`${bonus.name || 'Relic'}: +${bonus.amount}`);
      }
    });
    
    if (isFinite(totalRelicBonus)) {
      subtotal += totalRelicBonus;
    }

    // Validate subtotal
    if (isNaN(subtotal) || !isFinite(subtotal)) {
      console.error(`DamageCalculator.calculate: Invalid subtotal: ${subtotal}, defaulting to 0`);
      subtotal = 0;
    }

    breakdown.push(`Subtotal: ${subtotal}`);

    // 6. Apply multiplier
    let finalValue = Math.floor(subtotal * handMultiplier);
    
    // Validate after multiplier
    if (isNaN(finalValue) || !isFinite(finalValue)) {
      console.error(`DamageCalculator.calculate: Invalid finalValue after multiplier: ${finalValue}, defaulting to 0`);
      finalValue = 0;
    }
    
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
    
    // Validate after action modifier
    if (isNaN(finalValue) || !isFinite(finalValue)) {
      console.error(`DamageCalculator.calculate: Invalid finalValue after action modifier: ${finalValue}, defaulting to 0`);
      finalValue = 0;
    }
    
    // 8. Apply Weak debuff (reduces Attack damage by 25% per stack, max 3 stacks = 75% reduction)
    if (weakStacks > 0 && actionType === "attack") {
      const weakMultiplier = 1.0 - (weakStacks * 0.25);
      finalValue = Math.floor(finalValue * weakMultiplier);
      breakdown.push(`⚠️ Weak (${weakStacks}): ×${weakMultiplier.toFixed(2)}`);
      
      // Validate after weak
      if (isNaN(finalValue) || !isFinite(finalValue)) {
        console.error(`DamageCalculator.calculate: Invalid finalValue after weak: ${finalValue}, defaulting to 0`);
        finalValue = 0;
      }
    }

    // 9. Apply elemental weakness/resistance multiplier (after DDA adjustments)
    let elementalMultiplier = 1.0;
    if (enemy && enemy.elementalAffinity) {
      const dominantElement = ElementalAffinitySystem.getDominantElement(cards);
      elementalMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        dominantElement,
        enemy.elementalAffinity
      );
      
      // Validate elemental multiplier
      if (isNaN(elementalMultiplier) || !isFinite(elementalMultiplier)) {
        console.error(`DamageCalculator.calculate: Invalid elementalMultiplier: ${elementalMultiplier}, defaulting to 1.0`);
        elementalMultiplier = 1.0;
      }
      
      // Add breakdown text for elemental multipliers
      if (elementalMultiplier !== 1.0) {
        const elementIcon = dominantElement ? ElementalAffinitySystem.getElementIcon(dominantElement) : '';
        if (elementalMultiplier === 1.5) {
          breakdown.push(`${elementIcon} Weakness: ×1.5`);
        } else if (elementalMultiplier === 0.75) {
          breakdown.push(`${elementIcon} Resistance: ×0.75`);
        } else {
          breakdown.push(`${elementIcon} Elemental: ×${elementalMultiplier.toFixed(2)}`);
        }
        finalValue = Math.floor(finalValue * elementalMultiplier);
        
        // Validate after elemental multiplier
        if (isNaN(finalValue) || !isFinite(finalValue)) {
          console.error(`DamageCalculator.calculate: Invalid finalValue after elemental: ${finalValue}, defaulting to 0`);
          finalValue = 0;
        }
      }
    } else if (enemy && !enemy.elementalAffinity) {
      // Missing affinity fallback - default to 1.0× multiplier
      console.log('DamageCalculator.calculate: Enemy missing elementalAffinity, using 1.0× multiplier');
    }

    // Final safety check: cap damage at 9999 to prevent overflow
    if (finalValue > 9999) {
      console.warn(`DamageCalculator.calculate: Final value ${finalValue} exceeds maximum, capping at 9999`);
      finalValue = 9999;
    }
    
    // Ensure non-negative
    if (finalValue < 0) {
      console.warn(`DamageCalculator.calculate: Final value ${finalValue} is negative, setting to 0`);
      finalValue = 0;
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

  /**
   * Apply Vulnerable multiplier to damage
   * Vulnerable makes the target take 50% more damage from all sources
   * @param damage - Base damage value
   * @param target - Target entity to check for Vulnerable status
   * @returns Modified damage value
   */
  static applyVulnerableMultiplier(damage: number, target: CombatEntity): number {
    // Validate inputs
    if (typeof damage !== 'number' || isNaN(damage) || !isFinite(damage)) {
      console.error(`DamageCalculator.applyVulnerableMultiplier: Invalid damage: ${damage}, returning 0`);
      return 0;
    }

    if (!target || !target.statusEffects) {
      console.warn('DamageCalculator.applyVulnerableMultiplier: Invalid target, returning original damage');
      return damage;
    }

    const vulnerable = target.statusEffects.find(
      (e: StatusEffect) => e.id === "vulnerable" || e.name === "Vulnerable"
    );
    
    if (vulnerable && typeof vulnerable.value === 'number' && vulnerable.value > 0) {
      const modifiedDamage = Math.floor(damage * 1.5);
      
      // Validate result
      if (isNaN(modifiedDamage) || !isFinite(modifiedDamage)) {
        console.error(`DamageCalculator.applyVulnerableMultiplier: Invalid result: ${modifiedDamage}, returning original damage`);
        return damage;
      }
      
      // Cap at 9999
      if (modifiedDamage > 9999) {
        console.warn(`DamageCalculator.applyVulnerableMultiplier: Result ${modifiedDamage} exceeds maximum, capping at 9999`);
        return 9999;
      }
      
      return modifiedDamage;
    }
    
    return damage;
  }
}
