/**
 * Sirena Illusionist — Common Act 2 Enemy
 * Lore: Enchanting mermaids who use illusions and healing magic.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SIRENA_ILLUSIONIST: EnemyConfig = {
  id: 'sirena_illusionist',
  name: 'Sirena Illusionist',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 240,
  damage: 18,
  attackPattern: ['heal', 'stun', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'sirena_combat',
  overworldSpriteKey: 'sirena_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 10, description: 'Heals and stuns', icon: '💚' },

  // === Dialogue ===
  dialogue: {
    intro: 'Songs lure to deep!',
    defeat: 'My melody... fades...',
    spare: 'Mercy sings: Sirena, benevolent guardians, corrupted by false tides (Ramos, 1990).',
    slay: 'Silence my voice—fuel for shadow!',
  },

  // === Lore ===
  lore: {
    description: 'Enchanting mermaids who use illusions and healing magic. Once benevolent guardians of coastal waters.',
    origin: 'General, mermaids (Eugenio, 2001)',
    reference: 'Aswang Project – Lurers',
  },
};
