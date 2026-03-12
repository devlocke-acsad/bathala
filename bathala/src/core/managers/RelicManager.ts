import { Player, Relic, PlayingCard, HandType, StatusEffect, Element } from "../types/CombatTypes";
import { HandEvaluator } from "../../utils/HandEvaluator";
import { RELIC_EFFECTS, hasRelicEffect, getRelicById } from "../../data/relics/Act1Relics";
import { StatusEffectManager } from "./StatusEffectManager";
import { ElementalAffinitySystem, ElementalAffinity } from "./ElementalAffinitySystem";
import { DeckManager } from "../../utils/DeckManager";

/**
 * RelicManager - Manages all relic effects in combat and other game systems
 * Handles applying active relic effects during combat and attune sessions
 */
export class RelicManager {
  /**
   * Add a relic to a legacy Player inventory if not already owned.
   * Prevents duplicates and respects the 6-relic cap used throughout the game.
   *
   * Returns whether the relic was added and why it might have been skipped.
   */
  static tryGainRelic(
    player: Player,
    relic: Relic,
    opts?: { applyAcquisitionEffect?: boolean }
  ): { added: boolean; reason?: 'duplicate' | 'full' } {
    if (!player.relics) player.relics = [];

    if (player.relics.some(r => r.id === relic.id)) {
      return { added: false, reason: 'duplicate' };
    }

    // Consistent with UI/flows that cap at 6 relics.
    if (player.relics.length >= 6) {
      return { added: false, reason: 'full' };
    }

    player.relics.push(relic);
    if (opts?.applyAcquisitionEffect) {
      RelicManager.applyRelicAcquisitionEffect(relic.id, player);
    }
    return { added: true };
  }

  private static getUniqueRelicIds(player: Player): string[] {
    return [...new Set(player.relics.map(r => r.id))];
  }

  private static countSuit(hand: PlayingCard[], suit: PlayingCard["suit"]): number {
    return hand.filter(card => card.suit === suit).length;
  }

  private static isAllSuit(hand: PlayingCard[], suit: PlayingCard["suit"]): boolean {
    return hand.length > 0 && hand.every(card => card.suit === suit);
  }

  private static drawCardsForRelic(player: Player, count: number): number {
    if (!Array.isArray(player.hand) || !Array.isArray(player.drawPile) || !Array.isArray(player.discardPile) || count <= 0) {
      return 0;
    }

    if (player.drawPile.length < count && player.discardPile.length > 0) {
      player.drawPile = DeckManager.shuffleDeck(player.discardPile);
      player.discardPile = [];
    }

    const { drawnCards, remainingDeck } = DeckManager.drawCards(player.drawPile, count);
    player.hand.push(...drawnCards);
    player.drawPile = remainingDeck;
    return drawnCards.length;
  }

  private static healPlayer(player: Player, amount: number): number {
    const oldHealth = player.currentHealth;
    player.currentHealth = Math.min(player.maxHealth, player.currentHealth + amount);
    return Math.max(0, player.currentHealth - oldHealth);
  }

  private static onPlayerHealed(player: Player, healedAmount: number): void {
    if (healedAmount <= 0) return;

    // Act 2: draw 1 card whenever healing occurs.
    if (player.relics.some(r => r.id === "magindara_song")) {
      this.drawCardsForRelic(player, 1);
    }
  }
  
  /**
   * Helper method to add dexterity effect to player
   */
  private static addDexterityEffect(player: Player, effectId: string, value: number, relicId?: string, relicIcon?: string): void {
    const existingEffect = player.statusEffects.find(e => e.id === effectId);
    if (existingEffect) {
      existingEffect.value += value;
      return;
    }

    const dexterityEffect: StatusEffect = {
      id: effectId,
      name: "Dexterity",
      type: "buff" as const,
      value: value,
      description: "Gain +1 additional block per stack with Defend actions.",
      emoji: "⛨",
      source: relicId ? {
        type: 'relic',
        id: relicId,
        icon: relicIcon || '🗿'
      } : undefined
    };
    player.statusEffects.push(dexterityEffect);
  }

