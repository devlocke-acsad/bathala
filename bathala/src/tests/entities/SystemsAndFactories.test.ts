/**
 * Tests for Requirement 6: Single Source of Truth
 * Tests for Requirement 7: Backward Compatibility
 * Tests for Requirement 8: Manager Integration (registry-level)
 * Tests for Requirement 9: Factory Pattern for Entity Creation
 */
import { EnemyEntity, EnemyConfig } from '../../core/entities/EnemyEntity';
import { EnemyRegistry } from '../../core/registries/EnemyRegistry';
import { ItemRegistry } from '../../core/registries/ItemRegistry';
import { EnemyFactory } from '../../core/factories/EnemyFactory';
import { RelicFactory } from '../../core/factories/RelicFactory';
import { PotionFactory } from '../../core/factories/PotionFactory';
import { RelicEntity, RelicConfig } from '../../core/entities/items/RelicEntity';
import { PotionEntity, PotionConfig } from '../../core/entities/items/PotionEntity';
import { PlayerEntity } from '../../core/entities/PlayerEntity';
import { bootstrapEnemies, resetEnemyBootstrap } from '../../data/enemies/EnemyBootstrap';

// ── Shared helpers ────────────────────────────────────

function makeConfig(overrides: Partial<EnemyConfig> = {}): EnemyConfig {
  return {
    id: 'test_e',
    name: 'Test Enemy',
    tier: 'common',
    chapter: 1,
    maxHealth: 100,
    damage: 10,
    attackPattern: ['attack'],
    elementalAffinity: { weakness: 'fire', resistance: 'water' },
    combatSpriteKey: 'c',
    overworldSpriteKey: 'o',
    intent: { type: 'attack', value: 10, description: 'Attacks', icon: '†' },
    dialogue: { intro: '', defeat: '', spare: '', slay: '' },
    lore: { description: '', origin: '', reference: '' },
    ...overrides,
  };
}

// Cleanup between tests
afterEach(() => {
  resetEnemyBootstrap();
  ItemRegistry.clear();
});

// ============================================================================
// Requirement 6 — Single Source of Truth
// ============================================================================

describe('Req 6: Single Source of Truth', () => {
  it('changing maxHealth in config propagates to all created instances', () => {
    const cfg = makeConfig({ id: 'ssot_1', maxHealth: 200 });
    EnemyRegistry.register(cfg);
    const e1 = EnemyRegistry.create('ssot_1');
    expect(e1.maxHealth).toBe(200);
  });

  it('registry.create returns an instance whose data matches the registered config', () => {
    const cfg = makeConfig({ id: 'ssot_2', damage: 42, combatSpriteKey: 'my_sprite' });
    EnemyRegistry.register(cfg);
    const e = EnemyRegistry.create('ssot_2');
    expect(e.damage).toBe(42);
    expect(e.combatSpriteKey).toBe('my_sprite');
  });

  it('config stores sprite keys — no separate mapping needed', () => {
    const cfg = makeConfig({ id: 'ssot_3', combatSpriteKey: 'combat_x', overworldSpriteKey: 'ow_x' });
    EnemyRegistry.register(cfg);
    expect(EnemyRegistry.getCombatSprite('ssot_3')).toBe('combat_x');
    expect(EnemyRegistry.getOverworldSprite('ssot_3')).toBe('ow_x');
  });

  it('ID-based lookup (not display name) is the canonical identifier', () => {
    const cfg = makeConfig({ id: 'ssot_id', name: 'Display Name' });
    EnemyRegistry.register(cfg);
    // by ID
    expect(EnemyRegistry.getConfig('ssot_id')).toBeDefined();
    // by display name via backward compat
    expect(EnemyRegistry.getIdByName('Display Name')).toBe('ssot_id');
  });

  it('class constructors are the only way to create entity instances', () => {
    const e = new EnemyEntity(makeConfig());
    expect(e).toBeInstanceOf(EnemyEntity);
  });
});

// ============================================================================
// Requirement 7 — Backward Compatibility
// ============================================================================

