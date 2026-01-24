import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { 
  EducationalEvent, 
  FilipinoValue, 
  RegionalOrigin
} from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 13: System modularity**
 * 
 * Property-based test for system modularity and validation
 * Validates: Requirements 8.1, 8.3
 * 
 * The system must allow adding new educational events and strictly validate them
 * against the defined schema (cultural context, values definition, references).
 */
describe('Property-Based Test: System Modularity & Validation', () => {
  
  // Generators
  const validEventArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1 }),
      description: fc.array(fc.string(), { minLength: 1 }),
      choices: fc.array(fc.record({ text: fc.string(), outcome: fc.constant(() => {}) }), { minLength: 1 }),
      dayEvent: fc.boolean(),
      culturalContext: fc.record({
          mythologicalCreature: fc.string({ minLength: 1 }),
          folkloreType: fc.constantFrom('alamat', 'kwentong-bayan', 'pabula', 'legend'),
          culturalSignificance: fc.string({ minLength: 1 }),
          traditionalMeaning: fc.string({ minLength: 1 }),
          contemporaryRelevance: fc.string({ minLength: 1 })
      }),
      academicReferences: fc.array(fc.record({
          author: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1 }),
          publicationYear: fc.integer({ min: 1800, max: 2025 }),
          sourceType: fc.constant('book')
      }), { minLength: 1 }),
      valuesLesson: fc.record({
          primaryValue: fc.constantFrom(...Object.values(FilipinoValue)),
          moralTheme: fc.string({ minLength: 1 }),
          culturalWisdom: fc.string({ minLength: 1 }),
          applicationToModernLife: fc.string({ minLength: 1 })
      }),
      regionalOrigin: fc.constantFrom(...Object.values(RegionalOrigin)),
      educationalObjectives: fc.array(fc.string(), { minLength: 1 })
  });

  // Invalid event generator (missing key artifacts)
  const invalidEventArb = validEventArb.map(e => ({
      ...e,
      culturalContext: undefined // Invalidate it
  }));

  test('Property 13: Valid events pass validation', () => {
    fc.assert(
      fc.property(
        validEventArb,
        (eventData) => {
           // We have to cast because arb type inference is strictly structural matches
           const event = eventData as unknown as EducationalEvent;
           const manager = EducationalEventManager.getInstance();
           
           const validation = manager.validateEducationalEvent(event);
           expect(validation.isValid).toBe(true);
           expect(validation.issues).toHaveLength(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 13: Invalid events fail validation with specific messages', () => {
    fc.assert(
        fc.property(
          invalidEventArb,
          (eventData) => {
             const event = eventData as unknown as EducationalEvent;
             const manager = EducationalEventManager.getInstance();
             
             const validation = manager.validateEducationalEvent(event);
             expect(validation.isValid).toBe(false);
             expect(validation.issues).toContain('Missing cultural context');
          }
        ),
        { numRuns: 20 }
    );
  });
});
