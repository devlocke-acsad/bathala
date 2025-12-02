import { DamageCalculator } from './DamageCalculator';
import { PlayingCard, Enemy } from '../core/types/CombatTypes';

describe('DamageCalculator - Elemental System Integration', () => {
  // Helper to create a test card
  const createCard = (rank: any, suit: any): PlayingCard => ({
    id: `${rank}-${suit}`,
    rank,
    suit,
    element: suit === 'Apoy' ? 'fire' : suit === 'Tubig' ? 'water' : suit === 'Lupa' ? 'earth' : 'air',
    selected: false,
    playable: true
  });

  // Helper to create a test enemy
  const createEnemy = (weakness: any, resistance: any): Enemy => ({
    id: 'test-enemy',
    name: 'Test Enemy',
    maxHealth: 100,
    currentHealth: 100,
    block: 0,
    statusEffects: [],
    intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
    damage: 10,
    attackPattern: ['attack'],
    currentPatternIndex: 0,
    elementalAffinity: {
      weakness,
      resistance
    }
  });

  it('should apply 1.5× multiplier when hitting enemy weakness', () => {
    const cards = [
      createCard('2', 'Apoy'),
      createCard('3', 'Apoy'),
      createCard('4', 'Apoy')
    ];
    const enemy = createEnemy('fire', 'water');

    const result = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack', undefined, enemy);

    expect(result.elementalMultiplier).toBe(1.5);
    expect(result.breakdown).toContain('🔥 Weakness: ×1.5');
  });

  it('should apply 0.75× multiplier when hitting enemy resistance', () => {
    const cards = [
      createCard('2', 'Tubig'),
      createCard('3', 'Tubig'),
      createCard('4', 'Tubig')
    ];
    const enemy = createEnemy('fire', 'water');

    const result = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack', undefined, enemy);

    expect(result.elementalMultiplier).toBe(0.75);
    expect(result.breakdown).toContain('💧 Resistance: ×0.75');
  });

  it('should apply 1.0× multiplier for neutral elements', () => {
    const cards = [
      createCard('2', 'Lupa'),
      createCard('3', 'Lupa'),
      createCard('4', 'Lupa')
    ];
    const enemy = createEnemy('fire', 'water');

    const result = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack', undefined, enemy);

    expect(result.elementalMultiplier).toBe(1.0);
    expect(result.breakdown).not.toContain('Weakness');
    expect(result.breakdown).not.toContain('Resistance');
  });

  it('should default to 1.0× multiplier when no enemy is provided', () => {
    const cards = [
      createCard('2', 'Apoy'),
      createCard('3', 'Apoy'),
      createCard('4', 'Apoy')
    ];

    const result = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack');

    expect(result.elementalMultiplier).toBe(1.0);
  });

  it('should default to 1.0× multiplier when enemy has no elemental affinity', () => {
    const cards = [
      createCard('2', 'Apoy'),
      createCard('3', 'Apoy'),
      createCard('4', 'Apoy')
    ];
    const enemyWithoutAffinity: any = {
      id: 'test-enemy',
      name: 'Test Enemy',
      maxHealth: 100,
      currentHealth: 100,
      block: 0,
      statusEffects: [],
      intent: { type: 'attack', value: 10, description: 'Attack', icon: '⚔️' },
      damage: 10,
      attackPattern: ['attack'],
      currentPatternIndex: 0
      // No elementalAffinity property
    };

    const result = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack', undefined, enemyWithoutAffinity);

    expect(result.elementalMultiplier).toBe(1.0);
  });

  it('should apply elemental multiplier after action type modifiers', () => {
    const cards = [
      createCard('5', 'Apoy'),
      createCard('6', 'Apoy'),
      createCard('7', 'Apoy')
    ];
    const enemy = createEnemy('fire', 'water');

    // Test with attack (no modifier)
    const attackResult = DamageCalculator.calculate(cards, 'three_of_a_kind', 'attack', undefined, enemy);
    
    // Test with special (0.6× modifier, then 1.5× elemental)
    const specialResult = DamageCalculator.calculate(cards, 'three_of_a_kind', 'special', undefined, enemy);

    // Special should have both modifiers applied
    expect(specialResult.breakdown).toContain('Special Modifier: ×0.6');
    expect(specialResult.breakdown).toContain('🔥 Weakness: ×1.5');
    expect(specialResult.elementalMultiplier).toBe(1.5);
  });

  it('should handle mixed element hands correctly (no dominant element)', () => {
    const cards = [
      createCard('2', 'Apoy'),
      createCard('3', 'Tubig'),
      createCard('4', 'Lupa'),
      createCard('5', 'Hangin'),
      createCard('6', 'Apoy')
    ];
    const enemy = createEnemy('fire', 'water');

    const result = DamageCalculator.calculate(cards, 'high_card', 'attack', undefined, enemy);

    // With 2 fire cards and 1 of each other, fire is dominant
    expect(result.elementalMultiplier).toBe(1.5);
  });
});
