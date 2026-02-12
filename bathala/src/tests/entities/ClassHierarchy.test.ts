/**
 * Tests for Requirement 1: NPC and Enemy Class Hierarchy
 * Tests for Requirement 2: Player Class Implementation
 * Tests for Requirement 3: Item and Relic Class Hierarchy
 *
 * Validates the full OOP class hierarchy: base classes, enemy entities,
 * player entity, relics, and potions.
 */
import { GameEntity } from '../../core/entities/base/GameEntity';
import { CombatEntity } from '../../core/entities/base/CombatEntity';
import { EnemyEntity, EnemyConfig } from '../../core/entities/EnemyEntity';
import { PlayerEntity } from '../../core/entities/PlayerEntity';
import { ItemEntity } from '../../core/entities/items/ItemEntity';
import { RelicEntity, RelicConfig } from '../../core/entities/items/RelicEntity';
import { PotionEntity, PotionConfig } from '../../core/entities/items/PotionEntity';

// ── Test helpers ──────────────────────────────────────

function makeEnemyConfig(overrides: Partial<EnemyConfig> = {}): EnemyConfig {
  return {
    id: 'test_enemy',
    name: 'Test Enemy',
    tier: 'common',
    chapter: 1,
    maxHealth: 100,
    damage: 10,
    attackPattern: ['attack', 'defend'],
    elementalAffinity: { weakness: 'fire', resistance: 'water' },
    combatSpriteKey: 'test_combat',
    overworldSpriteKey: 'test_overworld',
    intent: { type: 'attack', value: 10, description: 'Attacks', icon: '†' },
    dialogue: {
      intro: 'Intro!',
      defeat: 'Defeat...',
      spare: 'Spare text.',
      slay: 'Slay text.',
    },
    lore: {
      description: 'A test creature.',
      origin: 'Unit test',
      reference: 'Jest test suite',
    },
    ...overrides,
  };
}

function makeRelicConfig(overrides: Partial<RelicConfig> = {}): RelicConfig {
  return {
    id: 'test_relic',
    name: 'Test Relic',
    description: 'A test relic.',
    emoji: '🧪',
    ...overrides,
  };
}

function makePotionConfig(overrides: Partial<PotionConfig> = {}): PotionConfig {
  return {
    id: 'test_potion',
    name: 'Test Potion',
    description: 'A test potion.',
    emoji: '🧫',
    rarity: 'common',
    effect: 'heal_20_hp',
    ...overrides,
  };
}

// ============================================================================
// Requirement 1 — NPC and Enemy Class Hierarchy
// ============================================================================

