/**
 * Bulalakaw Flamewings — Common Act 3 Enemy
 * Lore: Meteor spirits that streak across the sky, burning with celestial fire.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BULALAKAW_FLAMEWINGS: EnemyConfig = {
  id: 'bulalakaw_flamewings',
  name: 'Bulalakaw Flamewings',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 264,
  damage: 27,
  attackPattern: ['poison', 'attack', 'defend'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'bulalakaw_combat',
  overworldSpriteKey: 'bulalakaw_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Burns, attacks, defends', icon: '☠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Comets blaze your doom!',
    defeat: 'My streak... fades...',
    spare: 'Pity uncovers: Bulalakaw, comet-like omen birds (Ramos, 1990).',
    slay: 'Quench my fire—fuel for deceit!',
  },

  // === Lore ===
  lore: {
    description: 'Meteor spirits that streak across the sky, burning with celestial fire. Omens of illness and disaster.',
    origin: 'General, sky streakers (Eugenio, 2001)',
    reference: 'Aswang Project – Illness omens',
  },
};
