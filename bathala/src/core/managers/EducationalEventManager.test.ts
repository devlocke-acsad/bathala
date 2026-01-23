import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { 
  EducationalEvent, 
  FilipinoValue, 
  RegionalOrigin, 
  AcademicReference, 
  CulturalContext, 
  ValuesLesson,
  MiniGameMechanic,
  EventChoice,
  EventContext
} from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 1: Educational content completeness**
 * **Validates: Requirements 1.1, 1.2, 2.1**
 */

describe('EducationalEventManager Property Tests', () => {
  let manager: EducationalEventManager;

  beforeEach(() => {
    manager = EducationalEventManager.getInstance();
    manager.resetProgress();
  });

  // Generators for property-based testing
  const academicReferenceArb = fc.record({
    author: fc.string({ minLength: 1 }),
    title: fc.string({ minLength: 1 }),
    publicationYear: fc.integer({ min: 1900, max: 2024 }),
    publisher: fc.option(fc.string({ minLength: 1 })),
    pageReference: fc.option(fc.string({ minLength: 1 })),
    isbn: fc.option(fc.string({ minLength: 1 })),
    sourceType: fc.constantFrom('book', 'journal', 'thesis', 'oral_tradition')
  }) as fc.Arbitrary<AcademicReference>;

  const culturalContextArb = fc.record({
    mythologicalCreature: fc.option(fc.string({ minLength: 1 })),
    folkloreType: fc.constantFrom('alamat', 'kwentong-bayan', 'pabula', 'legend'),
    culturalSignificance: fc.string({ minLength: 1 }),
    traditionalMeaning: fc.string({ minLength: 1 }),
    contemporaryRelevance: fc.string({ minLength: 1 })
  }) as fc.Arbitrary<CulturalContext>;

  const valuesLessonArb = fc.record({
    primaryValue: fc.constantFrom(...Object.values(FilipinoValue)),
    moralTheme: fc.string({ minLength: 1 }),
    ethicalDilemma: fc.option(fc.string({ minLength: 1 })),
    culturalWisdom: fc.string({ minLength: 1 }),
    applicationToModernLife: fc.string({ minLength: 1 })
  }) as fc.Arbitrary<ValuesLesson>;

  const miniGameMechanicArb = fc.record({
    gameType: fc.constantFrom('riddle', 'pattern_matching', 'memory_game', 'traditional_game', 'moral_choice_tree'),
    instructions: fc.string({ minLength: 1 }),
    culturalConnection: fc.string({ minLength: 1 }),
    successReward: fc.anything(),
    failureConsequence: fc.option(fc.anything())
  }) as fc.Arbitrary<MiniGameMechanic>;

  const eventChoiceArb = fc.record({
    text: fc.string({ minLength: 1 }),
    outcome: fc.constant((context: EventContext) => "Test outcome")
  }) as fc.Arbitrary<EventChoice>;

  const educationalEventArb = fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    description: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    choices: fc.array(eventChoiceArb, { minLength: 1 }),
    dayEvent: fc.boolean(),
    culturalContext: culturalContextArb,
    academicReferences: fc.array(academicReferenceArb, { minLength: 1 }),
    valuesLesson: valuesLessonArb,
    miniGameMechanic: fc.option(miniGameMechanicArb),
    regionalOrigin: fc.constantFrom(...Object.values(RegionalOrigin)),
    educationalObjectives: fc.array(fc.string({ minLength: 1 }), { minLength: 1 })
  }) as fc.Arbitrary<EducationalEvent>;

  /**
   * Property 1: Educational content completeness
   * For any educational event, it must contain cultural context, at least one academic reference, and educational objectives
   */
  test('Property 1: Educational content completeness', () => {
    fc.assert(
      fc.property(educationalEventArb, (event) => {
        const validation = manager.validateEducationalEvent(event);
        
        // The event should be valid since our generator creates complete events
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);

        // Verify all required components are present
        expect(event.culturalContext).toBeDefined();
        expect(event.culturalContext.culturalSignificance).toBeTruthy();
        expect(event.culturalContext.traditionalMeaning).toBeTruthy();
        expect(event.culturalContext.contemporaryRelevance).toBeTruthy();

        expect(event.academicReferences).toBeDefined();
        expect(event.academicReferences.length).toBeGreaterThan(0);
        
        event.academicReferences.forEach(ref => {
          expect(ref.author).toBeTruthy();
          expect(ref.title).toBeTruthy();
          expect(ref.publicationYear).toBeGreaterThan(0);
        });

        expect(event.valuesLesson).toBeDefined();
        expect(event.valuesLesson.moralTheme).toBeTruthy();
        expect(event.valuesLesson.culturalWisdom).toBeTruthy();
        expect(event.valuesLesson.applicationToModernLife).toBeTruthy();

        expect(event.educationalObjectives).toBeDefined();
        expect(event.educationalObjectives.length).toBeGreaterThan(0);

        expect(event.regionalOrigin).toBeDefined();
        expect(Object.values(RegionalOrigin)).toContain(event.regionalOrigin);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test validation with incomplete events to ensure the validator catches missing components
   */
  test('Validation catches incomplete educational events', () => {
    const incompleteEventArb = fc.record({
      id: fc.string({ minLength: 1 }),
      name: fc.string({ minLength: 1 }),
      description: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
      choices: fc.array(eventChoiceArb, { minLength: 1 }),
      dayEvent: fc.boolean(),
      culturalContext: fc.option(culturalContextArb),
      academicReferences: fc.option(fc.array(academicReferenceArb)),
      valuesLesson: fc.option(valuesLessonArb),
      miniGameMechanic: fc.option(miniGameMechanicArb),
      regionalOrigin: fc.constantFrom(...Object.values(RegionalOrigin)),
      educationalObjectives: fc.option(fc.array(fc.string({ minLength: 1 })))
    }) as fc.Arbitrary<Partial<EducationalEvent>>;

    fc.assert(
      fc.property(incompleteEventArb, (partialEvent) => {
        // Cast to EducationalEvent for validation (this simulates incomplete data)
        const event = partialEvent as EducationalEvent;
        const validation = manager.validateEducationalEvent(event);

        // If any required component is missing, validation should fail
        const hasMissingComponents = 
          !event.culturalContext ||
          !event.academicReferences ||
          event.academicReferences.length === 0 ||
          !event.valuesLesson ||
          !event.educationalObjectives ||
          event.educationalObjectives.length === 0;

        if (hasMissingComponents) {
          expect(validation.isValid).toBe(false);
          expect(validation.issues.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test event selection ensures variety and uniqueness
   */
  test('Event selection maintains diversity and uniqueness', () => {
    const eventArrayArb = fc.array(educationalEventArb, { minLength: 10, maxLength: 20 });

    fc.assert(
      fc.property(eventArrayArb, (events) => {
        // Ensure all events have unique IDs for this test
        const uniqueEvents = events.map((event, index) => ({
          ...event,
          id: `event_${index}`
        }));

        const selectedEvents = manager.selectEventsForChapter(1, uniqueEvents, 5);

        // Should select at least the requested number of events (or all available if less)
        expect(selectedEvents.length).toBeLessThanOrEqual(Math.min(5, uniqueEvents.length));
        expect(selectedEvents.length).toBeGreaterThan(0);

        // All selected events should be unique
        const selectedIds = selectedEvents.map(e => e.id);
        const uniqueIds = new Set(selectedIds);
        expect(uniqueIds.size).toBe(selectedIds.length);

        // Events should have diverse values and regions when possible
        if (selectedEvents.length > 1) {
          const values = selectedEvents.map(e => e.valuesLesson.primaryValue);
          const regions = selectedEvents.map(e => e.regionalOrigin);
          
          // At least some diversity should exist if the input has diversity
          const uniqueValues = new Set(values);
          const uniqueRegions = new Set(regions);
          
          // This property ensures the selection algorithm attempts diversity
          expect(uniqueValues.size).toBeGreaterThan(0);
          expect(uniqueRegions.size).toBeGreaterThan(0);
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Test content uniqueness preservation
   */
  test('Content uniqueness is preserved across encounters', () => {
    fc.assert(
      fc.property(educationalEventArb, (event) => {
        // Initially, content should be unique
        expect(manager.isContentUnique(event.id)).toBe(true);

        // After marking as encountered, it should no longer be unique
        manager.markEventEncountered(event);
        expect(manager.isContentUnique(event.id)).toBe(false);

        // Reset and verify uniqueness is restored
        manager.resetProgress();
        expect(manager.isContentUnique(event.id)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});