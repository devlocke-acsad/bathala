/**
 * Apolaki Godling — Elite Act 3 Enemy
 * Lore: Lesser manifestation of Apolaki, god of sun and war.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const APOLAKI_GODLING: EnemyConfig = {
  id: 'apolaki_godling',
  name: 'Apolaki Godling',
  tier: 'elite',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 510,
  damage: 36,
  attackPattern: ['strengthen', 'attack', 'weaken', 'attack', 'poison'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'apolaki_combat',
  overworldSpriteKey: 'apolaki_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 2, description: 'Strengthens, attacks, weakens, attacks, burns', icon: '💪' },

  // === Dialogue ===
  dialogue: {
    intro: "Sun's wrath challenges you!",
    defeat: 'My light... dims...',
    spare: 'Pity uncovers: Apolaki, war/sun deity rivaling Mayari (Jocano, 1969).',
    slay: 'Eclipse my form—fuel for deceit!',
  },

  // === Lore ===
  lore: {
    description: 'Lesser manifestation of Apolaki, god of sun and war. Corrupted by the false Bathala to guard the citadel.',
    origin: "Tagalog, Bathala's son (Eugenio, 2001)",
    reference: 'Aswang Project – Moon feud',
  },
};
