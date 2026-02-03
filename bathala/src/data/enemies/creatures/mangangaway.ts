/**
 * Mangangaway - Witch/Sorcerer Boss
 * 
 * @module Mangangaway
 * @description Powerful sorcerer who weaves hexes and curses
 * 
 * Mythological Source:
 * - Origin: Tagalog, witches (Eugenio, 2001)
 * - Reference: Aswang Project – Skull-necklace bruha
 * 
 * Lore: Mangangaway are practitioners of dark magic, once healers who turned
 * to malevolent sorcery. They cast hexes and curses upon those who wrong
 * their communities. The Mangangaway boss wears a necklace of cursed bones
 * and commands the Hex of Reversal.
 * 
 * BOSS - Chapter 1 Final Boss
 */

import { BossConfig } from '../../../core/types/EnemyTypes';

export const MANGANGAWAY: BossConfig = {
  // === Identity ===
  id: 'mangangaway',
  name: 'Mangangaway',
  tier: 'boss',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 120,
  baseDamage: 15,
  
  // === Combat Behavior ===
  attackPatternType: 'adaptive',
  attackPattern: ['curse_card', 'mimic_element', 'attack', 'hex_reversal'],
  abilities: ['hex_of_reversal', 'curse_cards', 'mimic_element'],
  
  // === Elemental ===
  elementalWeakness: null,  // Adapts to player's element
  elementalResistance: null,
  
  // === Overworld Behavior ===
  pathingType: 'stationary',
  detectionRange: 0,  // Boss room only
  activeAtNight: true,
  activeAtDay: true,
  
  // === Visuals ===
  spriteKey: 'chap1/boss_mangangaway',
  portraitKey: 'chap1/portrait_mangangaway',
  scale: 2.0,
  
  // === Dialogue ===
  dialogueIntro: "Fates reverse at my command!",
  dialogueDefeat: "My hexes... unravel...",
  dialogueSpare: "Grace spares: Mangangaway, sorcerers casting evil spells.",
  dialogueSlay: "End my curses—fuel for false god!",
  dialogueHalfHealth: "You think you can defeat me? I am the weaver of fates!",
  
  // === Lore ===
  loreOrigin: "Tagalog, witches",
  loreReference: "Aswang Project – Skull-necklace bruha",
  loreDescription: "Mangangaway were once healers who turned to dark magic, casting hexes and curses upon those who wronged their communities. They are said to wear necklaces of bones and can reverse fortune itself.",
  
  // === Boss-Specific ===
  phases: [
    {
      id: 1,
      healthThreshold: 1.0,
      attackPattern: ['curse_card', 'attack', 'attack', 'mimic_element'],
      abilities: ['hex_of_reversal', 'curse_cards'],
      dialogue: "Fates reverse at my command!"
    },
    {
      id: 2,
      healthThreshold: 0.5,
      attackPattern: ['hex_reversal', 'curse_card', 'mimic_element', 'attack', 'curse_card'],
      abilities: ['hex_of_reversal', 'curse_cards', 'mimic_element'],
      dialogue: "You think you can defeat me? I am the weaver of fates!",
      modifiers: {
        damageMultiplier: 1.25,
        speedMultiplier: 1.2
      }
    }
  ],
  
  signatureMechanic: 'hex_of_reversal',
  
  arenaModifiers: {
    ambientTint: 0x4a1a4a,  // Dark purple
    screenShake: 0.3,
    particles: 'dark_magic'
  },
  
  bossMusic: 'boss_mangangaway'
};
