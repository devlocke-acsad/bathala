/**
 * Act 3 Definition — The Skyward Citadel
 *
 * Chapter 3 per GDD v5.8.14.25.
 * Multi-element focus with celestial enemies.
 */

import { Suit } from '../../core/types/CombatTypes';
import { IChunkGenerator, EnemyPoolEntry, NodeDistributionConfig, DEFAULT_NODE_DISTRIBUTION } from '../../core/types/GenerationTypes';
import { ActDefinition, ActTheme, ActAssets, ActProgression } from '../../core/acts/ActDefinition';
import { SkywardCitadelChunkAdapter } from '../../systems/generation/algorithms/skyward-citadel/SkywardCitadelChunkAdapter';

// Creature configs — single source of truth for names / sprites
import {
  TIGMAMANUKAN_WATCHER,
  DIWATA_SENTINEL,
  SARIMANOK_KEEPER,
  BULALAKAW_FLAMEWINGS,
  MINOKAWA_HARBINGER,
  ALAN,
  EKEK,
  RIBUNG_LINTI_DUO,
  APOLAKI_GODLING,
  FALSE_BATHALA,
} from '../../data/enemies/creatures';

export class Act3Definition extends ActDefinition {
  // === Identity ===
  readonly id = 3;
  readonly name = 'Chapter 3';
  readonly subtitle = 'The Skyward Citadel';

  // === Theme ===
  readonly theme: ActTheme = {
    primaryElements: ['Lupa', 'Tubig', 'Apoy', 'Hangin'] as readonly Suit[],
    colorPalette: {
      primary: 0xd4af37,    // Gold
      secondary: 0x2b163f,  // Deep purple
      accent: 0x8e44ad,     // Violet accent
    },
  };

  // === Assets ===
  readonly assets: ActAssets = {
    backgroundKey: 'forest_bg',         // TODO: Replace with sky_bg when available
    musicKey: 'overworld_ambient',      // TODO: Replace with skyward_ambient
    ambientSounds: ['forest_ambient', 'wind_whispers'],
    tilesetKey: 'cloud_tileset',        // Cloud platform tileset
    combatBackgroundKey: 'chap3_combat_bg',
  };

  // === Progression ===
  readonly progression: ActProgression = {
    requiredCyclesToBoss: 5,
    actionsPerCycle: 100,
  };

  // === Enemy pools ===
  readonly commonEnemies: readonly EnemyPoolEntry[] = [
    { name: TIGMAMANUKAN_WATCHER.name },
    { name: DIWATA_SENTINEL.name },
    { name: SARIMANOK_KEEPER.name },
    { name: BULALAKAW_FLAMEWINGS.name },
    { name: MINOKAWA_HARBINGER.name },
    { name: ALAN.name },
    { name: EKEK.name },
  ];

  readonly eliteEnemies: readonly EnemyPoolEntry[] = [
    { name: RIBUNG_LINTI_DUO.name },
    { name: APOLAKI_GODLING.name },
  ];

  readonly bossEnemy: EnemyPoolEntry = {
    name: FALSE_BATHALA.name,
  };

  // === Events ===
  readonly eventIds: readonly string[] = [
    // Reuse shared event ids until Act 3 gets bespoke events.
    'anito_shrine',
    'balete_vision',
    'diwata_whisper',
    'forgotten_altar',
    'tikbalang_crossroads',
    'ancestral_echo',
    'kapres_smoke',
    'wind_omen',
    'sacred_grove',
    'tiyanak_wail',
  ];

  // === Relics ===
  readonly relicIds: readonly string[] = [
    'tigmamanukan_feather',
    'diwata_veil',
    'sarimanok_plumage',
    'bulalakaw_spark',
    'minokawa_claw',
    'alan_wing',
    'ekek_fang',
    'linti_bolt',
    'apolaki_spear',
    'coconut_diwa',
  ];

  // === Node distribution (slightly more elites late-game) ===
  get nodeDistribution(): NodeDistributionConfig {
    return {
      ...DEFAULT_NODE_DISTRIBUTION,
      typeWeights: {
        combat: 5.5,
        elite: 0.6,
        shop: 1,
        event: 2,
        campfire: 1.1,
        treasure: 1.1,
      },
    };
  }

  createGenerator(): IChunkGenerator {
    return new SkywardCitadelChunkAdapter({
      chunkSize: 20,
      // ── Zone layout ──
      villageSpacing: 4,
      denseRadius: 0,
      transitionRadius: 1,
      // ── Dense citadel ──
      denseHouseCount: 12,
      denseHouseSpacing: 1,
      denseClearRadius: 1,
      // ── Transition ──
      transitionHouseCount: 4,
      transitionHouseSpacing: 1,
      // ── Forest ──
      forestHouseCount: 0,
    });
  }
}

/** Singleton instance for convenience */
export const ACT3 = new Act3Definition();

