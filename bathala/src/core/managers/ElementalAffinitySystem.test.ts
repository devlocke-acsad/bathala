/**
 * Tests for ElementalAffinitySystem
 * Verifies elemental weakness and resistance mechanics
 */

import { ElementalAffinitySystem, ElementalAffinity } from './ElementalAffinitySystem';
import { PlayingCard, Element } from '../types/CombatTypes';

describe('ElementalAffinitySystem', () => {
  describe('Elemental Multiplier Calculation', () => {
    it('should return 1.5× for weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('fire', affinity);
      expect(multiplier).toBe(1.5);
    });

    it('should return 0.75× for resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('water', affinity);
      expect(multiplier).toBe(0.75);
    });

    it('should return 1.0× for neutral element', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('earth', affinity);
      expect(multiplier).toBe(1.0);
    });

    it('should return 1.0× for neutral element type', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('neutral', affinity);
      expect(multiplier).toBe(1.0);
    });

    it('should return 1.0× for null element', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(null, affinity);
      expect(multiplier).toBe(1.0);
    });

    it('should handle null weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: null,
        resistance: 'water'
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('fire', affinity);
      expect(multiplier).toBe(1.0);
    });

    it('should handle null resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: null
      };

      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('water', affinity);
      expect(multiplier).toBe(1.0);
    });
  });

  describe('Dominant Element Detection', () => {
    const createCard = (suit: 'Apoy' | 'Tubig' | 'Lupa' | 'Hangin', rank: string = '5'): PlayingCard => ({
      id: `${suit}-${rank}`,
      rank: rank as any,
      suit,
      element: suit === 'Apoy' ? 'fire' : suit === 'Tubig' ? 'water' : suit === 'Lupa' ? 'earth' : 'air',
      selected: false,
      playable: true
    });

    it('should return null for empty hand', () => {
      const dominant = ElementalAffinitySystem.getDominantElement([]);
      expect(dominant).toBeNull();
    });

    it('should return fire for all fire cards', () => {
      const cards = [
        createCard('Apoy', '2'),
        createCard('Apoy', '5'),
        createCard('Apoy', '7')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBe('fire');
    });

    it('should return water for majority water cards', () => {
      const cards = [
        createCard('Tubig', '2'),
        createCard('Tubig', '5'),
        createCard('Apoy', '7')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBe('water');
    });

    it('should return earth for majority earth cards', () => {
      const cards = [
        createCard('Lupa', '2'),
        createCard('Lupa', '5'),
        createCard('Lupa', '7'),
        createCard('Hangin', '3')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBe('earth');
    });

    it('should return air for majority air cards', () => {
      const cards = [
        createCard('Hangin', '2'),
        createCard('Hangin', '5'),
        createCard('Apoy', '7')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBe('air');
    });

    it('should return null for tied elements', () => {
      const cards = [
        createCard('Apoy', '2'),
        createCard('Tubig', '5')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBeNull();
    });

    it('should return null for three-way tie', () => {
      const cards = [
        createCard('Apoy', '2'),
        createCard('Tubig', '5'),
        createCard('Lupa', '7')
      ];

      const dominant = ElementalAffinitySystem.getDominantElement(cards);
      expect(dominant).toBeNull();
    });
  });

  describe('Affinity Display Data', () => {
    it('should return correct icons for fire weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.weaknessIcon).toBe('🔥');
      expect(display.weaknessText).toContain('Fire');
      expect(display.resistanceIcon).toBe('💧');
      expect(display.resistanceText).toContain('Water');
    });

    it('should return correct icons for water weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: 'water',
        resistance: 'earth'
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.weaknessIcon).toBe('💧');
      expect(display.resistanceIcon).toBe('🌿');
    });

    it('should return correct icons for earth weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: 'earth',
        resistance: 'air'
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.weaknessIcon).toBe('🌿');
      expect(display.resistanceIcon).toBe('💨');
    });

    it('should return correct icons for air weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: 'air',
        resistance: 'fire'
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.weaknessIcon).toBe('💨');
      expect(display.resistanceIcon).toBe('🔥');
    });

    it('should handle null weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: null,
        resistance: 'fire'
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.weaknessIcon).toBe('');
      expect(display.weaknessText).toBe('No weakness');
    });

    it('should handle null resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: null
      };

      const display = ElementalAffinitySystem.getAffinityDisplayData(affinity);
      
      expect(display.resistanceIcon).toBe('');
      expect(display.resistanceText).toBe('No resistance');
    });
  });

  describe('Affinity Validation', () => {
    it('should validate correct affinity', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'water'
      };

      const isValid = ElementalAffinitySystem.validateAffinity(affinity);
      expect(isValid).toBe(true);
    });

    it('should reject circular affinity', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'fire'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const isValid = ElementalAffinitySystem.validateAffinity(affinity);
      
      expect(isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should allow null weakness and resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: null,
        resistance: null
      };

      const isValid = ElementalAffinitySystem.validateAffinity(affinity);
      expect(isValid).toBe(true);
    });
  });

  describe('Default Affinity', () => {
    it('should create neutral affinity', () => {
      const affinity = ElementalAffinitySystem.createDefaultAffinity();
      
      expect(affinity.weakness).toBeNull();
      expect(affinity.resistance).toBeNull();
    });
  });

  describe('Element Names and Icons', () => {
    it('should return correct name for fire', () => {
      const name = ElementalAffinitySystem.getElementName('fire');
      expect(name).toContain('Fire');
      expect(name).toContain('Apoy');
    });

    it('should return correct icon for fire', () => {
      const icon = ElementalAffinitySystem.getElementIcon('fire');
      expect(icon).toBe('🔥');
    });

    it('should return correct name for water', () => {
      const name = ElementalAffinitySystem.getElementName('water');
      expect(name).toContain('Water');
      expect(name).toContain('Tubig');
    });

    it('should return correct icon for water', () => {
      const icon = ElementalAffinitySystem.getElementIcon('water');
      expect(icon).toBe('💧');
    });

    it('should return correct name for earth', () => {
      const name = ElementalAffinitySystem.getElementName('earth');
      expect(name).toContain('Earth');
      expect(name).toContain('Lupa');
    });

    it('should return correct icon for earth', () => {
      const icon = ElementalAffinitySystem.getElementIcon('earth');
      expect(icon).toBe('🌿');
    });

    it('should return correct name for air', () => {
      const name = ElementalAffinitySystem.getElementName('air');
      expect(name).toContain('Air');
      expect(name).toContain('Hangin');
    });

    it('should return correct icon for air', () => {
      const icon = ElementalAffinitySystem.getElementIcon('air');
      expect(icon).toBe('💨');
    });
  });
});
