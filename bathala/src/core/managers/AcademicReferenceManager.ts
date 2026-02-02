import { AcademicReference } from '../../data/events/EventTypes';

/**
 * Academic Reference Manager
 * 
 * Manages academic references for educational events, providing validation,
 * formatting, and database functionality for Filipino folklore scholars.
 */
export class AcademicReferenceManager {
  private static instance: AcademicReferenceManager;
  private referenceDatabase: Map<string, AcademicReference> = new Map();

  private constructor() {
    this.initializeReferenceDatabase();
  }

  public static getInstance(): AcademicReferenceManager {
    if (!AcademicReferenceManager.instance) {
      AcademicReferenceManager.instance = new AcademicReferenceManager();
    }
    return AcademicReferenceManager.instance;
  }

  /**
   * Initialize the reference database with key Filipino folklore scholars
   */
  private initializeReferenceDatabase(): void {
    const references: AcademicReference[] = [
      {
        author: 'Ramos, Maximo D.',
        title: 'The Creatures of Philippine Lower Mythology',
        publicationYear: 1971,
        publisher: 'Phoenix Publishing',
        pageReference: 'pp. 45-52',
        sourceType: 'book'
      },
      {
        author: 'Ramos, Maximo D.',
        title: 'The Aswang Syncretic in Philippine Folklore',
        publicationYear: 1969,
        publisher: 'Phoenix Publishing',
        pageReference: 'pp. 123-130',
        sourceType: 'book'
      },
      {
        author: 'Ramos, Maximo D.',
        title: 'The Creatures of Midnight',
        publicationYear: 1990,
        publisher: 'Phoenix Publishing',
        pageReference: 'pp. 34-41',
        sourceType: 'book'
      },
      {
        author: 'Eugenio, Damiana L.',
        title: 'Philippine Folk Literature: The Myths',
        publicationYear: 1993,
        publisher: 'University of the Philippines Press',
        pageReference: 'pp. 78-85',
        sourceType: 'book'
      },
      {
        author: 'Rixhon, Gerard',
        title: 'Mindanao Folklore',
        publicationYear: 1988,
        publisher: 'Xavier University Press',
        pageReference: 'pp. 67-74',
        sourceType: 'book'
      },
      {
        author: 'Jocano, F. Landa',
        title: 'Philippine Mythology',
        publicationYear: 1969,
        publisher: 'PUNLAD Research House',
        sourceType: 'book'
      },
      {
        author: 'Demetrio, Francisco R.',
        title: 'Encyclopedia of Philippine Folk Beliefs and Customs',
        publicationYear: 1991,
        publisher: 'Xavier University Press',
        sourceType: 'book'
      },
      {
        author: 'Bernad, Miguel A.',
        title: 'The Christianization of the Philippines',
        publicationYear: 1972,
        publisher: 'Loyola House of Studies',
        sourceType: 'book'
      },
      {
        author: 'Salazar, Zeus A.',
        title: 'Ang Babaylan sa Kasaysayan ng Pilipinas',
        publicationYear: 1999,
        publisher: 'PUNLAD Research House',
        sourceType: 'book'
      },
      {
        author: 'Mercado, Leonardo N.',
        title: 'Elements of Filipino Philosophy',
        publicationYear: 1974,
        publisher: 'Divine Word University Publications',
        sourceType: 'book'
      },
      {
        author: 'Pe-Pua, Rogelia',
        title: 'Sikolohiyang Pilipino: Teorya, Metodo at Gamit',
        publicationYear: 1982,
        publisher: 'University of the Philippines Press',
        sourceType: 'book'
      }
    ];

    references.forEach(ref => {
      const key = this.generateReferenceKey(ref);
      this.referenceDatabase.set(key, ref);
    });
  }

  /**
   * Generate a unique key for a reference
   */
  private generateReferenceKey(reference: AcademicReference): string {
    return `${reference.author.toLowerCase().replace(/[^a-z0-9]/g, '')}_${reference.publicationYear}`;
  }

  /**
   * Validate an academic reference for completeness and integrity
   * @param reference - The academic reference to validate
   * @returns Validation result with any issues found
   */
  public validateReference(reference: AcademicReference): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Required fields validation
    if (!reference.author || reference.author.trim() === '') {
      issues.push('Author is required');
    }

    if (!reference.title || reference.title.trim() === '') {
      issues.push('Title is required');
    }

    if (!reference.publicationYear) {
      issues.push('Publication year is required');
    } else {
      // Validate publication year is reasonable
      const currentYear = new Date().getFullYear();
      if (reference.publicationYear < 1800 || reference.publicationYear > currentYear) {
        issues.push(`Publication year must be between 1800 and ${currentYear}`);
      }
    }

    if (!reference.sourceType) {
      issues.push('Source type is required');
    } else {
      const validSourceTypes = ['book', 'journal', 'thesis', 'oral_tradition'];
      if (!validSourceTypes.includes(reference.sourceType)) {
        issues.push(`Source type must be one of: ${validSourceTypes.join(', ')}`);
      }
    }

