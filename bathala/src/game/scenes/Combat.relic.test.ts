/**
 * Integration tests for Combat Relic Scenarios
 * Tests relics in actual combat context with Combat scene integration
 * Requirements: 9.1-9.5
 */

import { RelicManager } from '../../core/managers/RelicManager';
import { Player, Enemy, PlayingCard, StatusEffect, HandType } from '../../core/types/CombatTypes';
import { getRelicById } from '../../data/relics/Act1Relics';

// Helper function to create a mock player
function createMockPlayer(): Player {
  return {
    id: 'test-player',
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
    discardCharges: 3,
    maxDiscardCharges: 3
  };
}

// Helper function to create a mock enemy
function createMockEnemy(): Enemy {
  return {
    id: 'test-enemy',
    name: 'Test Enemy',
    maxHealth: 50,
    currentHealth: 50,
    block: 0,
    statusEffects: [],
    intent: {
      type: 'attack',
      value: 10,
      description: 'Attack',
      icon: '⚔️'
    },
    damage: 10,
    attackPattern: ['attack'],
    currentPatternIndex: 0,
    elementalAffinity: {
      weakness: null,
      resistance: null
    }
  };
}

// Helper function to create a mock card
function createMockCard(suit: 'Apoy' | 'Tubig' | 'Lupa' | 'Hangin', rank: string): PlayingCard {
  const elementMap = {
    'Apoy': 'fire' as const,
    'Tubig': 'water' as const,
    'Lupa': 'earth' as const,
    'Hangin': 'air' as const
  };
  
  return {
    id: `${suit}-${rank}`,
    rank: rank as any,
    suit,
    element: elementMap[suit],
    selected: false,
    playable: true
  };
}

// Helper function to create a mock combat scene
function createMockCombatScene() {
  return {
    kapresCigarUsed: false
  };
}

