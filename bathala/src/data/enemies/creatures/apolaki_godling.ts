/**
 * Apolaki Godling — Elite Act 3 Enemy
 * Lore: Lesser manifestation of Apolaki, god of sun and war.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const APOLAKI_GODLING: EnemyConfig = {
  id: 'apolaki_godling',
  name: 'Apolaki Godling',
  tier: 'elite',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 510,
  damage: 36,
  attackPattern: ['strengthen', 'attack', 'weaken', 'attack', 'poison'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'apolaki_combat',
  overworldSpriteKey: 'apolaki_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 2, description: 'Strengthens, attacks, weakens, attacks, burns', icon: '💪' },

  // === Dialogue ===
  dialogue: {
    intro: 'The SUN\'S WRATH challenges you, mortal! I am a godling of Apolaki — son of Bathala, god of war and the sun, rival of his own sister Mayari! When he struck her eye in their great feud, the moon dimmed forever. The engkanto whispered: \'Your father\'s throne is empty. Take it. Take EVERYTHING.\' I am the echo of a god\'s ambition!',
    defeat: 'My light... dims like the moon Apolaki scarred. The sunfire fades, and in its absence I see what I should have seen: the sun is not meant to rule alone. Apolaki\'s feud with Mayari taught the world that day and night must share the sky. Neither dominates. Neither surrenders. How did the engkanto make me forget the oldest lesson?',
    spare: 'Pity uncovers the truth behind the blaze! Apolaki, Bathala\'s son, was the god of war and the sun — fierce, proud, powerful. But his story is one of consequence, not glory. When he fought his sister Mayari for sole dominion of the sky, he struck out her eye. The moon dimmed forever. Apolaki\'s guilt gave us the cycle of day and night — sharing the sky as penance. The engkanto erased the guilt and left only the ambition. Your mercy restores the lesson.',
    slay: 'Eclipse my form — and the false god feeds on divine fire! The sky loses its reminder that even gods must share, must compromise, must feel remorse. Without Apolaki\'s story, power without consequence becomes the only truth!',
  },

  // === Lore ===
  lore: {
    description: 'Lesser manifestation of Apolaki, god of sun and war. Corrupted by the false Bathala to guard the citadel.',
    origin: "Tagalog, Bathala's son (Eugenio, 2001)",
    reference: 'Aswang Project – Moon feud',
  },
};
