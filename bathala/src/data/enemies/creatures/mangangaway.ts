/**
 * Mangangaway — Elite Act 1 Enemy
 * Lore: Sorcerers wearing skull necklaces who cast evil spells and hexes.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const MANGANGAWAY: EnemyConfig = {
  id: 'mangangaway',
  name: 'Mangangaway',
  tier: 'elite',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 300,
  damage: 33,
  attackPattern: ['weaken', 'poison', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'mangangaway_combat',
  overworldSpriteKey: 'mangangaway_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, poisons, attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: "Fates reverse at MY command! See this necklace of skulls? Each one was a patient I could not save — before the engkanto whispered: 'Why heal when you can hex? Why mend when you can curse?' Your ancestors' stories are my weapons now, and every prayer I learned as a babaylan, I speak BACKWARDS!",
    defeat: 'My hexes... unravel like bandages from a wound long healed. The skull necklace grows quiet. Each bone remembers a name — a name I once spoke with tenderness, not malice. Was I truly a bruha, a mangkukulam? Or was I always the babaylan — the healer — buried under curses I never wanted to learn?',
    spare: 'You spare the witch? Then hear the truth that the engkanto buried beneath a hundred hexes: mangangaway were not born as sorcerers of evil. We were babaylan — community healers, spiritual guides, the bridge between the mortal world and the anito. The engkanto found our grief when we lost patients we loved, and whispered: "If healing fails, try its opposite." Curse by curse, we forgot who we were. Your mercy remembers for us.',
    slay: 'Your strength mirrors the impostor\'s own — crushing what you cannot understand! The skull necklace shatters, and its bones cry out: not in anger, but in sorrow. Every mangangaway destroyed is a healer the world will never recover. The Shard is yours... but listen — can you hear it weeping?',
  },

  // === Lore ===
  lore: {
    description: 'Sorcerers wearing skull necklaces who cast evil spells and hexes. Once healers who broke kapwa\'s sacred laws.',
    origin: 'Tagalog, witches (Eugenio, 2001)',
    reference: 'Aswang Project – Skull-necklace bruha',
  },
};
