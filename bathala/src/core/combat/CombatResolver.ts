/**
 * CombatResolver - Pure-logic class that resolves player actions
 *
 * Extracts the 170-line executeAction() method from Combat.ts into a
 * testable, scene-independent class. Takes in player/enemy entities and
 * cards, returns an ActionResolution that the scene applies visually.
 *
 * Pipeline:  cards → HandEvaluator → DamageCalculator → RelicManager → resolution
 *
 * @module core/combat/CombatResolver
 */

import {
  PlayingCard,
  HandType,
  HandEvaluation,
  Suit,
  CombatActionType,
} from '../../core/types/CombatTypes';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { DamageCalculator, DamageCalculation } from '../../utils/DamageCalculator';
import { RelicManager } from '../../core/managers/RelicManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { EnemyEntity } from '../entities/EnemyEntity';

// =============================================================================
// TYPES
// =============================================================================

/** The full result of resolving a player action */
export interface ActionResolution {
  /** Which action was taken */
  actionType: CombatActionType;
  /** Evaluated hand */
  evaluation: HandEvaluation;
  /** Full damage calculation from DamageCalculator */
  damageCalc: DamageCalculation;
  /** Dominant suit of the played hand */
  dominantSuit: Suit;
  /** Net damage to apply to enemy (attack only) */
  damageToEnemy: number;
  /** Net block to apply to player (defend only) */
  blockToPlayer: number;
  /** Relic bonuses applied */
  relicBonuses: RelicBonus[];
  /** Status effects applied to enemy */
  statusEffectsOnEnemy: StatusApplication[];
  /** Status effects applied to player */
  statusEffectsOnPlayer: StatusApplication[];
  /** Whether special was consumed */
  specialConsumed: boolean;
  /** Human-readable messages for the action result overlay */
  messages: string[];
}

export interface RelicBonus {
  name: string;
  amount: number;
}

export interface StatusApplication {
  effectId: string;
  stacks: number;
  /** descriptive label for UI, e.g. "Burn" for poison-styled burn */
  displayName?: string;
}

// =============================================================================
// RESOLVER
// =============================================================================

