/**
 * Unit tests for elemental affinity UI indicators
 * Tests that the affinity display data is correctly generated
 */

import { ElementalAffinitySystem, ElementalAffinity } from '../../../core/managers/ElementalAffinitySystem';

describe('CombatUI - Elemental Affinity Indicators', () => {
  describe('Affinity Display Data', () => {
    it('should display correct icons for fire weakness and air resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'fire',
        resistance: 'air'
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('🔥');
      expect(displayData.weaknessText).toBe('Weak to Fire (Apoy)');
      expect(displayData.resistanceIcon).toBe('💨');
      expect(displayData.resistanceText).toBe('Resists Air (Hangin)');
    });

    it('should display correct icons for water weakness and earth resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'water',
        resistance: 'earth'
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('💧');
      expect(displayData.weaknessText).toBe('Weak to Water (Tubig)');
      expect(displayData.resistanceIcon).toBe('🌿');
      expect(displayData.resistanceText).toBe('Resists Earth (Lupa)');
    });

    it('should display correct icons for earth weakness and water resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'earth',
        resistance: 'water'
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('🌿');
      expect(displayData.weaknessText).toBe('Weak to Earth (Lupa)');
      expect(displayData.resistanceIcon).toBe('💧');
      expect(displayData.resistanceText).toBe('Resists Water (Tubig)');
    });

    it('should display correct icons for air weakness and fire resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'air',
        resistance: 'fire'
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('💨');
      expect(displayData.weaknessText).toBe('Weak to Air (Hangin)');
      expect(displayData.resistanceIcon).toBe('🔥');
      expect(displayData.resistanceText).toBe('Resists Fire (Apoy)');
    });

    it('should handle null weakness', () => {
      const affinity: ElementalAffinity = {
        weakness: null,
        resistance: 'fire'
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('');
      expect(displayData.weaknessText).toBe('No weakness');
      expect(displayData.resistanceIcon).toBe('🔥');
      expect(displayData.resistanceText).toBe('Resists Fire (Apoy)');
    });

    it('should handle null resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: 'water',
        resistance: null
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('💧');
      expect(displayData.weaknessText).toBe('Weak to Water (Tubig)');
      expect(displayData.resistanceIcon).toBe('');
      expect(displayData.resistanceText).toBe('No resistance');
    });

    it('should handle both null weakness and resistance', () => {
      const affinity: ElementalAffinity = {
        weakness: null,
        resistance: null
      };

      const displayData = ElementalAffinitySystem.getAffinityDisplayData(affinity);

      expect(displayData.weaknessIcon).toBe('');
      expect(displayData.weaknessText).toBe('No weakness');
      expect(displayData.resistanceIcon).toBe('');
      expect(displayData.resistanceText).toBe('No resistance');
    });
  });

  describe('Element Icons', () => {
    it('should return correct icon for fire element', () => {
      expect(ElementalAffinitySystem.getElementIcon('fire')).toBe('🔥');
    });

    it('should return correct icon for water element', () => {
      expect(ElementalAffinitySystem.getElementIcon('water')).toBe('💧');
    });

    it('should return correct icon for earth element', () => {
      expect(ElementalAffinitySystem.getElementIcon('earth')).toBe('🌿');
    });

    it('should return correct icon for air element', () => {
      expect(ElementalAffinitySystem.getElementIcon('air')).toBe('💨');
    });

    it('should return correct icon for neutral element', () => {
      expect(ElementalAffinitySystem.getElementIcon('neutral')).toBe('⚪');
    });
  });

  describe('Element Names', () => {
    it('should return correct name for fire element', () => {
      expect(ElementalAffinitySystem.getElementName('fire')).toBe('Fire (Apoy)');
    });

    it('should return correct name for water element', () => {
      expect(ElementalAffinitySystem.getElementName('water')).toBe('Water (Tubig)');
    });

    it('should return correct name for earth element', () => {
      expect(ElementalAffinitySystem.getElementName('earth')).toBe('Earth (Lupa)');
    });

    it('should return correct name for air element', () => {
      expect(ElementalAffinitySystem.getElementName('air')).toBe('Air (Hangin)');
    });

    it('should return correct name for neutral element', () => {
      expect(ElementalAffinitySystem.getElementName('neutral')).toBe('Neutral');
    });
  });
});
