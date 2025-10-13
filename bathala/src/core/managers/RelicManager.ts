import { Player, Relic, PlayingCard, HandType, StatusEffect } from "../types/CombatTypes";
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

    // Apply "Bakunawa Scale" effect: Gain 5 Max HP and damage reduction
    const bakunawaScale = player.relics.find(r => r.id === "bakunawa_scale");
    if (bakunawaScale) {
      player.maxHealth += 5;
      player.currentHealth += 5; // Also heal when first obtained
    }

    // Apply "Merchant's Scale" effect: All shop items are 20% cheaper
    const merchantsScale = player.relics.find(r => r.id === "merchants_scale");
    if (merchantsScale) {
      // This is handled in shop pricing logic
    }

    // Apply "Tigmamanukan's Eye" effect: Draw 1 additional card at start
    const tigmamanukanEye = player.relics.find(r => r.id === "tigmamanukan_eye");
    if (tigmamanukanEye) {
      // This is handled in the initial draw logic in Combat.ts
    }

    // Apply "Umalagad's Spirit" effect: Gain 1 temporary Dexterity
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit) {
      // Add temporary dexterity status effect
      const dexterityEffect: StatusEffect = {
        id: "dexterity_relic",
        name: "Dexterity",
        type: "buff" as const,
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
      const dexterityEffect: StatusEffect = {
        id: "dexterity_diwata",
        name: "Dexterity",
        type: "buff" as const,
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

    // Apply "Stone Golem's Heart" effect: Gain 10 Max HP and 2 Block at start
    const stoneGolemHeart = player.relics.find(r => r.id === "stone_golem_heart");
    if (stoneGolemHeart) {
      player.maxHealth += 10;
      player.currentHealth += 10; // Also heal 10 HP
      player.block += 2;
    }
    
    // Apply "Tikbalang's Hoof" effect: +10% dodge
    // This is handled in Combat.ts during damage calculations
    
    // Apply "Balete Root" effect: +2 block per Lupa card
    // This is handled in Combat.ts when defending
    
    // Apply "Duwende Charm" effect: +10% avoid Weak
    // This is handled in Combat.ts when applying Weak status
    
    // Apply "Tiyanak Tear" effect: Ignore 1 Fear
    // This is handled in Combat.ts when applying Fear status
    
    // Apply "Mangangaway Wand" effect: Ignore 1 curse
    // This is handled in Combat.ts when curses are applied
  }

  /**
   * Apply all relevant relic effects at the start of the player's turn
   */
  static applyStartOfTurnEffects(player: Player): void {
    // Apply "Ember Fetish" effect: Gain 3 Strength if no block at start of turn
    const emberFetish = player.relics.find(r => r.id === "ember_fetish");
    if (emberFetish && player.block === 0) {
      // Add temporary strength status effect
      const strengthEffect: StatusEffect = {
        id: "strength_ember",
        name: "Strength",
        type: "buff" as const,
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
      const strengthEffect: StatusEffect = {
        id: "strength_ancestral",
        name: "Strength",
        type: "buff" as const,
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
    
    // Apply "Wind Veil" effect: +1 draw on Air cards
    const windVeil = player.relics.find(r => r.id === "wind_veil");
    const hanginCards = hand.filter(card => card.suit === "Hangin").length;
    if (windVeil && hanginCards > 0) {
      // Draw additional cards based on number of Hangin cards played
      // This needs to be handled in Combat.ts since it needs to modify the hand
    }
    
    // Apply "Balete Root" effect: +2 block per Lupa card (for defend action)
    // This is handled in Combat.ts when defending
  }

  /**
   * Calculate dodge chance with "Tikbalang's Hoof" effect
   */
  static calculateDodgeChance(player: Player): number {
    // Base dodge chance is 0, but Tikbalang's Hoof adds 10%
    let dodgeChance = 0;
    const tikbalangsHoof = player.relics.find(r => r.id === "tikbalangs_hoof");
    if (tikbalangsHoof) {
      dodgeChance += 0.10; // 10% dodge chance
    }
    return dodgeChance;
  }

  /**
   * Calculate additional block from "Balete Root" effect
   */
  static calculateBaleteRootBlock(player: Player, playedHand: PlayingCard[]): number {
    const baleteRoot = player.relics.find(r => r.id === "balete_root");
    if (baleteRoot) {
      const lupaCards = playedHand.filter(card => card.suit === "Lupa").length;
      return lupaCards * 2; // +2 block per Lupa card
    }
    return 0;
  }

  /**
   * Calculate additional damage from "Sigbin Heart" effect on burst
   */
  static calculateSigbinHeartDamage(player: Player): number {
    const sigbinHeart = player.relics.find(r => r.id === "sigbin_heart");
    if (sigbinHeart) {
      // "On burst" means when player is at low health (below 30%)
      if (player.currentHealth < player.maxHealth * 0.3) {
        return 5; // +5 damage when low on health
      }
    }
    return 0;
  }

  /**
   * Calculate damage reduction from "Bakunawa Scale" effect
   */
  static calculateDamageReduction(incomingDamage: number, player: Player): number {
    const bakunawaScale = player.relics.find(r => r.id === "bakunawa_scale");
    if (bakunawaScale) {
      return Math.max(0, incomingDamage - 1); // Reduce all damage by 1
    }
    return incomingDamage;
  }

  /**
   * Calculate shop price reduction from "Merchant's Scale" effect
   */
  static calculateShopPriceReduction(originalPrice: number, player: Player): number {
    const merchantsScale = player.relics.find(r => r.id === "merchants_scale");
    if (merchantsScale) {
      return Math.floor(originalPrice * 0.8); // 20% cheaper (80% of original price)
    }
    return originalPrice;
  }

  /**
   * Check if first shop item is free with "Bargain Talisman"
   */
  static isFirstShopItemFree(player: Player, _actNumber: number): boolean {
    const bargainTalisman = player.relics.find(r => r.id === "bargain_talisman");
    if (bargainTalisman) {
      // This would need to track if the first item has been purchased this act
      // For now, return false - would need game state tracking
      return false;
    }
    return false;
  }

  /**
   * Calculate initial hand size with "Tigmamanukan's Eye" effect
   */
  static calculateInitialHandSize(baseHandSize: number, player: Player): number {
    const tigmamanukanEye = player.relics.find(r => r.id === "tigmamanukan_eye");
    if (tigmamanukanEye) {
      return baseHandSize + 1; // Draw 1 additional card
    }
    return baseHandSize;
  }

  /**
   * Apply relic effects when a relic is first obtained
   */
  static applyRelicAcquisitionEffect(relicId: string, player: Player): void {
    switch (relicId) {
      case "stone_golem_heart":
        // Gain 10 Max HP permanently
        player.maxHealth += 10;
        player.currentHealth += 10; // Also heal when first obtained
        break;
        
      case "bakunawa_scale":
        // Gain 5 Max HP permanently
        player.maxHealth += 5;
        player.currentHealth += 5; // Also heal when first obtained
        break;
        
      case "tigmamanukan_eye":
        // This relic's effect is passive, no immediate bonus
        break;
        
      case "merchant_scale":
      case "bargain_talisman":
        // These are passive shop effects, no immediate bonus
        break;
        
      case "earthwardens_plate":
      case "swift_wind_agimat":
      case "ember_fetish":
      case "umalagad_spirit":
      case "babaylans_talisman":
      case "ancestral_blade":
      case "tidal_amulet":
      case "sarimanok_feather":
      case "echo_ancestors":
      case "diwatas_crown":
      case "lucky_charm":
        // These are combat-only effects, no permanent bonuses
        break;
        
      default:
        // Handle mythological relics
        RelicManager.applyMythologicalRelicAcquisition(relicId, player);
        break;
    }
  }

  /**
   * Apply mythological relic acquisition effects
   */
  private static applyMythologicalRelicAcquisition(relicId: string, player: Player): void {
    // Most mythological relics are passive combat effects
    // Only permanent effects would go here
    switch (relicId) {
      case "tikbalangs_hoof":
      case "balete_root":
      case "sigbin_heart":
      case "duwende_charm":
      case "tiyanak_tear":
      case "amomongo_claw":
      case "bungisngis_grin":
      case "kapres_cigar":
      case "wind_veil":
      case "mangangaway_wand":
        // These are all passive combat effects, no permanent bonuses
        break;
    }
  }

  /**
   * Check if "Duwende Charm" helps avoid Weak status
   */
  static shouldApplyWeakStatus(player: Player): boolean {
    const duwendeCharm = player.relics.find(r => r.id === "duwende_charm");
    if (duwendeCharm) {
      // 10% chance to avoid Weak status
      return Math.random() > 0.10;
    }
    return true; // Apply status normally
  }

  /**
   * Check if "Tiyanak Tear" helps ignore Fear status
   */
  static shouldApplyFearStatus(player: Player): boolean {
    const tiyanakTear = player.relics.find(r => r.id === "tiyanak_tear");
    if (tiyanakTear) {
      // Ignore 1 Fear status
      return Math.random() > 0.10; // Simple implementation: 10% ignore chance
    }
    return true; // Apply status normally
  }

  /**
   * Calculate additional bleed damage from "Amomongo Claw" effect
   */
  static calculateAmomongoClawBleedDamage(baseBleedDamage: number, player: Player): number {
    const amomongoClaw = player.relics.find(r => r.id === "amomongo_claw");
    if (amomongoClaw) {
      return baseBleedDamage + 3; // +3 bleed damage
    }
    return baseBleedDamage;
  }

  /**
   * Calculate additional damage from "Bungisngis Grin" effect when applying debuffs
   */
  static calculateBungisngisGrinDamage(player: Player): number {
    const bungisngisGrin = player.relics.find(r => r.id === "bungisngis_grin");
    if (bungisngisGrin) {
      return 5; // +5 damage when applying debuffs
    }
    return 0;
  }

  /**
   * Check if "Mangangaway Wand" ignores curses
   */
  static shouldIgnoreCurse(player: Player): boolean {
    const mangangawayWand = player.relics.find(r => r.id === "mangangaway_wand");
    if (mangangawayWand) {
      // For now, simple implementation: ignore 1 curse
      return true;
    }
    return false;
  }

  /**
   * Calculate additional cards drawn with "Wind Veil" effect
   */
  static calculateWindVeilCardDraw(playedHand: PlayingCard[], player: Player): number {
    const windVeil = player.relics.find(r => r.id === "wind_veil");
    if (windVeil) {
      const hanginCards = playedHand.filter(card => card.suit === "Hangin").length;
      return hanginCards; // +1 draw per Hangin card
    }
    return 0;
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
  
  /**
   * Handle "Kapre's Cigar" effect: Summons minion once per combat
   */
  static tryKapresCigarSummon(combatScene: any, player: Player): boolean {
    const kapresCigar = player.relics.find(r => r.id === "kapres_cigar");
    if (kapresCigar && !combatScene.kapresCigarUsed) {
      // Mark as used for this combat
      combatScene.kapresCigarUsed = true;
      
      // Show result message
      combatScene.showActionResult("Kapre's Cigar summoned aid!");
      
      // For now, this might provide some benefit (e.g., extra damage, block, or other effect)
      // This would be expanded in a full implementation
      return true;
    }
    return false;
  }
}