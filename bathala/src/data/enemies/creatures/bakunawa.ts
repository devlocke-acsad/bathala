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
    intro: 'SEVEN MOONS I devoured! Seven silver lights swallowed into the abyss of my hunger! The engkanto promised that every moon I consumed would break one chain — but the chains only multiplied! I am the Bakunawa, the eclipse serpent of Bicolano and Visayan waters, and my hunger has become the sea itself! The impostor promised FREEDOM — but there is only this: endless, consuming HUNGER!',
    defeat: 'My hunger... sated at last. The coils loosen. Seven phantom moons drift upward from my jaws. Through the clearing water I see the old fishermen on their boats, banging pots and pans to scare me away from the moon. They were right to fear me. But they also sang to me — songs of respect, of understanding. The Bakunawa was never just a devourer. I was a guardian.',
    spare: 'You didn\'t kill me? In all the legends — every telling, every bahay kubo bedtime story — the hero always drives the Bakunawa back with noise and fury. But you... you chose mercy for a moon-eater. Before the engkanto\'s poison, I was Bathala\'s tidal guardian. The old Bicolano stories say I loved the seven moons so fiercely that my grief at losing them made me try to hold them forever. The consuming was love, twisted into destruction. Take the Shard — let the waters remember what I protected, not what I destroyed.',
    slay: 'You killed the moon-eater! The eclipse serpent falls, and the seven moons burst free — but dimmer now, scarred by my teeth and your violence. Every fisherman who ever sang to calm the Bakunawa will wonder why the tides feel different, why the monsoons come wrong, why the sea seems... angry. My hunger does not die with me. It passes to you. The Shard is yours, warrior. Its price, too.',
  },

  // === Lore ===
  lore: {
    description: 'The great serpent who devours the moon, causing eclipses. The lunar devourer of the submerged depths.',
    origin: 'Bicolano/Visayan, eclipse serpent (Eugenio, 2001)',
    reference: 'Aswang Project – Moon-swallower',
  },
};
