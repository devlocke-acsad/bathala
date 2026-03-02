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
    intro: 'Two elements FORCED together by the engkanto\'s cruelty! Fire drowning in water! Water boiling in flame! We are that war made flesh!',
    defeat: 'My balance... breaks at last. The fire and water separate, and in their parting, a moment of peace. Steam rises like a prayer. This is what the elements were meant to do — not clash, but transform. Fire heats water into clouds. Water tames fire into warmth. We were never enemies...',
    spare: 'Pity reveals the truth beneath the fury! In Jocano\'s cosmogony, the elements were Bathala\'s assistants — forces of creation, not destruction. Fire warmed the world. Water gave it life. Together they made steam, rain, seasons, growth. The engkanto forced us into opposition, turning synergy into combat. Your mercy allows us to remember: we are not enemies. We are partners in creation.',
    slay: 'Quench our flames and boil our waters — and the natural balance of the world tips further into chaos! The engkanto\'s deceit wins when creation\'s forces destroy each other instead of building together!',
  },

  // === Lore ===
  lore: {
    description: 'Elemental fusion of fire and water. Unstable and dangerous, representing the duality of Act 2.',
    origin: 'Visayan, elemental conflicts (Eugenio, 2001)',
    reference: 'Aswang Project – Elemental assistants',
  },
};
