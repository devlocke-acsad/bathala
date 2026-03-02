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
    intro: 'Our beauty veils our venom! Three voices sing as one — the magindara of Bicol. The engkanto showed us beauty is the cruelest weapon!',
    defeat: 'Our songs... end in dissonance. The swarm scatters, and in our separation we each remember: we were not always vicious. The Bicolano coastal people once spoke of magindara as protectors of the reef, our beauty a reflection of the ocean\'s own splendor...',
    spare: 'Mercy lures truth from the deep! The magindara — enchanting mermaids of Bicolano waters — were once protectors of coral and coastline. Our swarm traveled together in beauty and purpose, guarding the reefs from those who would destroy them. The engkanto whispered that beauty deserved tribute, and tribute became flesh. Your mercy breaks the enchantment. We remember the reef.',
    slay: 'Shatter our forms — and the shadow thrives on scattered beauty! Three voices silenced are three coral guardians lost. The reefs of Bicol will bleach and crumble without the magindara\'s ancient songs!',
  },

  // === Lore ===
  lore: {
    description: 'Beautiful mermaids with enchanting voices that travel in swarms. Once protective, now flesh-eaters.',
    origin: 'Bicolano, flesh-eaters (Ramos, 1990)',
    reference: 'Aswang Project – Enchanting drowners',
  },
};
