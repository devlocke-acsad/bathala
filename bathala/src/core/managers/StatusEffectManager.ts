/**
 * StatusEffectManager - Centralized management for all status effects
 * Handles status effect definitions, application, processing, and expiration
 */

import { CombatEntity, StatusEffect } from "../types/CombatTypes";

export type StatusEffectTriggerTiming = 'start_of_turn' | 'end_of_turn' | 'on_apply' | 'persistent';

export interface StatusEffectDefinition {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  emoji: string;
  description: string;
  triggerTiming: StatusEffectTriggerTiming;
  stackable: boolean;
  maxStacks?: number;
  onTrigger?: (target: CombatEntity, stacks: number) => StatusEffectTriggerResult | null;
  onApply?: (target: CombatEntity, stacks: number) => void;
  onExpire?: (target: CombatEntity) => void;
}

export interface StatusEffectTriggerResult {
  effectName: string;
  targetName: string;
  value: number;
  message: string;
}

/**
 * Callback type for relic modifications to status effects
 * @param effectId - The status effect being applied
 * @param stacks - The number of stacks being applied
 * @param target - The entity receiving the effect
 * @returns Modified stack count
 */
export type StatusEffectModifierCallback = (
  effectId: string,
  stacks: number,
  target: CombatEntity
) => number;

export class StatusEffectManager {
  private static definitions: Map<string, StatusEffectDefinition> = new Map();
  private static initialized = false;
  private static modifierCallbacks: StatusEffectModifierCallback[] = [];

  /**
   * Initialize all status effect definitions
   * Must be called before using the manager
   */
  static initialize(): void {
    if (this.initialized) return;

    // Define all 8 core status effects
    const definitions: StatusEffectDefinition[] = [
      {
        id: 'poison',
        name: 'Poison',
        type: 'debuff',
        emoji: '☠️',
        description: 'Takes damage at start of turn, then reduces by 1',
        triggerTiming: 'start_of_turn',
        stackable: true,
        onTrigger: (target: CombatEntity, stacks: number): StatusEffectTriggerResult | null => {
          // Deal stacks × 2 damage
          const damage = stacks * 2;
          target.currentHealth -= damage;
          
          // Reduce stacks by 1
          const effect = target.statusEffects.find(e => e.id === 'poison');
          if (effect) {
            effect.value -= 1;
          }
          
          return {
            effectName: 'Poison',
            targetName: target.name,
            value: damage,
            message: `${target.name} takes ${damage} poison damage`
          };
        }
      },
      {
        id: 'weak',
        name: 'Weak',
        type: 'debuff',
        emoji: '⚠️',
        description: 'Attack actions deal 25% less damage per stack',
        triggerTiming: 'persistent',
        stackable: true,
        maxStacks: 3,
      },
      {
        id: 'plated_armor',
        name: 'Plated Armor',
        type: 'buff',
        emoji: '🛡️',
        description: 'Gain block at start of turn, then reduces by 1',
        triggerTiming: 'start_of_turn',
        stackable: true,
        onTrigger: (target: CombatEntity, stacks: number): StatusEffectTriggerResult | null => {
          // Grant stacks × 3 block
          const blockGained = stacks * 3;
          target.block += blockGained;
          
          // Reduce stacks by 1
          const effect = target.statusEffects.find(e => e.id === 'plated_armor');
          if (effect) {
            effect.value -= 1;
          }
          
          return {
            effectName: 'Plated Armor',
            targetName: target.name,
            value: blockGained,
            message: `${target.name} gains ${blockGained} block`
          };
        }
      },
      {
        id: 'regeneration',
        name: 'Regeneration',
        type: 'buff',
        emoji: '💚',
        description: 'Heal HP at start of turn, then reduces by 1',
        triggerTiming: 'start_of_turn',
        stackable: true,
        onTrigger: (target: CombatEntity, stacks: number): StatusEffectTriggerResult | null => {
          // Heal stacks × 2 HP
          const healing = stacks * 2;
          const oldHealth = target.currentHealth;
          target.currentHealth = Math.min(
            target.maxHealth,
            target.currentHealth + healing
          );
          const actualHealing = target.currentHealth - oldHealth;
          
          // Reduce stacks by 1
          const effect = target.statusEffects.find(e => e.id === 'regeneration');
          if (effect) {
            effect.value -= 1;
          }
          
          return {
            effectName: 'Regeneration',
            targetName: target.name,
            value: actualHealing,
            message: `${target.name} heals ${actualHealing} HP`
          };
        }
      },
      {
        id: 'strength',
        name: 'Strength',
        type: 'buff',
        emoji: '💪',
        description: 'Attack actions deal +3 damage per stack',
        triggerTiming: 'persistent',
        stackable: true,
      },
      {
        id: 'vulnerable',
        name: 'Vulnerable',
        type: 'debuff',
        emoji: '🛡️💔',
        description: 'Takes 50% more damage from all sources',
        triggerTiming: 'persistent',
        stackable: false,
      },
      {
        id: 'frail',
        name: 'Frail',
        type: 'debuff',
        emoji: '🔻',
        description: 'Defend actions grant 25% less block per stack',
        triggerTiming: 'persistent',
        stackable: true,
        maxStacks: 3,
      },
      {
        id: 'ritual',
        name: 'Ritual',
        type: 'buff',
        emoji: '✨',
        description: 'Gain +1 Strength at end of turn',
        triggerTiming: 'end_of_turn',
        stackable: true,
        onTrigger: (target: CombatEntity, stacks: number): StatusEffectTriggerResult | null => {
          // Apply Strength equal to Ritual stacks
          StatusEffectManager.applyStatusEffect(target, 'strength', stacks);
          
          return {
            effectName: 'Ritual',
            targetName: target.name,
            value: stacks,
            message: `${target.name} gains ${stacks} Strength from Ritual`
          };
        }
      }
    ];

    // Register all definitions
    definitions.forEach(def => {
      this.definitions.set(def.id, def);
    });

    this.initialized = true;
  }

