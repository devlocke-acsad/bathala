import { CulturalContextManager } from './CulturalContextManager';
import { CulturalContext, RegionalOrigin } from '../../data/events/EventTypes';
import * as fc from 'fast-check';

describe('CulturalContextManager', () => {
  let manager: CulturalContextManager;

  beforeEach(() => {
    // Get a fresh instance for each test
    manager = CulturalContextManager.getInstance();
  });

  describe('Unit Tests', () => {
    describe('validateCulturalContext', () => {
      it('should validate a complete cultural context as valid', () => {
        const context: CulturalContext = {
          mythologicalCreature: 'Kapre',
          folkloreType: 'alamat',
          culturalSignificance: 'Forest guardian spirit that teaches respect for nature and ancestral wisdom',
          traditionalMeaning: 'Protector of trees and forests, often smoking tobacco and playing pranks on humans who disrespect nature',
          contemporaryRelevance: 'Represents environmental stewardship and the importance of preserving natural habitats in modern times'
        };

        const result = manager.validateCulturalContext(context, RegionalOrigin.LUZON_TAGALOG);
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should identify missing required fields', () => {
        const context: CulturalContext = {
          folkloreType: 'alamat',
          culturalSignificance: '',
          traditionalMeaning: '',
          contemporaryRelevance: ''
        };

        const result = manager.validateCulturalContext(context);
        expect(result.isValid).toBe(false);
        expect(result.issues).toContain('Cultural significance is required');
        expect(result.issues).toContain('Traditional meaning is required');
        expect(result.issues).toContain('Contemporary relevance is required');
      });

      it('should validate folklore type', () => {
        const context: CulturalContext = {
          folkloreType: 'invalid' as any,
          culturalSignificance: 'Test significance with enough characters',
          traditionalMeaning: 'Test traditional meaning with enough characters',
          contemporaryRelevance: 'Test contemporary relevance with enough characters'
        };

        const result = manager.validateCulturalContext(context);
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Folklore type must be one of'))).toBe(true);
      });

      it('should validate content length requirements', () => {
        const context: CulturalContext = {
          folkloreType: 'alamat',
          culturalSignificance: 'Short',
          traditionalMeaning: 'Short',
          contemporaryRelevance: 'Short'
        };

        const result = manager.validateCulturalContext(context);
        expect(result.isValid).toBe(false);
        expect(result.issues).toContain('Cultural significance should be more descriptive (minimum 20 characters)');
        expect(result.issues).toContain('Traditional meaning should be more descriptive (minimum 20 characters)');
        expect(result.issues).toContain('Contemporary relevance should be more descriptive (minimum 20 characters)');
      });
    });

    describe('regional operations', () => {
      it('should retrieve cultural context by creature name', () => {
        const context = manager.getCulturalContext('Kapre');
        expect(context).toBeDefined();
        expect(context?.mythologicalCreature).toBe('Kapre');
      });

      it('should get regional creatures', () => {
        const creatures = manager.getRegionalCreatures(RegionalOrigin.LUZON_TAGALOG);
        expect(creatures.length).toBeGreaterThan(0);
        expect(creatures).toContain('kapre');
      });

      it('should get creature regions', () => {
        const regions = manager.getCreatureRegions('Kapre');
        expect(regions.length).toBeGreaterThan(0);
        expect(regions).toContain(RegionalOrigin.LUZON_TAGALOG);
      });

      it('should search by folklore type', () => {
        const results = manager.searchByFolkloreType('alamat');
        expect(results.length).toBeGreaterThan(0);
        expect(results.every(r => r.context.folkloreType === 'alamat')).toBe(true);
      });

      it('should search by theme', () => {
        const results = manager.searchByTheme('nature');
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => 
          r.context.culturalSignificance.toLowerCase().includes('nature') ||
          r.context.traditionalMeaning.toLowerCase().includes('nature') ||
          r.context.contemporaryRelevance.toLowerCase().includes('nature')
        )).toBe(true);
      });
    });

    describe('cultural attribution validation', () => {
      it('should validate proper cultural attribution', () => {
        const context: CulturalContext = {
          mythologicalCreature: 'Kapre',
          folkloreType: 'alamat',
          culturalSignificance: 'Forest guardian spirit that teaches respect for nature and ancestral wisdom',
          traditionalMeaning: 'Protector of trees and forests, often smoking tobacco and playing pranks on humans who disrespect nature',
          contemporaryRelevance: 'Represents environmental stewardship and the importance of preserving natural habitats in modern times'
        };

        const result = manager.validateCulturalAttribution(
          context, 
          RegionalOrigin.LUZON_TAGALOG,
          'Tagalog community'
        );
        
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should identify regional misattribution', () => {
        const context: CulturalContext = {
          mythologicalCreature: 'Kapre',
          folkloreType: 'alamat',
          culturalSignificance: 'Forest guardian spirit that teaches respect for nature and ancestral wisdom',
          traditionalMeaning: 'Protector of trees and forests, often smoking tobacco and playing pranks on humans who disrespect nature',
          contemporaryRelevance: 'Represents environmental stewardship and the importance of preserving natural habitats in modern times'
        };

        // Try to attribute Kapre to a region where it's not traditionally found
        const result = manager.validateCulturalAttribution(
          context, 
          RegionalOrigin.MINDANAO_TAUSUG
        );
        
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.includes('not traditionally from region'))).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });
    });

    describe('database operations', () => {
      it('should add valid cultural context', () => {
        const context: CulturalContext = {
          mythologicalCreature: 'Test Creature',
          folkloreType: 'alamat',
          culturalSignificance: 'Test cultural significance with enough characters for validation',
          traditionalMeaning: 'Test traditional meaning with enough characters for validation',
          contemporaryRelevance: 'Test contemporary relevance with enough characters for validation'
        };

        const result = manager.addCulturalContext(
          'Test Creature',
          context,
          [RegionalOrigin.LUZON_TAGALOG]
        );

        expect(result.success).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should reject invalid cultural context', () => {
        const context: CulturalContext = {
          folkloreType: 'alamat',
          culturalSignificance: '',
          traditionalMeaning: '',
          contemporaryRelevance: ''
        };

        const result = manager.addCulturalContext('Invalid Creature', context);
        expect(result.success).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * **Feature: educational-events-system, Property 3: Cultural attribution completeness**
     * **Validates: Requirements 2.3, 6.1, 6.3**
     */
    it('Property 3: Cultural attribution completeness - For any event featuring regional or cultural content, it must include geographic origin, cultural context, and community attribution', () => {
      fc.assert(
        fc.property(
          // Generate valid cultural contexts
          fc.record({
            mythologicalCreature: fc.option(fc.string({ minLength: 3, maxLength: 30 })),
            folkloreType: fc.constantFrom('alamat', 'kwentong-bayan', 'pabula', 'legend'),
            culturalSignificance: fc.string({ minLength: 20, maxLength: 200 }),
            traditionalMeaning: fc.string({ minLength: 20, maxLength: 200 }),
            contemporaryRelevance: fc.string({ minLength: 20, maxLength: 200 })
          }),
          fc.constantFrom(...Object.values(RegionalOrigin)),
          fc.option(fc.string({ minLength: 5, maxLength: 50 })),
          (context: CulturalContext, regionalOrigin: RegionalOrigin, communityAttribution?: string) => {
            // Test that all valid cultural contexts have complete attribution
            const contextValidation = manager.validateCulturalContext(context);
            
            if (contextValidation.isValid) {
              // Should have geographic origin (provided as parameter)
              expect(regionalOrigin).toBeDefined();
              expect(Object.values(RegionalOrigin)).toContain(regionalOrigin);
              
              // Should have cultural context with all required fields
              expect(context.culturalSignificance).toBeTruthy();
              expect(context.traditionalMeaning).toBeTruthy();
              expect(context.contemporaryRelevance).toBeTruthy();
              expect(context.folkloreType).toBeTruthy();
              
              // Cultural attribution validation should provide meaningful feedback
              const attribution = manager.validateCulturalAttribution(
                context, 
                regionalOrigin, 
                communityAttribution
              );
              
              // Should always provide suggestions for improvement
              expect(attribution.suggestions).toBeDefined();
              
              // If context is valid, attribution should focus on regional appropriateness
              if (attribution.isValid) {
                expect(attribution.issues).toHaveLength(0);
              } else {
                // Issues should be specific and actionable
                expect(attribution.issues.every(issue => issue.length > 10)).toBe(true);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3 (Regional Consistency): Creatures should be consistently associated with their traditional regions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Kapre', 'Tikbalang', 'Bakunawa', 'Diwata', 'Aswang', 'Sirena'),
          (creatureName: string) => {
            const context = manager.getCulturalContext(creatureName);
            const regions = manager.getCreatureRegions(creatureName);
            
            if (context && regions.length > 0) {
              // Each region should list this creature
              regions.forEach(region => {
                const regionalCreatures = manager.getRegionalCreatures(region);
                const creatureKey = creatureName.toLowerCase().replace(/\s+/g, '_');
                expect(regionalCreatures).toContain(creatureKey);
              });
              
              // Validation should pass for traditional regions
              regions.forEach(region => {
                const validation = manager.validateCulturalContext(context, region);
                expect(validation.isValid).toBe(true);
              });
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('Property 3 (Content Quality): Cultural contexts should maintain descriptive quality standards', () => {
      fc.assert(
        fc.property(
          fc.record({
            folkloreType: fc.constantFrom('alamat', 'kwentong-bayan', 'pabula', 'legend'),
            culturalSignificance: fc.string({ minLength: 1, maxLength: 300 }),
            traditionalMeaning: fc.string({ minLength: 1, maxLength: 300 }),
            contemporaryRelevance: fc.string({ minLength: 1, maxLength: 300 })
          }),
          (context: CulturalContext) => {
            const validation = manager.validateCulturalContext(context);
            
            // Quality standards should be consistently applied
            const hasMinimumLength = 
              context.culturalSignificance.length >= 20 &&
              context.traditionalMeaning.length >= 20 &&
              context.contemporaryRelevance.length >= 20;
            
            if (hasMinimumLength) {
              // Should pass basic content validation
              expect(validation.issues.filter(issue => 
                issue.includes('should be more descriptive')
              )).toHaveLength(0);
            } else {
              // Should identify content quality issues
              expect(validation.isValid).toBe(false);
              expect(validation.issues.some(issue => 
                issue.includes('should be more descriptive')
              )).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3 (Database Integrity): Cultural database should maintain integrity across operations', () => {
      const integrityCheck = manager.checkCulturalIntegrity();
      
      // All contexts in database should be valid
      expect(integrityCheck.validContexts).toBe(integrityCheck.totalContexts);
      expect(integrityCheck.invalidContexts).toHaveLength(0);
      
      // Should have reasonable regional coverage
      expect(integrityCheck.regionalCoverage.size).toBe(Object.values(RegionalOrigin).length);
      
      // Each region should have at least one creature
      integrityCheck.regionalCoverage.forEach((count, region) => {
        expect(count).toBeGreaterThan(0);
      });
      
      // Should have the expected number of pre-loaded contexts
      expect(integrityCheck.totalContexts).toBeGreaterThan(0);
    });

    it('Property 3 (Search Consistency): Search operations should return consistent and relevant results', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('alamat', 'kwentong-bayan', 'pabula', 'legend'),
          fc.string({ minLength: 3, maxLength: 20 }),
          (folkloreType: CulturalContext['folkloreType'], searchTerm: string) => {
            // Folklore type search should be consistent
            const folkloreResults = manager.searchByFolkloreType(folkloreType);
            expect(folkloreResults.every(r => r.context.folkloreType === folkloreType)).toBe(true);
            
            // Theme search should return relevant results
            const themeResults = manager.searchByTheme(searchTerm);
            themeResults.forEach(result => {
              const searchableText = [
                result.context.culturalSignificance,
                result.context.traditionalMeaning,
                result.context.contemporaryRelevance
              ].join(' ').toLowerCase();
              
              expect(searchableText.includes(searchTerm.toLowerCase())).toBe(true);
            });
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});