describe('Req 1: NPC and Enemy Class Hierarchy', () => {
  describe('GameEntity (abstract root)', () => {
    it('cannot be instantiated directly', () => {
      // GameEntity is abstract; we verify via a concrete subclass.
      const enemy = new EnemyEntity(makeEnemyConfig());
      expect(enemy).toBeInstanceOf(GameEntity);
    });

    it('exposes readonly id and name', () => {
      const cfg = makeEnemyConfig({ id: 'abc', name: 'ABC' });
      const e = new EnemyEntity(cfg);
      expect(e.id).toBe('abc');
      expect(e.name).toBe('ABC');
    });

    it('toString() returns debug tag', () => {
      const e = new EnemyEntity(makeEnemyConfig({ id: 'x' }));
      expect(e.toString()).toBe('EnemyEntity(x)');
    });
  });

  describe('CombatEntity (abstract base)', () => {
    it('initialises health, block, statusEffects', () => {
      const e = new EnemyEntity(makeEnemyConfig({ maxHealth: 50 }));
      expect(e.maxHealth).toBe(50);
      expect(e.currentHealth).toBe(50);
      expect(e.block).toBe(0);
      expect(e.statusEffects).toEqual([]);
    });

    it('takeDamage deducts block first, then HP', () => {
      const e = new EnemyEntity(makeEnemyConfig({ maxHealth: 100 }));
      e.block = 20;
      const hpLost = e.takeDamage(35);
      expect(e.block).toBe(0);
      expect(e.currentHealth).toBe(85);
      expect(hpLost).toBe(15);
    });

    it('heal() clamps to maxHealth', () => {
      const e = new EnemyEntity(makeEnemyConfig({ maxHealth: 100 }));
      e.currentHealth = 60;
      const gained = e.heal(200);
      expect(e.currentHealth).toBe(100);
      expect(gained).toBe(40);
    });

    it('isDead returns true when HP reaches 0', () => {
      const e = new EnemyEntity(makeEnemyConfig({ maxHealth: 10 }));
      e.takeDamage(10);
      expect(e.isDead).toBe(true);
    });

    it('status effect management (apply, check, remove)', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      const effect = { id: 'burn', name: 'Burn', type: 'debuff' as const, value: 2, description: 'ouch', emoji: '🔥' };
      e.applyStatusEffect(effect);
      expect(e.hasStatusEffect('burn')).toBe(true);
      expect(e.getStatusEffect('burn')?.value).toBe(2);

      // Stacking
      e.applyStatusEffect({ ...effect, value: 3 });
      expect(e.getStatusEffect('burn')?.value).toBe(5);

      e.removeStatusEffect('burn');
      expect(e.hasStatusEffect('burn')).toBe(false);
    });
  });

  describe('EnemyEntity (concrete)', () => {
    it('inherits from CombatEntity → GameEntity', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      expect(e).toBeInstanceOf(CombatEntity);
      expect(e).toBeInstanceOf(GameEntity);
    });

    it('stores tier, chapter, damage, attackPattern', () => {
      const cfg = makeEnemyConfig({ tier: 'elite', chapter: 2, damage: 25, attackPattern: ['a', 'b', 'c'] });
      const e = new EnemyEntity(cfg);
      expect(e.tier).toBe('elite');
      expect(e.chapter).toBe(2);
      expect(e.damage).toBe(25);
      expect(e.attackPattern).toEqual(['a', 'b', 'c']);
    });

    it('holds combat and overworld sprite keys', () => {
      const e = new EnemyEntity(makeEnemyConfig({ combatSpriteKey: 'ckey', overworldSpriteKey: 'okey' }));
      expect(e.combatSpriteKey).toBe('ckey');
      expect(e.overworldSpriteKey).toBe('okey');
    });

    it('holds dialogue (intro, defeat, spare, slay)', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      expect(e.dialogue.intro).toBe('Intro!');
      expect(e.dialogue.defeat).toBe('Defeat...');
      expect(e.dialogue.spare).toBe('Spare text.');
      expect(e.dialogue.slay).toBe('Slay text.');
    });

    it('holds lore (description, origin, reference)', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      expect(e.lore.description).toBe('A test creature.');
      expect(e.lore.origin).toBe('Unit test');
      expect(e.lore.reference).toBe('Jest test suite');
    });

    it('attack pattern cycling advances and wraps', () => {
      const e = new EnemyEntity(makeEnemyConfig({ attackPattern: ['attack', 'defend', 'strengthen'] }));
      expect(e.currentAction).toBe('attack');
      e.advancePattern();
      expect(e.currentAction).toBe('defend');
      e.advancePattern();
      expect(e.currentAction).toBe('strengthen');
      e.advancePattern();
      expect(e.currentAction).toBe('attack'); // wrapped
    });

    it('onCombatStart resets pattern and halfHealthTriggered', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      e.currentPatternIndex = 999;
      e.halfHealthTriggered = true;
      e.onCombatStart();
      expect(e.currentPatternIndex).toBe(0);
      expect(e.halfHealthTriggered).toBe(false);
    });

    it('clone() creates a separate, fresh instance', () => {
      const e = new EnemyEntity(makeEnemyConfig({ maxHealth: 50 }));
      e.currentHealth = 10;
      const c = e.clone();
      expect(c.currentHealth).toBe(50); // fresh
      expect(c.id).toBe(e.id);
      expect(c).not.toBe(e);
    });

    it('toLegacyEnemy() produces a plain object', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      const legacy = e.toLegacyEnemy();
      expect(legacy).toHaveProperty('name', 'Test Enemy');
      expect(legacy).toHaveProperty('damage', 10);
    });

    it('initialStatusEffects are applied on construction', () => {
      const cfg = makeEnemyConfig({
        initialStatusEffects: [
          { id: 'dexterity', name: 'Dexterity', type: 'buff', value: 2, description: 'd', emoji: '💨' },
        ],
      });
      const e = new EnemyEntity(cfg);
      expect(e.hasStatusEffect('dexterity')).toBe(true);
      expect(e.getStatusEffect('dexterity')?.value).toBe(2);
    });

    it('toJSON() includes tier, chapter, lore, sprites', () => {
      const e = new EnemyEntity(makeEnemyConfig());
      const json = e.toJSON();
      expect(json).toHaveProperty('tier');
      expect(json).toHaveProperty('chapter');
      expect(json).toHaveProperty('lore');
      expect(json).toHaveProperty('combatSpriteKey');
    });
  });
});

