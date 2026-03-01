/**
 * Bakunawa — Boss Act 2 Enemy
 * Lore: The great serpent who devours the moon, causing eclipses.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BAKUNAWA: EnemyConfig = {
  id: 'bakunawa',
  name: 'Bakunawa',
  tier: 'boss',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 900,
  damage: 42,
  attackPattern: ['weaken', 'attack', 'strengthen', 'attack', 'poison'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'bakunawa_combat',
  overworldSpriteKey: 'bakunawa_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Weakens, attacks, strengthens, attacks, burns', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Seven moons devoured! The impostor promised freedom — but there is only hunger!',
    defeat: 'My hunger... sated...',
    spare: 'You didn\'t kill me? Bakunawa guarded the night once. The engkanto promised moon-eating meant freedom. Lies. Take the Shard — let the waters remember.',
    slay: 'You killed the moon-eater. But my hunger becomes yours now. The Shard is yours. Its price, too.',
  },

  // === Lore ===
  lore: {
    description: 'The great serpent who devours the moon, causing eclipses. The lunar devourer of the submerged depths.',
    origin: 'Bicolano/Visayan, eclipse serpent (Eugenio, 2001)',
    reference: 'Aswang Project – Moon-swallower',
  },
};
