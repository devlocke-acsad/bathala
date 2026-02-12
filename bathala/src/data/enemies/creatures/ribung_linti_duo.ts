/**
 * Ribung Linti Duo — Elite Act 3 Enemy
 * Lore: Twin lightning spirits that strike in perfect synchronization.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const RIBUNG_LINTI_DUO: EnemyConfig = {
  id: 'ribung_linti_duo',
  name: 'Ribung Linti Duo',
  tier: 'elite',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 270,
  damage: 30,
  attackPattern: ['attack', 'strengthen', 'attack', 'defend'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'ribunglinti_combat',
  overworldSpriteKey: 'ribunglinti_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 30, description: 'Attacks, strengthens, attacks, defends', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Storms strike in tandem!',
    defeat: 'Our thunder... silences...',
    spare: 'Mercy echoes: Ribung Linti, Ilocano lightning spirits (Samar, 2019).',
    slay: 'Shatter our bolts—false god grows!',
  },

  // === Lore ===
  lore: {
    description: 'Twin lightning spirits that strike in perfect synchronization. Ilocano storm beings of devastating power.',
    origin: 'Ilocano, storm beings (Ramos, 1990)',
    reference: 'Aswang Project – Thunder tormentors',
  },
};
