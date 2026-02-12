/**
 * Tests for Requirements 10-17:
 *   10: Type Safety and Abstraction
 *   11: ContentPool Integration (registry as pool)
 *   12: Utility Function Migration
 *   13: Enemy Sprite and Tooltip Consistency
 *   14: Enemy Identifier Migration
 *   15: Act 2 and Act 3 Enemy Class Coverage
 *   16: Prologue and Tutorial Consistency
 *   17: Asset Loading Validation
 */
import { GameEntity } from '../../core/entities/base/GameEntity';
import { CombatEntity } from '../../core/entities/base/CombatEntity';
import { EnemyEntity } from '../../core/entities/EnemyEntity';
import { PlayerEntity } from '../../core/entities/PlayerEntity';
import { ItemEntity } from '../../core/entities/items/ItemEntity';
import { RelicEntity } from '../../core/entities/items/RelicEntity';
import { PotionEntity } from '../../core/entities/items/PotionEntity';
import { EnemyRegistry } from '../../core/registries/EnemyRegistry';
import { ItemRegistry } from '../../core/registries/ItemRegistry';
import { EnemyFactory } from '../../core/factories/EnemyFactory';
import { GameScene } from '../../core/scenes/GameScene';
import { bootstrapEnemies, resetEnemyBootstrap } from '../../data/enemies/EnemyBootstrap';
import { ACT1_ENEMY_CONFIGS } from '../../data/enemies/Act1Enemies';
import { ACT2_ENEMY_CONFIGS } from '../../data/enemies/Act2Enemies';
import { ACT3_ENEMY_CONFIGS } from '../../data/enemies/Act3Enemies';

afterEach(() => {
  resetEnemyBootstrap();
  ItemRegistry.clear();
});

// ============================================================================
// Requirement 10 — Type Safety and Abstraction
// ============================================================================

describe('Req 10: Type Safety and Abstraction', () => {
  it('GameEntity is abstract (only usable via subclass)', () => {
    // Cannot do `new GameEntity()` — TS prevents it.
    // Verify hierarchy is correct:
    const e = new EnemyEntity({
      id: 'ts1', name: 'T', tier: 'common', chapter: 1,
      maxHealth: 10, damage: 1, attackPattern: ['attack'],
      elementalAffinity: { weakness: 'fire', resistance: null },
      combatSpriteKey: 'c', overworldSpriteKey: 'o',
      intent: { type: 'attack', value: 1, description: '', icon: '' },
      dialogue: { intro: '', defeat: '', spare: '', slay: '' },
      lore: { description: '', origin: '', reference: '' },
    });
    expect(e).toBeInstanceOf(GameEntity);
    expect(e).toBeInstanceOf(CombatEntity);
  });

  it('ItemEntity is abstract (used via RelicEntity / PotionEntity)', () => {
    const r = new RelicEntity({ id: 'ts2', name: 'R', description: '', emoji: '' });
    const p = new PotionEntity({ id: 'ts3', name: 'P', description: '', emoji: '', rarity: 'common', effect: 'heal_20_hp' });
    expect(r).toBeInstanceOf(ItemEntity);
    expect(p).toBeInstanceOf(ItemEntity);
  });

  it('GameScene is abstract (used via concrete subclasses)', () => {
    class ConcreteScene extends GameScene {
      constructor() { super('c'); }
      init(): void { /* no-op */ }
      preload(): void { /* no-op */ }
      create(): void { /* no-op */ }
      update(): void { /* no-op */ }
    }
    const s = new ConcreteScene();
    expect(s).toBeInstanceOf(GameScene);
  });

  it('EnemyEntity toJSON has proper shape', () => {
    const e = new EnemyEntity({
      id: 'ts4', name: 'X', tier: 'boss', chapter: 3,
      maxHealth: 999, damage: 50, attackPattern: ['a', 'b'],
      elementalAffinity: { weakness: null, resistance: null },
      combatSpriteKey: 'cx', overworldSpriteKey: 'ox',
      intent: { type: 'unknown', value: 0, description: '', icon: '' },
      dialogue: { intro: '', defeat: '', spare: '', slay: '' },
      lore: { description: '', origin: '', reference: '' },
    });
    const json = e.toJSON();
    expect(typeof json['id']).toBe('string');
    expect(typeof json['maxHealth']).toBe('number');
    expect(typeof json['tier']).toBe('string');
  });
});

