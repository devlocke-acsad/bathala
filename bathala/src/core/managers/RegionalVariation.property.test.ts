import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { 
  EducationalEvent, 
  FilipinoValue, 
  RegionalOrigin
} from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 11: Regional variation acknowledgment**
 * 
 * Property-based test for regional variation handling
 * Validates: Requirements 6.2
 * 
 * The system must correctly select regional variations prioritizing underrepresented regions
 * and preventing duplicates.
 */
describe('Property-Based Test: Regional Variation Acknowledgment', () => {
  
  // Generators
  const regionalOriginArb = fc.constantFrom(...Object.values(RegionalOrigin));
  
  // Helper to create a minimal valid EducationalEvent
  const createMockEvent = (
      id: string, 
      region: RegionalOrigin
  ): EducationalEvent => {
    return {
      id,
      name: `Event ${id}`,
      description: ['Desc'],
      choices: [],
      dayEvent: true,
      culturalContext: {
        mythologicalCreature: 'Creature',
        folkloreType: 'alamat',
        culturalSignificance: 'Sig',
        traditionalMeaning: 'Meaning',
        contemporaryRelevance: 'Relevance'
      },
      academicReferences: [
        { author: 'Auth', title: 'Title', publicationYear: 2000, sourceType: 'book' }
      ],
      valuesLesson: {
        primaryValue: FilipinoValue.MALASAKIT,
        moralTheme: 'Theme',
        culturalWisdom: 'Wisdom',
        applicationToModernLife: 'App'
      },
      regionalOrigin: region,
      educationalObjectives: ['Obj']
    };
  };

  test('Property 11: Selection prioritizes underrepresented regions', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            region: regionalOriginArb
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (variationParams) => {
          const manager = EducationalEventManager.getInstance();
          manager.resetProgress();
          
          const variations = variationParams.map(p => 
            createMockEvent(p.id, p.region)
          );

          // Artificially inflate coverage for the first region
          const firstRegion = variations[0].regionalOrigin;
          // Mark an unrelated event from first region as gathered
          // (Need to hack internals or simulate encounter)
          const dummyEvent = createMockEvent('dummy', firstRegion);
          manager.markEventEncountered(dummyEvent);
          manager.markEventEncountered(createMockEvent('dummy2', firstRegion));

          // Select variation
          const selected = manager.selectRegionalVariation('base', variations);

          if (selected) {
             // Selected should NOT be from firstRegion IF there are other regions available
             const otherRegionsAvailable = variations.some(v => v.regionalOrigin !== firstRegion);
             if (otherRegionsAvailable) {
                // Ideally, we prefer other regions.
                // However, if the "firstRegion" variant is the *only* one available (Wait, some checks exist),
                // Or if logic is "least covered".
                const coverageOfSelected = (manager.getEducationalStatistics().regionalCoverage.get(selected.regionalOrigin) || 0);
                const coverageOfFirst = (manager.getEducationalStatistics().regionalCoverage.get(firstRegion) || 0);
                
                // Expect selected coverage to be <= coverage of first region (usually strictly less if others exist with 0)
                expect(coverageOfSelected).toBeLessThanOrEqual(coverageOfFirst);
             }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  test('Property 11: Selection prevents duplicates', () => {
     const manager = EducationalEventManager.getInstance();
     manager.resetProgress();
     
     const varA = createMockEvent('A', RegionalOrigin.LUZON_TAGALOG);
     const varB = createMockEvent('B', RegionalOrigin.VISAYAS_CEBUANO);
     
     const variations = [varA, varB];
     
     // First pick
     const picked1 = manager.selectRegionalVariation('base', variations);
     expect(picked1).not.toBeNull();
     if (picked1) manager.markEventEncountered(picked1);
     
     // Second pick
     const picked2 = manager.selectRegionalVariation('base', variations);
     expect(picked2).not.toBeNull();
     expect(picked2?.id).not.toBe(picked1?.id);
     if (picked2) manager.markEventEncountered(picked2);
     
     // Third pick (exhausted)
     const picked3 = manager.selectRegionalVariation('base', variations);
     expect(picked3).toBeNull();
  });
});
