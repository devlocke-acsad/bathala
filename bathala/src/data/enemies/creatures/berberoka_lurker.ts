/**
 * Berberoka Lurker — Common Act 2 Enemy
 * Lore: Water creature that swallows victims whole, lurking in rivers.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BERBEROKA_LURKER: EnemyConfig = {
  id: 'berberoka_lurker',
  name: 'Berberoka Lurker',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 256,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'defend'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'berberoka_combat',
  overworldSpriteKey: 'berberoka_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then attacks defensively', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'The river looks shallow, does it not? Come closer. Dip your feet in. The berberoka of Apayao knows patience — I swallow the water around my prey to make the riverbed seem safe, then RELEASE it all at once. The engkanto taught me to be greedier. Now I swallow everything: water, hope, and the foolish who trust still ponds.',
    defeat: 'My waters... recede for the last time. The riverbed is exposed, and there — do you see? The bones of fish I used to catch and share with the riverside villages. Before the corruption, I was the Apayao people\'s strange, terrifying fisherman. Not kind, but... useful.',
    spare: 'Pity for the lurker of rivers? Then know what the Apayao people know: the berberoka is a creature of the deep pools, enormous and capable of changing its size. We would swallow river water to trap fish, then release the flood. Dangerous? Yes. But the riverside communities learned to read our swelling as a sign of abundant catches nearby. The engkanto expanded our appetite beyond fish. Your mercy reminds me of smaller hungers.',
    slay: 'Drain my essence — and the rivers of Apayao lose their most ancient presence! The pools I haunted will grow still and lifeless, for even a monster can be part of an ecosystem. The engkanto\'s deceit outlives me!',
  },

  // === Lore ===
  lore: {
    description: 'Water creature that swallows victims whole, lurking in rivers and changing size to trap prey.',
    origin: 'Apayao, water suckers (Samar, 2019)',
    reference: 'Aswang Project – Size-changers',
  },
};
