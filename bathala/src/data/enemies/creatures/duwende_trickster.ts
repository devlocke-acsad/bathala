/**
 * Duwende Trickster - Mound Goblin
 * 
 * @module DuwendeTrickster
 * @description Small earth spirit that grants boons or curses
 * 
 * Mythological Source:
 * - Origin: General, goblins (Ramos, 1990)
 * - Reference: Aswang Project – Magical omens
 * 
 * Lore: Duwende live in anthills, termite mounds, and the roots of large trees.
 * They can bestow good fortune or inflict illness on those who disturb their homes.
 * The engkanto's corruption has amplified their mischievous nature.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const DUWENDE_TRICKSTER: EnemyConfig = {
  // === Identity ===
  id: 'duwende_trickster',
  name: 'Duwende Trickster',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 18,
  baseDamage: 5,
  
  // === Combat Behavior ===
  attackPatternType: 'debuffer',
  attackPattern: ['disrupt_draw', 'steal_block', 'attack', 'disrupt_draw'],
  abilities: ['disrupt_draw', 'steal_block'],
  
  // === Elemental ===
  elementalWeakness: 'fire',
  elementalResistance: 'earth',
  
  // === Overworld Behavior ===
  pathingType: 'wander',
  detectionRange: 3,
  activeAtNight: true,
  activeAtDay: true,
  speedMultiplier: 0.8,
  
  // === Visuals ===
  spriteKey: 'chap1/duwende_trickster',
  scale: 0.7,
  
  // === Dialogue ===
  dialogueIntro: "Tricks abound in mounds!",
  dialogueDefeat: "My fortune... fades...",
  dialogueSpare: "Spare, learn: Duwende grant boons/curses, warped by engkanto lies.",
  dialogueSlay: "End my mischief—fuel for impostor!",
  
  // === Lore ===
  loreOrigin: "General, goblins",
  loreReference: "Aswang Project – Magical omens",
  loreDescription: "Duwende are small humanoid creatures, often classified as white (benevolent) or black (malevolent). Filipinos say 'Tabi tabi po' (excuse me) when passing areas where duwende might dwell, to avoid offending them."
};
