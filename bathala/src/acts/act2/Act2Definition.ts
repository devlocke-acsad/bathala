/**
 * Act 2 Definition — The Submerged Barangays
 *
 * Class-based act definition for Chapter 2 per GDD v5.8.14.25.
 * All act-specific content lives here: enemies, relics, events,
 * theme, assets, progression, and generator factory.
 *
 * Theme: Sunken barangays where Bathala's tears wove seas with merfolk,
 * engkanto's betrayals spark feuds, drowning kapwa in deceitful tides.
 *
 * Elemental Focus: Tubig (Water) / Apoy (Fire)
 *
 * @module Act2Definition
 */

import { Suit } from '../../core/types/CombatTypes';
import { IChunkGenerator, EnemyPoolEntry, NodeDistributionConfig, DEFAULT_NODE_DISTRIBUTION } from '../../core/types/GenerationTypes';
import { ActDefinition, ActTheme, ActAssets, ActProgression } from '../../core/acts/ActDefinition';
import { SubmergedVillageChunkAdapter } from '../../systems/generation/algorithms/submerged-village/SubmergedVillageChunkAdapter';

// Creature configs — single source of truth for names / sprites
import {
  SIRENA_ILLUSIONIST,
  SIYOKOY_RAIDER,
  SANTELMO_FLICKER,
  BERBEROKA_LURKER,
  MAGINDARA_SWARM,
  KATAW,
  BERBALANG,
  SUNKEN_BANGKILAN,
  APOY_TUBIG_FURY,
  BAKUNAWA,
} from '../../data/enemies/creatures';

// =========================================================================
// Act 2
// =========================================================================

export class Act2Definition extends ActDefinition {
  // === Identity ===
  readonly id = 2;
  readonly name = 'Chapter 2';
  readonly subtitle = 'The Submerged Barangays';

  // === Theme ===
  readonly theme: ActTheme = {
    primaryElements: ['Tubig', 'Apoy'] as readonly Suit[],
    colorPalette: {
      primary: 0x1a3a5c,    // Deep ocean blue
      secondary: 0x0d2137,  // Dark abyss
      accent: 0xc4563a,     // Fiery coral
    },
  };

  // === Assets (reusing forest assets as placeholders) ===
  readonly assets: ActAssets = {
    backgroundKey: 'forest_bg',         // Placeholder — will be replaced
    musicKey: 'overworld_ambient',      // Placeholder
    ambientSounds: ['forest_ambient'],  // Placeholder
    tilesetKey: 'forest_tileset',       // Placeholder — reuses forest tiles
    combatBackgroundKey: 'forest_combat_bg', // Placeholder
  };

  // === Progression ===
  readonly progression: ActProgression = {
    requiredCyclesToBoss: 5,
    actionsPerCycle: 100,
  };

  // === Enemy pools ===
  readonly commonEnemies: readonly EnemyPoolEntry[] = [
    { name: SIRENA_ILLUSIONIST.name },
    { name: SIYOKOY_RAIDER.name },
    { name: SANTELMO_FLICKER.name },
    { name: BERBEROKA_LURKER.name },
    { name: MAGINDARA_SWARM.name },
    { name: KATAW.name },
    { name: BERBALANG.name },
  ];

  readonly eliteEnemies: readonly EnemyPoolEntry[] = [
    { name: SUNKEN_BANGKILAN.name },
    { name: APOY_TUBIG_FURY.name },
  ];

  readonly bossEnemy: EnemyPoolEntry = {
    name: BAKUNAWA.name,
  };

  // === Events ===
  readonly eventIds: readonly string[] = [
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
    'sirenas_scale',
    'siyokoy_fin',
    'santelmo_ember',
    'berberoka_tide',
    'magindara_song',
    'kataw_crown',
    'berbalang_spirit',
    'bangkilan_veil',
    'elemental_core',
    'bakunawa_fang',
  ];

  // === Node distribution (village has slightly more events, shops) ===
  get nodeDistribution(): NodeDistributionConfig {
    return {
      ...DEFAULT_NODE_DISTRIBUTION,
      typeWeights: {
        combat: 5,
        elite: 0.4,
        shop: 1.5,
        event: 2.5,
        campfire: 1.2,
        treasure: 1,
      },
    };
  }

  // === Generator factory ===
  createGenerator(): IChunkGenerator {
    return new SubmergedVillageChunkAdapter({
      chunkSize: 20,
      // ── Zone layout ──
      villageSpacing: 3,     // villages appear more frequently, so forest gaps are shorter
      denseRadius: 0,        // center chunk is dense; surrounding chunks taper out
      transitionRadius: 1,   // 1-chunk transition ring around each village
      // ── Dense village ──
      denseHouseCount: 11,   // packed houses per dense chunk
      denseHouseSpacing: 1,  // 1-tile alleys between houses
      denseClearRadius: 1,   // clear forest 1 tile around each house
      // ── Transition ──
      transitionHouseCount: 5,
      transitionHouseSpacing: 1,
      // ── Forest ──
      forestHouseCount: 1,   // occasional isolated house so forest still feels inhabited
    });
  }
}

/** Singleton instance for convenience */
export const ACT2 = new Act2Definition();
