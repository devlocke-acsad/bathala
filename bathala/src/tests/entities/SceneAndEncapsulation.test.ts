/**
 * Tests for Requirement 4: Scene Class Architecture
 * Tests for Requirement 5: Encapsulation of Behavior
 */
import { GameScene } from '../../core/scenes/GameScene';
import { EnemyEntity, EnemyConfig } from '../../core/entities/EnemyEntity';
import { PlayerEntity } from '../../core/entities/PlayerEntity';

// ── Concrete scene stub for testing ───────────────────

class TestScene extends GameScene {
  public initCalled = false;
  public preloadCalled = false;
  public createCalled = false;
  public updateCalled = false;
  public shutdownCalled = false;

  constructor() {
    super('TestScene');
  }

  init(): void { this.initCalled = true; }
  preload(): void { this.preloadCalled = true; }
  create(): void { this.createCalled = true; }
  update(_time: number, _delta: number): void { this.updateCalled = true; }
  override shutdown(): void { this.shutdownCalled = true; }
}

function makeConfig(overrides: Partial<EnemyConfig> = {}): EnemyConfig {
  return {
    id: 'enc_test',
    name: 'Test',
    tier: 'common',
    chapter: 1,
    maxHealth: 50,
    damage: 5,
    attackPattern: ['attack', 'defend'],
    elementalAffinity: { weakness: 'fire', resistance: 'water' },
    combatSpriteKey: 'c',
    overworldSpriteKey: 'o',
    intent: { type: 'attack', value: 5, description: 'Attacks', icon: '†' },
    dialogue: { intro: 'hi', defeat: 'ow', spare: 'ok', slay: 'rip' },
    lore: { description: 'd', origin: 'o', reference: 'r' },
    ...overrides,
  };
}

// ============================================================================
// Requirement 4 — Scene Class Architecture
// ============================================================================

describe('Req 4: Scene Class Architecture', () => {
  it('GameScene stores a scene key', () => {
    const scene = new TestScene();
    expect(scene.sceneKey).toBe('TestScene');
  });

  it('lifecycle hooks are callable on concrete subclass', () => {
    const scene = new TestScene();
    scene.init();
    scene.preload();
    scene.create();
    scene.update(0, 0);
    scene.shutdown();
    expect(scene.initCalled).toBe(true);
    expect(scene.preloadCalled).toBe(true);
    expect(scene.createCalled).toBe(true);
    expect(scene.updateCalled).toBe(true);
    expect(scene.shutdownCalled).toBe(true);
  });

  it('shutdown() has a default no-op in base', () => {
    // Create a scene that doesn't override shutdown
    class MinScene extends GameScene {
      constructor() { super('Min'); }
      init(): void { /* no-op */ }
      preload(): void { /* no-op */ }
      create(): void { /* no-op */ }
      update(_time: number, _delta: number): void { /* no-op */ }
    }
    const scene = new MinScene();
    expect(() => scene.shutdown()).not.toThrow();
  });
});

// ============================================================================
// Requirement 5 — Encapsulation of Behavior
// ============================================================================

describe('Req 5: Encapsulation of Behavior', () => {
  describe('EnemyEntity encapsulates combat behavior', () => {
    it('takeDamage handles block then HP', () => {
      const e = new EnemyEntity(makeConfig({ maxHealth: 100 }));
      e.block = 10;
      const lost = e.takeDamage(15);
      expect(e.block).toBe(0);
      expect(lost).toBe(5);
      expect(e.currentHealth).toBe(95);
    });

    it('gainBlock increments block', () => {
      const e = new EnemyEntity(makeConfig());
      e.gainBlock(7);
      expect(e.block).toBe(7);
    });

    it('applyStatusEffect stacks existing effect', () => {
      const e = new EnemyEntity(makeConfig());
      e.applyStatusEffect({ id: 'burn', name: 'Burn', type: 'debuff', value: 2, description: 'ouch', emoji: '🔥' });
      e.applyStatusEffect({ id: 'burn', name: 'Burn', type: 'debuff', value: 3, description: 'ouch', emoji: '🔥' });
      expect(e.getStatusEffect('burn')?.value).toBe(5);
    });

    it('intent updates automatically with pattern cycling', () => {
      const e = new EnemyEntity(makeConfig({ damage: 10, attackPattern: ['attack', 'defend'] }));
      e.onCombatStart();
      expect(e.intent.type).toBe('attack');
      expect(e.intent.value).toBe(10);

      e.advancePattern();
      expect(e.intent.type).toBe('defend');
    });
  });

  describe('PlayerEntity encapsulates player behavior', () => {
    it('drawCards and discardSelected co-locate deck ops', () => {
      const p = new PlayerEntity();
      p.drawPile = [
        { id: '1', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
        { id: '2', rank: '2', suit: 'Tubig', element: 'water', selected: false, playable: true },
        { id: '3', rank: '3', suit: 'Lupa', element: 'earth', selected: false, playable: true },
      ];
      p.drawCards(3);
      expect(p.hand).toHaveLength(3);

      // Select first card, discard
      p.hand[0].selected = true;
      p.discardSelected();
      expect(p.hand).toHaveLength(2);
      expect(p.discardPile).toHaveLength(1);
    });

    it('heal method on player respects max', () => {
      const p = new PlayerEntity('p', 'P', 100);
      p.currentHealth = 90;
      const gained = p.heal(50);
      expect(p.currentHealth).toBe(100);
      expect(gained).toBe(10);
    });

    it('healthPercent returns correct percentage', () => {
      const p = new PlayerEntity('p', 'P', 200);
      p.currentHealth = 100;
      expect(p.healthPercent).toBe(50);
    });
  });
});
