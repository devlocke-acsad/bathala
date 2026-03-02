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
    intro: 'Blood calls from the night sky! I am ekek — the bird-vampire. My tongue finds the pulse, and the feeding begins. The darkness makes all voices sound like truth.',
    defeat: 'My thirst... quenches at last. The vampiric urge recedes like a tide pulling back from shore. In the moonlight, I see my reflection in a puddle — not a monster, but a night bird. Once, my nocturnal flights were simply that: flights. The ekek hunted insects, not people. When did the hunger change?',
    spare: 'Compassion stills the night hunter! The ekek are bird-like vampiric creatures of Filipino night mythology — relations of the more fearsome manananggal. Our long tongues and nocturnal habits made us terrifying, but in the oldest stories, we were simply creatures of the dark — no more evil than the owl or the bat. The engkanto cultivated our hunger, turning insect-catching into blood-drinking. Your mercy breaks the feeding cycle.',
    slay: 'Drain my life — and the impostor rises on wings of stolen blood! The night sky grows emptier and more dangerous without the ekek. We were the darkness\'s own creatures — fearsome, yes, but part of the balance between day and night. Without us, the night has no voice!',
  },

  // === Lore ===
  lore: {
    description: 'Bird-like vampiric creature that hunts at night, feeding on blood and tongues of sleeping victims.',
    origin: 'General, nocturnal suckers (Eugenio, 2001)',
    reference: 'Aswang Project – Tongue-suckers',
  },
};
