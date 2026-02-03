/**
 * Sigbin Charger - Heart-Stealing Beast
 * 
 * @module SigbinCharger
 * @description Goat-like creature that steals hearts for dark amulets
 * 
 * Mythological Source:
 * - Origin: Visayan, goat-like eaters (Ramos, 1990)
 * - Reference: Aswang Project – Nocturnal stench-emitters
 * 
 * Lore: The Sigbin walks backwards with its head lowered between its hind legs.
 * It emits a nauseating smell and steals the hearts of victims to create
 * powerful amulets. Once loyal servants of Bathala, they now serve darker masters.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const SIGBIN_CHARGER: EnemyConfig = {
  // === Identity ===
  id: 'sigbin_charger',
  name: 'Sigbin Charger',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 35,
  baseDamage: 10,
  
  // === Combat Behavior ===
  attackPatternType: 'aggressive',
  attackPattern: ['attack', 'attack', 'burst_attack'],
  abilities: ['burst_every_3_turns'],
  
  // === Elemental ===
  elementalWeakness: 'water',
  elementalResistance: null,
  
  // === Overworld Behavior ===
  pathingType: 'chase',
  detectionRange: 5,
  activeAtNight: true,
  activeAtDay: false,
  speedMultiplier: 1.2,
  
  // === Visuals ===
  spriteKey: 'chap1/sigbin_charger',
  
  // === Dialogue ===
  dialogueIntro: "Charge for shadow throne!",
  dialogueDefeat: "My heart... stolen...",
  dialogueSpare: "Compassion uncovers: Sigbin steal hearts for amulets, once loyal to Bathala.",
  dialogueSlay: "Slay me—claim power for shadow!",
  
  // === Lore ===
  loreOrigin: "Visayan, goat-like eaters",
  loreReference: "Aswang Project – Nocturnal stench-emitters",
  loreDescription: "The Sigbin resembles a hornless goat but walks backwards. Wealthy families in the Visayas were rumored to keep them as dark familiars. During Holy Week, they emerge to hunt for children's hearts to craft into powerful agimat (amulets)."
};