// ============================================================================
// Requirement 2 — Player Class Implementation
// ============================================================================

describe('Req 2: Player Class Implementation', () => {
  let player: PlayerEntity;

  beforeEach(() => {
    player = new PlayerEntity();
  });

  it('extends CombatEntity → GameEntity', () => {
    expect(player).toBeInstanceOf(CombatEntity);
    expect(player).toBeInstanceOf(GameEntity);
  });

  it('default constructor sets base stats', () => {
    expect(player.id).toBe('player');
    expect(player.name).toBe('Bayani');
    expect(player.maxHealth).toBe(80);
    expect(player.currentHealth).toBe(80);
    expect(player.ginto).toBe(0);
    expect(player.diamante).toBe(0);
    expect(player.landasScore).toBe(0);
  });

  it('landas getter returns correct alignment', () => {
    player.landasScore = 5;
    expect(player.landas).toBe('Mercy');
    player.landasScore = -5;
    expect(player.landas).toBe('Conquest');
    player.landasScore = 0;
    expect(player.landas).toBe('Balance');
  });

  it('spareMorality / slayMorality adjust score', () => {
    player.spareMorality();
    expect(player.landasScore).toBe(1);
    player.slayMorality();
    player.slayMorality();
    expect(player.landasScore).toBe(-1);
  });

  it('drawCards draws from drawPile to hand', () => {
    player.drawPile = [
      { id: 'c1', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
      { id: 'c2', rank: '2', suit: 'Tubig', element: 'water', selected: false, playable: true },
    ];
    const drawn = player.drawCards(2);
    expect(drawn).toHaveLength(2);
    expect(player.hand).toHaveLength(2);
    expect(player.drawPile).toHaveLength(0);
  });

  it('drawCards reshuffles discard into draw when needed', () => {
    player.drawPile = [];
    player.discardPile = [
      { id: 'c1', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
    ];
    const drawn = player.drawCards(1);
    expect(drawn).toHaveLength(1);
    expect(player.hand).toHaveLength(1);
  });

  it('discardSelected moves selected cards and costs a charge', () => {
    player.hand = [
      { id: 'c1', rank: '1', suit: 'Apoy', element: 'fire', selected: true, playable: true },
      { id: 'c2', rank: '2', suit: 'Tubig', element: 'water', selected: false, playable: true },
    ];
    player.discardCharges = 1;
    const discarded = player.discardSelected();
    expect(discarded).toHaveLength(1);
    expect(player.hand).toHaveLength(1);
    expect(player.discardCharges).toBe(0);
  });

  it('discardSelected returns empty when no charges', () => {
    player.discardCharges = 0;
    player.hand = [{ id: 'c1', rank: '1', suit: 'Apoy', element: 'fire', selected: true, playable: true }];
    expect(player.discardSelected()).toHaveLength(0);
  });

  describe('relic management', () => {
    it('gainRelic succeeds (max 6)', () => {
      const relic = new RelicEntity(makeRelicConfig({ id: 'r1' }));
      expect(player.gainRelic(relic)).toBe(true);
      expect(player.relics).toHaveLength(1);
    });

    it('gainRelic rejects duplicates', () => {
      const r = new RelicEntity(makeRelicConfig({ id: 'r1' }));
      player.gainRelic(r);
      expect(player.gainRelic(new RelicEntity(makeRelicConfig({ id: 'r1' })))).toBe(false);
    });

    it('gainRelic rejects when at max', () => {
      for (let i = 0; i < 6; i++) {
        player.gainRelic(new RelicEntity(makeRelicConfig({ id: `r${i}` })));
      }
      expect(player.gainRelic(new RelicEntity(makeRelicConfig({ id: 'r99' })))).toBe(false);
    });

    it('hasRelic checks by id', () => {
      player.gainRelic(new RelicEntity(makeRelicConfig({ id: 'r1' })));
      expect(player.hasRelic('r1')).toBe(true);
      expect(player.hasRelic('r2')).toBe(false);
    });
  });

  describe('potion management', () => {
    it('gainPotion succeeds (max 3)', () => {
      expect(player.gainPotion(new PotionEntity(makePotionConfig()))).toBe(true);
      expect(player.potions).toHaveLength(1);
    });

    it('gainPotion rejects when at max', () => {
      for (let i = 0; i < 3; i++) {
        player.gainPotion(new PotionEntity(makePotionConfig({ id: `p${i}` })));
      }
      expect(player.gainPotion(new PotionEntity(makePotionConfig({ id: 'p99' })))).toBe(false);
    });

    it('usePotion applies effect and removes from inventory', () => {
      const pot = new PotionEntity(makePotionConfig({ id: 'hp', effect: 'heal_20_hp' }));
      player.gainPotion(pot);
      player.currentHealth = 50;
      expect(player.usePotion('hp')).toBe(true);
      expect(player.currentHealth).toBe(70);
      expect(player.potions).toHaveLength(0);
    });

    it('usePotion returns false for unknown id', () => {
      expect(player.usePotion('nonexistent')).toBe(false);
    });
  });

  describe('combat hooks', () => {
    it('onCombatStart resets block and charges', () => {
      player.block = 99;
      player.discardCharges = 0;
      player.onCombatStart();
      expect(player.block).toBe(0);
      expect(player.discardCharges).toBe(player.maxDiscardCharges);
    });

    it('onTurnStart resets block and charges', () => {
      player.block = 5;
      player.discardCharges = 0;
      player.onTurnStart();
      expect(player.block).toBe(0);
      expect(player.discardCharges).toBe(player.maxDiscardCharges);
    });
  });
});

// ============================================================================
// Requirement 3 — Item and Relic Class Hierarchy
// ============================================================================

describe('Req 3: Item and Relic Class Hierarchy', () => {
  describe('ItemEntity (abstract)', () => {
    it('RelicEntity is an ItemEntity is a GameEntity', () => {
      const r = new RelicEntity(makeRelicConfig());
      expect(r).toBeInstanceOf(ItemEntity);
      expect(r).toBeInstanceOf(GameEntity);
    });

    it('displayInfo getter returns combined metadata', () => {
      const r = new RelicEntity(makeRelicConfig({ id: 'x', name: 'X', description: 'Desc', emoji: '🎲', lore: 'Lore text' }));
      const info = r.displayInfo;
      expect(info.name).toBe('X');
      expect(info.description).toBe('Desc');
      expect(info.emoji).toBe('🎲');
      expect(info.lore).toBe('Lore text');
      expect(info.spriteKey).toBe('relic_x');
    });
  });

  describe('RelicEntity', () => {
    it('stores effectTypes and triggerCondition', () => {
      const r = new RelicEntity(makeRelicConfig({
        effectTypes: ['start_of_combat', 'start_of_turn'],
        triggerCondition: 'once_per_combat',
      }));
      expect(r.effectTypes).toEqual(['start_of_combat', 'start_of_turn']);
      expect(r.triggerCondition).toBe('once_per_combat');
    });

    it('lifecycle hooks are callable (default no-ops)', () => {
      const r = new RelicEntity(makeRelicConfig());
      const owner = {
        maxHealth: 100, currentHealth: 100, block: 0,
        discardCharges: 1, maxDiscardCharges: 1, statusEffects: [],
        relics: [], hasStatusEffect: () => false,
        applyStatusEffect: () => {}, gainBlock: () => {}, heal: () => 0,
      };
      expect(() => r.onAcquire(owner)).not.toThrow();
      expect(() => r.onCombatStart(owner)).not.toThrow();
      expect(() => r.onTurnStart(owner)).not.toThrow();
      expect(() => r.onTurnEnd(owner)).not.toThrow();
      expect(() => r.onHandPlayed(owner)).not.toThrow();
    });

    it('toLegacy() returns plain object', () => {
      const r = new RelicEntity(makeRelicConfig({ id: 'rl', name: 'Relic', emoji: '⚡' }));
      const legacy = r.toLegacy();
      expect(legacy).toEqual(expect.objectContaining({ id: 'rl', name: 'Relic', emoji: '⚡' }));
    });
  });

  describe('PotionEntity', () => {
    it('is an ItemEntity is a GameEntity', () => {
      const p = new PotionEntity(makePotionConfig());
      expect(p).toBeInstanceOf(ItemEntity);
      expect(p).toBeInstanceOf(GameEntity);
    });

    it('stores rarity and effect key', () => {
      const p = new PotionEntity(makePotionConfig({ rarity: 'rare', effect: 'remove_debuffs' }));
      expect(p.rarity).toBe('rare');
      expect(p.effect).toBe('remove_debuffs');
    });

    it('use() heals target', () => {
      const p = new PotionEntity(makePotionConfig({ effect: 'heal_20_hp' }));
      const target = {
        currentHealth: 50, maxHealth: 100, block: 0, statusEffects: [],
        heal: jest.fn((_n: number) => 20),
        gainBlock: jest.fn(),
        applyStatusEffect: jest.fn(),
        removeStatusEffect: jest.fn(),
      };
      p.use(target);
      expect(target.heal).toHaveBeenCalledWith(20);
    });

    it('use() gains block', () => {
      const p = new PotionEntity(makePotionConfig({ effect: 'gain_15_block' }));
      const target = {
        currentHealth: 100, maxHealth: 100, block: 0, statusEffects: [],
        heal: jest.fn(), gainBlock: jest.fn(),
        applyStatusEffect: jest.fn(), removeStatusEffect: jest.fn(),
      };
      p.use(target);
      expect(target.gainBlock).toHaveBeenCalledWith(15);
    });

    it('use() applies strength buff', () => {
      const p = new PotionEntity(makePotionConfig({ effect: 'gain_2_strength' }));
      const target = {
        currentHealth: 100, maxHealth: 100, block: 0, statusEffects: [],
        heal: jest.fn(), gainBlock: jest.fn(),
        applyStatusEffect: jest.fn(), removeStatusEffect: jest.fn(),
      };
      p.use(target);
      expect(target.applyStatusEffect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'strength', value: 2 }),
      );
    });

    it('use() removes debuffs', () => {
      const p = new PotionEntity(makePotionConfig({ effect: 'remove_debuffs' }));
      const target = {
        currentHealth: 100, maxHealth: 100, block: 0,
        statusEffects: [
          { id: 'weak', name: 'Weak', value: 1, type: 'debuff' as const, description: 'x', emoji: '⚠️' },
          { id: 'strength', name: 'Strength', value: 2, type: 'buff' as const, description: 'x', emoji: '💪' },
        ],
        heal: jest.fn(), gainBlock: jest.fn(),
        applyStatusEffect: jest.fn(), removeStatusEffect: jest.fn(),
      };
      p.use(target);
      // After removing debuffs, only buff remains
      expect(target.statusEffects).toEqual([
        { id: 'strength', name: 'Strength', value: 2, type: 'buff', description: 'x', emoji: '💪' },
      ]);
    });

    it('toLegacy() returns plain object', () => {
      const p = new PotionEntity(makePotionConfig({ id: 'pot', effect: 'heal_20_hp', rarity: 'common' }));
      expect(p.toLegacy()).toEqual(expect.objectContaining({ id: 'pot', effect: 'heal_20_hp', rarity: 'common' }));
    });
  });
});
