import { Player, Relic, PlayingCard, HandType, StatusEffect } from "../types/CombatTypes";
import { HandEvaluator } from "../../utils/HandEvaluator";
import { RELIC_EFFECTS, hasRelicEffect, getRelicById } from "../../data/relics/Act1Relics";

/**
 * RelicManager - Manages all relic effects in combat and other game systems
 * Handles applying active relic effects during combat and attune sessions
 */
export class RelicManager {
  
  /**
   * Helper method to add dexterity effect to player
   */
  private static addDexterityEffect(player: Player, effectId: string, value: number): void {
    const dexterityEffect: StatusEffect = {
      id: effectId,
      name: "Dexterity",
      type: "buff" as const,
      duration: 999, // Permanent for this combat
      value: value,
      description: "Gain +1 additional block per stack with Defend actions.",
      emoji: "⛨",
    };
    
    // Check if dexterity effect already exists to avoid duplicates
    const existingEffect = player.statusEffects.find(e => e.id === effectId);
    if (!existingEffect) {
      player.statusEffects.push(dexterityEffect);
    }
  }

  /**
   * Helper method to add strength effect to player
   */
  private static addStrengthEffect(player: Player, effectId: string, value: number): void {
    const strengthEffect: StatusEffect = {
      id: effectId,
      name: "Strength",
      type: "buff" as const,
      duration: 999, // Permanent for this combat
      value: value,
      description: "Deal +3 additional damage per stack with Attack actions.",
      emoji: "†",
    };
    
    // Check if strength effect already exists to avoid duplicates
    const existingEffect = player.statusEffects.find(e => e.id === effectId);
    if (!existingEffect) {
      player.statusEffects.push(strengthEffect);
    }
  }
  
  /**
   * Apply all relevant relic effects at the start of combat
   * Now uses centralized relic system for easier management
   */
  static applyStartOfCombatEffects(player: Player): void {
    // Apply all start-of-combat effects using the centralized system
    RELIC_EFFECTS.START_OF_COMBAT.forEach(relicId => {
      const relic = player.relics.find(r => r.id === relicId);
      if (!relic) return;

      switch (relicId) {
        case "earthwardens_plate":
          player.block += 5;
          break;
          
        case "swift_wind_agimat":
          player.discardCharges += 1;
          player.maxDiscardCharges += 1;
          break;
          
        case "umalagad_spirit":
          RelicManager.addDexterityEffect(player, "dexterity_relic", 1);
          break;
          
        case "diwatas_crown":
          player.block += 10;
          RelicManager.addDexterityEffect(player, "dexterity_diwata", 1);
          break;
          
        case "stone_golem_heart":
          player.maxHealth += 10;
          player.currentHealth += 10;
          player.block += 2;
          break;
          
        case "bakunawa_scale":
          player.maxHealth += 5;
          player.currentHealth += 5;
          break;
          
        case "tigmamanukan_eye":
          // This is handled in the initial draw logic in Combat.ts
          break;
      }
    });
  }

  /**
   * Apply all relevant relic effects at the start of the player's turn
   * Now uses centralized relic system for easier management
   */
  static applyStartOfTurnEffects(player: Player): void {
    // Apply all start-of-turn effects using the centralized system
    RELIC_EFFECTS.START_OF_TURN.forEach(relicId => {
      const relic = player.relics.find(r => r.id === relicId);
      if (!relic) return;

      switch (relicId) {
        case "ember_fetish":
          if (player.block === 0) {
            RelicManager.addStrengthEffect(player, "strength_ember", 3);
          }
          break;
      }
    });
  }

  /**
   * Apply relic effects after a hand is played
   * Now uses centralized relic system for easier management
   */
  static applyAfterHandPlayedEffects(player: Player, hand: PlayingCard[], evaluation: any): void {
    // Apply all after-hand-played effects using the centralized system
    RELIC_EFFECTS.AFTER_HAND_PLAYED.forEach(relicId => {
      const relic = player.relics.find(r => r.id === relicId);
      if (!relic) return;

      switch (relicId) {
        case "ancestral_blade":
          if (evaluation.type === "flush") {
            RelicManager.addStrengthEffect(player, "strength_ancestral", 2);
          }
          break;
          
        case "sarimanok_feather":
        case "lucky_charm":
          if (RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
            player.ginto += 1;
          }
          break;
          
        case "wind_veil":
          // This needs to be handled in Combat.ts since it needs to modify the hand
          break;
      }
    });
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
   * Now uses centralized relic system for easier management
   */
  static applyEndOfTurnEffects(player: Player): void {
    // Apply all end-of-turn effects using the centralized system
    RELIC_EFFECTS.END_OF_TURN.forEach(relicId => {
      const relic = player.relics.find(r => r.id === relicId);
      if (!relic) return;

      switch (relicId) {
        case "tidal_amulet":
          const healAmount = player.hand.length * 2;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + healAmount);
          break;
      }
    });
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
   * Get all relics with a specific effect type for a player
   */
  static getPlayerRelicsWithEffect(player: Player, effectType: keyof typeof RELIC_EFFECTS): Relic[] {
    return player.relics.filter(relic => hasRelicEffect(relic.id, effectType));
  }

  /**
   * Check if player has any relic with a specific effect type
   */
  static hasPlayerRelicWithEffect(player: Player, effectType: keyof typeof RELIC_EFFECTS): boolean {
    return player.relics.some(relic => hasRelicEffect(relic.id, effectType));
  }

  /**
   * Get relic by ID from player's relics
   */
  static getPlayerRelicById(player: Player, relicId: string): Relic | undefined {
    return player.relics.find(relic => relic.id === relicId);
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