describe('Combat Relic Integration Tests', () => {
  describe('Start of Combat Triggers', () => {
    it('should apply all start-of-combat relics correctly', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('earthwardens_plate')); // +5 Block
      player.relics.push(getRelicById('diwatas_crown')); // +5 Block
      player.relics.push(getRelicById('swift_wind_agimat')); // +1 discard charge
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.block).toBe(10); // 5 + 5
      expect(player.discardCharges).toBe(4); // 3 + 1
      expect(player.maxDiscardCharges).toBe(4);
    });

    it('should apply Stone Golem Heart at start of combat', () => {
      const player = createMockPlayer();
      player.maxHealth = 100;
      player.currentHealth = 100;
      player.relics.push(getRelicById('stone_golem_heart'));
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.maxHealth).toBe(108); // +8 Max HP
      expect(player.currentHealth).toBe(108); // +8 Current HP
      expect(player.block).toBe(2); // +2 Block
    });

    it('should handle no relics at start of combat', () => {
      const player = createMockPlayer();
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.block).toBe(0);
      expect(player.discardCharges).toBe(3);
    });
  });

  describe('Start of Turn Triggers Across Multiple Turns', () => {
    it('should apply start-of-turn relics on turn 1', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish')); // +4 Strength when Block = 0
      player.relics.push(getRelicById('tiyanak_tear')); // +1 Strength
      player.relics.push(getRelicById('earthwardens_plate')); // +1 Block
      
      RelicManager.applyStartOfTurnEffects(player);
      
      expect(player.block).toBe(1); // +1 from Earthwarden's Plate
      const emberEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      const tiyanakEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      expect(emberEffect?.value).toBe(4); // +4 when Block = 0
      expect(tiyanakEffect?.value).toBe(1); // +1 always
    });

    it('should apply start-of-turn relics on turn 2 with existing block', () => {
      const player = createMockPlayer();
      player.block = 10; // Has block from previous turn
      player.relics.push(getRelicById('ember_fetish')); // +2 Strength when Block > 0
      player.relics.push(getRelicById('earthwardens_plate')); // +1 Block
      
      RelicManager.applyStartOfTurnEffects(player);
      
      expect(player.block).toBe(11); // 10 + 1
      const emberEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      expect(emberEffect?.value).toBe(2); // +2 when Block > 0
    });

    it('should apply start-of-turn relics consistently across 3 turns', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('tiyanak_tear')); // +1 Strength per turn
      
      // Turn 1
      RelicManager.applyStartOfTurnEffects(player);
      let strengthEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      expect(strengthEffect?.value).toBe(1);
      
      // Turn 2 - simulate status effect persistence
      player.statusEffects = []; // Reset for test (in real combat, effects persist)
      RelicManager.applyStartOfTurnEffects(player);
      strengthEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      expect(strengthEffect?.value).toBe(1);
      
      // Turn 3
      player.statusEffects = [];
      RelicManager.applyStartOfTurnEffects(player);
      strengthEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      expect(strengthEffect?.value).toBe(1);
    });
  });

  describe('After Hand Played with Different Hand Types', () => {
    it('should trigger Ancestral Blade on Flush', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('ancestral_blade'));
      
      const hand = [
        createMockCard('Apoy', '2'),
        createMockCard('Apoy', '5'),
        createMockCard('Apoy', '7'),
        createMockCard('Apoy', '9'),
        createMockCard('Apoy', '10')
      ];
      const evaluation = { type: 'flush' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ancestral');
      expect(strengthEffect?.value).toBe(2);
    });

    it('should trigger Sarimanok Feather on Straight', () => {
      const player = createMockPlayer();
      player.ginto = 10;
      player.relics.push(getRelicById('sarimanok_feather'));
      
      const hand = [createMockCard('Apoy', '2')];
      const evaluation = { type: 'straight' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.ginto).toBe(11); // +1 Ginto
    });

    it('should trigger Sarimanok Feather on Full House', () => {
      const player = createMockPlayer();
      player.ginto = 10;
      player.relics.push(getRelicById('sarimanok_feather'));
      
      const hand = [createMockCard('Apoy', '2')];
      const evaluation = { type: 'full_house' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.ginto).toBe(11); // +1 Ginto
    });

    it('should not trigger Sarimanok Feather on Pair', () => {
      const player = createMockPlayer();
      player.ginto = 10;
      player.relics.push(getRelicById('sarimanok_feather'));
      
      const hand = [createMockCard('Apoy', '2')];
      const evaluation = { type: 'pair' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.ginto).toBe(10); // No change
    });

    it('should trigger Umalagad Spirit based on cards played', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('umalagad_spirit'));
      
      const hand = [
        createMockCard('Apoy', '2'),
        createMockCard('Tubig', '5'),
        createMockCard('Lupa', '7')
      ];
      const evaluation = { type: 'high_card' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.block).toBe(6); // 3 cards * 2 Block
    });

    it('should trigger Balete Root based on Lupa cards', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('balete_root'));
      
      const hand = [
        createMockCard('Lupa', '2'),
        createMockCard('Lupa', '5'),
        createMockCard('Apoy', '7')
      ];
      
      const bonus = RelicManager.calculateBaleteRootBlock(player, hand);
      
      expect(bonus).toBe(4); // 2 Lupa cards * 2 Block
    });
  });

  describe('Action-Specific Relics', () => {
    describe('Attack Actions', () => {
      it('should apply Sigbin Heart damage bonus', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('sigbin_heart'));
        
        const bonus = RelicManager.calculateSigbinHeartDamage(player);
        
        expect(bonus).toBe(3);
      });

      it('should apply Bungisngis Grin when enemy has debuff', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('bungisngis_grin'));
        
        const enemy = createMockEnemy();
        enemy.statusEffects.push({
          id: 'weak',
          name: 'Weak',
          type: 'debuff',
          value: 1,
          description: 'Deal less damage',
          emoji: '💔'
        });
        
        const bonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
        
        expect(bonus).toBe(4);
      });

      it('should not apply Bungisngis Grin when enemy has no debuff', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('bungisngis_grin'));
        
        const enemy = createMockEnemy();
        
        const bonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
        
        expect(bonus).toBe(0);
      });

      it('should apply Kapre\'s Cigar double damage on first attack only', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('kapres_cigar'));
        
        const combatScene = createMockCombatScene();
        
        // First attack
        const shouldDouble1 = RelicManager.shouldApplyKapresCigarDouble(player, combatScene);
        expect(shouldDouble1).toBe(true);
        expect(combatScene.kapresCigarUsed).toBe(true);
        
        // Second attack
        const shouldDouble2 = RelicManager.shouldApplyKapresCigarDouble(player, combatScene);
        expect(shouldDouble2).toBe(false);
      });

      it('should apply Amomongo Claw vulnerable on attack', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('amomongo_claw'));
        
        const shouldApply = RelicManager.shouldApplyAmomongoVulnerable(player);
        const stacks = RelicManager.getAmomongoVulnerableStacks(player);
        
        expect(shouldApply).toBe(true);
        expect(stacks).toBe(1);
      });
    });

    describe('Defend Actions', () => {
      it('should apply Duwende Charm block bonus', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('duwende_charm'));
        
        const bonus = RelicManager.calculateDefendBlockBonus(player);
        
        expect(bonus).toBe(3);
      });

      it('should apply Umalagad Spirit block bonus', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('umalagad_spirit'));
        
        const bonus = RelicManager.calculateDefendBlockBonus(player);
        
        expect(bonus).toBe(4);
      });

      it('should stack multiple Defend relics', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('umalagad_spirit')); // +4
        player.relics.push(getRelicById('duwende_charm')); // +3
        
        const bonus = RelicManager.calculateDefendBlockBonus(player);
        
        expect(bonus).toBe(7); // 4 + 3
      });
    });

    describe('Special Actions', () => {
      it('should apply Mangangaway Wand damage bonus', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('mangangaway_wand'));
        
        const bonus = RelicManager.calculateMangangawayWandDamage(player);
        
        expect(bonus).toBe(5);
      });

      it('should return 0 when Mangangaway Wand not owned', () => {
        const player = createMockPlayer();
        
        const bonus = RelicManager.calculateMangangawayWandDamage(player);
        
        expect(bonus).toBe(0);
      });
    });
  });

  describe('Relic Combinations', () => {
    it('should trigger multiple relics together at start of combat', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('earthwardens_plate')); // +5 Block
      player.relics.push(getRelicById('diwatas_crown')); // +5 Block
      player.relics.push(getRelicById('swift_wind_agimat')); // +1 discard
      player.relics.push(getRelicById('stone_golem_heart')); // +8 HP, +2 Block
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.block).toBe(12); // 5 + 5 + 2
      expect(player.discardCharges).toBe(4); // 3 + 1
      expect(player.maxHealth).toBe(108); // 100 + 8
    });

    it('should trigger multiple relics together at start of turn', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish')); // +4 Strength (Block = 0)
      player.relics.push(getRelicById('tiyanak_tear')); // +1 Strength
      player.relics.push(getRelicById('earthwardens_plate')); // +1 Block
      
      RelicManager.applyStartOfTurnEffects(player);
      
      expect(player.block).toBe(1);
      const emberEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      const tiyanakEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      expect(emberEffect?.value).toBe(4);
      expect(tiyanakEffect?.value).toBe(1);
    });

    it('should trigger multiple relics after hand played', () => {
      const player = createMockPlayer();
      player.ginto = 10;
      player.block = 0;
      player.relics.push(getRelicById('sarimanok_feather')); // +1 Ginto on Straight+
      player.relics.push(getRelicById('lucky_charm')); // +1 Ginto on Straight+
      player.relics.push(getRelicById('umalagad_spirit')); // +2 Block per card
      
      const hand = [
        createMockCard('Apoy', '2'),
        createMockCard('Tubig', '5'),
        createMockCard('Lupa', '7')
      ];
      const evaluation = { type: 'straight' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.ginto).toBe(12); // 10 + 1 + 1
      expect(player.block).toBe(6); // 3 cards * 2
    });

    it('should stack multiple damage relics on attack', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart')); // +3 damage
      
      const enemy = createMockEnemy();
      enemy.statusEffects.push({
        id: 'weak',
        name: 'Weak',
        type: 'debuff',
        value: 1,
        description: 'Deal less damage',
        emoji: '💔'
      });
      player.relics.push(getRelicById('bungisngis_grin')); // +4 damage when debuffed
      
      const sigbinBonus = RelicManager.calculateSigbinHeartDamage(player);
      const bungisngisBonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
      
      expect(sigbinBonus + bungisngisBonus).toBe(7); // 3 + 4
    });

    it('should stack multiple block relics on defend', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('umalagad_spirit')); // +4 Block
      player.relics.push(getRelicById('duwende_charm')); // +3 Block
      
      const bonus = RelicManager.calculateDefendBlockBonus(player);
      
      expect(bonus).toBe(7); // 4 + 3
    });
  });

  describe('Edge Cases', () => {
    it('should handle no relics at all', () => {
      const player = createMockPlayer();
      
      RelicManager.applyStartOfCombatEffects(player);
      RelicManager.applyStartOfTurnEffects(player);
      
      const hand = [createMockCard('Apoy', '2')];
      const evaluation = { type: 'pair' as HandType };
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      RelicManager.applyEndOfTurnEffects(player);
      
      expect(player.block).toBe(0);
      expect(player.statusEffects.length).toBe(0);
      expect(player.ginto).toBe(0);
    });

    it('should handle all Act 1 relics together', () => {
      const player = createMockPlayer();
      player.maxHealth = 100;
      player.currentHealth = 100;
      player.ginto = 0;
      player.block = 0;
      
      // Add all Act 1 relics
      player.relics.push(getRelicById('earthwardens_plate'));
      player.relics.push(getRelicById('swift_wind_agimat'));
      player.relics.push(getRelicById('ember_fetish'));
      player.relics.push(getRelicById('umalagad_spirit'));
      player.relics.push(getRelicById('babaylans_talisman'));
      player.relics.push(getRelicById('ancestral_blade'));
      player.relics.push(getRelicById('tidal_amulet'));
      player.relics.push(getRelicById('sarimanok_feather'));
      player.relics.push(getRelicById('diwatas_crown'));
      player.relics.push(getRelicById('lucky_charm'));
      player.relics.push(getRelicById('tikbalangs_hoof'));
      player.relics.push(getRelicById('balete_root'));
      player.relics.push(getRelicById('sigbin_heart'));
      player.relics.push(getRelicById('duwende_charm'));
      player.relics.push(getRelicById('tiyanak_tear'));
      player.relics.push(getRelicById('amomongo_claw'));
      player.relics.push(getRelicById('bungisngis_grin'));
      player.relics.push(getRelicById('kapres_cigar'));
      player.relics.push(getRelicById('mangangaway_wand'));
      player.relics.push(getRelicById('stone_golem_heart'));
      
      // Start of combat
      RelicManager.applyStartOfCombatEffects(player);
      
      // Should have block from multiple sources
      expect(player.block).toBeGreaterThan(0);
      // Should have increased discard charges
      expect(player.discardCharges).toBeGreaterThan(3);
      // Should have increased max health
      expect(player.maxHealth).toBeGreaterThan(100);
    });

    it('should handle duplicate relics (same relic multiple times)', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart'));
      player.relics.push(getRelicById('sigbin_heart'));
      player.relics.push(getRelicById('sigbin_heart'));
      
      const bonus = RelicManager.calculateSigbinHeartDamage(player);
      
      // Current implementation only counts first instance
      // This is expected behavior based on unit tests
      expect(bonus).toBe(3);
    });

    it('should handle Tidal Amulet with empty hand', () => {
      const player = createMockPlayer();
      player.currentHealth = 80;
      player.maxHealth = 100;
      player.hand = [];
      player.relics.push(getRelicById('tidal_amulet'));
      
      RelicManager.applyEndOfTurnEffects(player);
      
      expect(player.currentHealth).toBe(80); // No healing
    });

    it('should handle Tidal Amulet at full health', () => {
      const player = createMockPlayer();
      player.currentHealth = 100;
      player.maxHealth = 100;
      player.hand = [
        createMockCard('Apoy', '2'),
        createMockCard('Tubig', '5')
      ];
      player.relics.push(getRelicById('tidal_amulet'));
      
      RelicManager.applyEndOfTurnEffects(player);
      
      expect(player.currentHealth).toBe(100); // Capped at max
    });

    it('should handle Ember Fetish with exactly 0 block', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish'));
      
      RelicManager.applyStartOfTurnEffects(player);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      expect(strengthEffect?.value).toBe(4); // +4 when Block = 0
    });

    it('should handle Balete Root with all Lupa cards', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('balete_root'));
      
      const hand = [
        createMockCard('Lupa', '2'),
        createMockCard('Lupa', '5'),
        createMockCard('Lupa', '7'),
        createMockCard('Lupa', '9'),
        createMockCard('Lupa', '10')
      ];
      
      const bonus = RelicManager.calculateBaleteRootBlock(player, hand);
      
      expect(bonus).toBe(10); // 5 Lupa cards * 2 Block
    });

    it('should handle Balete Root with no Lupa cards', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('balete_root'));
      
      const hand = [
        createMockCard('Apoy', '2'),
        createMockCard('Tubig', '5'),
        createMockCard('Hangin', '7')
      ];
      
      const bonus = RelicManager.calculateBaleteRootBlock(player, hand);
      
      expect(bonus).toBe(0); // No Lupa cards
    });
  });
});
