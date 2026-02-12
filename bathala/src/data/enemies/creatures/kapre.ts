/**
 * Kapre Shade — Elite Act 1 Enemy
 * Lore: Massive tree-dwelling giants who smoke enormous cigars.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KAPRE_SHADE: EnemyConfig = {
  id: 'kapre_shade',
  name: 'Kapre Shade',
  tier: 'elite',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 320,
  damage: 36,
  attackPattern: ['poison', 'strengthen', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'kapre_combat',
  overworldSpriteKey: 'kapre_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Poisons, strengthens, attacks', icon: '☠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Smoke veils my wrath!',
    defeat: 'My tree... falls...',
    spare: 'Compassion unlocks: Kapre, tree giants smoking cigars, loyal to Bathala (Ramos, 1990).',
    slay: 'Burn me down—shadow rises!',
  },

  // === Lore ===
  lore: {
    description: 'Massive tree-dwelling giants who smoke enormous cigars. Once loyal guardians of Bathala, now enslaved by engkanto deceit.',
    origin: 'General, smokers (Eugenio, 2001)',
    reference: 'Aswang Project – Tree-lurkers',
  },
};