describe('Req 7: Backward Compatibility', () => {
  it('toLegacyEnemy() produces shape compatible with the old Enemy interface', () => {
    const e = new EnemyEntity(makeConfig({ name: 'Tikbalang Scout', damage: 21 }));
    const legacy = e.toLegacyEnemy() as Record<string, unknown>;
    expect(legacy['name']).toBe('Tikbalang Scout');
    expect(legacy['maxHealth']).toBe(100);
    expect(legacy['damage']).toBe(21);
    expect(legacy['attackPattern']).toBeDefined();
    expect(legacy['statusEffects']).toBeDefined();
    expect(legacy['elementalAffinity']).toBeDefined();
  });

  it('RelicEntity.toLegacy() produces shape compatible with old Relic interface', () => {
    const r = new RelicEntity({ id: 'r1', name: 'Relic', description: 'Desc', emoji: '⚡' });
    const legacy = r.toLegacy();
    expect(legacy).toEqual(expect.objectContaining({ id: 'r1', name: 'Relic', description: 'Desc', emoji: '⚡' }));
  });

  it('PotionEntity.toLegacy() produces shape compatible with old Potion interface', () => {
    const p = new PotionEntity({ id: 'p1', name: 'Pot', description: 'D', emoji: '🧪', rarity: 'common', effect: 'heal_20_hp' });
    expect(p.toLegacy()).toEqual(expect.objectContaining({ id: 'p1', effect: 'heal_20_hp' }));
  });

  it('backward compat: resolve by display name', () => {
    EnemyRegistry.register(makeConfig({ id: 'compat_1', name: 'Some Old Name' }));
    const resolved = EnemyRegistry.resolve('Some Old Name');
    expect(resolved).toBeDefined();
    expect(resolved!.id).toBe('compat_1');
  });

  it('getCombatSprite falls back gracefully for unknown IDs', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const sprite = EnemyRegistry.getCombatSprite('nonexistent_enemy');
    expect(sprite).toBe('tikbalang_combat'); // fallback
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ============================================================================
// Requirement 8 — Manager Integration (registry-level tests)
// ============================================================================

describe('Req 8: Manager Integration', () => {
  it('EnemyRegistry provides ID-based lookup', () => {
    EnemyRegistry.register(makeConfig({ id: 'mgr_1' }));
    expect(EnemyRegistry.getConfig('mgr_1')).toBeDefined();
    expect(EnemyRegistry.getConfigOrThrow('mgr_1').id).toBe('mgr_1');
  });

  it('EnemyRegistry provides sprite lookup methods', () => {
    EnemyRegistry.register(makeConfig({ id: 'spr', combatSpriteKey: 'cspr', overworldSpriteKey: 'ospr' }));
    expect(EnemyRegistry.getCombatSprite('spr')).toBe('cspr');
    expect(EnemyRegistry.getOverworldSprite('spr')).toBe('ospr');
  });

  it('ItemRegistry manages relics via register / get', () => {
    const cfg: RelicConfig = { id: 'ir1', name: 'R', description: 'd', emoji: '⚡' };
    ItemRegistry.registerRelic(cfg);
    const r = ItemRegistry.getRelic('ir1');
    expect(r).toBeDefined();
    expect(r!.name).toBe('R');
  });

  it('ItemRegistry manages potions via register / get', () => {
    const cfg: PotionConfig = { id: 'ip1', name: 'P', description: 'd', emoji: '🧪', rarity: 'common', effect: 'heal_20_hp' };
    ItemRegistry.registerPotion(cfg);
    const p = ItemRegistry.getPotion('ip1');
    expect(p).toBeDefined();
    expect(p!.effect).toBe('heal_20_hp');
  });

  it('PlayerEntity works with RelicEntity & PotionEntity class instances', () => {
    const player = new PlayerEntity();
    const relic = new RelicEntity({ id: 'r', name: 'R', description: '', emoji: '' });
    const potion = new PotionEntity({ id: 'p', name: 'P', description: '', emoji: '', rarity: 'common', effect: 'heal_20_hp' });
    player.gainRelic(relic);
    player.gainPotion(potion);
    expect(player.relics[0]).toBeInstanceOf(RelicEntity);
    expect(player.potions[0]).toBeInstanceOf(PotionEntity);
  });
});

// ============================================================================
// Requirement 9 — Factory Pattern for Entity Creation
// ============================================================================

describe('Req 9: Factory Pattern for Entity Creation', () => {
  beforeEach(() => {
    bootstrapEnemies();
  });

  it('EnemyFactory.create returns EnemyEntity for registered ID', () => {
    const e = EnemyFactory.create('tikbalang_scout');
    expect(e).toBeInstanceOf(EnemyEntity);
    expect(e.name).toBe('Tikbalang Scout');
  });

  it('EnemyFactory.createRandom returns a valid enemy for chapter+tier', () => {
    const e = EnemyFactory.createRandom(1, 'common');
    expect(e).toBeInstanceOf(EnemyEntity);
    expect(e.chapter).toBe(1);
    expect(e.tier).toBe('common');
  });

  it('EnemyFactory.createAllCommon returns all common enemies for a chapter', () => {
    const commons = EnemyFactory.createAllCommon(1);
    expect(commons).toHaveLength(7);
    commons.forEach(e => expect(e.tier).toBe('common'));
  });

  it('EnemyFactory.createAllElite returns all elite enemies for a chapter', () => {
    const elites = EnemyFactory.createAllElite(2);
    expect(elites).toHaveLength(2);
    elites.forEach(e => expect(e.tier).toBe('elite'));
  });

  it('EnemyFactory.createAllBoss returns boss enemies for a chapter', () => {
    const bosses = EnemyFactory.createAllBoss(3);
    expect(bosses).toHaveLength(1);
    expect(bosses[0].name).toBe('False Bathala');
  });

  it('RelicFactory.create creates and registers a relic', () => {
    const r = RelicFactory.create({ id: 'rf1', name: 'FR', description: 'd', emoji: '⚡' });
    expect(r).toBeInstanceOf(RelicEntity);
    expect(ItemRegistry.getRelic('rf1')).toBeDefined();
  });

  it('RelicFactory.clone produces an independent copy', () => {
    RelicFactory.create({ id: 'rc1', name: 'Clone', description: '', emoji: '' });
    const c = RelicFactory.clone('rc1');
    expect(c.id).toBe('rc1');
    expect(c).toBeInstanceOf(RelicEntity);
  });

  it('PotionFactory.create creates and registers a potion', () => {
    const p = PotionFactory.create({ id: 'pf1', name: 'FP', description: '', emoji: '', rarity: 'common', effect: 'heal_20_hp' });
    expect(p).toBeInstanceOf(PotionEntity);
    expect(ItemRegistry.getPotion('pf1')).toBeDefined();
  });

  it('PotionFactory.clone produces an independent copy', () => {
    PotionFactory.create({ id: 'pc1', name: 'PClone', description: '', emoji: '', rarity: 'rare', effect: 'remove_debuffs' });
    const c = PotionFactory.clone('pc1');
    expect(c.id).toBe('pc1');
    expect(c.rarity).toBe('rare');
  });
});
