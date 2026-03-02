/**
 * Kapre Shade — Boss Act 1 Enemy
 * Lore: Massive tree-dwelling giants who smoke enormous cigars.
 * Once Bathala's appointed guardians of sacred groves, now the
 * engkanto's corruption has unleashed their ancient rage.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KAPRE_SHADE: EnemyConfig = {
  id: 'kapre_shade',
  name: 'Kapre Shade',
  tier: 'boss',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 600,
  damage: 42,
  attackPattern: ['strengthen', 'poison', 'attack', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'kapre_combat',
  overworldSpriteKey: 'kapre_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 42, description: 'Strengthens, poisons with smoke, then strikes', icon: '🔥' },

  // === Dialogue ===
  dialogue: {
    intro: 'You smell that smoke, little mortal? That is not just tabako burning — it is the scent of a forest that forgot its purpose. For a hundred years I sat in my acacia tree, guardian of every trail, watcher of every traveler. The engkanto came with honeyed lies: "Your vigil is thankless. Let the forest answer to YOU." And I listened. I AM the forest now — its rage, its fire, its choking shadow. Come. Burn with me.',
    defeat: 'My tree... my ancient, beloved tree... the cigar dims for the first time in an age. Through the thinning smoke I see them — the travelers I once protected, the children who left mangoes at my roots. I was their guardian. The engkanto\'s corruption doesn\'t excuse what I became... but perhaps it explains it.',
    spare: 'You spare the Kapre? Then sit with me a moment, in the shadow of what\'s left of my tree. The old stories are true — we were Bathala\'s appointed guardians of the sacred groves. Our smoke kept evil spirits away. Our enormous stature terrified those who would harm the forest. When travelers showed respect, we showed them the safest paths. The engkanto twisted our protectiveness into possessiveness. Your mercy lifts the corruption like morning mist.',
    slay: 'You burned my tree — the same tree where generations of fireflies nested, where lovers carved their names, where the anito crossed between worlds. The forest SCREAMS with a voice that remembers every root, every branch, every leaf you just destroyed. The Shard is yours... but the grove\'s anger will haunt you like cigar smoke that never clears.',
  },

  // === Lore ===
  lore: {
    description: 'Massive tree-dwelling giants who smoke enormous cigars. Once Bathala\'s appointed guardians of sacred groves, the engkanto\'s corruption has unleashed centuries of pent-up rage, turning their protective smoke into choking infernos.',
    origin: 'General, smokers (Eugenio, 2001)',
    reference: 'Aswang Project – Tree-lurkers',
  },
};
