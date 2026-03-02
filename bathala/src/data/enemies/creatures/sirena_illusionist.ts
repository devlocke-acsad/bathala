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
    intro: 'Do you hear my song? It once guided fishermen safely home. The engkanto rewrote my lyrics — now it lures you to depths where the current has teeth.',
    defeat: 'My melody... fades like foam on the shore. The enchantment breaks, and through the silence I remember the old songs — the ones that healed sick children and calmed raging seas. Was there ever a time when my voice was a gift?',
    spare: 'You spare the songstress of the deep? Then listen — truly listen. The sirena were once the most benevolent of sea spirits, guardians of coastal waters who sang to calm storms and guide the lost. Filipino fishermen would leave offerings for our protection. The engkanto corrupted our melodies, turning comfort into compulsion, guidance into luring. Your mercy restores a note of the old song.',
    slay: 'Silence my voice — and the seas lose their oldest lullaby! Every sirena you kill is a song the ocean will never sing again, and the impostor feasts on the silence that follows!',
  },

  // === Lore ===
  lore: {
    description: 'Enchanting mermaids who use illusions and healing magic. Once benevolent guardians of coastal waters.',
    origin: 'General, mermaids (Eugenio, 2001)',
    reference: 'Aswang Project – Lurers',
  },
};
