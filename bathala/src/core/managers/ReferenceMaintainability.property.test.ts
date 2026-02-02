import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { EducationalEvent } from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 14: Reference maintainability**
 * 
 * Property-based test for reference maintainability
 * Validates: Requirements 8.2
 * 
 * The system must enforce academic integrity by validating that all references 
 * contain necessary citation fields (author, title, year).
 */
describe('Property-Based Test: Reference Maintainability', () => {

  // Generator for references
  const referenceArb = fc.record({
      author: fc.string({ minLength: 1 }),
      title: fc.string({ minLength: 1 }),
      publicationYear: fc.integer({ min: 1000, max: 2030 })
      // Missing other optional fields is fine
  });

  test('Property 14: All events must cite valid sources', () => {
    fc.assert(
      fc.property(
        fc.array(referenceArb, { minLength: 1 }),
        (references) => {
           // Construct minimal event shell with these references
           const event = {
               culturalContext: { culturalSignificance: 'dummy', traditionalMeaning:'d', contemporaryRelevance:'d' },
               valuesLesson: { moralTheme:'d', culturalWisdom:'d', applicationToModernLife:'d' },
               educationalObjectives: ['d'],
               academicReferences: references
           } as unknown as EducationalEvent;

           const manager = EducationalEventManager.getInstance();
           
           // We are testing reference *structure* validation.
           // If 'author' or 'title' were empty strings in generation (possible with string()), val would fail.
           // Fast check string({ minLength: 1 }) ensures they are NOT empty.
           const validation = manager.validateEducationalEvent(event);
           
           // We expect no issues related to "Missing author/title/year"
           const refIssues = validation.issues.filter(i => i.startsWith('Academic reference'));
           expect(refIssues).toHaveLength(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 14: Incomplete citations are flagged', () => {
     const manager = EducationalEventManager.getInstance();
     const event = {
         culturalContext: { culturalSignificance: 'd', traditionalMeaning:'d', contemporaryRelevance:'d' },
         valuesLesson: { moralTheme:'d', culturalWisdom:'d', applicationToModernLife:'d' },
         educationalObjectives: ['d'],
         academicReferences: [
             { author: '', title: 'Valid Title', publicationYear: 2000 } // Invalid author
         ]
     } as unknown as EducationalEvent;
     
     const val = manager.validateEducationalEvent(event);
     expect(val.issues.some(i => i.includes('Missing author'))).toBe(true);
  });
});