  /**
   * Helper method to add strength effect to player
   */
  private static addStrengthEffect(player: Player, effectId: string, value: number, relicId?: string, relicIcon?: string): void {
    const existingEffect = player.statusEffects.find(e => e.id === effectId);
    if (existingEffect) {
      existingEffect.value += value;
      return;
    }

    const strengthEffect: StatusEffect = {
      id: effectId,
      name: "Strength",
      type: "buff" as const,
      value: value,
      description: "Deal +3 additional damage per stack with Attack actions.",
      emoji: "†",
      source: relicId ? {
        type: 'relic',
        id: relicId,
        icon: relicIcon || '🗿'
      } : undefined
    };
    player.statusEffects.push(strengthEffect);
  }
  
  /**
   * Register all relic modifiers for status effects and elemental damage
   * Should be called at the start of combat after StatusEffectManager.initialize()
   */
  static registerRelicModifiers(player: Player): void {
    // Clear any existing modifiers
    StatusEffectManager.clearModifiers();
    ElementalAffinitySystem.clearModifiers();

    // Register status effect modifiers
    // Implements additive stacking for multiple relics affecting the same status effect
    StatusEffectManager.registerModifier((effectId, stacks, target) => {
      let modifiedStacks = stacks;

      // Act 2: Ignore first Weak debuff each combat.
      if (
        effectId === 'weak' &&
        target.id === player.id &&
        player.relics.some(r => r.id === 'berbalang_spirit')
      ) {
        const weakIgnored = (player as any).berbalangWeakIgnoredThisCombat === true;
        if (!weakIgnored) {
          (player as any).berbalangWeakIgnoredThisCombat = true;
          return 0;
        }
      }

      // Get additive bonus from all relics
      const bonus = this.getStatusEffectStackBonus(effectId, player);
      modifiedStacks += bonus;

      // Act 2: Santelmo Ember intensifies Burn applications on enemies.
      if (effectId === 'burn' && target.id !== player.id && player.relics.some(r => r.id === 'santelmo_ember')) {
        modifiedStacks += stacks; // effectively doubles burn stacks from player applications
      }

      // Ensure stacks remain positive
      return Math.max(0, modifiedStacks);
    });

    // Register elemental damage modifiers
    // Implements additive stacking for multiple relics affecting elemental damage
    ElementalAffinitySystem.registerModifier((element, multiplier, affinity) => {
      let modifiedMultiplier = multiplier;

      // Get additive bonus from all relics
      const bonus = this.getElementalDamageBonus(element, player);
      modifiedMultiplier += bonus;

      // Ensure multiplier remains positive
      return Math.max(0, modifiedMultiplier);
    });
  }

  /**
   * Get status effect stack modifier from relics
   * Returns the total additive bonus to status effect stacks
   * @param effectId - The status effect being applied
   * @param player - The player with relics
   * @returns Total stack bonus (additive)
   */
  static getStatusEffectStackBonus(effectId: string, player: Player): number {
    let bonus = 0;

    // Add relic-specific bonuses here
    // Example: A relic that adds +1 to all Poison applications
    // if (effectId === 'poison' && player.relics.some(r => r.id === 'poison_amplifier')) {
    //   bonus += 1;
    // }

    return bonus;
  }

  /**
   * Get elemental damage multiplier bonus from relics
   * Returns the total additive bonus to elemental damage multipliers
   * @param element - The element being used
   * @param player - The player with relics
   * @returns Total multiplier bonus (additive)
   */
  static getElementalDamageBonus(element: Element | null, player: Player): number {
    let bonus = 0;

    // Add relic-specific bonuses here
    // Example: A relic that adds +0.25× to Fire damage
    // if (element === 'fire' && player.relics.some(r => r.id === 'fire_amplifier')) {
    //   bonus += 0.25;
    // }

    return bonus;
  }

