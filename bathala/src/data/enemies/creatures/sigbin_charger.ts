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
    intro: 'Smell that? The stench of fear! I am the sigbin — the hearts I steal now feed a darker master than any amulet ever did!',
    defeat: 'My heart... the one I should have kept... it beats slower now. The charge falters. I remember when my purpose was to gather hearts for sacred amulets — offerings to Bathala, not weapons for a false god...',
    spare: 'You show compassion to a heart-thief? Then know this: the sigbin were once loyal servants of the divine, gathering hearts not in cruelty but in sacred duty. The Visayan tradition tells that our stolen hearts became amulets of protection — anting-anting blessed by Bathala himself. The engkanto perverted our purpose, turned protection into predation. Your mercy reaches deeper than any stolen heart.',
    slay: 'Slay me and claim the power the shadow promises! But every heart the sigbin steals returns to feed the false god\'s amulets of corruption. My death is just another offering on the impostor\'s altar!',
  },

  // === Lore ===
  lore: {
    description: 'Goat-like nocturnal creatures that walk backward and collect hearts for dark amulets.',
    origin: 'Visayan, goat-like eaters (Ramos, 1990)',
    reference: 'Aswang Project – Nocturnal stench-emitters',
  },
};
