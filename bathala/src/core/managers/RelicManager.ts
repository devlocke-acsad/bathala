import { Player, Relic, PlayingCard, HandType } from "../types/CombatTypes";
import { HandEvaluator } from "../../utils/HandEvaluator";

/**
 * RelicManager - Manages all relic effects in combat and other game systems
 * Handles applying active relic effects during combat and attune sessions
 */
export class RelicManager {
  
  /**
   * Apply all relevant relic effects at the start of combat
   */
  static applyStartOfCombatEffects(player: Player): void {
    // Apply "Earthwarden's Plate" effect: Start with 5 persistent block
    const earthwardensPlate = player.relics.find(r => r.id === "earthwardens_plate");
    if (earthwardensPlate) {
      player.block += 5;
    }

    // Apply "Agimat of the Swift Wind" effect: Start with 1 additional discard charge
    const swiftWindAgimat = player.relics.find(r => r.id === "swift_wind_agimat");
    if (swiftWindAgimat) {
      player.discardCharges += 1;
      player.maxDiscardCharges += 1;
    }

    // Apply "Umalagad's Spirit" effect: Gain 1 temporary Dexterity
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit) {
      // Add temporary dexterity status effect
      const dexterityEffect = {
        id: "dexterity_relic",
        name: "Dexterity",
        type: "buff",
        duration: 999, // Permanent for this combat
        value: 1,
        description: "Gain +1 additional block per stack with Defend actions.",
        emoji: "⛨",
      };
      
      // Check if dexterity effect already exists to avoid duplicates
      const existingEffect = player.statusEffects.find(e => e.id === "dexterity_relic");
      if (!existingEffect) {
        player.statusEffects.push(dexterityEffect);
      }
    }

    // Apply "Diwata's Crown" effect: Start with 10 Block and gain 1 temporary Dexterity
    const diwatasCrown = player.relics.find(r => r.id === "diwatas_crown");
    if (diwatasCrown) {
      // Add the 10 block
      player.block += 10;
      // Add temporary dexterity status effect
      const dexterityEffect = {
        id: "dexterity_diwata",
        name: "Dexterity",
        type: "buff",
        duration: 999, // Permanent for this combat
        value: 1,
        description: "Gain +1 additional block per stack with Defend actions.",
        emoji: "⛨",
      };
      
      // Check if dexterity effect already exists to avoid duplicates
      const existingEffect = player.statusEffects.find(e => e.id === "dexterity_diwata");
      if (!existingEffect) {
        player.statusEffects.push(dexterityEffect);
      }
    }

    // Apply "Tidal Amulet" effect: Heal 2 HP for each card in hand at end of turn
    // (This effect is handled at the end of the turn in Combat.ts)
    
    // Apply "Tigmamanukan's Eye" effect: Draw 1 additional card at start of combat
    const tigmamanukanEye = player.relics.find(r => r.id === "tigmamanukan_eye");
    if (tigmamanukanEye) {
      // In Combat.ts, this is handled by increasing the initial hand draw
    }

    // Apply "Stone Golem's Heart" effect: Gain 10 Max HP and 2 Block at start
    const stoneGolemHeart = player.relics.find(r => r.id === "stone_golem_heart");
    if (stoneGolemHeart) {
      player.maxHealth += 10;
      player.currentHealth += 10; // Also heal 10 HP
      player.block += 2;
    }
  }

  /**
   * Apply all relevant relic effects at the start of the player's turn
   */
  static applyStartOfTurnEffects(player: Player): void {
    // Apply "Ember Fetish" effect: Gain 3 Strength if no block at start of turn
    const emberFetish = player.relics.find(r => r.id === "ember_fetish");
    if (emberFetish && player.block === 0) {
      // Add temporary strength status effect
      const strengthEffect = {
        id: "strength_ember",
        name: "Strength",
        type: "buff",
        duration: 999, // Permanent for this combat
        value: 3,
        description: "Deal +3 additional damage per stack with Attack actions.",
        emoji: "†",
      };
      
      // Check if strength effect already exists to avoid duplicates
      const existingEffect = player.statusEffects.find(e => e.id === "strength_ember");
      if (!existingEffect) {
        player.statusEffects.push(strengthEffect);
      }
    }
  }

  /**
   * Apply relic effects after a hand is played
   */
  static applyAfterHandPlayedEffects(player: Player, hand: PlayingCard[], evaluation: any): void {
    // Apply "Babaylan's Talisman" effect: Hand is considered one tier higher
    // (This is handled during hand evaluation in HandEvaluator)

    // Apply "Ancestral Blade" effect: Gain 2 temporary Strength when playing a Flush
    const ancestralBlade = player.relics.find(r => r.id === "ancestral_blade");
    if (ancestralBlade && evaluation.type === "flush") {
      // Add temporary strength status effect
      const strengthEffect = {
        id: "strength_ancestral",
        name: "Strength",
        type: "buff",
        duration: 999, // Permanent for this combat
        value: 2,
        description: "Deal +2 additional damage per stack with Attack actions.",
        emoji: "†",
      };
      
      // Check if strength effect already exists to avoid duplicates
      const existingEffect = player.statusEffects.find(e => e.id === "strength_ancestral");
      if (!existingEffect) {
        player.statusEffects.push(strengthEffect);
      }
    }

    // Apply "Sarimanok Feather" effect: Gain 1 Ginto when playing Straight or better
    const sarimanokFeather = player.relics.find(r => r.id === "sarimanok_feather");
    if (sarimanokFeather && RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
      player.ginto += 1;
    }

    // Apply "Lucky Charm" effect: Gain 1 Ginto when playing Straight or better
    const luckyCharm = player.relics.find(r => r.id === "lucky_charm");
    if (luckyCharm && RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
      player.ginto += 1;
    }
  }

  /**
   * Apply relic effects at the end of the turn
   */
  static applyEndOfTurnEffects(player: Player): void {
    // Apply "Tidal Amulet" effect: Heal 2 HP for each card in hand
    const tidalAmulet = player.relics.find(r => r.id === "tidal_amulet");
    if (tidalAmulet) {
      const healAmount = player.hand.length * 2;
      player.currentHealth = Math.min(player.maxHealth, player.currentHealth + healAmount);
    }
  }

  /**
   * Check if a hand type is at least as good as a specified type
   */
  private static isHandTypeAtLeast(handType: HandType, targetType: HandType): boolean {
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

    return handRankings[handType] >= handRankings[targetType];
  }

  /**
   * Get the modified hand type based on the "Babaylan's Talisman" effect
   */
  static getModifiedHandType(originalType: HandType, player: Player): HandType {
    const babaylansTalisman = player.relics.find(r => r.id === "babaylans_talisman");
    
    if (!babaylansTalisman) {
      return originalType;
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

    const currentRank = handRankings[originalType];
    const nextRank = Math.min(currentRank + 1, 11); // Cap at 11 for five_of_a_kind
    return reverseRankings[nextRank] || originalType;
  }

  /**
   * Check if the "Echo of the Ancestors" relic is active to enable Five of a Kind
   */
  static hasFiveOfAKindEnabled(player: Player): boolean {
    return player.relics.some(r => r.id === "echo_ancestors");
  }
}