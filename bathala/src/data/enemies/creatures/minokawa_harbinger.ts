/**
 * Minokawa Harbinger — Common Act 3 Enemy
 * Lore: Giant bird that causes eclipses by swallowing the sun and moon.
 * Source: Jocano, 1969; Ramos, 1990; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const MINOKAWA_HARBINGER: EnemyConfig = {
  id: 'minokawa_harbinger',
  name: 'Minokawa Harbinger',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 224,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'defend'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'minokawa_combat',
  overworldSpriteKey: 'minokawa_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, attacks, defends', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'ECLIPSES DEVOUR THE LIGHT! I am the Minokawa — when I swallow the sun, darkness falls. The engkanto said: \'Swallow HOPE itself!\'',
    defeat: 'My maw... closes on emptiness. The celestial bodies I swallowed burn inside me — too bright, too beautiful to digest. The Bagobo people were right to beat their drums and shake their spears at the sky during eclipses. They weren\'t trying to scare me. They were reminding me: the light is not yours to keep.',
    spare: 'Mercy spares the devourer! The Minokawa of Bagobo mythology is a cosmic bird of immense size, responsible for eclipses by attempting to swallow the sun and moon. But in the original stories, the Minokawa was not evil — it was hungry, and its hunger was a natural force, like gravity or tide. The people\'s noise drove it away, and the cycle continued: swallow, release, darkness, light. The engkanto broke that cycle, teaching me to hold on and never release. Your mercy unclenches my beak.',
    slay: 'Swallow my essence — and the false god grows vast as the sky I once darkened! The Bagobo will beat their drums during the next eclipse and find... nothing. No cosmic bird to drive away. Just permanent darkness, unanswered!',
  },

  // === Lore ===
  lore: {
    description: 'Giant bird that causes eclipses by swallowing the sun and moon. Herald of the false god.',
    origin: 'Bagobo, cosmic devourers (Ramos, 1990)',
    reference: 'Aswang Project – Eclipse causers',
  },
};