export class CombatResolver {
  /**
   * Resolve a player action into a pure data result.
   *
   * The caller (scene) is responsible for:
   *  - Applying damage/block to entities
   *  - Triggering animations
   *  - Updating UI
   *  - Starting the enemy turn timer
   *
   * @param actionType  "attack" | "defend" | "special"
   * @param playedCards The 1-5 cards the player committed
   * @param player      PlayerEntity (read-only for calculation; caller mutates)
   * @param enemy       EnemyEntity (read-only for calculation; caller mutates)
   * @param specialUsed Whether the once-per-combat special has already been used
   */
  static resolve(
    actionType: CombatActionType,
    playedCards: PlayingCard[],
    player: PlayerEntity,
    enemy: EnemyEntity,
    specialUsed: boolean
  ): ActionResolution {
    const messages: string[] = [];
    const relicBonuses: RelicBonus[] = [];
    const statusEffectsOnEnemy: StatusApplication[] = [];
    const statusEffectsOnPlayer: StatusApplication[] = [];

    // ----- 1. Evaluate hand ---------------------------------------------------
    const legacyPlayer = player.toPlayer();
    const evaluation = HandEvaluator.evaluateHand(
      playedCards,
      actionType,
      legacyPlayer
    );

    // ----- 2. Apply after-hand-played relic effects ---------------------------
    RelicManager.applyAfterHandPlayedEffects(legacyPlayer, playedCards, evaluation);

    // ----- 3. Get dominant suit -----------------------------------------------
    const dominantSuit = CombatResolver.getDominantSuit(playedCards);

    // ----- 4. Route by action type -------------------------------------------
    let damageToEnemy = 0;
    let blockToPlayer = 0;
    let specialConsumed = false;

    const legacyEnemy = enemy.toEnemy();

    switch (actionType) {
      case 'attack': {
        let damage = evaluation.totalValue;

        // Sigbin Heart: +5 damage on all Attacks
        const sigbinDmg = RelicManager.calculateSigbinHeartDamage(legacyPlayer);
        if (sigbinDmg > 0) {
          damage += sigbinDmg;
          relicBonuses.push({ name: 'Sigbin Heart', amount: sigbinDmg });
        }

        // Bungisngis Grin: +8 damage when enemy has debuffs
        const grinDmg = RelicManager.calculateBungisngisGrinDamage(legacyPlayer, legacyEnemy);
        if (grinDmg > 0) {
          damage += grinDmg;
          relicBonuses.push({ name: 'Bungisngis Grin', amount: grinDmg });
        }

        // Kapre's Cigar: first attack doubles (once per combat)
        // Handled at scene level because it's once-per-combat state (kapresCigarUsed flag).

        damageToEnemy = damage;
        messages.push(`Attack for ${damage} damage!`);

        // Amomongo Claw: apply Vulnerable after attack
        if (RelicManager.shouldApplyAmomongoVulnerable(legacyPlayer)) {
          const vulnStacks = RelicManager.getAmomongoVulnerableStacks(legacyPlayer);
          statusEffectsOnEnemy.push({
            effectId: 'vulnerable',
            stacks: vulnStacks,
            displayName: 'Vulnerable',
          });
          messages.push(`Amomongo Claw applied ${vulnStacks} Vulnerable!`);
        }
        break;
      }

      case 'defend': {
        let block = evaluation.totalValue;

        // Balete Root: +2 block per Lupa card
        const baleteBonus = RelicManager.calculateBaleteRootBlock(legacyPlayer, playedCards);
        if (baleteBonus > 0) {
          block += baleteBonus;
          relicBonuses.push({ name: 'Balete Root', amount: baleteBonus });
        }

        blockToPlayer = block;
        messages.push(`Gain ${block} block!`);
        break;
      }

      case 'special': {
        if (specialUsed) {
          messages.push('Special already used this combat!');
          break;
        }
        specialConsumed = true;

        // Mangangaway Wand: +10 damage on all Specials
        const wandDmg = RelicManager.calculateMangangawayWandDamage(legacyPlayer);
        if (wandDmg > 0) {
          damageToEnemy += wandDmg;
          relicBonuses.push({ name: 'Mangangaway Wand', amount: wandDmg });
        }

        // Bungisngis Grin: +5 damage when applying debuffs (all specials apply debuffs)
        const grinDmg = RelicManager.calculateBungisngisGrinDamage(legacyPlayer, legacyEnemy);
        if (grinDmg > 0) {
          damageToEnemy += grinDmg;
          relicBonuses.push({ name: 'Bungisngis Grin', amount: grinDmg });
        }

        // Elemental special effects
        const elementalEffects = CombatResolver.getElementalSpecialEffects(dominantSuit);
        statusEffectsOnEnemy.push(...elementalEffects.statusEffects);
        messages.push(...elementalEffects.messages);

        messages.push(`Special: ${CombatResolver.getSpecialActionName(dominantSuit)}`);
        break;
      }
    }

    // ----- 5. Build full DamageCalculation for breakdown display ---------------
    const damageCalc = DamageCalculator.calculate(
      playedCards,
      evaluation.type,
      actionType,
      legacyPlayer,
      legacyEnemy,
      relicBonuses
    );

    return {
      actionType,
      evaluation,
      damageCalc,
      dominantSuit,
      damageToEnemy,
      blockToPlayer,
      relicBonuses,
      statusEffectsOnEnemy,
      statusEffectsOnPlayer,
      specialConsumed,
      messages,
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  /** Determine the most-represented suit in a set of cards */
  static getDominantSuit(cards: PlayingCard[]): Suit {
    const counts: Record<Suit, number> = { Apoy: 0, Tubig: 0, Lupa: 0, Hangin: 0 };
    for (const c of cards) {
      if (c.suit in counts) counts[c.suit]++;
    }
    let best: Suit = 'Apoy';
    let max = 0;
    for (const [suit, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        best = suit as Suit;
      }
    }
    return best;
  }

  /** Map dominant suit to the Special action's display name */
  static getSpecialActionName(suit: Suit): string {
    const NAMES: Record<Suit, string> = {
      Apoy: 'Apoy Fury — Burn',
      Tubig: 'Tubig Cascade — Frail',
      Lupa: 'Lupa Quake — Vulnerable',
      Hangin: 'Hangin Gale — Weak',
    };
    return NAMES[suit] ?? 'Elemental Surge';
  }

  /**
   * Return the status effects and messages for an elemental Special action.
   * Does NOT apply them — the caller does.
   */
  static getElementalSpecialEffects(suit: Suit): {
    statusEffects: StatusApplication[];
    messages: string[];
  } {
    switch (suit) {
      case 'Apoy':
        return {
          statusEffects: [{ effectId: 'poison', stacks: 3, displayName: 'Burn' }],
          messages: ['Applied 3 stacks of Burn (6 damage/turn)'],
        };
      case 'Tubig':
        return {
          statusEffects: [{ effectId: 'frail', stacks: 2, displayName: 'Frail' }],
          messages: ['Applied 2 stacks of Frail (50% block reduction)'],
        };
      case 'Lupa':
        return {
          statusEffects: [{ effectId: 'vulnerable', stacks: 1, displayName: 'Vulnerable' }],
          messages: ['Enemy takes 50% more damage'],
        };
      case 'Hangin':
        return {
          statusEffects: [{ effectId: 'weak', stacks: 2, displayName: 'Weak' }],
          messages: ['Applied 2 stacks of Weak (50% damage reduction)'],
        };
      default:
        return { statusEffects: [], messages: [] };
    }
  }

  /**
   * Compare two HandTypes by strength (for DDA best-hand tracking)
   */
  static isHandBetterThan(a: HandType, b: HandType): boolean {
    const ORDER: HandType[] = [
      'high_card', 'pair', 'two_pair', 'three_of_a_kind',
      'straight', 'flush', 'full_house', 'four_of_a_kind',
      'five_of_a_kind', 'straight_flush', 'royal_flush',
    ];
    return ORDER.indexOf(a) > ORDER.indexOf(b);
  }
}