  /**
   * Register a callback for modifying status effect applications
   * Relics can use this to modify status effect stacks
   * @param callback - Function that modifies status effect stacks
   */
  static registerModifier(callback: StatusEffectModifierCallback): void {
    this.modifierCallbacks.push(callback);
  }

  /**
   * Clear all registered modifiers (useful for testing and combat reset)
   */
  static clearModifiers(): void {
    this.modifierCallbacks = [];
  }

  /**
   * Apply a status effect to a target
   * Handles stacking logic and max stack limits
   * @param source - Optional source information for tracking what caused this effect
   */
  static applyStatusEffect(
    target: CombatEntity,
    effectId: string,
    stacks: number,
    source?: { type: 'relic' | 'enemy' | 'card' | 'other'; id: string; icon: string }
  ): void {
    // Validate target
    if (!target) {
      console.error('StatusEffectManager.applyStatusEffect: target is null or undefined');
      return;
    }

    // Ensure target has statusEffects array
    if (!target.statusEffects) {
      console.warn('StatusEffectManager.applyStatusEffect: target missing statusEffects array, initializing');
      target.statusEffects = [];
    }

    // Validate effect ID
    const definition = this.definitions.get(effectId);
    if (!definition) {
      console.warn(`StatusEffectManager.applyStatusEffect: Unknown status effect ID: ${effectId}, skipping`);
      return;
    }

    // Validate and sanitize stacks
    if (typeof stacks !== 'number' || isNaN(stacks) || !isFinite(stacks)) {
      console.warn(`StatusEffectManager.applyStatusEffect: Invalid stacks value: ${stacks}, defaulting to 0`);
      stacks = 0;
    }

    // Prevent negative stacks - set to 0 and skip
    if (stacks <= 0) {
      return;
    }

    // Apply relic modifiers to stack count
    let modifiedStacks = stacks;
    try {
      for (const modifier of this.modifierCallbacks) {
        const result = modifier(effectId, modifiedStacks, target);
        
        // Validate modifier result
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
          console.warn(`StatusEffectManager.applyStatusEffect: Modifier returned invalid value: ${result}, using original stacks`);
          continue;
        }
        
        modifiedStacks = result;
      }
    } catch (error) {
      console.error('StatusEffectManager.applyStatusEffect: Error in modifier callback:', error);
      // Continue with unmodified stacks
      modifiedStacks = stacks;
    }

