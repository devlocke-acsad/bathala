/**
 * Tigmamanukan Watcher — Common Act 3 Enemy
 * Lore: Celestial prophetic bird that lives at the edge of creation.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIGMAMANUKAN_WATCHER: EnemyConfig = {
  id: 'tigmamanukan_watcher',
  name: 'Tigmamanukan Watcher',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 208,
  damage: 24,
  attackPattern: ['strengthen', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'tigmamanukan_combat',
  overworldSpriteKey: 'tigmamanukan_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 2, description: 'Strengthens then double attacks', icon: '💪' },

  // === Dialogue ===
  dialogue: {
    intro: 'Omens watch your path!',
    defeat: 'My flight... ends...',
    spare: 'Mercy foretells: Tigmamanukan, prophetic birds of Bathala (Jocano, 1969).',
    slay: 'Clip my wings—fuel for shadow!',
  },

  // === Lore ===
  lore: {
    description: 'Celestial prophetic bird that lives at the edge of creation. Once a divine messenger of Bathala.',
    origin: 'Tagalog, divination birds (Eugenio, 2001)',
    reference: 'Aswang Project – Celestial signs',
  },
};
