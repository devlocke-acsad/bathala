/**
 * Bungisngis - Laughing Giant
 * 
 * @module Bungisngis
 * @description One-eyed giant that cannot stop laughing
 * 
 * Mythological Source:
 * - Origin: Tagalog/Cebuano, grinning giants (Ramos, 1990)
 * - Reference: Aswang Project – Strong laughers
 * 
 * Lore: The Bungisngis is a one-eyed giant with enormous teeth, always
 * giggling or laughing. Despite their intimidating size, they were once
 * gentle and jovial creatures. The engkanto's corruption turned their
 * laughter into a maddening curse.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const BUNGISNGIS: EnemyConfig = {
  // === Identity ===
  id: 'bungisngis',
  name: 'Bungisngis',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 30,
  baseDamage: 11,
  
  // === Combat Behavior ===
  attackPatternType: 'support',
  attackPattern: ['laugh_debuff', 'heavy_attack', 'attack', 'laugh_debuff'],
  abilities: ['laugh_debuff', 'heavy_swing'],
  
  // === Elemental ===
  elementalWeakness: 'air',
  elementalResistance: 'earth',
  
  // === Overworld Behavior ===
  pathingType: 'wander',
  detectionRange: 5,
  activeAtNight: false,
  activeAtDay: true,
  speedMultiplier: 0.9,
  
  // === Visuals ===
  combatSpriteKey: 'bungisngis_combat',
  overworldSpriteKey: 'bungisngis_overworld',
  scale: 1.4,
  
  // === Dialogue ===
  dialogueIntro: "Laughter masks rage!",
  dialogueDefeat: "My grin... cracks...",
  dialogueSpare: "Pity reveals: Bungisngis, one-eyed laughing giants, once jovial.",
  dialogueSlay: "Silence my mirth—fuel for deceit!",
  
  // === Lore ===
  loreOrigin: "Tagalog/Cebuano, grinning giants",
  loreReference: "Aswang Project – Strong laughers",
  loreDescription: "The Bungisngis's name comes from the Tagalog word 'ngisi' meaning grin. Their single eye sits in the middle of their forehead, and their upper lip is so large it can cover their face when flipped up. They are strong but easily outwitted."
};
