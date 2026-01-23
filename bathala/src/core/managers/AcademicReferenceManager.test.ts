import { AcademicReferenceManager } from './AcademicReferenceManager';
import { AcademicReference } from '../../data/events/EventTypes';
import * as fc from 'fast-check';

describe('AcademicReferenceManager', () => {
  let manager: AcademicReferenceManager;

  beforeEach(() => {
    // Get a fresh instance for each test
    manager = AcademicReferenceManager.getInstance();
  });

  describe('Unit Tests', () => {
    describe('validateReference', () => {
      it('should validate a complete reference as valid', () => {
        const reference: AcademicReference = {
          author: 'Ramos, Maximo D.',
          title: 'The Creatures of Philippine Lower Mythology',
          publicationYear: 1971,
          publisher: 'Phoenix Publishing',
          pageReference: 'pp. 45-52',
          sourceType: 'book'
        };

        const result = manager.validateReference(reference);
        expect(result.isValid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should identify missing required fields', () => {
        const reference: AcademicReference = {
          author: '',
          title: '',
          publicationYear: 0,
          sourceType: 'book'
        };

        const result = manager.validateReference(reference);
        expect(result.isValid).toBe(false);
        expect(result.issues).toContain('Author is required');
        expect(result.issues).toContain('Title is required');
        expect(result.issues).toContain('Publication year is required');
      });

      it('should validate publication year range', () => {
        const reference: AcademicReference = {
          author: 'Test, Author',
          title: 'Test Title',
          publicationYear: 1700, // Too old
          sourceType: 'book'
        };

        const result = manager.validateReference(reference);
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Publication year must be between'))).toBe(true);
      });

      it('should validate source type', () => {
        const reference: AcademicReference = {
          author: 'Test, Author',
          title: 'Test Title',
          publicationYear: 2000,
          sourceType: 'invalid' as any
        };

        const result = manager.validateReference(reference);
        expect(result.isValid).toBe(false);
        expect(result.issues.some(issue => issue.includes('Source type must be one of'))).toBe(true);
      });
    });

    describe('formatCitation', () => {
      it('should format a complete reference correctly', () => {
        const reference: AcademicReference = {
          author: 'Ramos, Maximo D.',
          title: 'The Creatures of Philippine Lower Mythology',
          publicationYear: 1971,
          publisher: 'Phoenix Publishing',
          pageReference: 'pp. 45-52',
          sourceType: 'book'
        };

        const citation = manager.formatCitation(reference);
        expect(citation).toBe('Ramos, Maximo D. (1971). *The Creatures of Philippine Lower Mythology*. Phoenix Publishing, pp. 45-52.');
      });

      it('should format reference without optional fields', () => {
        const reference: AcademicReference = {
          author: 'Test, Author',
          title: 'Test Title',
          publicationYear: 2000,
          sourceType: 'book'
        };

        const citation = manager.formatCitation(reference);
        expect(citation).toBe('Test, Author (2000). *Test Title*.');
      });

      it('should throw error for invalid reference', () => {
        const reference: AcademicReference = {
          author: '',
          title: 'Test Title',
          publicationYear: 2000,
          sourceType: 'book'
        };

        expect(() => manager.formatCitation(reference)).toThrow();
      });
    });

    describe('database operations', () => {
      it('should retrieve references by author', () => {
        const references = manager.searchByAuthor('Ramos');
        expect(references.length).toBeGreaterThan(0);
        expect(references.every(ref => ref.author.includes('Ramos'))).toBe(true);
      });

      it('should retrieve references by title keywords', () => {
        const references = manager.searchByTitle('Philippine');
        expect(references.length).toBeGreaterThan(0);
        expect(references.every(ref => ref.title.toLowerCase().includes('philippine'))).toBe(true);
      });

      it('should add valid reference to database', () => {
        const reference: AcademicReference = {
          author: 'Test, New Author',
          title: 'New Test Title',
          publicationYear: 2023,
          sourceType: 'book'
        };

        const result = manager.addReference(reference);
        expect(result.success).toBe(true);
        expect(result.issues).toHaveLength(0);
      });

      it('should reject invalid reference', () => {
        const reference: AcademicReference = {
          author: '',
          title: 'Test Title',
          publicationYear: 2023,
          sourceType: 'book'
        };

        const result = manager.addReference(reference);
        expect(result.success).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * **Feature: educational-events-system, Property 2: Academic reference integrity**
     * **Validates: Requirements 2.2, 2.5**
     */
    it('Property 2: Academic reference integrity - For any event with academic references, all citations must include author, title, publication year, and follow consistent formatting', () => {
      fc.assert(
        fc.property(
          // Generate valid academic references
          fc.record({
            author: fc.string({ minLength: 3, maxLength: 50 }).map(s => `${s}, Test`),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            publicationYear: fc.integer({ min: 1800, max: new Date().getFullYear() }),
            publisher: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
            pageReference: fc.option(fc.string({ minLength: 3, maxLength: 20 })),
            isbn: fc.option(fc.string({ minLength: 10, maxLength: 17 })),
            sourceType: fc.constantFrom('book', 'journal', 'thesis', 'oral_tradition')
          }),
          (reference: AcademicReference) => {
            // Test that all valid references pass validation
            const validation = manager.validateReference(reference);
            
            if (validation.isValid) {
              // If valid, should be able to format citation
              const citation = manager.formatCitation(reference);
              
              // Citation should contain all required elements
              expect(citation).toContain(reference.author);
              expect(citation).toContain(reference.title);
              expect(citation).toContain(reference.publicationYear.toString());
              
              // Citation should follow consistent format
              expect(citation).toMatch(/^.+\s\(\d{4}\)\.\s\*.+\*.*\.$/);
              
              // Should be able to add to database
              const addResult = manager.addReference(reference);
              expect(addResult.success).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2 (Edge Case): Invalid references should be consistently rejected', () => {
      fc.assert(
        fc.property(
          // Generate potentially invalid references
          fc.record({
            author: fc.option(fc.string({ maxLength: 100 }), { nil: '' }),
            title: fc.option(fc.string({ maxLength: 100 }), { nil: '' }),
            publicationYear: fc.integer({ min: 0, max: 3000 }),
            publisher: fc.option(fc.string({ maxLength: 50 })),
            pageReference: fc.option(fc.string({ maxLength: 20 })),
            isbn: fc.option(fc.string({ maxLength: 20 })),
            sourceType: fc.oneof(
              fc.constantFrom('book', 'journal', 'thesis', 'oral_tradition'),
              fc.string({ maxLength: 20 }) // Invalid source types
            )
          }),
          (reference: any) => {
            const validation = manager.validateReference(reference);
            
            // If validation fails, should not be able to format or add
            if (!validation.isValid) {
              expect(() => manager.formatCitation(reference)).toThrow();
              
              const addResult = manager.addReference(reference);
              expect(addResult.success).toBe(false);
              expect(addResult.issues.length).toBeGreaterThan(0);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2 (Bibliography): Multiple references should maintain consistent formatting', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              author: fc.string({ minLength: 3, maxLength: 50 }).map(s => `${s}, Test`),
              title: fc.string({ minLength: 5, maxLength: 100 }),
              publicationYear: fc.integer({ min: 1800, max: new Date().getFullYear() }),
              publisher: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
              pageReference: fc.option(fc.string({ minLength: 3, maxLength: 20 })),
              sourceType: fc.constantFrom('book', 'journal', 'thesis', 'oral_tradition')
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (references: AcademicReference[]) => {
            // All references should be valid
            const validReferences = references.filter(ref => 
              manager.validateReference(ref).isValid
            );
            
            if (validReferences.length > 0) {
              const bibliography = manager.formatBibliography(validReferences);
              
              // Bibliography should contain all valid references
              validReferences.forEach(ref => {
                expect(bibliography).toContain(ref.author);
                expect(bibliography).toContain(ref.title);
                expect(bibliography).toContain(ref.publicationYear.toString());
              });
              
              // Should be sorted alphabetically by author
              const citations = bibliography.split('\n\n');
              for (let i = 1; i < citations.length; i++) {
                const prevAuthor = citations[i-1].split(' (')[0];
                const currAuthor = citations[i].split(' (')[0];
                expect(prevAuthor.localeCompare(currAuthor)).toBeLessThanOrEqual(0);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 2 (Integrity Check): Database integrity should be maintained', () => {
      const integrityCheck = manager.checkReferenceIntegrity();
      
      // All references in database should be valid
      expect(integrityCheck.validReferences).toBe(integrityCheck.totalReferences);
      expect(integrityCheck.invalidReferences).toHaveLength(0);
      expect(integrityCheck.issues).toHaveLength(0);
      
      // Should have the expected number of pre-loaded references
      expect(integrityCheck.totalReferences).toBeGreaterThan(0);
    });
  });
});