/**
 * Amomongo - Cave Ape Creature
 * 
 * @module Amomongo
 * @description Ape-like creature with long claws from Negros
 * 
 * Mythological Source:
 * - Origin: Visayan, cave-dweller (Ramos, 1990)
 * - Reference: Aswang Project – Negros terror
 * 
 * Lore: The Amomongo is a large, ape-like creature said to dwell in caves
 * on the island of Negros. It attacks livestock and occasionally humans,
 * using its long, sharp claws to rend flesh. Some believe it to be the
 * Philippine counterpart to Bigfoot.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const AMOMONGO: EnemyConfig = {
  // === Identity ===
  id: 'amomongo',
  name: 'Among Us',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 24,
  baseDamage: 7,
  
  // === Combat Behavior ===
  attackPatternType: 'aggressive',
  attackPattern: ['claw_attack', 'claw_attack', 'attack', 'claw_attack'],
  abilities: ['bleed_on_claw', 'fast_attacks'],
  
  // === Elemental ===
  elementalWeakness: 'fire',
  elementalResistance: 'earth',
  
  // === Overworld Behavior ===
  pathingType: 'chase',
  detectionRange: 4,
  activeAtNight: true,
  activeAtDay: true,
  speedMultiplier: 1.3,
  
  // === Visuals ===
  combatSpriteKey: 'amomongo_combat',
  overworldSpriteKey: 'amomongo_overworld',
  
  // === Dialogue ===
  dialogueIntro: "Nails rend unworthy!",
  dialogueDefeat: "My fury... breaks...",
  dialogueSpare: "Grace spares: Amomongo, ape-like with long nails, attacking livestock.",
  dialogueSlay: "Crush me—shadow lives on!",
  
  // === Lore ===
  loreOrigin: "Visayan, cave-dweller",
  loreReference: "Aswang Project – Negros terror",
  loreDescription: "In 2008, residents of La Castellana, Negros Occidental reported sightings of the Amomongo after livestock were found mutilated. The creature is described as standing over six feet tall, covered in dark fur, with claws capable of tearing through tin roofs."
};
