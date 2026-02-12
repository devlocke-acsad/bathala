/**
 * EnemyFactory — Static factory that converts legacy Act data into EnemyConfig
 * arrays and provides convenience methods for spawning EnemyEntity instances.
 *
 * Bridges the gap between the original flat-object Act files and the new
 * class-based EnemyEntity / EnemyRegistry system.
 */
import { EnemyEntity, EnemyConfig, EnemyTier } from '../entities/EnemyEntity';
import { EnemyRegistry } from '../registries/EnemyRegistry';

export class EnemyFactory {
  // ── Convenience creation from registry ──────────────

  /** Create a fresh EnemyEntity by id (delegates to registry). */
  static create(id: string): EnemyEntity {
    return EnemyRegistry.create(id);
  }

  /** Create a random enemy for the given chapter and tier. */
  static createRandom(chapter: number, tier: EnemyTier): EnemyEntity {
    return EnemyRegistry.createRandom(chapter, tier);
  }

  // ── Batch creation ──────────────────────────────────

  /** Create all common enemies for a chapter. */
  static createAllCommon(chapter: number): EnemyEntity[] {
    return EnemyRegistry.getByChapterAndTier(chapter, 'common')
      .map(cfg => new EnemyEntity(cfg));
  }

  /** Create all elite enemies for a chapter. */
  static createAllElite(chapter: number): EnemyEntity[] {
    return EnemyRegistry.getByChapterAndTier(chapter, 'elite')
      .map(cfg => new EnemyEntity(cfg));
  }

  /** Create all boss enemies for a chapter. */
  static createAllBoss(chapter: number): EnemyEntity[] {
    return EnemyRegistry.getByChapterAndTier(chapter, 'boss')
      .map(cfg => new EnemyEntity(cfg));
  }

  // ── Config builder helper ───────────────────────────

  /**
   * Build an EnemyConfig from parts. Useful as a convenience wrapper
   * when defining configs inline.
   */
  static buildConfig(partial: EnemyConfig): EnemyConfig {
    return { ...partial };
  }
}
