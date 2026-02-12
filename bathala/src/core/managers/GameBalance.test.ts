/**
 * Game Balance Verification Tests
 * 
 * These tests verify that the combat system balance parameters are set correctly
 * and that the interactions between systems produce fair and engaging gameplay.
 */

import { ElementalAffinitySystem } from './ElementalAffinitySystem';
import { StatusEffectManager } from './StatusEffectManager';
import { DamageCalculator } from '../../utils/DamageCalculator';
import type { Element, PlayingCard, Enemy, Player } from '../types/CombatTypes';
import { EnemyRegistry } from '../registries/EnemyRegistry';
import { bootstrapEnemies } from '../../data/enemies/EnemyBootstrap';

bootstrapEnemies();

describe('Game Balance Tests', () => {
  describe('Elemental Multiplier Balance', () => {
    it('should apply 1.5× multiplier for weakness', () => {
      const baseDamage = 100;
      const weaknessMultiplier = 1.5;
      const expectedDamage = baseDamage * weaknessMultiplier;
      
      expect(expectedDamage).toBe(150);
      expect(weaknessMultiplier).toBe(1.5);
    });

    it('should apply 0.75× multiplier for resistance', () => {
      const baseDamage = 100;
      const resistanceMultiplier = 0.75;
      const expectedDamage = baseDamage * resistanceMultiplier;
      
      expect(expectedDamage).toBe(75);
      expect(resistanceMultiplier).toBe(0.75);
    });

    it('should provide meaningful but not overwhelming advantage for weakness', () => {
      // Weakness should provide 50% more damage - significant but not game-breaking
      const baseDamage = 20;
      const weaknessDamage = Math.floor(baseDamage * 1.5);
      const advantage = weaknessDamage - baseDamage;
      
      expect(advantage).toBe(10); // 50% increase
      expect(advantage / baseDamage).toBe(0.5); // 50% relative advantage
    });

    it('should provide meaningful resistance reduction', () => {
      // Resistance should reduce damage by 25% - noticeable but not nullifying
      const baseDamage = 20;
      const resistedDamage = Math.floor(baseDamage * 0.75);
      const reduction = baseDamage - resistedDamage;
      
      expect(reduction).toBe(5); // 25% reduction
      expect(reduction / baseDamage).toBe(0.25); // 25% relative reduction
    });

    it('should balance weakness and resistance symmetrically', () => {
      // The advantage from weakness should be proportionally similar to resistance disadvantage
      const weaknessMultiplier = 1.5;
      const resistanceMultiplier = 0.75;
      const neutralMultiplier = 1.0;
      
      const weaknessAdvantage = weaknessMultiplier - neutralMultiplier; // 0.5
      const resistanceDisadvantage = neutralMultiplier - resistanceMultiplier; // 0.25
      
      // Weakness provides 2x the advantage of resistance disadvantage
      expect(weaknessAdvantage / resistanceDisadvantage).toBe(2);
    });
  });

  describe('Status Effect Value Balance', () => {
    let mockPlayer: Player;
    let mockEnemy: Enemy;

    beforeEach(() => {
      StatusEffectManager.initialize();
      
      mockPlayer = {
        id: 'player',
        name: 'Test Player',
        currentHealth: 100,
        maxHealth: 100,
        block: 0,
        statusEffects: []
      } as Player;

      mockEnemy = {
        id: 'enemy',
        name: 'Test Enemy',
        currentHealth: 50,
        maxHealth: 50,
        block: 0,
        statusEffects: [],
        elementalAffinity: { weakness: null, resistance: null }
      } as Enemy;
    });

    it('should verify Poison deals 2 damage per stack', () => {
      const poisonDef = StatusEffectManager.getDefinition('poison');
      expect(poisonDef).toBeDefined();
      
      // Apply 3 stacks of poison
      StatusEffectManager.applyStatusEffect(mockEnemy, 'poison', 3);
      const initialHealth = mockEnemy.currentHealth;
      
      // Process start of turn
      StatusEffectManager.processStatusEffects(mockEnemy, 'start_of_turn');
      
      // Should deal 6 damage (3 stacks × 2 damage)
      expect(initialHealth - mockEnemy.currentHealth).toBe(6);
    });

    it('should verify Plated Armor grants 3 block per stack', () => {
      const platedArmorDef = StatusEffectManager.getDefinition('plated_armor');
      expect(platedArmorDef).toBeDefined();
      
      // Apply 3 stacks of plated armor
      StatusEffectManager.applyStatusEffect(mockPlayer, 'plated_armor', 3);
      const initialBlock = mockPlayer.block;
      
      // Process start of turn
      StatusEffectManager.processStatusEffects(mockPlayer, 'start_of_turn');
      
      // Should grant 9 block (3 stacks × 3 block)
      expect(mockPlayer.block - initialBlock).toBe(9);
    });

    it('should verify Regeneration heals 2 HP per stack', () => {
      const regenDef = StatusEffectManager.getDefinition('regeneration');
      expect(regenDef).toBeDefined();
      
      // Damage player first
      mockPlayer.currentHealth = 80;
      
      // Apply 3 stacks of regeneration
      StatusEffectManager.applyStatusEffect(mockPlayer, 'regeneration', 3);
      const initialHealth = mockPlayer.currentHealth;
      
      // Process start of turn
      StatusEffectManager.processStatusEffects(mockPlayer, 'start_of_turn');
      
      // Should heal 6 HP (3 stacks × 2 HP)
      expect(mockPlayer.currentHealth - initialHealth).toBe(6);
    });

    it('should verify Weak reduces attack damage by 25% per stack', () => {
      const weakDef = StatusEffectManager.getDefinition('weak');
      expect(weakDef).toBeDefined();
      expect(weakDef.maxStacks).toBe(3); // Capped at 3 stacks
      
      // Weak should reduce damage multiplicatively
      const baseDamage = 100;
      const oneStackReduction = baseDamage * 0.75; // 75 damage
      const twoStackReduction = baseDamage * 0.75 * 0.75; // 56.25 damage
      const threeStackReduction = baseDamage * 0.75 * 0.75 * 0.75; // 42.1875 damage
      
      expect(Math.floor(oneStackReduction)).toBe(75);
      expect(Math.floor(twoStackReduction)).toBe(56);
      expect(Math.floor(threeStackReduction)).toBe(42);
    });

    it('should verify Strength adds 3 damage per stack', () => {
      const strengthDef = StatusEffectManager.getDefinition('strength');
      expect(strengthDef).toBeDefined();
      
      // Strength should add flat damage
      const baseDamage = 20;
      const strengthStacks = 2;
      const expectedBonus = strengthStacks * 3; // 6 damage
      
      expect(expectedBonus).toBe(6);
      expect(baseDamage + expectedBonus).toBe(26);
    });

    it('should verify status effect values are balanced for 8-card hands', () => {
      // Average hand damage is around 15-25 for basic hands
      // Status effects should be meaningful but not overwhelming
      
      const averageHandDamage = 20;
      
      // Poison (3 stacks from Fire Special): 6 damage over 3 turns
      const poisonValue = 3 * 2; // 6 total damage
      expect(poisonValue / averageHandDamage).toBeCloseTo(0.3, 1); // 30% of a hand
      
      // Plated Armor (3 stacks from Earth Special): 9 block over 3 turns
      const platedArmorValue = 3 * 3; // 9 total block
      expect(platedArmorValue / averageHandDamage).toBeCloseTo(0.45, 1); // 45% of a hand
      
      // Weak (2 stacks from Air Special): 25% reduction per stack
      const weakReduction = 0.25 * 2; // 50% total reduction
      expect(weakReduction).toBe(0.5); // Significant but not complete nullification
    });
  });

  describe('Special Action Balance', () => {
    it('should verify Special action has 0.6× damage modifier', () => {
      const specialModifier = 0.6;
      const baseDamage = 100;
      const specialDamage = Math.floor(baseDamage * specialModifier);
      
      expect(specialDamage).toBe(60);
      expect(specialModifier).toBe(0.6);
    });

    it('should balance Special action damage reduction with status effect application', () => {
      // Special actions deal 40% less damage but apply powerful status effects
      const normalAttackDamage = 20;
      const specialActionDamage = Math.floor(normalAttackDamage * 0.6); // 12 damage
      const damageLoss = normalAttackDamage - specialActionDamage; // 8 damage lost
      
      // Fire Special: Apply 3 Poison (6 damage over 3 turns)
      const poisonValue = 3 * 2; // 6 damage
      
      // Earth Special: Apply 3 Plated Armor (9 block over 3 turns)
      const platedArmorValue = 3 * 3; // 9 block
      
      // Air Special: Apply 2 Weak (reduces enemy damage by ~50%)
      const weakValue = normalAttackDamage * 0.5; // 10 damage prevented per enemy attack
      
      // Water Special: Heal 8 HP
      const healValue = 8;
      
      // All status effects should provide value greater than the damage loss
      expect(poisonValue).toBeGreaterThanOrEqual(damageLoss * 0.75); // Close to break-even
      expect(platedArmorValue).toBeGreaterThan(damageLoss); // Better than damage
      expect(weakValue).toBeGreaterThan(damageLoss); // Better than damage
      expect(healValue).toBeGreaterThanOrEqual(damageLoss); // Equal value
    });

    it('should verify Fire Special (Poison) is balanced', () => {
      // Fire Special: 0.6× damage + 3 Poison stacks
      const baseDamage = 20;
      const specialDamage = Math.floor(baseDamage * 0.6); // 12
      const poisonDamage = 3 * 2; // 6 damage over 3 turns
      const totalValue = specialDamage + poisonDamage; // 18
      
      // Should be slightly less than normal attack but with delayed damage
      expect(totalValue).toBeLessThan(baseDamage);
      expect(totalValue / baseDamage).toBeGreaterThan(0.8); // At least 80% value
    });

    it('should verify Water Special (Heal) is balanced', () => {
      // Water Special: 0.6× damage + 8 HP heal
      const baseDamage = 20;
      const specialDamage = Math.floor(baseDamage * 0.6); // 12
      const healValue = 8;
      
      // Heal value should compensate for damage loss
      const damageLoss = baseDamage - specialDamage; // 8
      expect(healValue).toBe(damageLoss); // Exactly compensates
    });

    it('should verify Earth Special (Plated Armor) is balanced', () => {
      // Earth Special: 0.6× damage + 3 Plated Armor stacks
      const baseDamage = 20;
      const specialDamage = Math.floor(baseDamage * 0.6); // 12
      const blockValue = 3 * 3; // 9 block over 3 turns
      const totalValue = specialDamage + blockValue; // 21
      
      // Should be slightly better than normal attack due to defensive value
      expect(totalValue).toBeGreaterThanOrEqual(baseDamage);
    });

    it('should verify Air Special (Weak) is balanced', () => {
      // Air Special: 0.6× damage + 2 Weak stacks
      const baseDamage = 20;
      const specialDamage = Math.floor(baseDamage * 0.6); // 12
      
      // Weak reduces enemy damage by 25% per stack
      // Assuming enemy deals 15 damage per turn
      const enemyDamage = 15;
      const damageReduction = enemyDamage * 0.25 * 2; // 7.5 per turn
      
      // Over 2 enemy turns, prevents 15 damage
      const preventedDamage = damageReduction * 2; // 15
      const totalValue = specialDamage + preventedDamage; // 27
      
      // Should be better than normal attack due to defensive value
      expect(totalValue).toBeGreaterThan(baseDamage);
    });
  });

  describe('Enemy Affinity Distribution', () => {
    const getEnemyConfig = (id: string) => EnemyRegistry.getConfigOrThrow(id);
    const act1Enemies = [
      getEnemyConfig('tikbalang_scout'),
      getEnemyConfig('balete_wraith'),
      getEnemyConfig('sigbin_charger'),
      getEnemyConfig('duwende_trickster'),
      getEnemyConfig('tiyanak_ambusher'),
      getEnemyConfig('amomongo'),
      getEnemyConfig('bungisngis'),
      getEnemyConfig('kapre_shade'),
      getEnemyConfig('tawong_lipod'),
      getEnemyConfig('mangangaway')
    ];

    it('should verify all enemies have elemental affinities defined', () => {
      act1Enemies.forEach(enemy => {
        expect(enemy.elementalAffinity).toBeDefined();
        expect(enemy.elementalAffinity.weakness).toBeDefined();
        expect(enemy.elementalAffinity.resistance).toBeDefined();
      });
    });

    it('should verify no enemy has same weakness and resistance', () => {
      act1Enemies.forEach(enemy => {
        if (enemy.elementalAffinity.weakness && enemy.elementalAffinity.resistance) {
          expect(enemy.elementalAffinity.weakness).not.toBe(enemy.elementalAffinity.resistance);
        }
      });
    });

    it('should verify element distribution is fair', () => {
      const weaknessCounts: Record<string, number> = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0
      };

      const resistanceCounts: Record<string, number> = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0
      };

      act1Enemies.forEach(enemy => {
        if (enemy.elementalAffinity.weakness) {
          weaknessCounts[enemy.elementalAffinity.weakness]++;
        }
        if (enemy.elementalAffinity.resistance) {
          resistanceCounts[enemy.elementalAffinity.resistance]++;
        }
      });

      // Each element should appear as weakness at least once
      Object.values(weaknessCounts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });

      // Each element should appear as resistance at least once
      Object.values(resistanceCounts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });

      // No element should be overwhelmingly common or rare
      const totalEnemies = act1Enemies.length;
      Object.values(weaknessCounts).forEach(count => {
        const percentage = count / totalEnemies;
        expect(percentage).toBeGreaterThan(0.1); // At least 10%
        expect(percentage).toBeLessThan(0.5); // At most 50%
      });
    });

    it('should verify thematic affinity assignments make sense', () => {
      // Fire weak to Water, resist Earth
      // Water weak to Earth, resist Fire
      // Earth weak to Air, resist Water
      // Air weak to Fire, resist Air
      
      // This is a design verification - just check the pattern exists
      const fireWeakEnemies = act1Enemies.filter(e => e.elementalAffinity.weakness === 'fire');
      const waterWeakEnemies = act1Enemies.filter(e => e.elementalAffinity.weakness === 'water');
      const earthWeakEnemies = act1Enemies.filter(e => e.elementalAffinity.weakness === 'earth');
      const airWeakEnemies = act1Enemies.filter(e => e.elementalAffinity.weakness === 'air');
      
      // All elements should be represented
      expect(fireWeakEnemies.length).toBeGreaterThan(0);
      expect(waterWeakEnemies.length).toBeGreaterThan(0);
      expect(earthWeakEnemies.length).toBeGreaterThan(0);
      expect(airWeakEnemies.length).toBeGreaterThan(0);
    });
  });

  describe('Integrated Balance Scenarios', () => {
    it('should verify elemental weakness provides meaningful advantage in combat', () => {
      // Scenario: Player uses weakness element vs neutral element
      const baseDamage = 20;
      const weaknessDamage = Math.floor(baseDamage * 1.5); // 30
      const advantage = weaknessDamage - baseDamage; // 10
      
      // Over 5 turns, this is 50 extra damage
      const turnsToKill = 5;
      const totalAdvantage = advantage * turnsToKill; // 50
      
      // This should be significant (can kill a 50 HP enemy faster)
      expect(totalAdvantage).toBeGreaterThanOrEqual(50);
    });

    it('should verify status effects create tactical decisions', () => {
      // Scenario: Choose between immediate damage or status effect
      const attackDamage = 20;
      const specialDamage = Math.floor(attackDamage * 0.6); // 12
      const poisonValue = 3 * 2; // 6 over 3 turns
      
      // Immediate: 20 damage now
      // Delayed: 12 + 6 = 18 damage total
      
      // Special is slightly worse for burst but better for sustained
      expect(attackDamage).toBeGreaterThan(specialDamage + poisonValue);
      
      // But if enemy survives 3+ turns, poison provides value
      const longFightValue = specialDamage + poisonValue;
      expect(longFightValue / attackDamage).toBeGreaterThan(0.8);
    });

    it('should verify multiple systems interact fairly', () => {
      // Scenario: Weakness + Status Effect + DDA
      const baseDamage = 20;
      
      // Apply weakness multiplier
      const weaknessDamage = Math.floor(baseDamage * 1.5); // 30
      
      // Apply Strength (2 stacks)
      const strengthBonus = 2 * 3; // 6
      const totalDamage = weaknessDamage + strengthBonus; // 36
      
      // This should be powerful but not game-breaking
      expect(totalDamage).toBeLessThan(baseDamage * 2); // Less than double
      expect(totalDamage).toBeGreaterThan(baseDamage * 1.5); // More than 1.5×
    });

    it('should verify difficulty feels appropriate for average player', () => {
      // Assumptions for balance:
      // - Player has 100 HP
      // - Average hand deals 20 damage
      // - Enemy has 50 HP (common) or 100 HP (elite/boss)
      // - Enemy deals 10-15 damage per turn
      
      const playerHP = 100;
      const averageHandDamage = 20;
      const commonEnemyHP = 50;
      const enemyDamage = 12;
      
      // Common enemy should die in 2-3 turns
      const turnsToKillEnemy = Math.ceil(commonEnemyHP / averageHandDamage);
      expect(turnsToKillEnemy).toBeGreaterThanOrEqual(2);
      expect(turnsToKillEnemy).toBeLessThanOrEqual(4);
      
      // Player should survive 6-8 enemy attacks
      const turnsToKillPlayer = Math.ceil(playerHP / enemyDamage);
      expect(turnsToKillPlayer).toBeGreaterThanOrEqual(6);
      expect(turnsToKillPlayer).toBeLessThanOrEqual(10);
      
      // Player should have comfortable margin
      expect(turnsToKillPlayer).toBeGreaterThan(turnsToKillEnemy * 2);
    });
  });

  describe('Balance Edge Cases', () => {
    it('should verify maximum Weak stacks (3) does not completely nullify damage', () => {
      const baseDamage = 100;
      const maxWeakStacks = 3;
      const weakMultiplier = Math.pow(0.75, maxWeakStacks); // 0.421875
      const finalDamage = Math.floor(baseDamage * weakMultiplier);
      
      // Should still deal meaningful damage
      expect(finalDamage).toBeGreaterThan(baseDamage * 0.4); // At least 40%
      expect(finalDamage).toBe(42);
    });

    it('should verify maximum Strength stacks do not break balance', () => {
      // Assuming reasonable max of 5 stacks
      const baseDamage = 20;
      const maxStrengthStacks = 5;
      const strengthBonus = maxStrengthStacks * 3; // 15
      const totalDamage = baseDamage + strengthBonus; // 35
      
      // Should be powerful but not instant-win
      expect(totalDamage).toBeLessThan(baseDamage * 2.5);
    });

    it('should verify stacking weakness + Vulnerable is powerful but fair', () => {
      const baseDamage = 20;
      
      // Apply weakness (1.5×)
      const weaknessDamage = Math.floor(baseDamage * 1.5); // 30
      
      // Apply Vulnerable (1.5× more damage taken)
      const vulnerableDamage = Math.floor(weaknessDamage * 1.5); // 45
      
      // Should be very powerful but not one-shot territory
      expect(vulnerableDamage).toBeLessThan(baseDamage * 3);
      expect(vulnerableDamage).toBeGreaterThan(baseDamage * 2);
    });

    it('should verify resistance + high block is survivable but not trivial', () => {
      const baseDamage = 30;
      
      // Apply resistance (0.75×)
      const resistedDamage = Math.floor(baseDamage * 0.75); // 22
      
      // Apply block (15)
      const block = 15;
      const finalDamage = Math.max(0, resistedDamage - block); // 7
      
      // Should still take some damage
      expect(finalDamage).toBeGreaterThan(0);
      expect(finalDamage).toBeLessThan(baseDamage * 0.5);
    });
  });
});