  /**
   * Apply all relevant relic effects at the start of combat
   * Now uses centralized relic system for easier management
   */
  static applyStartOfCombatEffects(player: Player): void {
    // Register relic modifiers first
    this.registerRelicModifiers(player);
    
    // Reset per-combat relic state flags
    (player as any).berbalangWeakIgnoredThisCombat = false;
    (player as any).bonusSpecialChargeGranted = player.relics.some(r => r.id === "sarimanok_plumage");
    (player as any).bonusSpecialChargeConsumed = false;

    // Apply all start-of-combat effects for each owned relic (unique IDs)
    const ownedRelicIds = this.getUniqueRelicIds(player);
    ownedRelicIds.forEach(relicId => {
      switch (relicId) {
        case "earthwardens_plate":
          // BALANCED: Start with 5 Block (defensive foundation without being overpowered)
          player.block += 5;
          break;
          
        case "swift_wind_agimat":
          // BALANCED: +1 discard charge (4 total: 3 base + 1 from relic)
          // Provides flexibility without trivializing hand management
          player.discardCharges += 1;
          player.maxDiscardCharges += 1;
          // No additional card draw - focus on discard utility
          break;
          
        case "umalagad_spirit":
          // BALANCED: +2 Block per card played (consistent defensive scaling)
          // No flat Defend bonus - rewards playing more cards
          break;
          
        case "diwatas_crown":
          // BALANCED: +5 Block at start, All Defend actions gain +3 Block
          player.block += 5;
          // Defend bonus handled in combat damage calculation
          break;
          
        case "stone_golem_heart":
          // BALANCED: +8 Max HP, +2 Block at start
          // Modest HP increase (~7% of 120) with small defensive bonus
          player.maxHealth += 8;
          player.currentHealth += 8;
          player.block += 2;
          break;

        case "apolaki_spear":
          // Act 3 relic: gain 2 Strength at start of combat
          RelicManager.addStrengthEffect(player, "strength_apolaki", 2, "apolaki_spear", "🔱");
          break;
      }
    });
  }

  /**
   * Apply all relevant relic effects at the start of the player's turn
   * Now uses centralized relic system for easier management
   */
  static applyStartOfTurnEffects(player: Player): void {
    const ownedRelicIds = this.getUniqueRelicIds(player);
    ownedRelicIds.forEach(relicId => {
      switch (relicId) {
        case "ember_fetish":
          // BALANCED: +4 Strength when Block = 0 (encourages risky play), +2 Strength otherwise
          if (player.block === 0) {
            RelicManager.addStrengthEffect(player, "strength_ember", 4, "ember_fetish", "🔥");
          } else {
            RelicManager.addStrengthEffect(player, "strength_ember", 2, "ember_fetish", "🔥");
          }
          break;
          
        case "earthwardens_plate":
          // BALANCED: +1 Block at start of each turn (total +5-10 over 5 turns)
          player.block += 1;
          console.log(`[Earthwarden's Plate] +1 Block at start of turn`);
          break;
          
        case "tiyanak_tear":
          // BALANCED: +1 Strength at start of each turn (~3-5 extra damage per turn)
          RelicManager.addStrengthEffect(player, "strength_tiyanak", 1, "tiyanak_tear", "😭");
          console.log(`[Tiyanak Tear] +1 Strength at start of turn`);
          break;
      }
    });
  }

  /**
   * Apply relic effects after a hand is played
   * Now uses centralized relic system for easier management
   */
  static applyAfterHandPlayedEffects(player: Player, hand: PlayingCard[], evaluation: any): void {
    const ownedRelicIds = this.getUniqueRelicIds(player);
    ownedRelicIds.forEach(relicId => {
      switch (relicId) {
        case "ancestral_blade":
          // BALANCED: +2 Strength per Flush (rewards element focus)
          if (evaluation.type === "flush") {
            RelicManager.addStrengthEffect(player, "strength_ancestral", 2, "ancestral_blade", "⚔️");
          }
          break;
          
        case "sarimanok_feather":
        case "lucky_charm":
          // BALANCED: +1 Ginto per Straight or better (modest economy boost)
          if (RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
            player.ginto += 1;
          }
          break;
          
        case "umalagad_spirit":
          // BALANCED: +2 Block per card played (consistent defensive scaling)
          const cardsPlayed = hand.length;
          if (cardsPlayed > 0) {
            const blockBonus = cardsPlayed * 2;
            player.block += blockBonus;
            console.log(`[Umalagad's Spirit] +${blockBonus} Block from playing ${cardsPlayed} cards`);
          }
          break;
          
        case "wind_veil":
          // +1 draw on Air (Hangin) cards - handled in Combat.ts
          break;

        case "sirenas_scale":
          // Act 2: Heal when at least one Tubig card is played
          if (this.countSuit(hand, "Tubig") > 0) {
            const healed = this.healPlayer(player, 2);
            this.onPlayerHealed(player, healed);
          }
          break;

        case "berberoka_tide":
          // Act 2: Gain 10 block on all-Tubig hands
          if (this.isAllSuit(hand, "Tubig")) {
            player.block += 10;
          }
          break;

        case "tigmamanukan_feather":
          // Act 3: Draw 1 on Straight or better
          if (RelicManager.isHandTypeAtLeast(evaluation.type, "straight")) {
            this.drawCardsForRelic(player, 1);
          }
          break;
      }
    });
  }

