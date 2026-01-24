import * as fc from 'fast-check';
import { EducationalEventManager } from './EducationalEventManager';
import { FilipinoValue, RegionalOrigin } from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 15: Backward compatibility preservation**
 * 
 * Property-based test for backward compatibility
 * Validates: Requirements 8.5
 * 
 * The system must gracefully handle loading saved data that is missing fields,
 * corrupted, or from an older version, ensuring valid state restoration.
 */
describe('Property-Based Test: Backward Compatibility', () => {

  // Generator for approximate legacy data structures
  const legacyDataArb = fc.record({
      // Maybe missing some fields
      encounteredEvents: fc.option(fc.array(fc.uuid())),
      educationalProgress: fc.option(fc.array(fc.tuple(fc.constantFrom(...Object.values(FilipinoValue)), fc.integer({min:0})))),
      // Missing regionalCoverage entirely (simulating old version)
      extraField: fc.string()
  });

  test('Property 15: Manager handles partial/legacy data gracefully', () => {
    fc.assert(
      fc.property(
        legacyDataArb,
        (legacyData) => {
           const manager = EducationalEventManager.getInstance();
           // Reset first to ensure we aren't using previous state
           manager.resetProgress();
           
           // Load legacy data
           manager.loadProgress(legacyData);
           
           // Invariants:
           // 1. Manager state must be valid (not undefined)
           const stats = manager.getEducationalStatistics();
           
           // 2. All required maps must be initialized (even if data was missing)
           expect(stats.valuesProgress).toBeDefined();
           expect(stats.regionalCoverage).toBeDefined();
           
           // 3. Must have entries for all enums (defaults applied)
           Object.values(FilipinoValue).forEach(v => {
               expect(stats.valuesProgress.has(v)).toBe(true);
           });
           Object.values(RegionalOrigin).forEach(r => {
               expect(stats.regionalCoverage.has(r)).toBe(true);
           });
        }
      ),
      { numRuns: 50 }
    );
  });
});