    // Format validation
    if (reference.author && !this.isValidAuthorFormat(reference.author)) {
      issues.push('Author should be in "Last, First" format');
    }

    if (reference.isbn && !this.isValidISBN(reference.isbn)) {
      issues.push('ISBN format is invalid');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Check if author is in proper academic format
   */
  private isValidAuthorFormat(author: string): boolean {
    // Check for "Last, First" format
    return /^[A-Za-z\s\-'\.]+,\s*[A-Za-z\s\-'\.]+$/.test(author);
  }

  /**
   * Validate ISBN format (basic validation)
   */
  private isValidISBN(isbn: string): boolean {
    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    // Check for 10 or 13 digit ISBN
    return /^(\d{10}|\d{13})$/.test(cleanISBN);
  }

  /**
   * Format a reference in consistent academic style (APA-like)
   * @param reference - The academic reference to format
   * @returns Formatted citation string
   */
  public formatCitation(reference: AcademicReference): string {
    const validation = this.validateReference(reference);
    if (!validation.isValid) {
      throw new Error(`Cannot format invalid reference: ${validation.issues.join(', ')}`);
    }

    let citation = `${reference.author} (${reference.publicationYear}). *${reference.title}*`;

    if (reference.publisher) {
      citation += `. ${reference.publisher}`;
    }

    if (reference.pageReference) {
      citation += `, ${reference.pageReference}`;
    }

    citation += '.';

    return citation;
  }

  /**
   * Format multiple references as a bibliography
   * @param references - Array of academic references
   * @returns Formatted bibliography string
   */
  public formatBibliography(references: AcademicReference[]): string {
    const validReferences = references.filter(ref => 
      this.validateReference(ref).isValid
    );

    // Sort references alphabetically by author
    const sortedReferences = validReferences.sort((a, b) => 
      a.author.localeCompare(b.author)
    );

    return sortedReferences
      .map(ref => this.formatCitation(ref))
      .join('\n\n');
  }

  /**
   * Get a reference from the database by key
   * @param key - The reference key (generated from author and year)
   * @returns The academic reference if found
   */
  public getReferenceByKey(key: string): AcademicReference | undefined {
    return this.referenceDatabase.get(key);
  }

  /**
   * Search references by author
   * @param authorName - The author name to search for
   * @returns Array of matching references
   */
  public searchByAuthor(authorName: string): AcademicReference[] {
    const searchTerm = authorName.toLowerCase();
    return Array.from(this.referenceDatabase.values()).filter(ref =>
      ref.author.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Search references by title
   * @param titleKeywords - Keywords to search in titles
   * @returns Array of matching references
   */
  public searchByTitle(titleKeywords: string): AcademicReference[] {
    const searchTerm = titleKeywords.toLowerCase();
    return Array.from(this.referenceDatabase.values()).filter(ref =>
      ref.title.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get all references from a specific year
   * @param year - The publication year
   * @returns Array of references from that year
   */
  public getReferencesByYear(year: number): AcademicReference[] {
    return Array.from(this.referenceDatabase.values()).filter(ref =>
      ref.publicationYear === year
    );
  }

  /**
   * Get all references of a specific source type
   * @param sourceType - The type of source to filter by
   * @returns Array of references of that type
   */
  public getReferencesBySourceType(sourceType: AcademicReference['sourceType']): AcademicReference[] {
    return Array.from(this.referenceDatabase.values()).filter(ref =>
      ref.sourceType === sourceType
    );
  }

  /**
   * Add a new reference to the database
   * @param reference - The academic reference to add
   * @returns Success status and any validation issues
   */
  public addReference(reference: AcademicReference): {
    success: boolean;
    issues: string[];
  } {
    const validation = this.validateReference(reference);
    
    if (!validation.isValid) {
      return {
        success: false,
        issues: validation.issues
      };
    }

    const key = this.generateReferenceKey(reference);
    this.referenceDatabase.set(key, reference);

    return {
      success: true,
      issues: []
    };
  }

  /**
   * Get all references in the database
   * @returns Array of all academic references
   */
  public getAllReferences(): AcademicReference[] {
    return Array.from(this.referenceDatabase.values());
  }

  /**
   * Check reference integrity across all stored references
   * @returns Integrity check results
   */
  public checkReferenceIntegrity(): {
    totalReferences: number;
    validReferences: number;
    invalidReferences: AcademicReference[];
    issues: string[];
  } {
    const allReferences = this.getAllReferences();
    const invalidReferences: AcademicReference[] = [];
    const allIssues: string[] = [];

    let validCount = 0;

    allReferences.forEach(ref => {
      const validation = this.validateReference(ref);
      if (validation.isValid) {
        validCount++;
      } else {
        invalidReferences.push(ref);
        allIssues.push(`${ref.author} (${ref.publicationYear}): ${validation.issues.join(', ')}`);
      }
    });

    return {
      totalReferences: allReferences.length,
      validReferences: validCount,
      invalidReferences,
      issues: allIssues
    };
  }
}