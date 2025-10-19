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
          // BUFFED: Start with 12 Block (was 8)
          player.block += 12;
          break;
          
        case "swift_wind_agimat":
          // BUFFED: +2 discard charges (5 total: 3 base + 2 from relic)
          player.discardCharges += 2;
          player.maxDiscardCharges += 2;
          // BUFFED: Draw 1 additional card at start (handled in Combat.ts)
          break;
          
        case "umalagad_spirit":
          // BUFFED: All Defend actions gain +8 Block (was 6)
          // +3 Block per card played (implemented in combat damage calculation)
          break;
          
        case "diwatas_crown":
          // Buffed: 10 → 15 Block, All Defend actions gain +6 Block
          player.block += 15;
          // Defend bonus handled in combat damage calculation
          break;
          
        case "stone_golem_heart":
          // Buffed: 10 → 15 Max HP, 2 → 3 Block
          player.maxHealth += 15;
          player.currentHealth += 15;
          player.block += 3;
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
          // BUFFED: 4 Attack when Block = 0, 2 Attack when Block > 0
          if (player.block === 0) {
            RelicManager.addStrengthEffect(player, "strength_ember", 4);
          } else {
            RelicManager.addStrengthEffect(player, "strength_ember", 2);
          }
          break;
          
        case "earthwardens_plate":
          // BUFFED: +2 Block at start of each turn (in addition to 12 Block at combat start)
          player.block += 2;
          console.log(`[Earthwarden's Plate] +2 Block at start of turn`);
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
          // Buffed: 2 Strength → 3 Attack per Flush
          if (evaluation.type === "flush") {
            RelicManager.addStrengthEffect(player, "strength_ancestral", 3);
          }
          break;
          
        case "sarimanok_feather":
        case "lucky_charm":
          // Buffed: 1 → 2 Ginto per Straight or better
          if (RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
            player.ginto += 2;
          }
          break;
          
        case "umalagad_spirit":
          // BUFFED: +3 Block per card played (applies to ALL actions: Attack/Defend/Special)
          const cardsPlayed = hand.length;
          if (cardsPlayed > 0) {
            const blockBonus = cardsPlayed * 3;
            player.block += blockBonus;
            console.log(`[Umalagad's Spirit] +${blockBonus} Block from playing ${cardsPlayed} cards`);
          }
          break;
          
        case "wind_veil":
          // +1 draw on Air (Hangin) cards - handled in Combat.ts
          break;
      }
    });
  }

  /**
   * Calculate additional Block from "Umalagad's Spirit" and "Diwata's Crown" on Defend actions
   */
  static calculateDefendBlockBonus(player: Player): number {
    let bonusBlock = 0;
    
    // BUFFED: Umalagad's Spirit: All Defend actions gain +8 Block (was 6)
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit) {
      bonusBlock += 8;
    }
    
    // Diwata's Crown: All Defend actions gain +6 Block (when Full House+ is played)
    // Note: This bonus should be applied only on the turn when Full House+ was played
    // For simplicity, we'll check if the player has the relic and a flag is set
    const diwatasCrown = player.relics.find(r => r.id === "diwatas_crown");
    if (diwatasCrown && (player as any).diwatasCrownActive) {
      bonusBlock += 6;
    }
    
    return bonusBlock;
  }

  /**
   * Calculate additional Block from "Umalagad's Spirit" when playing cards
   * NEW: +3 Block per card played
   */
  static calculateUmalagadCardPlayBonus(player: Player, cardsPlayed: number = 0): number {
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit && cardsPlayed > 0) {
      return 3 * cardsPlayed; // +3 Block per card played
    }
    return 0;
  }

  /**
   * Calculate additional Block from "Earthwarden's Plate" at start of each turn
   * NEW: +2 Block per turn
   */
  static calculateEarthwardenTurnBonus(player: Player): number {
    const earthwardensPlate = player.relics.find(r => r.id === "earthwardens_plate");
    if (earthwardensPlate) {
      return 2; // +2 Block at start of turn
    }
    return 0;
  }

  /**
   * Calculate additional initial draw from "Swift Wind Agimat"
   * NEW: +1 card at start of combat (in addition to +2 discard charges)
   */
  static calculateSwiftWindDrawBonus(player: Player): number {
    const swiftWindAgimat = player.relics.find(r => r.id === "swift_wind_agimat");
    if (swiftWindAgimat) {
      return 1; // +1 additional card at start
    }
    return 0;
  }

  /**
   * Calculate dodge chance with "Tikbalang's Hoof" effect
   */
  static calculateDodgeChance(player: Player): number {
    // Buffed: 10% → 15% dodge chance
    let dodgeChance = 0;
    const tikbalangsHoof = player.relics.find(r => r.id === "tikbalangs_hoof");
    if (tikbalangsHoof) {
      dodgeChance += 0.15; // 15% dodge chance
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
      return lupaCards * 3; // Buffed: +2 → +3 Block per Lupa card
    }
    return 0;
  }

  /**
   * Calculate additional damage from "Sigbin Heart" effect
   * Buffed: +5 damage on burst → +8 damage when dealing 40+ damage in a single attack
   */
  static calculateSigbinHeartDamage(player: Player, baseDamage: number): number {
    const sigbinHeart = player.relics.find(r => r.id === "sigbin_heart");
    if (sigbinHeart) {
      // New effect: +8 damage when dealing 40+ damage in a single attack
      if (baseDamage >= 40) {
        return 8;
      }
    }
    return 0;
  }

  /**
   * Calculate damage reduction - REMOVED (no bakunawa_scale sprite)
   */
  static calculateDamageReduction(incomingDamage: number, _player: Player): number {
    // Bakunawa Scale removed (no sprite)
    return incomingDamage;
  }

  /**
   * Calculate shop price reduction - REMOVED (no merchants_scale sprite)
   */
  static calculateShopPriceReduction(originalPrice: number, _player: Player): number {
    // Merchant's Scale removed (no sprite)
    return originalPrice;
  }

  /**
   * Calculate initial hand size - REMOVED tigmamanukan_eye (no sprite)
   */
  static calculateInitialHandSize(baseHandSize: number, player: Player): number {
    let handSize = baseHandSize;
    
    // Swift Wind Agimat: +1 additional card at start
    const swiftWindAgimat = player.relics.find(r => r.id === "swift_wind_agimat");
    if (swiftWindAgimat) {
      handSize += 1; // +1 additional card draw at combat start
      console.log(`[Swift Wind Agimat] +1 additional card drawn at combat start`);
    }
    
    return handSize;
  }

  /**
   * Apply relic effects when a relic is first obtained
   */
  static applyRelicAcquisitionEffect(relicId: string, player: Player): void {
    switch (relicId) {
      case "stone_golem_heart":
        // Buffed: Gain 15 Max HP permanently (was 10)
        player.maxHealth += 15;
        player.currentHealth += 15; // Also heal when first obtained
        break;
        
      // Removed relics (no sprites):
      // - bakunawa_scale
      // - tigmamanukan_eye
      // - merchants_scale
      // - bargain_talisman
        
      case "earthwardens_plate":
      case "swift_wind_agimat":
      case "ember_fetish":
      case "umalagad_spirit":
      case "babaylans_talisman":
      case "ancestral_blade":
      case "tidal_amulet":
      case "sarimanok_feather":
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
  private static applyMythologicalRelicAcquisition(relicId: string, _player: Player): void {
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
      case "mangangaway_wand":
        // Removed: wind_veil (no sprite)
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
      // Buffed: 10% → 20% chance to resist Weak status
      return Math.random() > 0.20;
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
      return baseBleedDamage + 4; // Buffed: +3 → +4 bleed damage
    }
    return baseBleedDamage;
  }

  /**
   * Calculate additional damage from "Bungisngis Grin" effect when applying debuffs
   */
  static calculateBungisngisGrinDamage(player: Player): number {
    const bungisngisGrin = player.relics.find(r => r.id === "bungisngis_grin");
    if (bungisngisGrin) {
      return 8; // Buffed: +5 → +8 damage when applying debuffs
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
   * Calculate additional cards drawn with "Wind Veil" effect - REMOVED (no sprite)
   */
  static calculateWindVeilCardDraw(_playedHand: PlayingCard[], _player: Player): number {
    // Wind Veil removed (no sprite)
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
          // Buffed: 2 HP → 3 HP per card remaining in hand
          const healAmount = player.hand.length * 3;
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
   * Check if the "Echo of the Ancestors" relic is active to enable Five of a Kind - REMOVED (no sprite)
   */
  static hasFiveOfAKindEnabled(_player: Player): boolean {
    // Echo of the Ancestors removed (no sprite)
    return false;
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
   * Handle "Kapre's Cigar" effect: Summons minion once per combat that deals 12 damage
   */
  static tryKapresCigarSummon(combatScene: any, player: Player): { used: boolean; damage: number } {
    const kapresCigar = player.relics.find(r => r.id === "kapres_cigar");
    if (kapresCigar && !combatScene.kapresCigarUsed) {
      // Mark as used for this combat
      combatScene.kapresCigarUsed = true;
      
      // Show result message
      combatScene.showActionResult("Kapre's Cigar summoned aid! Dealing 12 damage!");
      
      // Return 12 damage as specified in the buffed effect
      return { used: true, damage: 12 };
    }
    return { used: false, damage: 0 };
  }
  
  /**
   * Check if player has Babaylan's Talisman for hand tier upgrade
   */
  static hasBabaylansTalisman(player: Player): boolean {
    return player.relics.some(r => r.id === "babaylans_talisman");
  }
  
  /**
   * Check if player has Echo of Ancestors for Five of a Kind - REMOVED (no sprite)
   */
  static hasEchoOfAncestors(_player: Player): boolean {
    // Echo of the Ancestors removed (no sprite)
    return false;
  }
}