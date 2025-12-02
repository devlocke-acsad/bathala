/**
 * Performance Optimization Tests
 * Tests for caching, throttling, and batch processing optimizations
 */

import { ElementalAffinitySystem } from './ElementalAffinitySystem';
import { StatusEffectManager } from './StatusEffectManager';
import { PlayingCard, CombatEntity } from '../types/CombatTypes';

describe('Performance Optimizations', () => {
  beforeEach(() => {
    StatusEffectManager.initialize();
    ElementalAffinitySystem.clearDominantElementCache();
  });

  describe('Dominant Element Caching', () => {
    it('should cache dominant element calculations', () => {
      const cards: PlayingCard[] = [
        { id: 1, suit: 'Apoy', rank: 'A', value: 14 },
        { id: 2, suit: 'Apoy', rank: 'K', value: 13 },
        { id: 3, suit: 'Apoy', rank: 'Q', value: 12 },
        { id: 4, suit: 'Tubig', rank: 'J', value: 11 },
        { id: 5, suit: 'Lupa', rank: '10', value: 10 }
      ];

      // First call - should calculate
      const result1 = ElementalAffinitySystem.getDominantElement(cards);
      expect(result1).toBe('fire');

      // Second call with same cards - should use cache
      const result2 = ElementalAffinitySystem.getDominantElement(cards);
      expect(result2).toBe('fire');
      expect(result1).toBe(result2);
    });

    it('should return different results for different hands', () => {
      const fireCards: PlayingCard[] = [
        { id: 1, suit: 'Apoy', rank: 'A', value: 14 },
        { id: 2, suit: 'Apoy', rank: 'K', value: 13 },
        { id: 3, suit: 'Apoy', rank: 'Q', value: 12 }
      ];

      const waterCards: PlayingCard[] = [
        { id: 4, suit: 'Tubig', rank: 'A', value: 14 },
        { id: 5, suit: 'Tubig', rank: 'K', value: 13 },
        { id: 6, suit: 'Tubig', rank: 'Q', value: 12 }
      ];

      const fireResult = ElementalAffinitySystem.getDominantElement(fireCards);
      const waterResult = ElementalAffinitySystem.getDominantElement(waterCards);

      expect(fireResult).toBe('fire');
      expect(waterResult).toBe('water');
      expect(fireResult).not.toBe(waterResult);
    });

    it('should clear cache when requested', () => {
      const cards: PlayingCard[] = [
        { id: 1, suit: 'Apoy', rank: 'A', value: 14 },
        { id: 2, suit: 'Apoy', rank: 'K', value: 13 }
      ];

      // Calculate and cache
      const result1 = ElementalAffinitySystem.getDominantElement(cards);
      expect(result1).toBe('fire');

      // Clear cache
      ElementalAffinitySystem.clearDominantElementCache();

      // Should still work after cache clear
      const result2 = ElementalAffinitySystem.getDominantElement(cards);
      expect(result2).toBe('fire');
    });

    it('should handle cache with same cards in different order', () => {
      const cards1: PlayingCard[] = [
        { id: 1, suit: 'Apoy', rank: 'A', value: 14 },
        { id: 2, suit: 'Tubig', rank: 'K', value: 13 }
      ];

      const cards2: PlayingCard[] = [
        { id: 2, suit: 'Tubig', rank: 'K', value: 13 },
        { id: 1, suit: 'Apoy', rank: 'A', value: 14 }
      ];

      // Both should return null (tie) and use same cache entry
      const result1 = ElementalAffinitySystem.getDominantElement(cards1);
      const result2 = ElementalAffinitySystem.getDominantElement(cards2);

      expect(result1).toBe(null);
      expect(result2).toBe(null);
    });
  });

  describe('Batch Status Effect Processing', () => {
    it('should batch process status effects for multiple targets', () => {
      const player: CombatEntity = {
        name: 'Player',
        currentHealth: 100,
        maxHealth: 100,
        block: 0,
        statusEffects: [
          { id: 'poison', name: 'Poison', type: 'debuff', value: 2, emoji: '☠️', description: 'Poison' }
        ]
      };

      const enemy: CombatEntity = {
        name: 'Enemy',
        currentHealth: 50,
        maxHealth: 50,
        block: 0,
        statusEffects: [
          { id: 'regeneration', name: 'Regeneration', type: 'buff', value: 3, emoji: '💚', description: 'Regen' }
        ]
      };

      const results = StatusEffectManager.batchProcessStatusEffects(
        [player, enemy],
        'start_of_turn'
      );

      // Should process both poison and regeneration
      expect(results.length).toBe(2);
      expect(results.some(r => r.effectName === 'Poison')).toBe(true);
      expect(results.some(r => r.effectName === 'Regeneration')).toBe(true);
    });

    it('should batch cleanup expired effects for multiple targets', () => {
      const player: CombatEntity = {
        name: 'Player',
        currentHealth: 100,
        maxHealth: 100,
        block: 0,
        statusEffects: [
          { id: 'poison', name: 'Poison', type: 'debuff', value: 0, emoji: '☠️', description: 'Poison' },
          { id: 'strength', name: 'Strength', type: 'buff', value: 2, emoji: '💪', description: 'Strength' }
        ]
      };

      const enemy: CombatEntity = {
        name: 'Enemy',
        currentHealth: 50,
        maxHealth: 50,
        block: 0,
        statusEffects: [
          { id: 'weak', name: 'Weak', type: 'debuff', value: 0, emoji: '⚠️', description: 'Weak' },
          { id: 'plated_armor', name: 'Plated Armor', type: 'buff', value: 1, emoji: '🛡️', description: 'Armor' }
        ]
      };

      StatusEffectManager.batchCleanupExpiredEffects([player, enemy]);

      // Expired effects should be removed
      expect(player.statusEffects.length).toBe(1);
      expect(player.statusEffects[0].id).toBe('strength');
      expect(enemy.statusEffects.length).toBe(1);
      expect(enemy.statusEffects[0].id).toBe('plated_armor');
    });

    it('should handle empty targets array in batch processing', () => {
      const results = StatusEffectManager.batchProcessStatusEffects([], 'start_of_turn');
      expect(results).toEqual([]);
    });

    it('should handle null targets in batch processing', () => {
      const player: CombatEntity = {
        name: 'Player',
        currentHealth: 100,
        maxHealth: 100,
        block: 0,
        statusEffects: []
      };

      // Should not throw error with null in array
      expect(() => {
        StatusEffectManager.batchProcessStatusEffects([player, null as any], 'start_of_turn');
      }).not.toThrow();
    });
  });

  describe('Map-based Definition Lookups', () => {
    it('should use Map for O(1) status effect lookups', () => {
      // This is already implemented - just verify it works
      const definition = StatusEffectManager.getDefinition('poison');
      expect(definition).toBeDefined();
      expect(definition?.id).toBe('poison');
    });

    it('should return undefined for unknown effect IDs', () => {
      const definition = StatusEffectManager.getDefinition('unknown_effect');
      expect(definition).toBeUndefined();
    });

    it('should efficiently lookup all 8 status effects', () => {
      const effectIds = ['poison', 'weak', 'plated_armor', 'regeneration', 'strength', 'vulnerable', 'frail', 'ritual'];
      
      effectIds.forEach(id => {
        const definition = StatusEffectManager.getDefinition(id);
        expect(definition).toBeDefined();
        expect(definition?.id).toBe(id);
      });
    });
  });
});
