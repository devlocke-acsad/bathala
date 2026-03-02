/**
 * Sarimanok Keeper — Common Act 3 Enemy
 * Lore: The legendary bird of good fortune, now twisted to serve the false god.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SARIMANOK_KEEPER: EnemyConfig = {
  id: 'sarimanok_keeper',
  name: 'Sarimanok Keeper',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 240,
  damage: 24,
  attackPattern: ['weaken', 'strengthen', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'sarimanok_combat',
  overworldSpriteKey: 'sarimanok_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, strengthens, attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'My plumage shields the false one\'s throne — every feather a stolen fortune, every color a corrupted blessing! I am the sarimanok, the legendary bird of Maranao prosperity! My ornate wings once brought good luck wherever I flew. Now the engkanto has gilded my cage and called it freedom!',
    defeat: 'My fortune... lost like gold scattered in the wind. The ornate feathers dim, and beneath the splendor I am just a bird — small, trembling, far from the Mindanao lakes where the Maranao artisans carved my image into everything beautiful...',
    spare: 'Compassion reveals what is hidden! The sarimanok is the legendary bird of Maranao art and culture — symbol of prosperity, good fortune, and divine favor. Every graceful curve, every vibrant color of my plumage appears in Maranao okir designs, boat prows, and royal houses. We embodied the beauty of creation itself. The engkanto captured that beauty and weaponized it. Your mercy frees the fortune bird to fly true again.',
    slay: 'Pluck my feathers — and the shadow rises as Maranao art loses its muse! Every sarimanok destroyed is prosperity ripped from a people who celebrated beauty as devotion. The false god\'s throne grows more opulent with every fortune it steals!',
  },

  // === Lore ===
  lore: {
    description: 'The legendary bird of good fortune, now twisted to serve the false god. Symbol of Maranao prosperity.',
    origin: 'Maranao, prosperity omens (Ramos, 1990)',
    reference: 'Aswang Project – Mindanao pantheon',
  },
};
