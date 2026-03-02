/**
 * Bungisngis — Common Act 1 Enemy
 * Lore: One-eyed laughing giants once jovial, now driven to rage.
 * Source: Ramos, 1990; Jocano, 1969; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BUNGISNGIS: EnemyConfig = {
  id: 'bungisngis',
  name: 'Bungisngis',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 200,
  damage: 36,
  attackPattern: ['weaken', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'air', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'bungisngis_combat',
  overworldSpriteKey: 'bungisngis_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, attacks, strengthens', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'BWAHAHAHAHA! So small, so serious! I am the laughing giant with one eye! The engkanto taught me a new joke — where only I laugh at the end!',
    defeat: 'My grin... cracks. The laughter hollows out. With one eye I see the truth now — I was laughing to keep from crying. The engkanto turned my joy into madness, my mirth into menace...',
    spare: 'You spare the laughing giant? HA! ...no, not "ha." Thank you. The Tagalog and Cebuano elders spoke of the bungisngis as jovial one-eyed giants — strong enough to uproot trees, but laughing always, because the world delighted us. We were the comic relief of the spirit world. The engkanto poisoned our laughter, turned delight into delirium. Your mercy... it\'s the first thing that\'s made me smile — truly smile — in an age.',
    slay: 'Silence the mirth — and the forest grows quieter, colder, grimmer! Every bungisngis that falls is a laugh stolen from the world, fuel for the impostor\'s joyless throne!',
  },

  // === Lore ===
  lore: {
    description: "One-eyed laughing giants once jovial and friendly, now driven to rage by the engkanto's corruption.",
    origin: 'Tagalog/Cebuano, grinning giants (Ramos, 1990)',
    reference: 'Aswang Project – Strong laughers',
  },
};
