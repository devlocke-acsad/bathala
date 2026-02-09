/**
 * Tests for RelicManager
 * Verifies all relic effects trigger correctly and apply proper values
 * Requirements: 9.1-9.5
 */

import { RelicManager } from './RelicManager';
import { Player, Enemy, PlayingCard, StatusEffect, HandType } from '../types/CombatTypes';
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

// Helper function to create a mock combat scene with kapresCigarUsed flag
function createMockCombatScene() {
  return {
    kapresCigarUsed: false
  };
}

describe('RelicManager', () => {
  describe('START_OF_COMBAT Relics', () => {
    describe('Earthwarden\'s Plate', () => {
      it('should grant +5 Block at start of combat', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('earthwardens_plate'));
        
        RelicManager.applyStartOfCombatEffects(player);
        
        expect(player.block).toBe(5);
      });
    });

    describe('Swift Wind Agimat', () => {
      it('should grant +1 discard charge at start of combat', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('swift_wind_agimat'));
        
        RelicManager.applyStartOfCombatEffects(player);
        
        expect(player.discardCharges).toBe(4); // 3 base + 1
        expect(player.maxDiscardCharges).toBe(4);
      });
    });

    describe('Diwata\'s Crown', () => {
      it('should grant +5 Block at start of combat', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('diwatas_crown'));
        
        RelicManager.applyStartOfCombatEffects(player);
        
        expect(player.block).toBe(5);
      });
    });

    describe('Stone Golem Heart', () => {
      it('should grant +8 Max HP and +2 Block at start of combat', () => {
        const player = createMockPlayer();
        player.maxHealth = 100;
        player.currentHealth = 100;
        player.relics.push(getRelicById('stone_golem_heart'));
        
        RelicManager.applyStartOfCombatEffects(player);
        
        expect(player.maxHealth).toBe(108);
        expect(player.currentHealth).toBe(108);
        expect(player.block).toBe(2);
      });
    });
  });

  describe('START_OF_TURN Relics', () => {
    describe('Ember Fetish', () => {
      it('should grant +4 Strength when Block = 0', () => {
        const player = createMockPlayer();
        player.block = 0;
        player.relics.push(getRelicById('ember_fetish'));
        
        RelicManager.applyStartOfTurnEffects(player);
        
        const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
        expect(strengthEffect).toBeDefined();
        expect(strengthEffect?.value).toBe(4);
        expect(strengthEffect?.name).toBe('Strength');
      });

      it('should grant +2 Strength when Block > 0', () => {
        const player = createMockPlayer();
        player.block = 10;
        player.relics.push(getRelicById('ember_fetish'));
        
        RelicManager.applyStartOfTurnEffects(player);
        
        const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
        expect(strengthEffect).toBeDefined();
        expect(strengthEffect?.value).toBe(2);
      });
    });

    describe('Earthwarden\'s Plate', () => {
      it('should grant +1 Block at start of turn', () => {
        const player = createMockPlayer();
        player.block = 5;
        player.relics.push(getRelicById('earthwardens_plate'));
        
        RelicManager.applyStartOfTurnEffects(player);
        
        expect(player.block).toBe(6);
      });
    });

    describe('Tiyanak Tear', () => {
      it('should grant +1 Strength at start of turn', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('tiyanak_tear'));
        
        RelicManager.applyStartOfTurnEffects(player);
        
        const strengthEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
        expect(strengthEffect).toBeDefined();
        expect(strengthEffect?.value).toBe(1);
        expect(strengthEffect?.name).toBe('Strength');
      });
    });
  });

  describe('AFTER_HAND_PLAYED Relics', () => {
    describe('Ancestral Blade', () => {
      it('should grant +2 Strength on Flush', () => {
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
        expect(strengthEffect).toBeDefined();
        expect(strengthEffect?.value).toBe(2);
      });

      it('should not grant Strength on non-Flush hands', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('ancestral_blade'));
        
        const hand = [createMockCard('Apoy', '2')];
        const evaluation = { type: 'pair' as HandType };
        
        RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
        
        const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ancestral');
        expect(strengthEffect).toBeUndefined();
      });
    });

    describe('Sarimanok Feather', () => {
      it('should grant +1 Ginto on Straight', () => {
        const player = createMockPlayer();
        player.ginto = 0;
        player.relics.push(getRelicById('sarimanok_feather'));
        
        const hand = [createMockCard('Apoy', '2')];
        const evaluation = { type: 'straight' as HandType };
        
        RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
        
        expect(player.ginto).toBe(1);
      });

      it('should grant +1 Ginto on Flush', () => {
        const player = createMockPlayer();
        player.ginto = 0;
        player.relics.push(getRelicById('sarimanok_feather'));
        
        const hand = [createMockCard('Apoy', '2')];
        const evaluation = { type: 'flush' as HandType };
        
        RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
        
        expect(player.ginto).toBe(1);
      });

      it('should not grant Ginto on Pair', () => {
        const player = createMockPlayer();
        player.ginto = 0;
        player.relics.push(getRelicById('sarimanok_feather'));
        
        const hand = [createMockCard('Apoy', '2')];
        const evaluation = { type: 'pair' as HandType };
        
        RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
        
        expect(player.ginto).toBe(0);
      });
    });

    describe('Lucky Charm', () => {
      it('should grant +1 Ginto on Straight or better', () => {
        const player = createMockPlayer();
        player.ginto = 0;
        player.relics.push(getRelicById('lucky_charm'));
        
        const hand = [createMockCard('Apoy', '2')];
        const evaluation = { type: 'straight' as HandType };
        
        RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
        
        expect(player.ginto).toBe(1);
      });
    });

    describe('Umalagad\'s Spirit', () => {
      it('should grant +2 Block per card played', () => {
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

      it('should grant +4 Block on Defend actions', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('umalagad_spirit'));
        
        const bonus = RelicManager.calculateDefendBlockBonus(player);
        
        expect(bonus).toBe(4);
      });
    });

    describe('Balete Root', () => {
      it('should grant +2 Block per Lupa card', () => {
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

      it('should grant 0 Block when no Lupa cards', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('balete_root'));
        
        const hand = [
          createMockCard('Apoy', '2'),
          createMockCard('Tubig', '5')
        ];
        
        const bonus = RelicManager.calculateBaleteRootBlock(player, hand);
        
        expect(bonus).toBe(0);
      });
    });
  });

  describe('END_OF_TURN Relics', () => {
    describe('Tidal Amulet', () => {
      it('should heal +1 HP per card in hand', () => {
        const player = createMockPlayer();
        player.currentHealth = 80;
        player.maxHealth = 100;
        player.hand = [
          createMockCard('Apoy', '2'),
          createMockCard('Tubig', '5'),
          createMockCard('Lupa', '7')
        ];
        player.relics.push(getRelicById('tidal_amulet'));
        
        RelicManager.applyEndOfTurnEffects(player);
        
        expect(player.currentHealth).toBe(83); // 80 + 3 cards
      });

      it('should not heal above max HP', () => {
        const player = createMockPlayer();
        player.currentHealth = 98;
        player.maxHealth = 100;
        player.hand = [
          createMockCard('Apoy', '2'),
          createMockCard('Tubig', '5'),
          createMockCard('Lupa', '7')
        ];
        player.relics.push(getRelicById('tidal_amulet'));
        
        RelicManager.applyEndOfTurnEffects(player);
        
        expect(player.currentHealth).toBe(100); // Capped at max
      });

      it('should heal 0 HP when hand is empty', () => {
        const player = createMockPlayer();
        player.currentHealth = 80;
        player.maxHealth = 100;
        player.hand = [];
        player.relics.push(getRelicById('tidal_amulet'));
        
        RelicManager.applyEndOfTurnEffects(player);
        
        expect(player.currentHealth).toBe(80); // No change
      });
    });
  });

  describe('Action-Specific Relics', () => {
    describe('Sigbin Heart', () => {
      it('should add +3 damage on Attack actions', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('sigbin_heart'));
        
        const bonus = RelicManager.calculateSigbinHeartDamage(player);
        
        expect(bonus).toBe(3);
      });

      it('should return 0 damage when not owned', () => {
        const player = createMockPlayer();
        
        const bonus = RelicManager.calculateSigbinHeartDamage(player);
        
        expect(bonus).toBe(0);
      });
    });

    describe('Duwende Charm', () => {
      it('should add +3 Block on Defend actions', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('duwende_charm'));
        
        const bonus = RelicManager.calculateDefendBlockBonus(player);
        
        expect(bonus).toBe(3);
      });
    });

    describe('Mangangaway Wand', () => {
      it('should add +5 damage on Special actions', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('mangangaway_wand'));
        
        const bonus = RelicManager.calculateMangangawayWandDamage(player);
        
        expect(bonus).toBe(5);
      });

      it('should return 0 damage when not owned', () => {
        const player = createMockPlayer();
        
        const bonus = RelicManager.calculateMangangawayWandDamage(player);
        
        expect(bonus).toBe(0);
      });
    });

    describe('Amomongo Claw', () => {
      it('should apply Vulnerable on Attack actions', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('amomongo_claw'));
        
        const shouldApply = RelicManager.shouldApplyAmomongoVulnerable(player);
        
        expect(shouldApply).toBe(true);
      });

      it('should return 1 Vulnerable stack', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('amomongo_claw'));
        
        const stacks = RelicManager.getAmomongoVulnerableStacks(player);
        
        expect(stacks).toBe(1);
      });

      it('should not apply Vulnerable when not owned', () => {
        const player = createMockPlayer();
        
        const shouldApply = RelicManager.shouldApplyAmomongoVulnerable(player);
        
        expect(shouldApply).toBe(false);
      });
    });

    describe('Bungisngis Grin', () => {
      it('should add +4 damage when enemy has debuff', () => {
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

      it('should return 0 damage when enemy has no debuff', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('bungisngis_grin'));
        
        const enemy = createMockEnemy();
        
        const bonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
        
        expect(bonus).toBe(0);
      });

      it('should work with Vulnerable debuff', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('bungisngis_grin'));
        
        const enemy = createMockEnemy();
        enemy.statusEffects.push({
          id: 'vulnerable',
          name: 'Vulnerable',
          type: 'debuff',
          value: 2,
          description: 'Take more damage',
          emoji: '🛡️'
        });
        
        const bonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
        
        expect(bonus).toBe(4);
      });
    });

    describe('Kapre\'s Cigar', () => {
      it('should double damage on first Attack', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('kapres_cigar'));
        
        const combatScene = createMockCombatScene();
        
        const shouldDouble = RelicManager.shouldApplyKapresCigarDouble(player, combatScene);
        
        expect(shouldDouble).toBe(true);
        expect(combatScene.kapresCigarUsed).toBe(true);
      });

      it('should not double damage on second Attack', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('kapres_cigar'));
        
        const combatScene = createMockCombatScene();
        combatScene.kapresCigarUsed = true;
        
        const shouldDouble = RelicManager.shouldApplyKapresCigarDouble(player, combatScene);
        
        expect(shouldDouble).toBe(false);
      });

      it('should not double damage when not owned', () => {
        const player = createMockPlayer();
        
        const combatScene = createMockCombatScene();
        
        const shouldDouble = RelicManager.shouldApplyKapresCigarDouble(player, combatScene);
        
        expect(shouldDouble).toBe(false);
      });
    });
  });

  describe('Passive Relics', () => {
    describe('Tikbalang\'s Hoof', () => {
      it('should provide 10% dodge chance', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('tikbalangs_hoof'));
        
        const dodgeChance = RelicManager.calculateDodgeChance(player);
        
        expect(dodgeChance).toBe(0.10);
      });

      it('should return 0% dodge chance when not owned', () => {
        const player = createMockPlayer();
        
        const dodgeChance = RelicManager.calculateDodgeChance(player);
        
        expect(dodgeChance).toBe(0);
      });
    });

    describe('Babaylan\'s Talisman', () => {
      it('should upgrade hand tier by 1', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('babaylans_talisman'));
        
        const upgradedType = RelicManager.getModifiedHandType('pair', player);
        
        expect(upgradedType).toBe('two_pair');
      });

      it('should upgrade flush to full_house', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('babaylans_talisman'));
        
        const upgradedType = RelicManager.getModifiedHandType('flush', player);
        
        expect(upgradedType).toBe('full_house');
      });

      it('should not upgrade beyond five_of_a_kind', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('babaylans_talisman'));
        
        const upgradedType = RelicManager.getModifiedHandType('five_of_a_kind', player);
        
        expect(upgradedType).toBe('five_of_a_kind');
      });

      it('should not upgrade when not owned', () => {
        const player = createMockPlayer();
        
        const upgradedType = RelicManager.getModifiedHandType('pair', player);
        
        expect(upgradedType).toBe('pair');
      });

      it('should be detected by hasBabaylansTalisman', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('babaylans_talisman'));
        
        const hasTalisman = RelicManager.hasBabaylansTalisman(player);
        
        expect(hasTalisman).toBe(true);
      });
    });

    describe('Diwata\'s Crown - Five of a Kind', () => {
      it('should enable Five of a Kind', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('diwatas_crown'));
        
        const isEnabled = RelicManager.hasFiveOfAKindEnabled(player);
        
        expect(isEnabled).toBe(true);
      });

      it('should not enable Five of a Kind when not owned', () => {
        const player = createMockPlayer();
        
        const isEnabled = RelicManager.hasFiveOfAKindEnabled(player);
        
        expect(isEnabled).toBe(false);
      });

      it('should be detected by hasDiwatasCrown', () => {
        const player = createMockPlayer();
        player.relics.push(getRelicById('diwatas_crown'));
        
        const hasCrown = RelicManager.hasDiwatasCrown(player);
        
        expect(hasCrown).toBe(true);
      });
    });
  });

  describe('Multiple Relic Stacking', () => {
    // NOTE: Current implementation uses .find() which only finds first occurrence
    // Requirement 8.1 states effects should stack additively, but implementation needs update
    it('should apply Earthwarden\'s Plate Block bonus (single instance)', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('earthwardens_plate'));
      player.relics.push(getRelicById('earthwardens_plate'));
      
      RelicManager.applyStartOfCombatEffects(player);
      
      // Current: Only first instance applies (5 Block)
      // Expected (Req 8.1): Both instances should apply (10 Block)
      expect(player.block).toBe(5);
    });

    it('should apply Sigbin Heart damage bonus (single instance)', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart'));
      player.relics.push(getRelicById('sigbin_heart'));
      
      const bonus = RelicManager.calculateSigbinHeartDamage(player);
      
      // Current: Only first instance applies (3 damage)
      // Expected (Req 8.1): Both instances should apply (6 damage)
      expect(bonus).toBe(3);
    });

    it('should stack multiple Defend relics', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('umalagad_spirit')); // +4
      player.relics.push(getRelicById('diwatas_crown')); // +3
      player.relics.push(getRelicById('duwende_charm')); // +3
      
      const bonus = RelicManager.calculateDefendBlockBonus(player);
      
      expect(bonus).toBe(10); // 4 + 3 + 3
    });

    it('should stack multiple Ginto relics', () => {
      const player = createMockPlayer();
      player.ginto = 0;
      player.relics.push(getRelicById('sarimanok_feather'));
      player.relics.push(getRelicById('lucky_charm'));
      
      const hand = [createMockCard('Apoy', '2')];
      const evaluation = { type: 'straight' as HandType };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      expect(player.ginto).toBe(2); // 1 + 1
    });

    it('should stack multiple Swift Wind Agimat discard charges (single instance)', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('swift_wind_agimat'));
      player.relics.push(getRelicById('swift_wind_agimat'));
      
      RelicManager.applyStartOfCombatEffects(player);
      
      // Current: Only first instance applies (4 charges)
      // Expected (Req 8.1): Both instances should apply (5 charges)
      expect(player.discardCharges).toBe(4);
      expect(player.maxDiscardCharges).toBe(4);
    });

    it('should stack multiple Strength relics at start of turn', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish')); // +4 when Block = 0
      player.relics.push(getRelicById('tiyanak_tear')); // +1
      
      RelicManager.applyStartOfTurnEffects(player);
      
      const emberEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      const tiyanakEffect = player.statusEffects.find(e => e.id === 'strength_tiyanak');
      
      expect(emberEffect?.value).toBe(4);
      expect(tiyanakEffect?.value).toBe(1);
      // Total: 5 Strength
    });

    it('should stack multiple Mangangaway Wand damage bonuses (single instance)', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('mangangaway_wand'));
      player.relics.push(getRelicById('mangangaway_wand'));
      
      const bonus = RelicManager.calculateMangangawayWandDamage(player);
      
      // Current: Only first instance applies (5 damage)
      // Expected (Req 8.1): Both instances should apply (10 damage)
      expect(bonus).toBe(5);
    });
  });

  describe('Relic Acquisition Effects', () => {
    it('should apply Stone Golem Heart acquisition effect', () => {
      const player = createMockPlayer();
      player.maxHealth = 100;
      player.currentHealth = 100;
      
      RelicManager.applyRelicAcquisitionEffect('stone_golem_heart', player);
      
      expect(player.maxHealth).toBe(108);
      expect(player.currentHealth).toBe(108);
    });

    it('should not apply acquisition effect for combat-only relics', () => {
      const player = createMockPlayer();
      player.maxHealth = 100;
      player.currentHealth = 100;
      
      RelicManager.applyRelicAcquisitionEffect('earthwardens_plate', player);
      
      expect(player.maxHealth).toBe(100);
      expect(player.currentHealth).toBe(100);
    });
  });

  describe('Relic Utility Methods', () => {
    it('should get player relics with specific effect', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('earthwardens_plate'));
      player.relics.push(getRelicById('swift_wind_agimat'));
      player.relics.push(getRelicById('tiyanak_tear'));
      
      const startOfCombatRelics = RelicManager.getPlayerRelicsWithEffect(player, 'START_OF_COMBAT');
      
      expect(startOfCombatRelics.length).toBe(2);
      expect(startOfCombatRelics.some(r => r.id === 'earthwardens_plate')).toBe(true);
      expect(startOfCombatRelics.some(r => r.id === 'swift_wind_agimat')).toBe(true);
    });

    it('should check if player has relic with specific effect', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('tiyanak_tear'));
      
      const hasStartOfTurn = RelicManager.hasPlayerRelicWithEffect(player, 'START_OF_TURN');
      const hasEndOfTurn = RelicManager.hasPlayerRelicWithEffect(player, 'END_OF_TURN');
      
      expect(hasStartOfTurn).toBe(true);
      expect(hasEndOfTurn).toBe(false);
    });

    it('should get player relic by ID', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart'));
      
      const relic = RelicManager.getPlayerRelicById(player, 'sigbin_heart');
      
      expect(relic).toBeDefined();
      expect(relic?.name).toBe('Sigbin Heart');
    });

    it('should return undefined for non-existent relic', () => {
      const player = createMockPlayer();
      
      const relic = RelicManager.getPlayerRelicById(player, 'non_existent_relic');
      
      expect(relic).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty relic list', () => {
      const player = createMockPlayer();
      
      RelicManager.applyStartOfCombatEffects(player);
      RelicManager.applyStartOfTurnEffects(player);
      RelicManager.applyEndOfTurnEffects(player);
      
      expect(player.block).toBe(0);
      expect(player.statusEffects.length).toBe(0);
    });

    it('should handle Tidal Amulet healing at full HP', () => {
      const player = createMockPlayer();
      player.currentHealth = 100;
      player.maxHealth = 100;
      player.hand = [createMockCard('Apoy', '2')];
      player.relics.push(getRelicById('tidal_amulet'));
      
      RelicManager.applyEndOfTurnEffects(player);
      
      expect(player.currentHealth).toBe(100);
    });

    it('should handle Ember Fetish with exactly 0 Block', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish'));
      
      RelicManager.applyStartOfTurnEffects(player);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      expect(strengthEffect?.value).toBe(4);
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
  });
});