// ============================================================================
// Requirement 11 — ContentPool Integration (registry as pool)
// ============================================================================

describe('Req 11: ContentPool Integration (registry as pool)', () => {
  beforeEach(() => bootstrapEnemies());

  it('EnemyRegistry.getByChapter returns all enemies for a chapter', () => {
    const act1 = EnemyRegistry.getByChapter(1);
    expect(act1).toHaveLength(10);
  });

  it('EnemyRegistry.getByTier returns enemies across chapters', () => {
    const commons = EnemyRegistry.getByTier('common');
    expect(commons.length).toBeGreaterThanOrEqual(21); // 7 per act × 3
  });

  it('EnemyRegistry.getByChapterAndTier filters correctly', () => {
    const elites2 = EnemyRegistry.getByChapterAndTier(2, 'elite');
    expect(elites2).toHaveLength(2);
    elites2.forEach(cfg => {
      expect(cfg.chapter).toBe(2);
      expect(cfg.tier).toBe('elite');
    });
  });

  it('EnemyRegistry.getRandom returns a valid config', () => {
    const cfg = EnemyRegistry.getRandom(1, 'common');
    expect(cfg.chapter).toBe(1);
    expect(cfg.tier).toBe('common');
  });

  it('EnemyRegistry.createRandom returns an EnemyEntity instance', () => {
    const e = EnemyRegistry.createRandom(3, 'boss');
    expect(e).toBeInstanceOf(EnemyEntity);
    expect(e.tier).toBe('boss');
  });

  it('ItemRegistry.allRelics and allPotions return all registered items', () => {
    ItemRegistry.registerRelic({ id: 'p1', name: 'R', description: '', emoji: '' });
    ItemRegistry.registerPotion({ id: 'p2', name: 'P', description: '', emoji: '', rarity: 'common', effect: 'heal_20_hp' });
    expect(ItemRegistry.allRelics()).toHaveLength(1);
    expect(ItemRegistry.allPotions()).toHaveLength(1);
  });
});

// ============================================================================
// Requirement 12 — Utility Function Migration
// ============================================================================

describe('Req 12: Utility Function Migration', () => {
  it('CombatEntity.takeDamage encapsulates damage calculation (block → HP)', () => {
    const e = new EnemyEntity({
      id: 'ut1', name: 'U', tier: 'common', chapter: 1,
      maxHealth: 100, damage: 10, attackPattern: ['attack'],
      elementalAffinity: { weakness: null, resistance: null },
      combatSpriteKey: 'c', overworldSpriteKey: 'o',
      intent: { type: 'attack', value: 10, description: '', icon: '' },
      dialogue: { intro: '', defeat: '', spare: '', slay: '' },
      lore: { description: '', origin: '', reference: '' },
    });
    e.block = 30;
    const lost = e.takeDamage(50);
    expect(e.block).toBe(0);
    expect(lost).toBe(20);
    expect(e.currentHealth).toBe(80);
  });

  it('PlayerEntity.drawCards encapsulates deck management', () => {
    const p = new PlayerEntity();
    p.drawPile = [
      { id: 'a', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
      { id: 'b', rank: '2', suit: 'Apoy', element: 'fire', selected: false, playable: true },
    ];
    p.drawCards(1);
    expect(p.hand).toHaveLength(1);
    expect(p.drawPile).toHaveLength(1);
  });

  it('PlayerEntity.gainRelic encapsulates relic acquisition logic', () => {
    const p = new PlayerEntity();
    const r = new RelicEntity({ id: 'ur1', name: 'R', description: '', emoji: '' });
    expect(p.gainRelic(r)).toBe(true);
    expect(p.hasRelic('ur1')).toBe(true);
  });

  it('PotionEntity.use encapsulates effect dispatch', () => {
    const pot = new PotionEntity({ id: 'up1', name: 'P', description: '', emoji: '', rarity: 'common', effect: 'gain_15_block' });
    const player = new PlayerEntity();
    pot.use(player);
    expect(player.block).toBe(15);
  });
});

// ============================================================================
// Requirement 13 — Enemy Sprite and Tooltip Consistency
// ============================================================================

describe('Req 13: Enemy Sprite and Tooltip Consistency', () => {
  beforeEach(() => bootstrapEnemies());

  it('getCombatSprite returns correct key for registered ID', () => {
    expect(EnemyRegistry.getCombatSprite('tikbalang_scout')).toBe('tikbalang_combat');
  });

  it('getOverworldSprite returns correct key for registered ID', () => {
    expect(EnemyRegistry.getOverworldSprite('tikbalang_scout')).toBe('tikbalang_overworld');
  });

  it('sprite lookup by display name (backward compat)', () => {
    expect(EnemyRegistry.getCombatSprite('Tikbalang Scout')).toBe('tikbalang_combat');
  });

  it('unknown ID produces a fallback sprite and warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const sprite = EnemyRegistry.getCombatSprite('completely_unknown');
    expect(sprite).toBe('tikbalang_combat');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown enemy'));
    warnSpy.mockRestore();
  });

  it('all 30 enemies have non-empty combat sprite keys', () => {
    const all = [...EnemyRegistry.getByChapter(1), ...EnemyRegistry.getByChapter(2), ...EnemyRegistry.getByChapter(3)];
    expect(all).toHaveLength(30);
    all.forEach(cfg => {
      expect(cfg.combatSpriteKey).toBeTruthy();
      expect(cfg.overworldSpriteKey).toBeTruthy();
    });
  });
});

