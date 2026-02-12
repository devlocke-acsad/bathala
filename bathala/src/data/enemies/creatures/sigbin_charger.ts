/**
 * Sigbin Charger — Common Act 1 Enemy
 * Lore: Goat-like nocturnal creatures that walk backward and collect hearts.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SIGBIN_CHARGER: EnemyConfig = {
  id: 'sigbin_charger',
  name: 'Sigbin Charger',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 220,
  damage: 30,
  attackPattern: ['defend', 'attack', 'defend'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'sigbin_combat',
  overworldSpriteKey: 'sigbin_overworld',

  // === Intent ===
  intent: { type: 'defend', value: 5, description: 'Defends then attacks', icon: '⛨' },

  // === Dialogue ===
  dialogue: {
    intro: 'Charge for shadow throne!',
    defeat: 'My heart... stolen...',
    spare: 'Compassion uncovers: Sigbin steal hearts for amulets, once loyal to Bathala (Eugenio, 2001).',
    slay: 'Slay me—claim power for shadow!',
  },

  // === Lore ===
  lore: {
    description: 'Goat-like nocturnal creatures that walk backward and collect hearts for dark amulets.',
    origin: 'Visayan, goat-like eaters (Ramos, 1990)',
    reference: 'Aswang Project – Nocturnal stench-emitters',
  },
};
