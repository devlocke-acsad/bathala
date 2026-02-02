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
import { 
  commonPotions as act1CommonPotions,
  uncommonPotions as act1UncommonPotions,
  rarePotions as act1RarePotions
} from './Act1Potions';
import { 
  commonPotions as act2CommonPotions,
  uncommonPotions as act2UncommonPotions,
  rarePotions as act2RarePotions
} from './Act2Potions';
import { 
  commonPotions as act3CommonPotions,
  uncommonPotions as act3UncommonPotions,
  rarePotions as act3RarePotions
} from './Act3Potions';

/**
 * Get chapter-specific common potions
 */
export function getChapterCommonPotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      return act2CommonPotions;
    case 3:
      return act3CommonPotions;
    case 1:
    default:
      return act1CommonPotions;
  }
}

/**
 * Get chapter-specific uncommon potions
 */
export function getChapterUncommonPotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      return act2UncommonPotions;
    case 3:
      return act3UncommonPotions;
    case 1:
    default:
      return act1UncommonPotions;
  }
}

/**
 * Get chapter-specific rare potions
 */
export function getChapterRarePotions(chapter: number): Potion[] {
  switch (chapter) {
    case 2:
      return act2RarePotions;
    case 3:
      return act3RarePotions;
    case 1:
    default:
      return act1RarePotions;
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
