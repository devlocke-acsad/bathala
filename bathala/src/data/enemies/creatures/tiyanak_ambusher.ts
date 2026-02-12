/**
 * Tiyanak Ambusher — Common Act 1 Enemy
 * Lore: Demonic infants who mimic baby cries to lure travelers.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIYANAK_AMBUSHER: EnemyConfig = {
  id: 'tiyanak_ambusher',
  name: 'Tiyanak Ambusher',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 170,
  damage: 18,
  attackPattern: ['weaken', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'tiyanak_combat',
  overworldSpriteKey: 'tiyanak_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then double attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Wails lure to doom!',
    defeat: 'My cry... silenced...',
    spare: 'Mercy shows: Tiyanak, lost infant spirits mimicking babies to attack (Ramos, 1990).',
    slay: 'Slay innocent form—fuel for shadow!',
  },

  // === Lore ===
  lore: {
    description: 'Demonic infants who mimic the cries of abandoned babies to lure travelers into forest ambushes.',
    origin: 'General, demon babies (Eugenio, 2001)',
    reference: 'Aswang Project – Forest lurers',
  },
};
