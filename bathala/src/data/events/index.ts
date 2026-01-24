import { GameEvent, EducationalEvent } from './EventTypes';
import { Act1Events } from './Act1Events';
import { Act1EducationalEvents } from './Act1EducationalEvents';

/**
 * Combined Act 1 Events
 * 
 * Merges traditional game events with educational events to provide
 * a comprehensive event pool for Act 1 gameplay.
 */
export const CombinedAct1Events: (GameEvent | EducationalEvent)[] = [
  ...Act1Events,
  ...Act1EducationalEvents
];

/**
 * Educational Events Only
 * 
 * Provides access to only the educational events for specific
 * educational gameplay modes or testing.
 */
export const Act1EducationalEventsOnly: EducationalEvent[] = Act1EducationalEvents;

/**
 * Traditional Events Only
 * 
 * Provides access to only the traditional game events for
 * non-educational gameplay modes.
 */
export const Act1TraditionalEventsOnly: GameEvent[] = Act1Events;

// Re-export types for convenience
export * from './EventTypes';
export { Act1Events } from './Act1Events';
export { Act1EducationalEvents } from './Act1EducationalEvents';