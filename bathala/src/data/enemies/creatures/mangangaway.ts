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
    intro: 'Fates reverse at my command!',
    defeat: 'My hexes... unravel...',
    spare: 'Grace spares: Mangangaway, sorcerers casting evil spells (Ramos, 1990).',
    slay: 'End my curses—fuel for false god!',
  },

  // === Lore ===
  lore: {
    description: 'Sorcerers wearing skull necklaces who cast evil spells and hexes. Once healers who broke kapwa\'s sacred laws.',
    origin: 'Tagalog, witches (Eugenio, 2001)',
    reference: 'Aswang Project – Skull-necklace bruha',
  },
};