  /**
   * Calculate additional Block from "Umalagad's Spirit", "Diwata's Crown", and "Duwende Charm" on Defend actions
   */
  static calculateDefendBlockBonus(player: Player): number {
    let bonusBlock = 0;
    
    // BALANCED: Umalagad's Spirit: All Defend actions gain +4 Block
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit) {
      bonusBlock += 4;
    }
    
    // BALANCED: Diwata's Crown: All Defend actions gain +3 Block
    const diwatasCrown = player.relics.find(r => r.id === "diwatas_crown");
    if (diwatasCrown) {
      bonusBlock += 3;
    }
    
    // BALANCED: Duwende Charm: All Defend actions gain +3 Block
    const duwendeCharm = player.relics.find(r => r.id === "duwende_charm");
    if (duwendeCharm) {
      bonusBlock += 3;
    }
    
    return bonusBlock;
  }

  /**
   * Calculate additional Block from "Umalagad's Spirit" when playing cards
   * BALANCED: +2 Block per card played
   */
  static calculateUmalagadCardPlayBonus(player: Player, cardsPlayed: number = 0): number {
    const umalagadSpirit = player.relics.find(r => r.id === "umalagad_spirit");
    if (umalagadSpirit && cardsPlayed > 0) {
      return 2 * cardsPlayed; // +2 Block per card played
    }
    return 0;
  }

  /**
   * Calculate additional Block from "Earthwarden's Plate" at start of each turn
   * BALANCED: +1 Block per turn
   */
  static calculateEarthwardenTurnBonus(player: Player): number {
    const earthwardensPlate = player.relics.find(r => r.id === "earthwardens_plate");
    if (earthwardensPlate) {
      return 1; // +1 Block at start of turn
    }
    return 0;
  }

  /**
   * Calculate additional initial draw from "Swift Wind Agimat"
   * REMOVED: No longer provides extra card draw
   */
  static calculateSwiftWindDrawBonus(_player: Player): number {
    // Swift Wind Agimat now only provides +1 discard charge
    return 0;
  }

  /**
   * Calculate dodge chance with "Tikbalang's Hoof" effect
   */
  static calculateDodgeChance(player: Player): number {
    let dodgeChance = 0;

    if (player.relics.some(r => r.id === "tikbalangs_hoof")) {
      dodgeChance += 0.10;
    }

    // Act 3: flat dodge chance
    if (player.relics.some(r => r.id === "diwata_veil")) {
      dodgeChance += 0.10;
    }

    // Act 2: dodge while debuffed
    if (player.relics.some(r => r.id === "bangkilan_veil")) {
      const hasDebuff = player.statusEffects?.some(effect => effect.type === "debuff");
      if (hasDebuff) {
        dodgeChance += 0.10;
      }
    }

    // Safety cap for stacked dodge relics
    dodgeChance = Math.min(0.6, dodgeChance);
    return dodgeChance;
  }

  /**
   * Calculate additional block from "Balete Root" effect
   */
  static calculateBaleteRootBlock(player: Player, playedHand: PlayingCard[]): number {
    const baleteRoot = player.relics.find(r => r.id === "balete_root");
    if (baleteRoot) {
      const lupaCards = playedHand.filter(card => card.suit === "Lupa").length;
      return lupaCards * 2; // BALANCED: +2 Block per Lupa card
    }
    return 0;
  }

  /**
   * Calculate additional damage from "Sigbin Heart" effect
   * BALANCED: +3 damage on all Attack actions
   */
  static calculateSigbinHeartDamage(player: Player): number {
    const sigbinHeart = player.relics.find(r => r.id === "sigbin_heart");
    if (sigbinHeart) {
      return 3; // +3 damage on Attack actions
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
   * Calculate initial hand size - REMOVED Swift Wind Agimat draw bonus
   */
  static calculateInitialHandSize(baseHandSize: number, _player: Player): number {
    let handSize = baseHandSize;
    
    // Swift Wind Agimat no longer provides card draw bonus (only +1 discard charge)
    
    return handSize;
  }

  /**
   * Apply relic effects when a relic is first obtained
   */
  static applyRelicAcquisitionEffect(relicId: string, player: Player): void {
    switch (relicId) {
      case "stone_golem_heart":
        // BALANCED: Gain +8 Max HP permanently (~7% increase)
        player.maxHealth += 8;
        player.currentHealth += 8; // Also heal when first obtained
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
   * Calculate additional damage from "Mangangaway Wand" on Special actions
   * BALANCED: +5 damage on Special actions
   */
  static calculateMangangawayWandDamage(player: Player): number {
    const mangangawayWand = player.relics.find(r => r.id === "mangangaway_wand");
    if (mangangawayWand) {
      return 5; // +5 damage on Special actions
    }
    return 0;
  }

  /**
   * Check if "Amomongo Claw" should apply Vulnerable on Attack
   * BALANCED: Apply 1 Vulnerable on Attack actions
   */
  static shouldApplyAmomongoVulnerable(player: Player): boolean {
    const amomongoClaw = player.relics.find(r => r.id === "amomongo_claw");
    return !!amomongoClaw;
  }

  /**
   * Get Vulnerable stacks from "Amomongo Claw"
   */
  static getAmomongoVulnerableStacks(player: Player): number {
    const amomongoClaw = player.relics.find(r => r.id === "amomongo_claw");
    if (amomongoClaw) {
      return 1; // Apply 1 stack of Vulnerable
    }
    return 0;
  }

  /**
   * Calculate additional damage from "Bungisngis Grin" effect when enemy has debuffs
   * BALANCED: +4 damage on Attack when enemy has any debuff
   */
  static calculateBungisngisGrinDamage(player: Player, enemy: any): number {
    const bungisngisGrin = player.relics.find(r => r.id === "bungisngis_grin");
    if (bungisngisGrin) {
      // Check if enemy has any debuffs (Weak, Vulnerable, Burn, etc.)
      const hasDebuff = enemy.statusEffects?.some((effect: any) => 
        effect.type === "debuff" || 
        effect.name === "Weak" || 
        effect.name === "Vulnerable" || 
        effect.name === "Burn"
      );
      if (hasDebuff) {
        return 4; // +4 damage when enemy has debuff
      }
    }
    return 0;
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
    const ownedRelicIds = this.getUniqueRelicIds(player);
    ownedRelicIds.forEach(relicId => {
      switch (relicId) {
        case "tidal_amulet":
          // BALANCED: +1 HP per card remaining in hand (max +8 HP with full hand)
          const healAmount = player.hand.length * 1;
          const healed = this.healPlayer(player, healAmount);
          this.onPlayerHealed(player, healed);
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
   * Check if Five of a Kind is enabled by "Diwata's Crown"
   * NEW: Diwata's Crown enables Five of a Kind
   */
  static hasFiveOfAKindEnabled(player: Player): boolean {
    const diwatasCrown = player.relics.find(r => r.id === "diwatas_crown");
    return !!diwatasCrown;
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
   * Handle "Kapre's Cigar" effect: First Attack deals double damage (once per combat)
   * NEW: Simplified from minion summon to direct damage doubling
   */
  static shouldApplyKapresCigarDouble(player: Player, combatScene: any): boolean {
    const kapresCigar = player.relics.find(r => r.id === "kapres_cigar");
    if (kapresCigar && !combatScene.kapresCigarUsed) {
      // Mark as used for this combat
      combatScene.kapresCigarUsed = true;
      return true;
    }
    return false;
  }
  
  /**
   * Check if player has Babaylan's Talisman for hand tier upgrade
   */
  static hasBabaylansTalisman(player: Player): boolean {
    return player.relics.some(r => r.id === "babaylans_talisman");
  }
  
  /**
   * Check if player has Diwata's Crown for Five of a Kind
   */
  static hasDiwatasCrown(player: Player): boolean {
    return player.relics.some(r => r.id === "diwatas_crown");
  }
}