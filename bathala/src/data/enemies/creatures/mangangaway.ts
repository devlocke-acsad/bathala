/**
 * Mangangaway — Elite Act 1 Enemy
 * Lore: Sorcerers wearing skull necklaces who cast evil spells and hexes.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const MANGANGAWAY: EnemyConfig = {
  id: 'mangangaway',
  name: 'Mangangaway',
  tier: 'elite',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 300,
  damage: 33,
  attackPattern: ['weaken', 'poison', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'mangangaway_combat',
  overworldSpriteKey: 'mangangaway_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, poisons, attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: "Your ancestors' stories are my weapons now!",
    defeat: 'My hexes... unravel...',
    spare: 'My hexes fade… mangangaway were healers once. The engkanto turned cures into curses. Take the Shard — the earth sings again.',
    slay: 'Your strength mirrors the impostor\'s. The Shard is yours… but its soul weeps.',
  },

  // === Lore ===
  lore: {
    description: 'Sorcerers wearing skull necklaces who cast evil spells and hexes. Once healers who broke kapwa\'s sacred laws.',
    origin: 'Tagalog, witches (Eugenio, 2001)',
    reference: 'Aswang Project – Skull-necklace bruha',
  },
};