    // Ensure stacks remain positive after modifications
    if (modifiedStacks <= 0) {
      return;
    }

    // Find existing effect
    const existingEffect = target.statusEffects.find(e => e.id === effectId);

    if (existingEffect) {
      // Stack with existing effect
      if (definition.stackable) {
        existingEffect.value += modifiedStacks;
        
        // Apply max stack limit (stack overflow protection)
        if (definition.maxStacks !== undefined) {
          const cappedValue = Math.min(existingEffect.value, definition.maxStacks);
          if (existingEffect.value > cappedValue) {
            console.log(`StatusEffectManager.applyStatusEffect: Capping ${effectId} stacks from ${existingEffect.value} to ${cappedValue}`);
          }
          existingEffect.value = cappedValue;
        }
        
        // Additional safety: cap at 999 stacks to prevent overflow
        if (existingEffect.value > 999) {
          console.warn(`StatusEffectManager.applyStatusEffect: ${effectId} exceeded 999 stacks, capping`);
          existingEffect.value = 999;
        }
      } else {
        // Non-stackable effects just refresh
        existingEffect.value = modifiedStacks;
      }
    } else {
      // Create new effect
      let finalStacks = modifiedStacks;
      
      // Apply max stack limit for new effects
      if (definition.maxStacks !== undefined) {
        finalStacks = Math.min(modifiedStacks, definition.maxStacks);
      }
      
      // Additional safety: cap at 999 stacks
      if (finalStacks > 999) {
        console.warn(`StatusEffectManager.applyStatusEffect: ${effectId} exceeded 999 stacks, capping`);
        finalStacks = 999;
      }

      const newEffect: StatusEffect = {
        id: definition.id,
        name: definition.name,
        type: definition.type,
        value: finalStacks,
        emoji: definition.emoji,
        description: definition.description,
        source: source // Track what caused this effect
      };

      target.statusEffects.push(newEffect);
    }

