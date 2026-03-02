/**
 * Siyokoy Raider — Common Act 2 Enemy
 * Lore: Aggressive male sea creatures with webbed limbs and scales.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SIYOKOY_RAIDER: EnemyConfig = {
  id: 'siyokoy_raider',
  name: 'Siyokoy Raider',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 320,
  damage: 27,
  attackPattern: ['defend', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'siyokoy_combat',
  overworldSpriteKey: 'siyokoy_overworld',

  // === Intent ===
  intent: { type: 'defend', value: 8, description: 'Defends then double attacks', icon: '⛨' },

  // === Dialogue ===
  dialogue: {
    intro: 'The scales you see are not just armor, surfacer — they are the weight of the drowned. I am siyokoy, merman of the deep trench, and my webbed hands have pulled hundreds beneath the waves. The engkanto promised that every soul I drag down would free one of my own. LIES — but the dragging feels true!',
    defeat: 'My fins... fail at last. The water grows still around me. Through the clearing depths I see the sunken barangay below — the homes, the boats, the toys of children. All drowned. All because I believed the engkanto\'s promise...',
    spare: 'Grace? For a siyokoy? We are the malevolent mermen of Filipino waters — webbed, scaled, created to be feared. But even we had a purpose once. The siyokoy patrolled the deep trenches, keeping ancient evils sealed beneath the ocean floor. We were jailors, not predators. The engkanto unlocked our prisoners and told us to join them. Your mercy... it tastes like clean water for the first time in ages.',
    slay: 'Drown my form — and the impostor rises from the depths I guarded! Every siyokoy you slay is a trench left unpatrolled, an ancient evil left unguarded. The sea remembers its wardens, even if you do not!',
  },

  // === Lore ===
  lore: {
    description: 'Aggressive male sea creatures with webbed limbs and scales. Warriors of the deep who drag victims beneath the waves.',
    origin: 'General, scaled drowners (Ramos, 1990)',
    reference: 'Aswang Project – Webbed predators',
  },
};
