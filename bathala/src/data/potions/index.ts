// Export all potion data for the game

export type { Potion } from './Act1Potions';

export { 
  commonPotions as act1CommonPotions,
  uncommonPotions as act1UncommonPotions,
  rarePotions as act1RarePotions
} from './Act1Potions';

export { 
  commonPotions as act2CommonPotions,
  uncommonPotions as act2UncommonPotions,
  rarePotions as act2RarePotions,
  allAct2Potions
} from './Act2Potions';

export { 
  commonPotions as act3CommonPotions,
  uncommonPotions as act3UncommonPotions,
  rarePotions as act3RarePotions,
  allAct3Potions
} from './Act3Potions';

import { Potion } from './Act1Potions';

/**
 * Get chapter-specific common potions
 */
export function getChapterCommonPotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      const { commonPotions: act2Common } = require('./Act2Potions');
      return act2Common;
    case 3:
      const { commonPotions: act3Common } = require('./Act3Potions');
      return act3Common;
    case 1:
    default:
      const { commonPotions: act1Common } = require('./Act1Potions');
      return act1Common;
  }
}

/**
 * Get chapter-specific uncommon potions
 */
export function getChapterUncommonPotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      const { uncommonPotions: act2Uncommon } = require('./Act2Potions');
      return act2Uncommon;
    case 3:
      const { uncommonPotions: act3Uncommon } = require('./Act3Potions');
      return act3Uncommon;
    case 1:
    default:
      const { uncommonPotions: act1Uncommon } = require('./Act1Potions');
      return act1Uncommon;
  }
}

/**
 * Get chapter-specific rare potions
 */
export function getChapterRarePotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      const { rarePotions: act2Rare } = require('./Act2Potions');
      return act2Rare;
    case 3:
      const { rarePotions: act3Rare } = require('./Act3Potions');
      return act3Rare;
    case 1:
    default:
      const { rarePotions: act1Rare } = require('./Act1Potions');
      return act1Rare;
  }
}

/**
 * Get all chapter-specific potions
 */
export function getAllChapterPotions(chapter: number): Potion[] {
  return [
    ...getChapterCommonPotions(chapter),
    ...getChapterUncommonPotions(chapter),
    ...getChapterRarePotions(chapter)
  ];
}
