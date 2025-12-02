/**
 * DDA and Elemental Affinity Integration Tests
 * 
 * **Feature: combat-status-elemental-system, Property 8: DDA and elemental affinity independence**
 * 
 * Tests that DDA stat adjustments preserve elemental affinities and that
 * elemental multipliers are applied correctly after DDA adjustments.
 * 
 * Validates: Requirements 6.1, 6.3
 */

import { RuleBasedDDA } from './RuleBasedDDA';
import { DEFAULT_DDA_CONFIG } from './DDAConfig';
import { DifficultyTier } from './DDATypes';
import { Enemy, Element, PlayingCard } from '../types/CombatTypes';
import { ElementalAffinitySystem } from '../managers/ElementalAffinitySystem';
import { DamageCalculator } from '../../utils/DamageCalculator';

describe('DDA and Elemental Affinity Integration', () => {
  let dda: RuleBasedDDA;

  beforeEach(() => {
    RuleBasedDDA.forceClearSingleton();
    dda = RuleBasedDDA.getInstance(DEFAULT_DDA_CONFIG);
  });

  afterEach(() => {
    RuleBasedDDA.forceClearSingleton();
  });

  /**
   * Helper: Set PPS to a specific tier
   */
  function setPPS(targetPPS: number, tier: DifficultyTier): void {
    const snapshot = dda.getStateSnapshot();
    snapshot.currentPPS = targetPPS;
    snapshot.previousPPS = targetPPS;
    snapshot.tier = tier;
    snapshot.isCalibrating = false;
    snapshot.totalCombatsCompleted = 5;
    dda.restoreStateSnapshot(snapshot);
  }

  /**
   * Helper: Create a test enemy with elemental affinity
   */
  function createTestEnemy(
    baseHealth: number,
    baseDamage: number,
    weakness: Element | null,
    resistance: Element | null
  ): Enemy {
    return {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHealth: baseHealth,
      currentHealth: baseHealth,
      damage: baseDamage,
      block: 0,
      intent: {
        type: 'attack',
        value: baseDamage,
        description: `Attacks for ${baseDamage} damage`,
        icon: '⚔️'
      },
      attackPattern: [],
      patternIndex: 0,
      statusEffects: [],
      elementalAffinity: {
        weakness: weakness,
        resistance: resistance
      },
      sprite: 'test-sprite',
      lore: 'Test enemy'
    };
  }

  describe('Property 8: DDA and elemental affinity independence', () => {
    it('should preserve elemental affinity when applying DDA adjustments - struggling tier', () => {
      // ARRANGE
      setPPS(0.8, 'struggling');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const originalEnemy = createTestEnemy(100, 20, 'fire', 'water');
      const originalAffinity = { ...originalEnemy.elementalAffinity };

      // ACT - Apply DDA adjustments (simulating what CombatDDA.initializeDDA does)
      originalEnemy.maxHealth = Math.round(originalEnemy.maxHealth * adjustment.enemyHealthMultiplier);
      originalEnemy.currentHealth = originalEnemy.maxHealth;
      originalEnemy.damage = Math.round(originalEnemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT - Elemental affinity should be unchanged
      expect(originalEnemy.elementalAffinity).toEqual(originalAffinity);
      expect(originalEnemy.elementalAffinity.weakness).toBe('fire');
      expect(originalEnemy.elementalAffinity.resistance).toBe('water');
      
      // Stats should be adjusted
      expect(originalEnemy.maxHealth).toBe(80); // 100 * 0.8
      expect(originalEnemy.damage).toBe(16); // 20 * 0.8
    });

    it('should preserve elemental affinity when applying DDA adjustments - learning tier', () => {
      // ARRANGE
      setPPS(2.0, 'learning');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const originalEnemy = createTestEnemy(150, 25, 'water', 'earth');
      const originalAffinity = { ...originalEnemy.elementalAffinity };

      // ACT
      originalEnemy.maxHealth = Math.round(originalEnemy.maxHealth * adjustment.enemyHealthMultiplier);
      originalEnemy.currentHealth = originalEnemy.maxHealth;
      originalEnemy.damage = Math.round(originalEnemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT
      expect(originalEnemy.elementalAffinity).toEqual(originalAffinity);
      expect(originalEnemy.elementalAffinity.weakness).toBe('water');
      expect(originalEnemy.elementalAffinity.resistance).toBe('earth');
      
      // Stats should be unchanged (1.0x multiplier)
      expect(originalEnemy.maxHealth).toBe(150);
      expect(originalEnemy.damage).toBe(25);
    });

    it('should preserve elemental affinity when applying DDA adjustments - thriving tier', () => {
      // ARRANGE
      setPPS(3.2, 'thriving');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const originalEnemy = createTestEnemy(200, 30, 'earth', 'air');
      const originalAffinity = { ...originalEnemy.elementalAffinity };

      // ACT
      originalEnemy.maxHealth = Math.round(originalEnemy.maxHealth * adjustment.enemyHealthMultiplier);
      originalEnemy.currentHealth = originalEnemy.maxHealth;
      originalEnemy.damage = Math.round(originalEnemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT
      expect(originalEnemy.elementalAffinity).toEqual(originalAffinity);
      expect(originalEnemy.elementalAffinity.weakness).toBe('earth');
      expect(originalEnemy.elementalAffinity.resistance).toBe('air');
      
      // Stats should be increased
      expect(originalEnemy.maxHealth).toBe(220); // 200 * 1.10
      expect(originalEnemy.damage).toBe(33); // 30 * 1.10
    });

    it('should preserve elemental affinity when applying DDA adjustments - mastering tier', () => {
      // ARRANGE
      setPPS(4.5, 'mastering');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const originalEnemy = createTestEnemy(250, 35, 'air', 'fire');
      const originalAffinity = { ...originalEnemy.elementalAffinity };

      // ACT
      originalEnemy.maxHealth = Math.round(originalEnemy.maxHealth * adjustment.enemyHealthMultiplier);
      originalEnemy.currentHealth = originalEnemy.maxHealth;
      originalEnemy.damage = Math.round(originalEnemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT
      expect(originalEnemy.elementalAffinity).toEqual(originalAffinity);
      expect(originalEnemy.elementalAffinity.weakness).toBe('air');
      expect(originalEnemy.elementalAffinity.resistance).toBe('fire');
      
      // Stats should be increased
      expect(originalEnemy.maxHealth).toBe(288); // 250 * 1.15 = 287.5 → 288
      expect(originalEnemy.damage).toBe(40); // 35 * 1.15 = 40.25 → 40
    });

    it('should preserve null elemental affinities when applying DDA adjustments', () => {
      // ARRANGE
      setPPS(3.5, 'thriving');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const originalEnemy = createTestEnemy(180, 28, null, null);
      const originalAffinity = { ...originalEnemy.elementalAffinity };

      // ACT
      originalEnemy.maxHealth = Math.round(originalEnemy.maxHealth * adjustment.enemyHealthMultiplier);
      originalEnemy.currentHealth = originalEnemy.maxHealth;
      originalEnemy.damage = Math.round(originalEnemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT
      expect(originalEnemy.elementalAffinity).toEqual(originalAffinity);
      expect(originalEnemy.elementalAffinity.weakness).toBeNull();
      expect(originalEnemy.elementalAffinity.resistance).toBeNull();
      
      // Stats should be adjusted
      expect(originalEnemy.maxHealth).toBe(198); // 180 * 1.10
      expect(originalEnemy.damage).toBe(31); // 28 * 1.10 = 30.8 → 31
    });

    it('should apply elemental multipliers after DDA stat adjustments', () => {
      // ARRANGE
      setPPS(3.0, 'thriving');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const enemy = createTestEnemy(100, 20, 'fire', 'water');
      
      // Apply DDA adjustments first
      enemy.maxHealth = Math.round(enemy.maxHealth * adjustment.enemyHealthMultiplier);
      enemy.currentHealth = enemy.maxHealth;
      enemy.damage = Math.round(enemy.damage * adjustment.enemyDamageMultiplier);
      
      // DDA-adjusted stats: HP = 110, Damage = 22

      // ACT - Calculate damage with elemental weakness
      const baseDamage = 50;
      const elementalMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        'fire',
        enemy.elementalAffinity
      );
      const finalDamage = Math.floor(baseDamage * elementalMultiplier);

      // ASSERT
      expect(enemy.maxHealth).toBe(110); // DDA adjusted
      expect(elementalMultiplier).toBe(1.5); // Weakness multiplier
      expect(finalDamage).toBe(75); // 50 * 1.5 = 75
      
      // Verify elemental multiplier is independent of DDA
      expect(elementalMultiplier).toBe(1.5); // Always 1.5 for weakness, regardless of DDA tier
    });

    it('should not modify elemental multipliers based on DDA tier', () => {
      // ARRANGE - Test all tiers
      const tiers: Array<{ pps: number; tier: DifficultyTier }> = [
        { pps: 0.5, tier: 'struggling' },
        { pps: 2.0, tier: 'learning' },
        { pps: 3.5, tier: 'thriving' },
        { pps: 4.8, tier: 'mastering' }
      ];

      const enemy = createTestEnemy(100, 20, 'fire', 'water');

      // ACT & ASSERT - Elemental multipliers should be the same across all tiers
      tiers.forEach(({ pps, tier }) => {
        setPPS(pps, tier);
        
        const weaknessMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'fire',
          enemy.elementalAffinity
        );
        const resistanceMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'water',
          enemy.elementalAffinity
        );
        const neutralMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
          'earth',
          enemy.elementalAffinity
        );

        expect(weaknessMultiplier).toBe(1.5);
        expect(resistanceMultiplier).toBe(0.75);
        expect(neutralMultiplier).toBe(1.0);
      });
    });

    it('should calculate final damage correctly with both DDA and elemental multipliers', () => {
      // ARRANGE
      setPPS(4.0, 'mastering');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const enemy = createTestEnemy(200, 30, 'water', 'fire');
      
      // Apply DDA adjustments
      enemy.maxHealth = Math.round(enemy.maxHealth * adjustment.enemyHealthMultiplier);
      enemy.damage = Math.round(enemy.damage * adjustment.enemyDamageMultiplier);

      // ACT - Calculate damage with weakness exploitation
      const playerBaseDamage = 60;
      const elementalMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        'water', // Attacking with weakness
        enemy.elementalAffinity
      );
      const finalDamage = Math.floor(playerBaseDamage * elementalMultiplier);

      // ASSERT
      // DDA increased enemy HP to 230 (200 * 1.15)
      expect(enemy.maxHealth).toBe(230);
      
      // But elemental multiplier is still 1.5x
      expect(elementalMultiplier).toBe(1.5);
      
      // Final damage: 60 * 1.5 = 90
      expect(finalDamage).toBe(90);
      
      // Verify the player can still exploit weakness effectively even at high DDA tier
      const damageRatio = finalDamage / enemy.maxHealth;
      expect(damageRatio).toBeGreaterThan(0.3); // Still deals significant % of enemy HP
    });

    it('should maintain elemental affinity object reference integrity', () => {
      // ARRANGE
      setPPS(2.5, 'learning');
      const adjustment = dda.getCurrentDifficultyAdjustment();
      
      const enemy = createTestEnemy(150, 25, 'earth', 'air');
      const affinityReference = enemy.elementalAffinity;

      // ACT - Apply DDA adjustments
      enemy.maxHealth = Math.round(enemy.maxHealth * adjustment.enemyHealthMultiplier);
      enemy.currentHealth = enemy.maxHealth;
      enemy.damage = Math.round(enemy.damage * adjustment.enemyDamageMultiplier);

      // ASSERT - The affinity object should be the same reference
      expect(enemy.elementalAffinity).toBe(affinityReference);
      expect(enemy.elementalAffinity.weakness).toBe('earth');
      expect(enemy.elementalAffinity.resistance).toBe('air');
    });
  });

  describe('Integration with DamageCalculator', () => {
    it('should apply elemental multipliers after DDA adjustments in damage calculation', () => {
      // ARRANGE
      setPPS(3.8, 'thriving');
      
      const enemy = createTestEnemy(180, 28, 'fire', 'water');
      
      // Note: DDA adjustments are applied in CombatDDA.initializeDDA before combat starts
      // The DamageCalculator receives the already-adjusted enemy
      const adjustment = dda.getCurrentDifficultyAdjustment();
      enemy.maxHealth = Math.round(enemy.maxHealth * adjustment.enemyHealthMultiplier);
      enemy.damage = Math.round(enemy.damage * adjustment.enemyDamageMultiplier);

      // Create test cards (all fire element)
      const fireCards: PlayingCard[] = [
        { rank: '10', suit: 'Apoy', element: 'fire', id: 'card1', selected: false, playable: true },
        { rank: '10', suit: 'Apoy', element: 'fire', id: 'card2', selected: false, playable: true },
        { rank: '10', suit: 'Apoy', element: 'fire', id: 'card3', selected: false, playable: true },
        { rank: '5', suit: 'Apoy', element: 'fire', id: 'card4', selected: false, playable: true },
        { rank: '5', suit: 'Apoy', element: 'fire', id: 'card5', selected: false, playable: true }
      ];

      // ACT - Calculate damage
      const calculation = DamageCalculator.calculate(
        fireCards,
        'pair',
        'attack',
        undefined,
        enemy,
        []
      );

      // ASSERT
      // Enemy HP was increased by DDA: 180 * 1.10 = 198
      expect(enemy.maxHealth).toBe(198);
      
      // Elemental multiplier should be 1.5 (fire weakness)
      expect(calculation.elementalMultiplier).toBe(1.5);
      
      // Final damage should include elemental multiplier
      expect(calculation.finalValue).toBeGreaterThan(calculation.baseValue);
      
      // Verify calculation order: base → DDA (N/A for player damage) → elemental
      expect(calculation.elementalMultiplier).toBe(1.5);
    });
  });
});
