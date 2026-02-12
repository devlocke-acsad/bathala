/**
 * Santelmo Flicker — Common Act 2 Enemy
 * Lore: Fire spirits appearing as floating flames near water.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SANTELMO_FLICKER: EnemyConfig = {
  id: 'santelmo_flicker',
  name: 'Santelmo Flicker',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 160,
  damage: 21,
  attackPattern: ['attack', 'defend', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'santelmo_combat',
  overworldSpriteKey: 'santelmo_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 21, description: 'Fast attacks with defense', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Flames ignite tides!',
    defeat: 'My light... dims...',
    spare: 'Compassion reveals: Santelmo, soul fires aiding gods (Jocano, 1969).',
    slay: 'Extinguish me—shadow grows!',
  },

  // === Lore ===
  lore: {
    description: "Fire spirits appearing as floating flames near water, based on St. Elmo's fire phenomenon.",
    origin: "Visayan, St. Elmo's fire (Eugenio, 2001)",
    reference: 'Aswang Project – Upper world assistants',
  },
};
