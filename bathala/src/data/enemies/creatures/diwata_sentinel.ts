/**
 * Diwata Sentinel — Common Act 3 Enemy
 * Lore: Divine nature spirits corrupted to guard the false god's citadel.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const DIWATA_SENTINEL: EnemyConfig = {
  id: 'diwata_sentinel',
  name: 'Diwata Sentinel',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 304,
  damage: 27,
  attackPattern: ['defend', 'attack', 'defend'],
  elementalAffinity: { weakness: 'fire', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'diwata_combat',
  overworldSpriteKey: 'diwata_overworld',

  // === Intent ===
  intent: { type: 'defend', value: 10, description: 'Defends, attacks, defends', icon: '⛨' },

  // === Dialogue ===
  dialogue: {
    intro: 'Sky wards against intruders!',
    defeat: 'My guard... falters...',
    spare: 'Grace protects: Diwata, divine guardians owning deer/fish (Ramos, 1990).',
    slay: 'Banish my form—impostor thrives!',
  },

  // === Lore ===
  lore: {
    description: "Divine nature spirits corrupted to guard the false god's citadel. Once guardians of sacred groves.",
    origin: 'Visayan, protectors (Eugenio, 2001)',
    reference: 'Aswang Project – Nature deities',
  },
};
