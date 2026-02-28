/**
 * Act 1 Definition — The Corrupted Ancestral Forests
 * 
 * Class-based replacement for the plain ACT1_CONFIG object.
 * All act-specific content lives here: enemies, relics, events,
 * theme, assets, progression, and generator factory.
 * 
 * To edit Act 1 behaviour, modify this single file.
 * 
 * @module Act1Definition
 */

import { Suit } from '../../core/types/CombatTypes';
import { IChunkGenerator, EnemyPoolEntry, NodeDistributionConfig, DEFAULT_NODE_DISTRIBUTION } from '../../core/types/GenerationTypes';
import { ActDefinition, ActTheme, ActAssets, ActProgression } from '../../core/acts/ActDefinition';
import { MazeChunkGenerator } from '../../systems/generation/generators/MazeChunkGenerator';

// Creature configs — single source of truth for names / sprites
import {
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  KAPRE_SHADE,
  TAWONG_LIPOD,
  MANGANGAWAY,
} from '../../data/enemies/creatures';

// =========================================================================
// Act 1
// =========================================================================

export class Act1Definition extends ActDefinition {
  // === Identity ===
  readonly id = 1;
  readonly name = 'Chapter 1';
  readonly subtitle = 'The Corrupted Ancestral Forests';

  // === Theme ===
  readonly theme: ActTheme = {
    primaryElements: ['Lupa', 'Hangin'] as readonly Suit[],
    colorPalette: {
      primary: 0x2d4a3e,    // Forest green
      secondary: 0x1a2f26,  // Dark foliage
      accent: 0x77888c,     // Mist grey
    },
  };

  // === Assets ===
  readonly assets: ActAssets = {
    backgroundKey: 'forest_bg',
    musicKey: 'overworld_ambient',
    ambientSounds: ['forest_ambient', 'wind_whispers'],
    tilesetKey: 'forest_tileset',
    combatBackgroundKey: 'forest_combat_bg',
  };

  // === Progression ===
  readonly progression: ActProgression = {
    requiredCyclesToBoss: 5,
    actionsPerCycle: 100,
  };

  // === Enemy pools (names come from creature configs) ===
  readonly commonEnemies: readonly EnemyPoolEntry[] = [
    { name: TIKBALANG_SCOUT.name },
    { name: BALETE_WRAITH.name },
    { name: SIGBIN_CHARGER.name },
    { name: DUWENDE_TRICKSTER.name },
    { name: TIYANAK_AMBUSHER.name },
    { name: AMOMONGO.name },
    { name: BUNGISNGIS.name },
  ];

  readonly eliteEnemies: readonly EnemyPoolEntry[] = [
    { name: TAWONG_LIPOD.name },
    { name: MANGANGAWAY.name },
  ];

  readonly bossEnemy: EnemyPoolEntry = {
    name: KAPRE_SHADE.name,
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
    'tikbalangs_hoof',
    'balete_root',
    'sigbin_heart',
    'duwende_charm',
    'tiyanak_tear',
    'amomongo_claw',
    'bungisngis_grin',
    'kapres_cigar',
    'wind_veil',
    'mangangaway_wand',
  ];

  // === Node distribution (forest favours more combat encounters) ===
  get nodeDistribution(): NodeDistributionConfig {
    return {
      ...DEFAULT_NODE_DISTRIBUTION,
      typeWeights: {
        combat: 3,
        elite: 1,
        shop: 1,
        event: 2,
        campfire: 1,
        treasure: 1,
      },
    };
  }

  // === Generator factory ===
  createGenerator(): IChunkGenerator {
    return new MazeChunkGenerator({
      chunkSize: 20,
      regionCountMultiplier: 2,
      minRegionDistance: 3,
    });
  }
}

/** Singleton instance for convenience (same as old ACT1_CONFIG usage) */
export const ACT1 = new Act1Definition();
