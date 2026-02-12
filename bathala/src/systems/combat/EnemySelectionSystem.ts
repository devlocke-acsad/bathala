/**
 * EnemySelectionSystem — Chapter-aware enemy selection.
 *
 * Centralises the logic that was previously a sprawling switch-case inside
 * Combat.ts. Each chapter registers a provider that knows how to return
 * random common / elite / boss enemies and search by display name.
 *
 * Adding a new chapter (e.g. Act 4) is one line:
 *   EnemySelectionSystem.registerChapter(4, act4Provider);
 */
import { EnemyFactory } from "../../core/factories/EnemyFactory";
import { EnemyRegistry } from "../../core/registries/EnemyRegistry";
import { EnemyEntity, EnemyTier } from "../../core/entities/EnemyEntity";
import { bootstrapEnemies } from "../../data/enemies/EnemyBootstrap";

// ── Types ─────────────────────────────────────────────

type ChapterEnemyProvider = {
  chapter: number;
};

const CHAPTER_PROVIDERS: Record<number, ChapterEnemyProvider> = {
  1: { chapter: 1 },
  2: { chapter: 2 },
  3: { chapter: 3 },
};

// ── Public API ────────────────────────────────────────

export class EnemySelectionSystem {
  private static registryInitialized = false;

  private static ensureRegistryReady(): void {
    if (!this.registryInitialized) {
      bootstrapEnemies();
      this.registryInitialized = true;
    }
  }

  /**
   * Register (or replace) the provider for a chapter number.
   * Use this for Act 4+ or for test overrides.
   */
  static registerChapter(chapter: number, provider: ChapterEnemyProvider): void {
    CHAPTER_PROVIDERS[chapter] = provider;
  }

  /**
   * Get a random enemy matching the given node type for the chapter.
   * Maps node types to tier: "elite" → elite, "boss" → boss, else → common.
   * Returns a fresh EnemyEntity ready for combat.
   */
  static getEnemyForNodeType(
    nodeType: string,
    chapter: number
  ): EnemyEntity {
    this.ensureRegistryReady();
    const provider = this.getProvider(chapter);
    const tier = this.getTierFromNodeType(nodeType);
    return EnemyFactory.createRandom(provider.chapter, tier);
  }

  /**
   * Find an enemy across ALL chapters by display name or config ID.
   * Used when the overworld passes a specific enemyId to combat.
   * Falls back to a random common enemy from `fallbackChapter` if not found.
   * Returns a fresh EnemyEntity ready for combat.
   */
  static getEnemyByName(
    enemyId: string,
    fallbackChapter: number = 1
  ): EnemyEntity {
    this.ensureRegistryReady();

    const resolved = EnemyRegistry.resolve(enemyId);
    if (resolved) {
      return EnemyFactory.create(resolved.id);
    }

    console.warn(
      `[EnemySelectionSystem] Enemy "${enemyId}" not found in registry, ` +
        `falling back to random common for chapter ${fallbackChapter}`
    );

    return EnemyFactory.createRandom(this.getProvider(fallbackChapter).chapter, "common");
  }

  /**
   * Create a unique runtime ID for an enemy instance.
   * Format: `lowercase_name_timestamp`
   */
  static generateEnemyId(enemyName: string): string {
    return (
      enemyName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now()
    );
  }

  // ── Internal ──────────────────────────────────────

  private static getProvider(chapter: number): ChapterEnemyProvider {
    const provider = CHAPTER_PROVIDERS[chapter];
    if (!provider) {
      console.warn(
        `[EnemySelectionSystem] No provider for chapter ${chapter}, defaulting to chapter 1`
      );
      return CHAPTER_PROVIDERS[1];
    }
    return provider;
  }

  private static getTierFromNodeType(nodeType: string): EnemyTier {
    switch (nodeType) {
      case "elite":
        return "elite";
      case "boss":
        return "boss";
      case "common":
      case "combat":
      default:
        return "common";
    }
  }
}