    // Call onApply callback if defined
    if (definition.onApply) {
      try {
        const currentEffect = target.statusEffects.find(e => e.id === effectId);
        if (currentEffect) {
          definition.onApply(target, currentEffect.value);
        }
      } catch (error) {
        console.error(`StatusEffectManager.applyStatusEffect: Error in onApply callback for ${effectId}:`, error);
      }
    }
  }

  /**
   * Process all status effects for a target at a specific timing
   * Returns array of trigger results for UI feedback
   */
  static processStatusEffects(
    target: CombatEntity,
    timing: 'start_of_turn' | 'end_of_turn'
  ): StatusEffectTriggerResult[] {
    const results: StatusEffectTriggerResult[] = [];

    // Validate target
    if (!target) {
      console.error('StatusEffectManager.processStatusEffects: target is null or undefined');
      return results;
    }

    // Ensure target has statusEffects array
    if (!target.statusEffects) {
      console.warn('StatusEffectManager.processStatusEffects: target missing statusEffects array, initializing');
      target.statusEffects = [];
      return results;
    }

    // Process effects in consistent order: buffs first, then debuffs
    const sortedEffects = [...target.statusEffects].sort((a, b) => {
      if (a.type === 'buff' && b.type === 'debuff') return -1;
      if (a.type === 'debuff' && b.type === 'buff') return 1;
      return 0;
    });

    for (const effect of sortedEffects) {
      // Validate effect has required properties
      if (!effect || !effect.id) {
        console.warn('StatusEffectManager.processStatusEffects: Invalid effect object, skipping');
        continue;
      }

      const definition = this.definitions.get(effect.id);
      
      if (!definition) {
        console.warn(`StatusEffectManager.processStatusEffects: Unknown status effect ID: ${effect.id}, skipping`);
        continue;
      }

      // Only process effects that match the current timing
      if (definition.triggerTiming === timing && definition.onTrigger) {
        try {
          // Validate effect value before triggering
          if (typeof effect.value !== 'number' || isNaN(effect.value) || !isFinite(effect.value)) {
            console.warn(`StatusEffectManager.processStatusEffects: Invalid effect value for ${effect.id}: ${effect.value}, skipping`);
            continue;
          }

          const result = definition.onTrigger(target, effect.value);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`StatusEffectManager.processStatusEffects: Error triggering ${effect.id}:`, error);
          // Continue processing other effects
        }
      }
    }

    return results;
  }
  
  /**
   * Batch process status effects for multiple targets at once
   * More efficient than calling processStatusEffects multiple times
   * @param targets - Array of entities to process
   * @param timing - When to trigger effects
   * @returns Combined array of all trigger results
   */
  static batchProcessStatusEffects(
    targets: CombatEntity[],
    timing: 'start_of_turn' | 'end_of_turn'
  ): StatusEffectTriggerResult[] {
    const allResults: StatusEffectTriggerResult[] = [];
    
    // Validate input
    if (!targets || !Array.isArray(targets)) {
      console.warn('StatusEffectManager.batchProcessStatusEffects: Invalid targets array');
      return allResults;
    }
    
    // Process all targets in a single batch
    for (const target of targets) {
      if (!target) continue;
      
      const results = this.processStatusEffects(target, timing);
      allResults.push(...results);
    }
    
    return allResults;
  }

  /**
   * Remove expired status effects (those with 0 or negative stacks)
   */
  static cleanupExpiredEffects(target: CombatEntity): void {
    // Validate target
    if (!target) {
      console.error('StatusEffectManager.cleanupExpiredEffects: target is null or undefined');
      return;
    }

    // Ensure target has statusEffects array
    if (!target.statusEffects) {
      console.warn('StatusEffectManager.cleanupExpiredEffects: target missing statusEffects array, initializing');
      target.statusEffects = [];
      return;
    }

    // Filter expired effects (0 or negative stacks)
    const expiredEffects = target.statusEffects.filter(e => {
      // Validate effect value
      if (typeof e.value !== 'number' || isNaN(e.value) || !isFinite(e.value)) {
        console.warn(`StatusEffectManager.cleanupExpiredEffects: Invalid effect value for ${e.id}: ${e.value}, treating as expired`);
        return true; // Remove invalid effects
      }
      return e.value <= 0;
    });
    
    // Call onExpire callbacks
    expiredEffects.forEach(effect => {
      if (!effect || !effect.id) {
        return;
      }

      const definition = this.definitions.get(effect.id);
      if (definition?.onExpire) {
        try {
          definition.onExpire(target);
        } catch (error) {
          console.error(`StatusEffectManager.cleanupExpiredEffects: Error in onExpire callback for ${effect.id}:`, error);
        }
      }
    });

    // Remove expired effects and sanitize remaining effects
    target.statusEffects = target.statusEffects.filter(e => {
      // Remove effects with invalid values
      if (typeof e.value !== 'number' || isNaN(e.value) || !isFinite(e.value)) {
        return false;
      }
      // Remove effects with 0 or negative stacks
      if (e.value <= 0) {
        return false;
      }
      return true;
    });
  }
  
  /**
   * Batch cleanup expired effects for multiple targets at once
   * More efficient than calling cleanupExpiredEffects multiple times
   * @param targets - Array of entities to clean up
   */
  static batchCleanupExpiredEffects(targets: CombatEntity[]): void {
    // Validate input
    if (!targets || !Array.isArray(targets)) {
      console.warn('StatusEffectManager.batchCleanupExpiredEffects: Invalid targets array');
      return;
    }
    
    // Clean up all targets in a single batch
    for (const target of targets) {
      if (!target) continue;
      this.cleanupExpiredEffects(target);
    }
  }

  /**
   * Get definition for UI display
   */
  static getDefinition(effectId: string): StatusEffectDefinition | undefined {
    return this.definitions.get(effectId);
  }

  /**
   * Get all registered status effect definitions
   * Useful for validation and testing
   */
  static getAllDefinitions(): StatusEffectDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Check if the system has been initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the manager (useful for testing)
   */
  static reset(): void {
    this.definitions.clear();
    this.initialized = false;
  }
}