// ============================================================================
// Requirement 14 — Enemy Identifier Migration
// ============================================================================

describe('Req 14: Enemy Identifier Migration', () => {
  beforeEach(() => bootstrapEnemies());

  it('resolve() maps display name to config id', () => {
    const cfg = EnemyRegistry.resolve('Balete Wraith');
    expect(cfg).toBeDefined();
    expect(cfg!.id).toBe('balete_wraith');
  });

  it('resolve() also works directly with config id', () => {
    const cfg = EnemyRegistry.resolve('balete_wraith');
    expect(cfg).toBeDefined();
    expect(cfg!.name).toBe('Balete Wraith');
  });

  it('getIdByName returns the canonical ID for a display name', () => {
    expect(EnemyRegistry.getIdByName('Mangangaway')).toBe('mangangaway');
  });

  it('getIdByName returns undefined for unknown names', () => {
    expect(EnemyRegistry.getIdByName('NonexistentCreature')).toBeUndefined();
  });
});

// ============================================================================
// Requirement 15 — Act 2 and Act 3 Enemy Class Coverage
// ============================================================================

describe('Req 15: Act 2 and Act 3 Enemy Class Coverage', () => {
  it('Act 1 has 10 enemy configs (7 common, 2 elite, 1 boss)', () => {
    expect(ACT1_ENEMY_CONFIGS).toHaveLength(10);
    expect(ACT1_ENEMY_CONFIGS.filter(c => c.tier === 'common')).toHaveLength(7);
    expect(ACT1_ENEMY_CONFIGS.filter(c => c.tier === 'elite')).toHaveLength(2);
    expect(ACT1_ENEMY_CONFIGS.filter(c => c.tier === 'boss')).toHaveLength(1);
  });

  it('Act 2 has 10 enemy configs (7 common, 2 elite, 1 boss)', () => {
    expect(ACT2_ENEMY_CONFIGS).toHaveLength(10);
    expect(ACT2_ENEMY_CONFIGS.filter(c => c.tier === 'common')).toHaveLength(7);
    expect(ACT2_ENEMY_CONFIGS.filter(c => c.tier === 'elite')).toHaveLength(2);
    expect(ACT2_ENEMY_CONFIGS.filter(c => c.tier === 'boss')).toHaveLength(1);
  });

  it('Act 3 has 10 enemy configs (7 common, 2 elite, 1 boss)', () => {
    expect(ACT3_ENEMY_CONFIGS).toHaveLength(10);
    expect(ACT3_ENEMY_CONFIGS.filter(c => c.tier === 'common')).toHaveLength(7);
    expect(ACT3_ENEMY_CONFIGS.filter(c => c.tier === 'elite')).toHaveLength(2);
    expect(ACT3_ENEMY_CONFIGS.filter(c => c.tier === 'boss')).toHaveLength(1);
  });

  it('all Act 2 configs have chapter=2', () => {
    ACT2_ENEMY_CONFIGS.forEach(c => expect(c.chapter).toBe(2));
  });

  it('all Act 3 configs have chapter=3', () => {
    ACT3_ENEMY_CONFIGS.forEach(c => expect(c.chapter).toBe(3));
  });

  it('all enemy configs have unique IDs', () => {
    const all = [...ACT1_ENEMY_CONFIGS, ...ACT2_ENEMY_CONFIGS, ...ACT3_ENEMY_CONFIGS];
    const ids = all.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('after bootstrap, registry has all 30 enemies', () => {
    bootstrapEnemies();
    const all = [
      ...EnemyRegistry.getByChapter(1),
      ...EnemyRegistry.getByChapter(2),
      ...EnemyRegistry.getByChapter(3),
    ];
    expect(all).toHaveLength(30);
  });

  it('Act 2 enemies preserve expected stats', () => {
    const bakunawa = ACT2_ENEMY_CONFIGS.find(c => c.id === 'bakunawa');
    expect(bakunawa).toBeDefined();
    expect(bakunawa!.maxHealth).toBe(900);
    expect(bakunawa!.damage).toBe(42);
    expect(bakunawa!.tier).toBe('boss');
  });

  it('Act 3 enemies preserve expected stats', () => {
    const fb = ACT3_ENEMY_CONFIGS.find(c => c.id === 'false_bathala');
    expect(fb).toBeDefined();
    expect(fb!.maxHealth).toBe(1200);
    expect(fb!.damage).toBe(48);
    expect(fb!.tier).toBe('boss');
  });
});

// ============================================================================
// Requirement 16 — Prologue and Tutorial Consistency
// ============================================================================

describe('Req 16: Prologue and Tutorial Consistency', () => {
  beforeEach(() => bootstrapEnemies());

  it('prologue enemy (Tikbalang Scout) is resolvable by ID', () => {
    const cfg = EnemyRegistry.getConfig('tikbalang_scout');
    expect(cfg).toBeDefined();
    expect(cfg!.name).toBe('Tikbalang Scout');
  });

  it('prologue enemy sprite lookup works', () => {
    expect(EnemyRegistry.getCombatSprite('tikbalang_scout')).toBe('tikbalang_combat');
    expect(EnemyRegistry.getOverworldSprite('tikbalang_scout')).toBe('tikbalang_overworld');
  });

  it('prologue enemy can be constructed for scripted encounter', () => {
    const e = EnemyFactory.create('tikbalang_scout');
    expect(e.maxHealth).toBe(180);
    expect(e.dialogue.intro).toContain('Lost in my paths');
  });
});

// ============================================================================
// Requirement 17 — Asset Loading Validation
// ============================================================================

describe('Req 17: Asset Loading Validation', () => {
  beforeEach(() => bootstrapEnemies());

  it('getAllSpriteKeys returns all combat + overworld keys', () => {
    const keys = EnemyRegistry.getAllSpriteKeys();
    expect(keys.combat.length).toBe(30);
    expect(keys.overworld.length).toBe(30);
  });

  it('all sprite keys are non-empty strings', () => {
    const keys = EnemyRegistry.getAllSpriteKeys();
    keys.combat.forEach(k => expect(k.length).toBeGreaterThan(0));
    keys.overworld.forEach(k => expect(k.length).toBeGreaterThan(0));
  });

  it('validateSprites reports missing textures', () => {
    // Simulate a texture manager that knows nothing
    const missing = EnemyRegistry.validateSprites(() => false);
    // Should report 60 missing (30 combat + 30 overworld)
    expect(missing.length).toBe(60);
  });

  it('validateSprites reports zero when all textures exist', () => {
    const missing = EnemyRegistry.validateSprites(() => true);
    expect(missing.length).toBe(0);
  });

  it('each enemy config has a distinct combat sprite key', () => {
    const keys = EnemyRegistry.getAllSpriteKeys();
    expect(new Set(keys.combat).size).toBe(keys.combat.length);
  });
});
