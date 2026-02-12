/**
 * Berbalang — Common Act 2 Enemy
 * Lore: Vampire-like creature that can separate its upper body to hunt.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BERBALANG: EnemyConfig = {
  id: 'berbalang',
  name: 'Berbalang',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 208,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'berbalang_combat',
  overworldSpriteKey: 'berbalang_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then double attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Ghoul hunger rises from depths!',
    defeat: 'My spirit... scatters...',
    spare: 'Compassion spares: Berbalang, ghouls feeding on drowned (Ramos, 1990).',
    slay: 'Consume my form—impostor grows!',
  },

  // === Lore ===
  lore: {
    description: 'Vampire-like creature that can separate its upper body to hunt. Feeds on corpses and the drowned.',
    origin: 'Sulu, astral hunters (Eugenio, 2001)',
    reference: 'Aswang Project – Corpse-eaters',
  },
};
