/**
 * Ekek — Common Act 3 Enemy
 * Lore: Bird-like vampiric creature that hunts at night.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const EKEK: EnemyConfig = {
  id: 'ekek',
  name: 'Ekek',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 176,
  damage: 21,
  attackPattern: ['attack', 'weaken', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'ekek_combat',
  overworldSpriteKey: 'ekek_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Attacks, weakens, attacks', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Blood calls from skies!',
    defeat: 'My thirst... quenches...',
    spare: 'Compassion reveals: Ekek, bird vampires sucking tongues (Ramos, 1990).',
    slay: 'Drain my life—impostor rises!',
  },

  // === Lore ===
  lore: {
    description: 'Bird-like vampiric creature that hunts at night, feeding on blood and tongues of sleeping victims.',
    origin: 'General, nocturnal suckers (Eugenio, 2001)',
    reference: 'Aswang Project – Tongue-suckers',
  },
};
