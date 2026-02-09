/**
 * EnemyAIController - Resolves enemy turn actions
 * 
 * Replaces the 120-line switch-case in Combat.ts executeEnemyTurn()
 * Reads from EnemyEntity's attack pattern and produces ActionResults
 * that the scene or CombatResolver can apply.
 * 
 * @module core/combat/EnemyAIController
 */

import { EnemyEntity, ActionResult } from '../entities/EnemyEntity';
import { PlayerEntity } from '../entities/PlayerEntity';
import { StatusEffectManager } from '../managers/StatusEffectManager';

// =============================================================================
// ACTION HANDLERS
// =============================================================================

type ActionHandler = (
  enemy: EnemyEntity,
  player: PlayerEntity
) => ActionResult;

/**
 * Registry of action handlers keyed by action string
 * Each handler reads enemy/player state and returns an ActionResult
 * The caller is responsible for applying the result (damage, effects, animations)
 */
const ACTION_HANDLERS: Record<string, ActionHandler> = {
  attack: (enemy, player) => {
    const damage = enemy.effectiveDamage;
    player.takeDamage(damage);
    return {
      action: 'attack',
      description: `${enemy.name} attacks for ${damage} damage!`,
      damage,
    };
  },

  defend: (enemy) => {
    const blockGained = 5;
    enemy.addBlock(blockGained);
    return {
      action: 'defend',
      description: `${enemy.name} gains ${blockGained} block!`,
      blockGained,
    };
  },

  strengthen: (enemy) => {
    StatusEffectManager.applyStatusEffect(enemy.toCombatEntity(), 'strength', 2);
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
    return {
      action: 'strengthen',
      description: `${enemy.name} gains 2 Strength!`,
      statusEffect: { id: 'strength', stacks: 2, target: 'self' as const },
    };
  },

  poison: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'poison', 2);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'poison',
      description: `${enemy.name} poisons you for 2 stacks!`,
      statusEffect: { id: 'poison', stacks: 2, target: 'player' as const },
    };
  },

  weaken: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'weaken',
      description: `${enemy.name} weakens you!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  confuse: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'confuse',
      description: `${enemy.name} disrupts you!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  confuse_targeting: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'confuse_targeting',
      description: `${enemy.name} confuses your targeting!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  disrupt_draw: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'disrupt_draw',
      description: `${enemy.name} disrupts your draw!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  fear: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'fear',
      description: `${enemy.name} instills fear!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  stun: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'frail', 2);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'stun',
      description: `${enemy.name} stuns you!`,
      statusEffect: { id: 'frail', stacks: 2, target: 'player' as const },
    };
  },

  charge: (enemy) => {
    const blockGained = 3;
    enemy.addBlock(blockGained);
    return {
      action: 'charge',
      description: `${enemy.name} prepares...`,
      blockGained,
    };
  },

  wait: (enemy) => {
    const blockGained = 3;
    enemy.addBlock(blockGained);
    return {
      action: 'wait',
      description: `${enemy.name} waits...`,
      blockGained,
    };
  },

  // === Boss-specific actions ===

  curse_card: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'curse_card',
      description: `${enemy.name} curses your cards!`,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  mimic_element: (enemy) => {
    StatusEffectManager.applyStatusEffect(enemy.toCombatEntity(), 'strength', 1);
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
    return {
      action: 'mimic_element',
      description: `${enemy.name} mimics your element!`,
      statusEffect: { id: 'strength', stacks: 1, target: 'self' as const },
    };
  },

  hex_reversal: (enemy, player) => {
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'frail', 2);
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'hex_reversal',
      description: `${enemy.name} reverses your fates!`,
      statusEffect: { id: 'frail', stacks: 2, target: 'player' as const },
    };
  },

  smoke_attack: (enemy, player) => {
    const damage = enemy.effectiveDamage;
    player.takeDamage(damage);
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'weak', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'smoke_attack',
      description: `${enemy.name} attacks through smoke for ${damage}!`,
      damage,
      statusEffect: { id: 'weak', stacks: 1, target: 'player' as const },
    };
  },

  summon_minion: (enemy) => {
    StatusEffectManager.applyStatusEffect(enemy.toCombatEntity(), 'strength', 1);
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
    return {
      action: 'summon_minion',
      description: `${enemy.name} summons reinforcements!`,
      statusEffect: { id: 'strength', stacks: 1, target: 'self' as const },
    };
  },

  summon_smoke_minion: (enemy) => {
    StatusEffectManager.applyStatusEffect(enemy.toCombatEntity(), 'strength', 1);
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
    return {
      action: 'summon_smoke_minion',
      description: `${enemy.name} conjures a smoke guardian!`,
      statusEffect: { id: 'strength', stacks: 1, target: 'self' as const },
    };
  },

  aoe_burn: (enemy, player) => {
    const damage = Math.round(enemy.effectiveDamage * 0.7);
    player.takeDamage(damage);
    StatusEffectManager.applyStatusEffect(player.toCombatEntity(), 'poison', 1);
    player.syncFromCombatEntity(player.toCombatEntity());
    return {
      action: 'aoe_burn',
      description: `${enemy.name} burns everything for ${damage}!`,
      damage,
      statusEffect: { id: 'poison', stacks: 1, target: 'player' as const },
    };
  },
};

// =============================================================================
// CONTROLLER
// =============================================================================

export class EnemyAIController {
  /**
   * Resolve the enemy's current turn action
   * 
   * Reads the next action from the enemy's pattern, executes it via
   * the registered handler, and advances the pattern index.
   * 
   * @returns ActionResult describing what happened (for UI/animation)
   */
  static resolveAction(enemy: EnemyEntity, player: PlayerEntity): ActionResult {
    // Check if stunned
    if (enemy.isStunned) {
      enemy.advancePattern();
      return {
        action: 'stunned',
        description: `${enemy.name} is Stunned — Turn Skipped!`,
        skipped: true,
        skipReason: 'stunned',
      };
    }

    const actionName = enemy.getNextAction();
    const handler = ACTION_HANDLERS[actionName];

    let result: ActionResult;
    if (handler) {
      result = handler(enemy, player);
    } else {
      // Fallback: unknown action → basic attack
      console.warn(`⚠️ Unknown enemy action: "${actionName}", falling back to attack`);
      const damage = enemy.effectiveDamage;
      player.takeDamage(damage);
      result = {
        action: actionName,
        description: `${enemy.name} attacks for ${damage}!`,
        damage,
      };
    }

    enemy.advancePattern();
    return result;
  }

  /**
   * Process start-of-turn effects for an enemy
   * (Status effect triggers, boss phase checks, etc.)
   */
  static processStartOfTurn(enemy: EnemyEntity): void {
    StatusEffectManager.processStatusEffects(enemy.toCombatEntity(), 'start_of_turn');
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
  }

  /**
   * Process end-of-turn effects for an enemy
   */
  static processEndOfTurn(enemy: EnemyEntity): void {
    StatusEffectManager.processStatusEffects(enemy.toCombatEntity(), 'end_of_turn');
    enemy.syncFromCombatEntity(enemy.toCombatEntity());
  }

  /**
   * Register a custom action handler (for modding/extensibility)
   */
  static registerAction(actionName: string, handler: ActionHandler): void {
    ACTION_HANDLERS[actionName] = handler;
  }

  /**
   * Check if an action handler exists
   */
  static hasAction(actionName: string): boolean {
    return actionName in ACTION_HANDLERS;
  }

  /**
   * Get all registered action names
   */
  static getRegisteredActions(): string[] {
    return Object.keys(ACTION_HANDLERS);
  }
}
