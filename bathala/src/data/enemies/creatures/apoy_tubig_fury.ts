/**
 * Apoy-Tubig Fury — Elite Act 2 Enemy
 * Lore: Elemental fusion of fire and water, unstable and dangerous.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const APOY_TUBIG_FURY: EnemyConfig = {
  id: 'apoy_tubig_fury',
  name: 'Apoy-Tubig Fury',
  tier: 'elite',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 408,
  damage: 30,
  attackPattern: ['poison', 'attack', 'heal', 'attack'],
  elementalAffinity: { weakness: null, resistance: null },

  // === Visuals ===
  combatSpriteKey: 'apoytubig_combat',
  overworldSpriteKey: 'apoytubig_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Burns, attacks, heals, attacks', icon: '☠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Elements clash in fury!',
    defeat: 'My balance... breaks...',
    spare: 'Pity reveals: Elementals, feuding fire-water forces (Jocano, 1969).',
    slay: 'Quench my flames—fuel for deceit!',
  },

  // === Lore ===
  lore: {
    description: 'Elemental fusion of fire and water. Unstable and dangerous, representing the duality of Act 2.',
    origin: 'Visayan, elemental conflicts (Eugenio, 2001)',
    reference: 'Aswang Project – Elemental assistants',
  },
};
