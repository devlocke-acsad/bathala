import { GameEvent, EducationalEvent } from './EventTypes';
import { Act1Events } from './Act1Events';
import { Act1EducationalEvents } from './Act1EducationalEvents';
import { Act2Events } from './Act2Events';
import { Act3Events } from './Act3Events';

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

/**
 * Act 2 Events — The Submerged Barangays
 * Maritime mythology events (Tubig/Apoy focus).
 */
export const Act2TraditionalEventsOnly: GameEvent[] = Act2Events;

/**
 * Act 3 Events — The Skyward Citadel
 * Celestial mythology events (Multi-Element focus).
 */
export const Act3TraditionalEventsOnly: GameEvent[] = Act3Events;

// Re-export types for convenience
export * from './EventTypes';
export { Act1Events } from './Act1Events';
export { Act1EducationalEvents } from './Act1EducationalEvents';
export { Act2Events } from './Act2Events';
export { Act3Events } from './Act3Events';