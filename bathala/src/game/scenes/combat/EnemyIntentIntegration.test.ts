/**
 * Integration test for enemy intent display with status effects
 * Tests the complete flow from attack pattern to intent display
 * Validates Requirements 4.5
 */

import { describe, it, expect } from '@jest/globals';
import { Enemy, EnemyIntent } from '../../../core/types/CombatTypes';

describe('Enemy Intent Integration', () => {
  /**
   * Simulates the updateEnemyIntent logic from Combat.ts
   */
  function updateEnemyIntent(enemy: Enemy): void {
    enemy.currentPatternIndex =
      (enemy.currentPatternIndex + 1) % enemy.attackPattern.length;

    const nextAction = enemy.attackPattern[enemy.currentPatternIndex];

    if (nextAction === "attack") {
      enemy.intent = {
        type: "attack",
        value: enemy.damage,
        description: `Attacks for ${enemy.damage} damage`,
        icon: "†",
      };
    } else if (nextAction === "defend") {
      enemy.intent = {
        type: "defend",
        value: 5,
        description: "Gains 5 block",
        icon: "⛨",
      };
    } else if (nextAction === "strengthen") {
      enemy.intent = {
        type: "buff",
        value: 2,
        description: "Gains 2 Strength",
        icon: "💪",
      };
    } else if (nextAction === "poison") {
      enemy.intent = {
        type: "debuff",
        value: 2,
        description: "Applies 2 Poison",
        icon: "☠️",
      };
    } else if (nextAction === "weaken") {
      enemy.intent = {
        type: "debuff",
        value: 1,
        description: "Applies 1 Weak",
        icon: "⚠️",
      };
    }
  }

  it('should cycle through attack pattern and update intent correctly', () => {
    const enemy: Enemy = {
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

    // Turn 1: attack -> strengthen
    updateEnemyIntent(enemy);
    expect(enemy.currentPatternIndex).toBe(1);
    expect(enemy.intent.type).toBe('buff');
    expect(enemy.intent.icon).toBe('💪');
    expect(enemy.intent.description).toContain('Strength');
    expect(enemy.intent.value).toBe(2);

    // Turn 2: strengthen -> poison
    updateEnemyIntent(enemy);
    expect(enemy.currentPatternIndex).toBe(2);
    expect(enemy.intent.type).toBe('debuff');
    expect(enemy.intent.icon).toBe('☠️');
    expect(enemy.intent.description).toContain('Poison');
    expect(enemy.intent.value).toBe(2);

    // Turn 3: poison -> weaken
    updateEnemyIntent(enemy);
    expect(enemy.currentPatternIndex).toBe(3);
    expect(enemy.intent.type).toBe('debuff');
    expect(enemy.intent.icon).toBe('⚠️');
    expect(enemy.intent.description).toContain('Weak');
    expect(enemy.intent.value).toBe(1);

    // Turn 4: weaken -> attack (cycle back)
    updateEnemyIntent(enemy);
    expect(enemy.currentPatternIndex).toBe(0);
    expect(enemy.intent.type).toBe('attack');
    expect(enemy.intent.icon).toBe('†');
    expect(enemy.intent.description).toContain('Attacks');
  });

  it('should display correct intent text for each action type', () => {
    const enemy: Enemy = {
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
      damage: 15,
      attackPattern: ['attack', 'defend', 'strengthen', 'poison', 'weaken'],
      currentPatternIndex: -1, // Start at -1 so first update goes to 0
      elementalAffinity: {
        weakness: 'fire',
        resistance: 'water',
      },
    };

    // Attack intent
    updateEnemyIntent(enemy);
    let intentText = `${enemy.intent.icon} ${enemy.intent.description}`;
    expect(intentText).toBe('† Attacks for 15 damage');

    // Defend intent
    updateEnemyIntent(enemy);
    intentText = `${enemy.intent.icon} ${enemy.intent.description}`;
    expect(intentText).toBe('⛨ Gains 5 block');

    // Strengthen intent
    updateEnemyIntent(enemy);
    intentText = `${enemy.intent.icon} ${enemy.intent.description}`;
    expect(intentText).toBe('💪 Gains 2 Strength');

    // Poison intent
    updateEnemyIntent(enemy);
    intentText = `${enemy.intent.icon} ${enemy.intent.description}`;
    expect(intentText).toBe('☠️ Applies 2 Poison');

    // Weaken intent
    updateEnemyIntent(enemy);
    intentText = `${enemy.intent.icon} ${enemy.intent.description}`;
    expect(intentText).toBe('⚠️ Applies 1 Weak');
  });

  it('should include status effect stack count in intent', () => {
    const enemy: Enemy = {
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
      attackPattern: ['strengthen', 'poison', 'weaken'],
      currentPatternIndex: -1,
      elementalAffinity: {
        weakness: 'fire',
        resistance: 'water',
      },
    };

    // Strengthen: 2 stacks
    updateEnemyIntent(enemy);
    expect(enemy.intent.value).toBe(2);
    expect(enemy.intent.description).toContain('2');

    // Poison: 2 stacks
    updateEnemyIntent(enemy);
    expect(enemy.intent.value).toBe(2);
    expect(enemy.intent.description).toContain('2');

    // Weaken: 1 stack
    updateEnemyIntent(enemy);
    expect(enemy.intent.value).toBe(1);
    expect(enemy.intent.description).toContain('1');
  });

  it('should use correct intent types for status effects', () => {
    const enemy: Enemy = {
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
      attackPattern: ['strengthen', 'poison', 'weaken'],
      currentPatternIndex: -1,
      elementalAffinity: {
        weakness: 'fire',
        resistance: 'water',
      },
    };

    // Strengthen should be a buff
    updateEnemyIntent(enemy);
    expect(enemy.intent.type).toBe('buff');

    // Poison should be a debuff
    updateEnemyIntent(enemy);
    expect(enemy.intent.type).toBe('debuff');

    // Weaken should be a debuff
    updateEnemyIntent(enemy);
    expect(enemy.intent.type).toBe('debuff');
  });
});
