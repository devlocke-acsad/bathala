/**
 * Act 1 Configuration: The Corrupted Ancestral Forests
 * 
 * @module Act1Config
 * @description Configuration for Chapter 1 per GDD v5.8.14.25
 * 
 * Theme: In balete groves—portals to anito realms where Bathala's breath 
 * birthed earth and winds carried omens—the engkanto's lies twist guardians 
 * into deceivers.
 * 
 * Elemental Focus: Lupa (Earth) / Hangin (Wind)
 */

import { ActConfig, GeneratorType } from '../../core/types/ActTypes';
import { Suit } from '../../core/types/CombatTypes';

/**
 * Act 1: The Corrupted Ancestral Forests
 * 
 * Gameplay:
 * - Day: Neutral enemies, attune relics
 * - Night: Aggressive enemies, face trials
 * - 5 cycles (500 actions) to summon boss
 * 
 * @constant
 */
export const ACT1_CONFIG: ActConfig = {
  id: 1,
  name: 'Chapter 1',
  subtitle: 'The Corrupted Ancestral Forests',
  
  theme: {
    primaryElements: ['Lupa', 'Hangin'] as readonly Suit[],
    colorPalette: {
      primary: 0x2d4a3e,    // Forest green
      secondary: 0x1a2f26,  // Dark foliage
      accent: 0x77888c      // Mist grey
    }
  },
  
  // === Generation ===
  generatorType: GeneratorType.MAZE,
  generatorConfig: {
    chunkSize: 32,
    pathWidth: 1,
    roomChance: 0.15
  },
  
  // === Enemy References (IDs for lazy loading) ===
  // Common enemies: HP 18-35, basic patterns
  commonEnemyIds: [
    'tikbalang_scout',    // HP: 28, Confuses targeting
    'balete_wraith',      // HP: 22, Vulnerable, gains Strength
    'sigbin_charger',     // HP: 35, Burst every 3 turns
    'duwende_trickster',  // HP: 18, Disrupts draw, steals block
    'tiyanak_ambusher',   // HP: 25, Criticals, Fear
    'amomongo',           // HP: 24, Claws bleed, fast attacks
    'bungisngis'          // HP: 30, Laugh debuff, high swings
  ],
  
  // Elite enemies: HP 60-300, special mechanics
  eliteEnemyIds: [
    'tawong_lipod',   // HP: 60, Invisible stuns, Air benefits
    'mangangaway'     // HP: 300, Mimics elements, curses cards
  ],
  
  // Boss: HP 600, AoE Burn, summon minions
  bossId: 'kapre_shade',
  
  // === Event References ===
  eventIds: [
    'anito_shrine',       // Day: Grants relic/potion
    'balete_vision',      // Night: Attune deck
    'diwata_whisper',     // Grants potion
    'forgotten_altar',    // Sculpt deck
    'tikbalang_crossroads', // Night: Choose reward
    'ancestral_echo',     // Grants Fragments
    'kapres_smoke',       // Night: Offers relic
    'wind_omen',          // Day: Upgrades card
    'sacred_grove',       // Grants potion
    'tiyanak_wail'        // Night: Choose sculpt/reward
  ],
  
  // === Relic References ===
  relicIds: [
    'tikbalangs_hoof',    // +10% dodge
    'balete_root',        // +2 block per Lupa card
    'sigbin_heart',       // +5 damage on burst
    'duwende_charm',      // +10% avoid Weak
    'tiyanak_tear',       // Ignore 1 Fear
    'amomongo_claw',      // +3 bleed damage
    'bungisngis_grin',    // +5 damage on debuff
    'kapres_cigar',       // Summons minion once per combat
    'wind_veil',          // +1 draw on Air cards
    'mangangaway_wand'    // Ignore 1 curse
  ],
  
  // === Assets ===
  backgroundKey: 'forest_bg',
  musicKey: 'overworld_ambient',
  ambientSounds: ['forest_ambient', 'wind_whispers'],
  
  // === Progression ===
  requiredCyclesToBoss: 5,  // 5 day-night cycles
  actionsPerCycle: 100      // 50 day + 50 night actions
};
