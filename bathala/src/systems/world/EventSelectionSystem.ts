/**
 * EventSelectionSystem - Decoupled event selection by chapter
 * 
 * Replaces hardcoded CombinedAct1Events import in EventScene with
 * a chapter-aware event provider registry.
 * 
 * @module systems/world/EventSelectionSystem
 */

import { GameEvent, EducationalEvent } from '../../data/events/EventTypes';
import { CombinedAct1Events } from '../../data/events';
import { GameState } from '../../core/managers/GameState';

type EventProvider = () => (GameEvent | EducationalEvent)[];

/**
 * Registry mapping chapter numbers to event provider functions.
 * Currently only Act 1 has events; Act 2/3 will be added when data is ready.
 */
const CHAPTER_EVENT_PROVIDERS: Map<number, EventProvider> = new Map([
  [1, () => CombinedAct1Events],
  // [2, () => CombinedAct2Events],  // Add when Act 2 events exist
  // [3, () => CombinedAct3Events],  // Add when Act 3 events exist
]);

export class EventSelectionSystem {
  /**
   * Register a new chapter's event provider
   * Allows extensibility without modifying this file
   */
  static registerChapter(chapter: number, provider: EventProvider): void {
    CHAPTER_EVENT_PROVIDERS.set(chapter, provider);
  }

  /**
   * Get all available events for the current chapter
   * Falls back to Act 1 events if no events exist for the chapter
   */
  static getEventsForChapter(chapter?: number): (GameEvent | EducationalEvent)[] {
    const currentChapter = chapter ?? GameState.getInstance().getCurrentChapter();
    const provider = CHAPTER_EVENT_PROVIDERS.get(currentChapter);
    
    if (provider) {
      return provider();
    }

    // Fallback to Act 1 events if chapter has no events yet
    console.warn(`⚠️ EventSelectionSystem: No events for chapter ${currentChapter}, falling back to Act 1`);
    const fallback = CHAPTER_EVENT_PROVIDERS.get(1);
    return fallback ? fallback() : [];
  }

  /**
   * Get a random event for the current chapter
   */
  static getRandomEvent(chapter?: number): GameEvent | EducationalEvent {
    const events = EventSelectionSystem.getEventsForChapter(chapter);
    return events[Math.floor(Math.random() * events.length)];
  }
}
