/**
 * RelicManager Unit Tests
 * 
 * Tests for relic effects, shop pricing, and acquisition behaviors
 */

import { RelicManager } from './RelicManager';
import { Player } from '../types/CombatTypes';

describe('RelicManager', () => {
  let mockPlayer: Player;

  beforeEach(() => {
    // Create a fresh mock player before each test
    mockPlayer = {
      id: 'test-player',
      name: 'Test Hero',
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
      ginto: 500,
      diamante: 0,
      relics: [],
      potions: [],
      discardCharges: 1,
      maxDiscardCharges: 1
    };
  });

  describe('calculateShopPriceReduction', () => {
    it('should return original price when player has no shop-related relics', () => {
      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBe(100);
    });

    it('should return 20% reduced price when player has merchants_scale', () => {
      mockPlayer.relics = [{
        id: 'merchants_scale',
        name: "Merchant's Scale",
        description: "All shop items cost 20% less.",
        emoji: '⚖️'
      }];

      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBe(80); // 20% discount = 80% of original
    });

    it('should handle multiple shop relics stacking reductions', () => {
      mockPlayer.relics = [
        {
          id: 'merchants_scale',
          name: "Merchant's Scale",
          description: "All shop items cost 20% less.",
          emoji: '⚖️'
        },
        {
          id: 'bargain_talisman',
          name: "Bargain Talisman",
          description: "All shop items cost 15% less.",
          emoji: '🏷️'
        }
      ];

      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBeLessThan(100); // Should get some reduction
      expect(reducedPrice).toBeGreaterThan(0); // But not free
    });

    it('should not reduce price below zero', () => {
      // Edge case test: even with impossible stacking, should be safe
      mockPlayer.relics = Array(10).fill({
        id: 'merchants_scale',
        name: "Merchant's Scale",
        description: "All shop items cost 20% less.",
        emoji: '⚖️'
      });

      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('applyRelicAcquisitionEffect', () => {
    it('should add persistent block when acquiring earthwardens_plate', () => {
      RelicManager.applyRelicAcquisitionEffect('earthwardens_plate', mockPlayer);
      expect(mockPlayer.block).toBe(5);
    });

    it('should heal player when acquiring blessed_amulet', () => {
      mockPlayer.currentHealth = 50; // Set to half health
      RelicManager.applyRelicAcquisitionEffect('blessed_amulet', mockPlayer);
      
      expect(mockPlayer.currentHealth).toBeGreaterThan(50); // Should heal
      expect(mockPlayer.maxHealth).toBeGreaterThan(100); // Should increase max
    });

    it('should increase max HP when acquiring blessed_amulet', () => {
      const initialMaxHealth = mockPlayer.maxHealth;
      RelicManager.applyRelicAcquisitionEffect('blessed_amulet', mockPlayer);
      
      expect(mockPlayer.maxHealth).toBeGreaterThan(initialMaxHealth);
    });

    it('should not exceed max health when healing', () => {
      mockPlayer.currentHealth = 95; // Near max
      RelicManager.applyRelicAcquisitionEffect('blessed_amulet', mockPlayer);
      
      // Should heal but not exceed new max health
      expect(mockPlayer.currentHealth).toBeLessThanOrEqual(mockPlayer.maxHealth);
    });

    it('should handle passive relics without immediate effects', () => {
      const initialHealth = mockPlayer.currentHealth;
      const initialMaxHealth = mockPlayer.maxHealth;
      const initialBlock = mockPlayer.block;
      
      RelicManager.applyRelicAcquisitionEffect('babaylans_talisman', mockPlayer);
      
      // Passive relics shouldn't change immediate stats
      expect(mockPlayer.currentHealth).toBe(initialHealth);
      expect(mockPlayer.maxHealth).toBe(initialMaxHealth);
      expect(mockPlayer.block).toBe(initialBlock);
    });

    it('should handle shop relics without immediate effects', () => {
      const initialGinto = mockPlayer.ginto;
      RelicManager.applyRelicAcquisitionEffect('merchants_scale', mockPlayer);
      
      // Shop relics don't give immediate benefits
      expect(mockPlayer.ginto).toBe(initialGinto);
    });
  });

  describe('applyStartOfCombatEffects', () => {
    it('should apply persistent block from earthwardens_plate', () => {
      mockPlayer.relics = [{
        id: 'earthwardens_plate',
        name: "Earthwarden's Plate",
        description: "Start each combat with 5 Block.",
        emoji: '🛡️'
      }];

      RelicManager.applyStartOfCombatEffects(mockPlayer);
      expect(mockPlayer.block).toBe(5);
    });

    it('should grant extra discard charge from swift_wind_agimat', () => {
      mockPlayer.relics = [{
        id: 'swift_wind_agimat',
        name: "Swift Wind Agimat",
        description: "Gain +1 discard charge per combat.",
        emoji: '🌪️'
      }];

      mockPlayer.maxDiscardCharges = 1;
      mockPlayer.discardCharges = 1;

      RelicManager.applyStartOfCombatEffects(mockPlayer);
      
      expect(mockPlayer.maxDiscardCharges).toBe(2);
      expect(mockPlayer.discardCharges).toBe(2);
    });

    it('should stack multiple start-of-combat effects', () => {
      mockPlayer.relics = [
        {
          id: 'earthwardens_plate',
          name: "Earthwarden's Plate",
          description: "Start each combat with 5 Block.",
          emoji: '🛡️'
        },
        {
          id: 'swift_wind_agimat',
          name: "Swift Wind Agimat",
          description: "Gain +1 discard charge per combat.",
          emoji: '🌪️'
        }
      ];

      mockPlayer.maxDiscardCharges = 1;
      mockPlayer.discardCharges = 1;

      RelicManager.applyStartOfCombatEffects(mockPlayer);
      
      expect(mockPlayer.block).toBe(5);
      expect(mockPlayer.maxDiscardCharges).toBe(2);
      expect(mockPlayer.discardCharges).toBe(2);
    });

    it('should handle player with no combat-start relics', () => {
      mockPlayer.relics = [{
        id: 'merchants_scale',
        name: "Merchant's Scale",
        description: "All shop items cost 20% less.",
        emoji: '⚖️'
      }];

      const initialBlock = mockPlayer.block;
      const initialCharges = mockPlayer.discardCharges;

      RelicManager.applyStartOfCombatEffects(mockPlayer);
      
      expect(mockPlayer.block).toBe(initialBlock);
      expect(mockPlayer.discardCharges).toBe(initialCharges);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined relics array gracefully', () => {
      // @ts-ignore - Testing edge case
      mockPlayer.relics = undefined;

      expect(() => {
        RelicManager.calculateShopPriceReduction(100, mockPlayer);
      }).not.toThrow();
    });

    it('should handle duplicate relics in array', () => {
      mockPlayer.relics = [
        {
          id: 'merchants_scale',
          name: "Merchant's Scale",
          description: "All shop items cost 20% less.",
          emoji: '⚖️'
        },
        {
          id: 'merchants_scale',
          name: "Merchant's Scale",
          description: "All shop items cost 20% less.",
          emoji: '⚖️'
        }
      ];

      // Should handle duplicates (though game shouldn't allow this)
      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBeLessThan(originalPrice);
      expect(reducedPrice).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty relics array', () => {
      mockPlayer.relics = [];
      
      const originalPrice = 100;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBe(originalPrice);
    });

    it('should handle zero price', () => {
      mockPlayer.relics = [{
        id: 'merchants_scale',
        name: "Merchant's Scale",
        description: "All shop items cost 20% less.",
        emoji: '⚖️'
      }];
      
      const originalPrice = 0;
      const reducedPrice = RelicManager.calculateShopPriceReduction(originalPrice, mockPlayer);
      expect(reducedPrice).toBe(0);
    });
  });
});
