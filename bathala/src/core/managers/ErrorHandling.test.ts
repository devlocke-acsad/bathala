/**
 * Error Handling Tests
 * Verifies that all error handling and validation works correctly
 * Tests for Task 14: Add error handling and validation
 */

import { StatusEffectManager } from './StatusEffectManager';
import { ElementalAffinitySystem, ElementalAffinity } from './ElementalAffinitySystem';
import { DamageCalculator } from '../../utils/DamageCalculator';
import { CombatEntity, PlayingCard } from '../types/CombatTypes';

// Helper to create test cards
function createCard(rank: string, suit: string): PlayingCard {
  return {
    id: `${rank}-${suit}`,
    rank: rank as any,
    suit: suit as any,
    element: suit === 'Apoy' ? 'fire' : suit === 'Tubig' ? 'water' : suit === 'Lupa' ? 'earth' : 'air',
    selected: false,
    playable: true
  };
}

describe('Error Handling and Validation', () => {
  let testEntity: CombatEntity;

  beforeEach(() => {
    StatusEffectManager.reset();
    StatusEffectManager.initialize();
    StatusEffectManager.clearModifiers();
    ElementalAffinitySystem.clearModifiers();

    testEntity = {
      id: 'test-entity',
      name: 'Test Entity',
      maxHealth: 100,
      currentHealth: 100,
      block: 0,
      statusEffects: []
    };
  });

  describe('StatusEffectManager Error Handling', () => {
    describe('Invalid Status Effect IDs', () => {
      it('should log warning and skip for invalid effect ID', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        StatusEffectManager.applyStatusEffect(testEntity, 'nonexistent_effect', 5);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown status effect ID: nonexistent_effect')
        );
        expect(testEntity.statusEffects).toHaveLength(0);
        
        consoleSpy.mockRestore();
      });

      it('should skip processing for unknown effect IDs', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        // Manually add an invalid effect
        testEntity.statusEffects.push({
          id: 'fake_effect',
          name: 'Fake',
          type: 'buff',
          value: 5,
          emoji: '❓',
          description: 'Invalid'
        });
        
        const results = StatusEffectManager.processStatusEffects(testEntity, 'start_of_turn');
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown status effect ID: fake_effect')
        );
        expect(results).toHaveLength(0);
        
        consoleSpy.mockRestore();
      });
    });

    describe('Stack Overflow Protection', () => {
      it('should cap stacks at maxStacks limit', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'weak', 10);
        
        expect(testEntity.statusEffects[0].value).toBe(3); // Max is 3
      });

      it('should cap stacks when adding to existing effect', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'weak', 2);
        StatusEffectManager.applyStatusEffect(testEntity, 'weak', 5);
        
        expect(testEntity.statusEffects[0].value).toBe(3); // Max is 3
      });

      it('should cap stacks at 999 for safety', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', 1000);
        
        expect(testEntity.statusEffects[0].value).toBe(999);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('exceeded 999 stacks')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('Negative Stack Protection', () => {
      it('should ignore negative stacks on application', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', -5);
        
        expect(testEntity.statusEffects).toHaveLength(0);
      });

      it('should ignore zero stacks on application', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', 0);
        
        expect(testEntity.statusEffects).toHaveLength(0);
      });

      it('should remove effects with negative stacks during cleanup', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', 5);
        testEntity.statusEffects[0].value = -2;
        
        StatusEffectManager.cleanupExpiredEffects(testEntity);
        
        expect(testEntity.statusEffects).toHaveLength(0);
      });
    });

    describe('Invalid Target Handling', () => {
      it('should handle null target gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        StatusEffectManager.applyStatusEffect(null as any, 'poison', 5);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('target is null or undefined')
        );
        
        consoleSpy.mockRestore();
      });

      it('should initialize missing statusEffects array', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const entityWithoutEffects: any = {
          id: 'test',
          name: 'Test',
          maxHealth: 100,
          currentHealth: 100,
          block: 0
        };
        
        StatusEffectManager.applyStatusEffect(entityWithoutEffects, 'poison', 3);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('missing statusEffects array')
        );
        expect(entityWithoutEffects.statusEffects).toBeDefined();
        expect(entityWithoutEffects.statusEffects).toHaveLength(1);
        
        consoleSpy.mockRestore();
      });
    });

    describe('NaN and Invalid Value Protection', () => {
      it('should handle NaN stacks', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', NaN);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid stacks value')
        );
        expect(testEntity.statusEffects).toHaveLength(0);
        
        consoleSpy.mockRestore();
      });

      it('should handle Infinity stacks', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', Infinity);
        
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid stacks value')
        );
        expect(testEntity.statusEffects).toHaveLength(0);
        
        consoleSpy.mockRestore();
      });

      it('should remove effects with invalid values during cleanup', () => {
        StatusEffectManager.applyStatusEffect(testEntity, 'poison', 5);
        testEntity.statusEffects[0].value = NaN;
        
        StatusEffectManager.cleanupExpiredEffects(testEntity);
        
        expect(testEntity.statusEffects).toHaveLength(0);
      });
    });
  });

  describe('ElementalAffinitySystem Error Handling', () => {
    describe('Missing Affinity Fallback', () => {
      it('should default to 1.0× multiplier for null affinity', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'fire',
          null as any
        );
        
        expect(multiplier).toBe(1.0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing affinity')
        );
        
        consoleSpy.mockRestore();
      });

      it('should default to 1.0× multiplier for undefined affinity', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'fire',
          undefined as any
        );
        
        expect(multiplier).toBe(1.0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing affinity')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('Invalid Element Handling', () => {
      it('should treat invalid elements as neutral', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const affinity: ElementalAffinity = {
          weakness: 'fire',
          resistance: 'water'
        };
        
        const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'invalid_element' as any,
          affinity
        );
        
        expect(multiplier).toBe(1.0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid element')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('Invalid Cards Handling', () => {
      it('should handle null cards array', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const element = ElementalAffinitySystem.getDominantElement(null as any);
        
        expect(element).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid cards array')
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle undefined cards array', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const element = ElementalAffinitySystem.getDominantElement(undefined as any);
        
        expect(element).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid cards array')
        );
        
        consoleSpy.mockRestore();
      });

      it('should skip invalid card objects', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy'),
          null as any,
          createCard('3', 'Apoy'),
          { rank: '4' } as any, // Missing suit
        ];
        
        const element = ElementalAffinitySystem.getDominantElement(cards);
        
        expect(element).toBe('fire');
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });
    });

    describe('Modifier Validation', () => {
      it('should handle invalid modifier return values', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        ElementalAffinitySystem.registerModifier(() => NaN);
        
        const affinity: ElementalAffinity = {
          weakness: 'fire',
          resistance: null
        };
        
        const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'fire',
          affinity
        );
        
        expect(multiplier).toBe(1.5); // Should use base multiplier
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Modifier returned invalid value')
        );
        
        consoleSpy.mockRestore();
      });

      it('should clamp out-of-bounds modifier values', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        ElementalAffinitySystem.registerModifier(() => 100);
        
        const affinity: ElementalAffinity = {
          weakness: null,
          resistance: null
        };
        
        const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'fire',
          affinity
        );
        
        expect(multiplier).toBe(10.0); // Clamped to max
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('out-of-bounds value')
        );
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('DamageCalculator Error Handling', () => {
    describe('Invalid Input Handling', () => {
      it('should handle null cards array', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const result = DamageCalculator.calculate(
          null as any,
          'high_card',
          'attack'
        );
        
        expect(result.finalValue).toBe(0);
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should handle missing handType', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy')
        ];
        
        const result = DamageCalculator.calculate(
          cards,
          null as any,
          'attack'
        );
        
        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing handType')
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle invalid relicBonuses', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy')
        ];
        
        const result = DamageCalculator.calculate(
          cards,
          'high_card',
          'attack',
          undefined,
          undefined,
          null as any
        );
        
        expect(result).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid relicBonuses')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('NaN and Overflow Protection', () => {
      it('should cap final damage at 9999', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        // Create a scenario that would produce very high damage
        const cards: PlayingCard[] = Array(5).fill(createCard('Datu', 'Apoy'));
        const player: any = {
          statusEffects: [
            { id: 'strength', name: 'Strength', type: 'buff', value: 100, emoji: '💪', description: '' }
          ]
        };
        
        const result = DamageCalculator.calculate(
          cards,
          'five_of_a_kind',
          'attack',
          player
        );
        
        expect(result.finalValue).toBeLessThanOrEqual(9999);
        
        consoleSpy.mockRestore();
      });

      it('should ensure non-negative damage', () => {
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy')
        ];
        
        const result = DamageCalculator.calculate(
          cards,
          'high_card',
          'attack'
        );
        
        expect(result.finalValue).toBeGreaterThanOrEqual(0);
      });

      it('should handle invalid card values', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy'),
          null as any,
          createCard('3', 'Tubig')
        ];
        
        const result = DamageCalculator.calculate(
          cards,
          'high_card',
          'attack'
        );
        
        expect(result).toBeDefined();
        expect(result.finalValue).toBeGreaterThanOrEqual(0);
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });
    });

    describe('Missing Enemy Affinity Fallback', () => {
      it('should use 1.0× multiplier when enemy lacks affinity', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const cards: PlayingCard[] = [
          createCard('2', 'Apoy'),
          createCard('3', 'Apoy'),
          createCard('4', 'Apoy')
        ];
        const enemy: any = {
          id: 'test-enemy',
          name: 'Test Enemy',
          maxHealth: 100,
          currentHealth: 100,
          block: 0,
          statusEffects: []
          // Missing elementalAffinity
        };
        
        const result = DamageCalculator.calculate(
          cards,
          'high_card',
          'attack',
          undefined,
          enemy
        );
        
        expect(result.elementalMultiplier).toBe(1.0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('missing elementalAffinity')
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('Vulnerable Multiplier Error Handling', () => {
      it('should handle invalid damage input', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const result = DamageCalculator.applyVulnerableMultiplier(NaN, testEntity);
        
        expect(result).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid damage')
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle invalid target', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const result = DamageCalculator.applyVulnerableMultiplier(50, null as any);
        
        expect(result).toBe(50);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid target')
        );
        
        consoleSpy.mockRestore();
      });

      it('should cap vulnerable damage at 9999', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        StatusEffectManager.applyStatusEffect(testEntity, 'vulnerable', 1);
        
        const result = DamageCalculator.applyVulnerableMultiplier(8000, testEntity);
        
        expect(result).toBe(9999);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('exceeds maximum')
        );
        
        consoleSpy.mockRestore();
      });
    });
  });
});
