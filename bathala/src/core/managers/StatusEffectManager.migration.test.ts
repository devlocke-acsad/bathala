/**
 * Tests for Strength and Vulnerable migration to StatusEffectManager
 * Validates backward compatibility and proper integration
 */

import { StatusEffectManager } from './StatusEffectManager';
import { DamageCalculator } from '../../utils/DamageCalculator';
import { CombatEntity, Player, Enemy, PlayingCard } from '../types/CombatTypes';

describe('StatusEffectManager - Strength and Vulnerable Migration', () => {
  beforeEach(() => {
    StatusEffectManager.reset();
    StatusEffectManager.initialize();
    StatusEffectManager.clearModifiers();
  });

  describe('Strength Integration', () => {
    it('should apply Strength status effect using StatusEffectManager', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply Strength using StatusEffectManager
      StatusEffectManager.applyStatusEffect(player, 'strength', 2);

      // Verify effect was applied
      expect(player.statusEffects.length).toBe(1);
      expect(player.statusEffects[0].id).toBe('strength');
      expect(player.statusEffects[0].name).toBe('Strength');
      expect(player.statusEffects[0].value).toBe(2);
      expect(player.statusEffects[0].type).toBe('buff');
    });

    it('should apply Strength bonus in DamageCalculator for attack actions', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply Strength
      StatusEffectManager.applyStatusEffect(player, 'strength', 2);

      // Create test cards
      const cards: PlayingCard[] = [
        { id: '1', rank: '5', suit: 'Apoy', element: 'fire', selected: false, playable: true },
        { id: '2', rank: '5', suit: 'Apoy', element: 'fire', selected: false, playable: true }
      ];

      // Calculate damage with Strength
      const result = DamageCalculator.calculate(
        cards,
        'pair',
        'attack',
        player
      );

      // Verify Strength bonus is applied (2 stacks × 3 = +6 base value)
      expect(result.statusBonus).toBe(6);
      expect(result.breakdown).toContain('Strength: +6');
    });

    it('should stack Strength effects correctly', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply Strength twice
      StatusEffectManager.applyStatusEffect(player, 'strength', 2);
      StatusEffectManager.applyStatusEffect(player, 'strength', 3);

      // Verify stacking
      expect(player.statusEffects.length).toBe(1);
      expect(player.statusEffects[0].value).toBe(5); // 2 + 3 = 5
    });
  });

  describe('Vulnerable Integration', () => {
    it('should apply Vulnerable status effect using StatusEffectManager', () => {
      const enemy: Enemy = {
        id: 'enemy',
        name: 'Test Enemy',
        maxHealth: 50,
        currentHealth: 50,
        block: 0,
        statusEffects: [],
        intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
        damage: 10,
        attackPattern: ['attack'],
        currentPatternIndex: 0,
        elementalAffinity: { weakness: null, resistance: null }
      };

      // Apply Vulnerable using StatusEffectManager
      StatusEffectManager.applyStatusEffect(enemy, 'vulnerable', 1);

      // Verify effect was applied
      expect(enemy.statusEffects.length).toBe(1);
      expect(enemy.statusEffects[0].id).toBe('vulnerable');
      expect(enemy.statusEffects[0].name).toBe('Vulnerable');
      expect(enemy.statusEffects[0].value).toBe(1);
      expect(enemy.statusEffects[0].type).toBe('debuff');
    });

    it('should apply 1.5× damage multiplier when target has Vulnerable', () => {
      const enemy: Enemy = {
        id: 'enemy',
        name: 'Test Enemy',
        maxHealth: 50,
        currentHealth: 50,
        block: 0,
        statusEffects: [],
        intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
        damage: 10,
        attackPattern: ['attack'],
        currentPatternIndex: 0,
        elementalAffinity: { weakness: null, resistance: null }
      };

      // Apply Vulnerable
      StatusEffectManager.applyStatusEffect(enemy, 'vulnerable', 1);

      // Test damage multiplier
      const baseDamage = 20;
      const modifiedDamage = DamageCalculator.applyVulnerableMultiplier(baseDamage, enemy);

      expect(modifiedDamage).toBe(30); // 20 × 1.5 = 30
    });

    it('should not apply multiplier when target does not have Vulnerable', () => {
      const enemy: Enemy = {
        id: 'enemy',
        name: 'Test Enemy',
        maxHealth: 50,
        currentHealth: 50,
        block: 0,
        statusEffects: [],
        intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
        damage: 10,
        attackPattern: ['attack'],
        currentPatternIndex: 0,
        elementalAffinity: { weakness: null, resistance: null }
      };

      // Test damage without Vulnerable
      const baseDamage = 20;
      const modifiedDamage = DamageCalculator.applyVulnerableMultiplier(baseDamage, enemy);

      expect(modifiedDamage).toBe(20); // No change
    });

    it('should not stack Vulnerable (non-stackable effect)', () => {
      const enemy: Enemy = {
        id: 'enemy',
        name: 'Test Enemy',
        maxHealth: 50,
        currentHealth: 50,
        block: 0,
        statusEffects: [],
        intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
        damage: 10,
        attackPattern: ['attack'],
        currentPatternIndex: 0,
        elementalAffinity: { weakness: null, resistance: null }
      };

      // Apply Vulnerable twice
      StatusEffectManager.applyStatusEffect(enemy, 'vulnerable', 1);
      StatusEffectManager.applyStatusEffect(enemy, 'vulnerable', 1);

      // Verify it doesn't stack (non-stackable)
      expect(enemy.statusEffects.length).toBe(1);
      expect(enemy.statusEffects[0].value).toBe(1); // Stays at 1
    });
  });

  describe('Weak Integration', () => {
    it('should apply Weak status effect using StatusEffectManager', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply Weak using StatusEffectManager
      StatusEffectManager.applyStatusEffect(player, 'weak', 2);

      // Verify effect was applied
      expect(player.statusEffects.length).toBe(1);
      expect(player.statusEffects[0].id).toBe('weak');
      expect(player.statusEffects[0].name).toBe('Weak');
      expect(player.statusEffects[0].value).toBe(2);
      expect(player.statusEffects[0].type).toBe('debuff');
    });

    it('should reduce attack damage by 25% per stack of Weak', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply 2 stacks of Weak
      StatusEffectManager.applyStatusEffect(player, 'weak', 2);

      // Create test cards
      const cards: PlayingCard[] = [
        { id: '1', rank: '10', suit: 'Apoy', element: 'fire', selected: false, playable: true },
        { id: '2', rank: '10', suit: 'Apoy', element: 'fire', selected: false, playable: true }
      ];

      // Calculate damage with Weak (2 stacks = 50% reduction)
      const result = DamageCalculator.calculate(
        cards,
        'pair',
        'attack',
        player
      );

      // Verify Weak multiplier is applied (×0.5 for 2 stacks)
      expect(result.breakdown).toContain('⚠️ Weak (2): ×0.50');
    });

    it('should cap Weak at 3 stacks (75% reduction)', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Try to apply 5 stacks of Weak (should cap at 3)
      StatusEffectManager.applyStatusEffect(player, 'weak', 5);

      // Verify capped at max stacks
      expect(player.statusEffects[0].value).toBe(3);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with effects using old "name" property', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [
          {
            id: 'old_strength',
            name: 'Strength', // Old format using name
            type: 'buff',
            value: 3,
            emoji: '💪',
            description: 'Old strength effect'
          }
        ],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Create test cards
      const cards: PlayingCard[] = [
        { id: '1', rank: '5', suit: 'Apoy', element: 'fire', selected: false, playable: true }
      ];

      // Calculate damage - should still recognize old format
      const result = DamageCalculator.calculate(
        cards,
        'high_card',
        'attack',
        player
      );

      // Verify old format still works
      expect(result.statusBonus).toBe(9); // 3 stacks × 3 = 9
    });

    it('should work with effects using new "id" property', () => {
      const player: Player = {
        id: 'player',
        name: 'Test Player',
        maxHealth: 100,
        currentHealth: 100,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 0,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 0,
        maxDiscardCharges: 3
      };

      // Apply using new StatusEffectManager
      StatusEffectManager.applyStatusEffect(player, 'strength', 3);

      // Create test cards
      const cards: PlayingCard[] = [
        { id: '1', rank: '5', suit: 'Apoy', element: 'fire', selected: false, playable: true }
      ];

      // Calculate damage
      const result = DamageCalculator.calculate(
        cards,
        'high_card',
        'attack',
        player
      );

      // Verify new format works
      expect(result.statusBonus).toBe(9); // 3 stacks × 3 = 9
    });
  });
});
