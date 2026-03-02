/**
 * Berbalang — Common Act 2 Enemy
 * Lore: Vampire-like creature that can separate its upper body to hunt.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BERBALANG: EnemyConfig = {
  id: 'berbalang',
  name: 'Berbalang',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 208,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'berbalang_combat',
  overworldSpriteKey: 'berbalang_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then double attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Ghoul hunger rises from the depths of Sulu! I am the berbalang — I who can split my spirit from my body and send it hunting through the dark. The drowned are my feast, the shipwrecked my banquet. The engkanto taught me to hunger for the living as well as the dead!',
    defeat: 'My spirit... scatters like ash on the water. The astral form collapses back into flesh that no longer moves. In the stillness, I remember: the berbalang once held vigil over the dead, ensuring their passage to the afterlife. We were undertakers of the sea, not desecrators...',
    spare: 'Compassion for the corpse-eater? Then hear what Sulu\'s elders knew: the berbalang are astral hunters, able to separate their upper bodies to hunt. Terrifying, yes — but our original purpose was sacred. We consumed the dead so their spirits could travel freely to the afterlife. We were the sea\'s funeral rites. The engkanto turned our sacred consumption into endless hunger. Your mercy... it tastes like the last meal I ate with purpose.',
    slay: 'Consume my form — and the impostor grows fat on a ghoul\'s essence! The dead of Sulu\'s waters will drift without passage, their spirits trapped between worlds. Every berbalang destroyed is an afterlife pathway sealed!',
  },

  // === Lore ===
  lore: {
    description: 'Vampire-like creature that can separate its upper body to hunt. Feeds on corpses and the drowned.',
    origin: 'Sulu, astral hunters (Eugenio, 2001)',
    reference: 'Aswang Project – Corpse-eaters',
  },
};
