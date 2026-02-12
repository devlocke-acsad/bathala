/**
 * Magindara Swarm — Common Act 2 Enemy
 * Lore: Beautiful mermaids with enchanting voices that travel in swarms.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const MAGINDARA_SWARM: EnemyConfig = {
  id: 'magindara_swarm',
  name: 'Magindara Swarm',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 120,
  damage: 15,
  attackPattern: ['attack', 'heal'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'magindara_combat',
  overworldSpriteKey: 'magindara_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 15, description: 'Attacks then heals', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Beauty veils venom!',
    defeat: 'Our songs... end...',
    spare: 'Mercy lures truth: Magindara, vicious mermaids, once protective (Eugenio, 2001).',
    slay: 'Shatter our forms—shadow thrives!',
  },

  // === Lore ===
  lore: {
    description: 'Beautiful mermaids with enchanting voices that travel in swarms. Once protective, now flesh-eaters.',
    origin: 'Bicolano, flesh-eaters (Ramos, 1990)',
    reference: 'Aswang Project – Enchanting drowners',
  },
};
