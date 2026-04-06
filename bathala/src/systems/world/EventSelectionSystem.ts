/**
 * EventSelectionSystem - Decoupled event selection by chapter
 *
 * Replaces hardcoded CombinedAct1Events import in EventScene with
 * a chapter-aware event provider registry.
 *
 * @module systems/world/EventSelectionSystem
 */

import { GameEvent, EducationalEvent } from '../../data/events/EventTypes';
import {
  CombinedAct1Events,
  Act2EducationalEvents,
  Act3EducationalEvents,
} from '../../data/events';
import { GameState } from '../../core/managers/GameState';
import { OverworldGameState } from '../../core/managers/OverworldGameState';

type EventProvider = () => (GameEvent | EducationalEvent)[];

/**
 * Registry mapping chapter numbers to event provider functions.
 * Each chapter is restricted to its own event pool.
 */
const CHAPTER_EVENT_PROVIDERS: Map<number, EventProvider> = new Map([
  [1, () => CombinedAct1Events],
  // Chapters 2 and 3 should only use the curated educational event pools
  // shown in the chapter event debug screens.
  [2, () => Act2EducationalEvents],
  [3, () => Act3EducationalEvents],
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
   * Get all available events for the current chapter.
   * Chapters are isolated, so no cross-chapter fallback is allowed.
   */
  static getEventsForChapter(chapter?: number): (GameEvent | EducationalEvent)[] {
    const currentChapter = chapter ?? GameState.getInstance().getCurrentChapter();
    const provider = CHAPTER_EVENT_PROVIDERS.get(currentChapter);

    if (provider) {
      return provider();
    }

    console.warn(`EventSelectionSystem: No events registered for chapter ${currentChapter}.`);
    return [];
  }

  /**
   * Get a random event for the current chapter
   */
  static getRandomEvent(chapter?: number): GameEvent | EducationalEvent {
    const events = EventSelectionSystem.getEventsForChapter(chapter);
    if (events.length === 0) {
      throw new Error('EventSelectionSystem: No events available for selection.');
    }

    const isDay = OverworldGameState.getInstance().isDay;
    const overworldState = OverworldGameState.getInstance();
    const unseenEvents = events.filter(e => !overworldState.hasEncounteredEvent(e.id));
    const cycleUnseenEvents = unseenEvents.filter(e => e.dayEvent === isDay);
    const cycleEvents = events.filter(e => e.dayEvent === isDay);

    // If a chapter doesn't have any events authored for this cycle yet,
    // fall back to the full pool inside the same chapter only.
    const pool =
      cycleUnseenEvents.length > 0
        ? cycleUnseenEvents
        : unseenEvents.length > 0
          ? unseenEvents
          : cycleEvents.length > 0
            ? cycleEvents
            : events;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
