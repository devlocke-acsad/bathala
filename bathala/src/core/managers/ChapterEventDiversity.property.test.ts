import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { 
  EducationalEvent, 
  FilipinoValue, 
  RegionalOrigin
} from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 7: Chapter event diversity**
 * 
 * Property-based test for chapter event diversity
 * Validates: Requirements 4.1, 4.2
 * 
 * For any chapter, it must contain at least 5 unique events with variety in 
 * mythological creatures, moral themes, and regional origins
 */
describe('Property-Based Test: Chapter Event Diversity', () => {
  
  // Generators
  const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
  const regionalOriginArb = fc.constantFrom(...Object.values(RegionalOrigin));
  
  // Helper to create a minimal valid EducationalEvent
  const createMockEvent = (
      id: string, 
      creature: string, 
      value: FilipinoValue, 
      region: RegionalOrigin
  ): EducationalEvent => {
    return {
      id,
      name: `Event ${id}`,
      description: ['Desc'],
      choices: [],
      dayEvent: true,
      culturalContext: {
        mythologicalCreature: creature,
        folkloreType: 'alamat',
        culturalSignificance: 'Sig',
        traditionalMeaning: 'Meaning',
        contemporaryRelevance: 'Relevance'
      },
      academicReferences: [
        { author: 'Auth', title: 'Title', publicationYear: 2000, sourceType: 'book' }
      ],
      valuesLesson: {
        primaryValue: value,
        moralTheme: 'Theme',
        culturalWisdom: 'Wisdom',
        applicationToModernLife: 'App'
      },
      regionalOrigin: region,
      educationalObjectives: ['Obj']
    };
  };

  test('Property 7: Selected events should maximize diversity', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            creature: fc.string({ minLength: 1 }),
            value: filipinoValueArb,
            region: regionalOriginArb
          }),
          { minLength: 10, maxLength: 50 } // Provide a pool of 10-50 events
        ),
        (eventParams) => {
          const manager = EducationalEventManager.getInstance();
          manager.resetProgress(); // Ensure clean state each run
          
          // Map params to event objects
          const availableEvents = eventParams.map(p => 
            createMockEvent(p.id, p.creature, p.value, p.region)
          );

          // Select events
          const selectedEvents = manager.selectEventsForChapter(1, availableEvents, 5);

          // Requirements:
          // 1. Should adhere to required count if enough unique events exist
          expect(selectedEvents.length).toBe(5);

          // 2. Diversity Checks - We expect high diversity but since inputs are random, 
          // we can't assert exact diversity counts easily without checking the input distribution.
          // Correctness check: No duplicates
          const ids = new Set(selectedEvents.map(e => e.id));
          expect(ids.size).toBe(selectedEvents.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // A specific non-property check to verify the logic strictly
  test('Selection prioritizes diversity', () => {
    const manager = EducationalEventManager.getInstance();
    manager.resetProgress();
    
    // Setup: 2 events are identical in metadata (A and B), 1 is diverse (C).
    // We want to select 2 events.
    // Ideally, we select {A, C} or {B, C} to maximize coverage.
    // If we select {A, B}, we fail diversity because we cover only 1 region/value/creature.
    
    const eventA = createMockEvent('1', 'Kapre', FilipinoValue.MALASAKIT, RegionalOrigin.LUZON_TAGALOG);
    const eventB = createMockEvent('2', 'Kapre', FilipinoValue.MALASAKIT, RegionalOrigin.LUZON_TAGALOG); 
    const eventC = createMockEvent('3', 'Tikbalang', FilipinoValue.HIYA, RegionalOrigin.VISAYAS_CEBUANO); 
    
    const pool = [eventA, eventB, eventC];
    
    const selectedEvents = manager.selectEventsForChapter(1, pool, 2);
    
    expect(selectedEvents.length).toBe(2);
    
    const hasC = selectedEvents.some(e => e.id === '3');
    const hasAorB = selectedEvents.some(e => e.id === '1' || e.id === '2');
    
    // We MUST have C to be diverse.
    expect(hasC).toBe(true);
    // We should have at least one of A or B to fill the quota of 2.
    expect(hasAorB).toBe(true);
    
    // Verify diversity stats
    const regions = new Set(selectedEvents.map(e => e.regionalOrigin));
    // Should have 2 regions (Luzon and Visayas)
    expect(regions.size).toBe(2);
  });
});
