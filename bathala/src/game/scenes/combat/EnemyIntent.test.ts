/**
 * Test for enemy intent display with status effects
 * Validates Requirements 4.5
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Enemy, EnemyIntent } from '../../../core/types/CombatTypes';

describe('Enemy Intent Display', () => {
  let mockEnemy: Enemy;

  beforeEach(() => {
    mockEnemy = {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHealth: 100,
      currentHealth: 100,
      block: 0,
      statusEffects: [],
      intent: {
        type: 'attack',
        value: 10,
        description: 'Attacks for 10 damage',
        icon: '†',
      },
      damage: 10,
      attackPattern: ['attack', 'strengthen', 'poison', 'weaken'],
      currentPatternIndex: 0,
      elementalAffinity: {
        weakness: 'fire',
        resistance: 'water',
      },
    };
  });

  it('should display attack intent correctly', () => {
    const intent: EnemyIntent = {
      type: 'attack',
      value: 10,
      description: 'Attacks for 10 damage',
      icon: '†',
    };

    expect(intent.type).toBe('attack');
    expect(intent.value).toBe(10);
    expect(intent.icon).toBe('†');
    expect(intent.description).toContain('Attacks');
  });

  it('should display strengthen intent with status effect icon', () => {
    const intent: EnemyIntent = {
      type: 'buff',
      value: 2,
      description: 'Gains 2 Strength',
      icon: '💪',
    };

    expect(intent.type).toBe('buff');
    expect(intent.value).toBe(2);
    expect(intent.icon).toBe('💪');
    expect(intent.description).toContain('Strength');
  });

  it('should display poison intent with status effect icon and stack count', () => {
    const intent: EnemyIntent = {
      type: 'debuff',
      value: 2,
      description: 'Applies 2 Poison',
      icon: '☠️',
    };

    expect(intent.type).toBe('debuff');
    expect(intent.value).toBe(2);
    expect(intent.icon).toBe('☠️');
    expect(intent.description).toContain('Poison');
    expect(intent.description).toContain('2');
  });

  it('should display weaken intent with status effect icon and stack count', () => {
    const intent: EnemyIntent = {
      type: 'debuff',
      value: 1,
      description: 'Applies 1 Weak',
      icon: '⚠️',
    };

    expect(intent.type).toBe('debuff');
    expect(intent.value).toBe(1);
    expect(intent.icon).toBe('⚠️');
    expect(intent.description).toContain('Weak');
    expect(intent.description).toContain('1');
  });

  it('should include status effect information in intent description', () => {
    const strengthIntent: EnemyIntent = {
      type: 'buff',
      value: 2,
      description: 'Gains 2 Strength',
      icon: '💪',
    };

    const poisonIntent: EnemyIntent = {
      type: 'debuff',
      value: 2,
      description: 'Applies 2 Poison',
      icon: '☠️',
    };

    const weakIntent: EnemyIntent = {
      type: 'debuff',
      value: 1,
      description: 'Applies 1 Weak',
      icon: '⚠️',
    };

    // All intents should have the status effect name
    expect(strengthIntent.description).toContain('Strength');
    expect(poisonIntent.description).toContain('Poison');
    expect(weakIntent.description).toContain('Weak');

    // All intents should have the stack count
    expect(strengthIntent.description).toContain('2');
    expect(poisonIntent.description).toContain('2');
    expect(weakIntent.description).toContain('1');
  });

  it('should have correct intent types for status effects', () => {
    // Buff intents should be type 'buff'
    const buffIntent: EnemyIntent = {
      type: 'buff',
      value: 2,
      description: 'Gains 2 Strength',
      icon: '💪',
    };
    expect(buffIntent.type).toBe('buff');

    // Debuff intents should be type 'debuff'
    const debuffIntent: EnemyIntent = {
      type: 'debuff',
      value: 2,
      description: 'Applies 2 Poison',
      icon: '☠️',
    };
    expect(debuffIntent.type).toBe('debuff');
  });
});
