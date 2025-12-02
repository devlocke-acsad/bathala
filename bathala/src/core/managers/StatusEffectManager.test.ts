/**
 * Tests for StatusEffectManager
 * Verifies core status effect functionality
 */

import { StatusEffectManager } from './StatusEffectManager';
import { CombatEntity } from '../types/CombatTypes';

describe('StatusEffectManager', () => {
  let testEntity: CombatEntity;

  beforeEach(() => {
    // Reset manager before each test
    StatusEffectManager.reset();
    StatusEffectManager.initialize();

    // Create a test entity
    testEntity = {
      id: 'test-entity',
      name: 'Test Entity',
      maxHealth: 100,
      currentHealth: 100,
      block: 0,
      statusEffects: []
    };
  });

  describe('Initialization', () => {
    it('should initialize with 8 status effect definitions', () => {
      const definitions = StatusEffectManager.getAllDefinitions();
      expect(definitions).toHaveLength(8);
    });

    it('should have all required status effects', () => {
      const definitions = StatusEffectManager.getAllDefinitions();
      const ids = definitions.map(d => d.id);
      
      expect(ids).toContain('poison');
      expect(ids).toContain('weak');
      expect(ids).toContain('plated_armor');
      expect(ids).toContain('regeneration');
      expect(ids).toContain('strength');
      expect(ids).toContain('vulnerable');
      expect(ids).toContain('frail');
      expect(ids).toContain('ritual');
    });

    it('should not exceed 8 status effect types', () => {
      const definitions = StatusEffectManager.getAllDefinitions();
      expect(definitions.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Status Effect Application', () => {
    it('should apply a new status effect', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 3);
      
      expect(testEntity.statusEffects).toHaveLength(1);
      expect(testEntity.statusEffects[0].id).toBe('poison');
      expect(testEntity.statusEffects[0].value).toBe(3);
      expect(testEntity.statusEffects[0].name).toBe('Poison');
      expect(testEntity.statusEffects[0].type).toBe('debuff');
      expect(testEntity.statusEffects[0].emoji).toBe('☠️');
    });

    it('should stack stackable effects', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 2);
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 3);
      
      expect(testEntity.statusEffects).toHaveLength(1);
      expect(testEntity.statusEffects[0].value).toBe(5);
    });

    it('should not stack non-stackable effects', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'vulnerable', 1);
      StatusEffectManager.applyStatusEffect(testEntity, 'vulnerable', 1);
      
      expect(testEntity.statusEffects).toHaveLength(1);
      expect(testEntity.statusEffects[0].value).toBe(1);
    });

    it('should respect max stack limits', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'weak', 5);
      
      expect(testEntity.statusEffects[0].value).toBe(3); // Max is 3
    });

    it('should ignore negative stacks', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', -5);
      
      expect(testEntity.statusEffects).toHaveLength(0);
    });

    it('should warn on invalid effect ID', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      StatusEffectManager.applyStatusEffect(testEntity, 'invalid_effect', 1);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown status effect ID: invalid_effect');
      expect(testEntity.statusEffects).toHaveLength(0);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Status Effect Processing', () => {
    it('should process Poison at start of turn', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 3);
      
      const results = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      
      expect(results).toHaveLength(1);
      expect(results[0].effectName).toBe('Poison');
      expect(results[0].value).toBe(6); // 3 stacks × 2 damage
      expect(testEntity.currentHealth).toBe(94); // 100 - 6
      expect(testEntity.statusEffects[0].value).toBe(2); // Reduced by 1
    });

    it('should process Regeneration at start of turn', () => {
      testEntity.currentHealth = 80;
      StatusEffectManager.applyStatusEffect(testEntity, 'regeneration', 2);
      
      const results = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      
      expect(results).toHaveLength(1);
      expect(results[0].effectName).toBe('Regeneration');
      expect(results[0].value).toBe(4); // 2 stacks × 2 healing
      expect(testEntity.currentHealth).toBe(84);
      expect(testEntity.statusEffects[0].value).toBe(1); // Reduced by 1
    });

    it('should process Plated Armor at start of turn', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'plated_armor', 2);
      
      const results = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      
      expect(results).toHaveLength(1);
      expect(results[0].effectName).toBe('Plated Armor');
      expect(results[0].value).toBe(6); // 2 stacks × 3 block
      expect(testEntity.block).toBe(6);
      expect(testEntity.statusEffects[0].value).toBe(1); // Reduced by 1
    });

    it('should process Ritual at end of turn', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'ritual', 2);
      
      const results = StatusEffectManager.processStatusEffects(testEntity, 'end_of_turn');
      
      expect(results).toHaveLength(1);
      expect(results[0].effectName).toBe('Ritual');
      expect(results[0].value).toBe(2);
      
      // Should have applied Strength
      const strengthEffect = testEntity.statusEffects.find(e => e.id === 'strength');
      expect(strengthEffect).toBeDefined();
      expect(strengthEffect?.value).toBe(2);
    });

    it('should not process persistent effects during turn processing', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'strength', 3);
      StatusEffectManager.applyStatusEffect(testEntity, 'weak', 2);
      
      const startResults = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      const endResults = StatusEffectManager.processStatusEffects(testEntity, 'end_of_turn');
      
      expect(startResults).toHaveLength(0);
      expect(endResults).toHaveLength(0);
    });

    it('should process effects in order: buffs first, then debuffs', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 1);
      StatusEffectManager.applyStatusEffect(testEntity, 'regeneration', 1);
      StatusEffectManager.applyStatusEffect(testEntity, 'plated_armor', 1);
      
      const results = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      
      // Should have 3 results
      expect(results).toHaveLength(3);
      
      // Buffs should come before debuffs
      const buffResults = results.filter(r => ['Plated Armor', 'Regeneration'].includes(r.effectName));
      const debuffResults = results.filter(r => r.effectName === 'Poison');
      
      expect(buffResults).toHaveLength(2);
      expect(debuffResults).toHaveLength(1);
      
      // The debuff should be last
      expect(results[2].effectName).toBe('Poison');
    });
  });

  describe('Status Effect Cleanup', () => {
    it('should remove effects with 0 stacks', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 1);
      
      // Process to reduce to 0
      StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
      
      expect(testEntity.statusEffects[0].value).toBe(0);
      
      StatusEffectManager.cleanupExpiredEffects(testEntity);
      
      expect(testEntity.statusEffects).toHaveLength(0);
    });

    it('should remove effects with negative stacks', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 1);
      testEntity.statusEffects[0].value = -1;
      
      StatusEffectManager.cleanupExpiredEffects(testEntity);
      
      expect(testEntity.statusEffects).toHaveLength(0);
    });

    it('should keep effects with positive stacks', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 3);
      StatusEffectManager.applyStatusEffect(testEntity, 'strength', 2);
      
      StatusEffectManager.cleanupExpiredEffects(testEntity);
      
      expect(testEntity.statusEffects).toHaveLength(2);
    });
  });

  describe('Status Effect Data Integrity', () => {
    it('should ensure all applied effects have required properties', () => {
      StatusEffectManager.applyStatusEffect(testEntity, 'poison', 3);
      
      const effect = testEntity.statusEffects[0];
      
      expect(effect).toHaveProperty('id');
      expect(effect).toHaveProperty('name');
      expect(effect).toHaveProperty('type');
      expect(effect).toHaveProperty('value');
      expect(effect).toHaveProperty('emoji');
      expect(effect).toHaveProperty('description');
      
      expect(typeof effect.id).toBe('string');
      expect(typeof effect.name).toBe('string');
      expect(['buff', 'debuff']).toContain(effect.type);
      expect(typeof effect.value).toBe('number');
      expect(typeof effect.emoji).toBe('string');
      expect(typeof effect.description).toBe('string');
    });
  });
});
