import { 
  EducationalEvent, 
  RegionalOrigin, 
  FilipinoValue
} from '../../data/events/EventTypes';

/**
 * Educational Event Manager
 * 
 * Orchestrates the selection, presentation, and tracking of educational events
 * that teach Filipino mythology, folklore, and values while maintaining engaging gameplay.
 */
export class EducationalEventManager {
  private static instance: EducationalEventManager;
  private encounteredEvents: Set<string> = new Set();
  private educationalProgress: Map<FilipinoValue, number> = new Map();
  private regionalCoverage: Map<RegionalOrigin, number> = new Map();

  private constructor() {
    this.initializeProgress();
  }

  public static getInstance(): EducationalEventManager {
    if (!EducationalEventManager.instance) {
      EducationalEventManager.instance = new EducationalEventManager();
    }
    return EducationalEventManager.instance;
  }

  /**
   * Initialize progress tracking for all Filipino values and regional origins
   */
  private initializeProgress(): void {
    // Initialize Filipino values progress tracking
    Object.values(FilipinoValue).forEach(value => {
      this.educationalProgress.set(value, 0);
    });

    // Initialize regional coverage tracking
    Object.values(RegionalOrigin).forEach(region => {
      this.regionalCoverage.set(region, 0);
    });
  }

  /**
   * Select educational events for a chapter ensuring variety and educational coherence
   * @param chapter - The current chapter/act number
   * @param availableEvents - Pool of available educational events
   * @param requiredCount - Number of events needed (minimum 5 per requirements)
   * @returns Array of selected educational events
   */
  public selectEventsForChapter(
    _chapter: number, 
    availableEvents: EducationalEvent[], 
    requiredCount: number = 5
  ): EducationalEvent[] {
    const selectedEvents: EducationalEvent[] = [];
    const usedCreatures = new Set<string>();
    const usedValues = new Set<FilipinoValue>();
    const usedRegions = new Set<RegionalOrigin>();

    // Filter out already encountered events to ensure uniqueness
    const uniqueEvents = availableEvents.filter(event => 
      !this.encounteredEvents.has(event.id)
    );

    // Score events by how much diversity they add
    // 3 points = new creature, value, and region
    // 0 points = nothing new
    const scoredEvents = uniqueEvents.map(event => {
      let score = 0;
      if (event.culturalContext.mythologicalCreature && !usedCreatures.has(event.culturalContext.mythologicalCreature)) score++;
      if (!usedValues.has(event.valuesLesson.primaryValue)) score++;
      if (!usedRegions.has(event.regionalOrigin)) score++;
      return { event, score };
    });

    // Sort by score descending
    scoredEvents.sort((a, b) => b.score - a.score);

    // Select top events
    for (const { event } of scoredEvents) {
      if (selectedEvents.length >= requiredCount) break;

      selectedEvents.push(event);
      
      const creature = event.culturalContext.mythologicalCreature;
      if (creature) usedCreatures.add(creature);
      usedValues.add(event.valuesLesson.primaryValue);
      usedRegions.add(event.regionalOrigin);
      
      // Re-score remaining events? 
      // Ideally yes, because selecting one changes the "used" sets.
      // But a simple sort is a good first heuristic. 
      // For strictly optimal diversity, we would re-evaluate after each pick.
      // Let's implement the re-evaluation for better quality.
    }
    
    // Better Greedy Strategy with Re-evaluation
    // Reset selection and sets
    const finalSelection: EducationalEvent[] = [];
    const finalCreatures = new Set<string>();
    const finalValues = new Set<FilipinoValue>();
    const finalRegions = new Set<RegionalOrigin>();
    
    // Work with a mutable copy of the pool
    const pool = [...uniqueEvents];
    
    while (finalSelection.length < requiredCount && pool.length > 0) {
      // Find best candidate
      let bestIndex = -1;
      let maxScore = -1;
      
      for (let i = 0; i < pool.length; i++) {
        const event = pool[i];
        let score = 0;
        if (event.culturalContext.mythologicalCreature && !finalCreatures.has(event.culturalContext.mythologicalCreature)) score += 10;
        if (!finalValues.has(event.valuesLesson.primaryValue)) score += 5;
        if (!finalRegions.has(event.regionalOrigin)) score += 5;
        
        if (score > maxScore) {
          maxScore = score;
          bestIndex = i;
        }
      }
      
      if (bestIndex !== -1) {
        const bestEvent = pool[bestIndex];
        finalSelection.push(bestEvent);
        pool.splice(bestIndex, 1);
        
        if (bestEvent.culturalContext.mythologicalCreature) finalCreatures.add(bestEvent.culturalContext.mythologicalCreature);
        finalValues.add(bestEvent.valuesLesson.primaryValue);
        finalRegions.add(bestEvent.regionalOrigin);
      }
    }

    return finalSelection;
  }

  /**
   * Track that an educational event has been encountered
   * @param event - The educational event that was encountered
   */
  public markEventEncountered(event: EducationalEvent): void {
    this.encounteredEvents.add(event.id);
    
    // Update educational progress
    const currentProgress = this.educationalProgress.get(event.valuesLesson.primaryValue) || 0;
    this.educationalProgress.set(event.valuesLesson.primaryValue, currentProgress + 1);

    // Update regional coverage
    const currentCoverage = this.regionalCoverage.get(event.regionalOrigin) || 0;
    this.regionalCoverage.set(event.regionalOrigin, currentCoverage + 1);
  }

  /**
   * Validate that an educational event meets all requirements
   * @param event - The educational event to validate
   * @returns Validation result with any issues found
   */
  public validateEducationalEvent(event: EducationalEvent): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for required cultural context
    if (!event.culturalContext) {
      issues.push('Missing cultural context');
    } else {
      if (!event.culturalContext.culturalSignificance) {
        issues.push('Missing cultural significance');
      }
      if (!event.culturalContext.traditionalMeaning) {
        issues.push('Missing traditional meaning');
      }
      if (!event.culturalContext.contemporaryRelevance) {
        issues.push('Missing contemporary relevance');
      }
    }

    // Check for academic references
    if (!event.academicReferences || event.academicReferences.length === 0) {
      issues.push('Missing academic references');
    } else {
      event.academicReferences.forEach((ref, index) => {
        if (!ref.author) issues.push(`Academic reference ${index + 1}: Missing author`);
        if (!ref.title) issues.push(`Academic reference ${index + 1}: Missing title`);
        if (!ref.publicationYear) issues.push(`Academic reference ${index + 1}: Missing publication year`);
      });
    }

    // Check for values lesson
    if (!event.valuesLesson) {
      issues.push('Missing values lesson');
    } else {
      if (!event.valuesLesson.moralTheme) {
        issues.push('Missing moral theme');
      }
      if (!event.valuesLesson.culturalWisdom) {
        issues.push('Missing cultural wisdom');
      }
      if (!event.valuesLesson.applicationToModernLife) {
        issues.push('Missing application to modern life');
      }
    }

    // Check for educational objectives
    if (!event.educationalObjectives || event.educationalObjectives.length === 0) {
      issues.push('Missing educational objectives');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get educational progress statistics for thesis data collection
   * @returns Educational progress and coverage statistics
   */
  public getEducationalStatistics(): {
    valuesProgress: Map<FilipinoValue, number>;
    regionalCoverage: Map<RegionalOrigin, number>;
    totalEventsEncountered: number;
    uniqueCreaturesEncountered: number;
  } {
    return {
      valuesProgress: new Map(this.educationalProgress),
      regionalCoverage: new Map(this.regionalCoverage),
      totalEventsEncountered: this.encounteredEvents.size,
      uniqueCreaturesEncountered: this.encounteredEvents.size // Simplified for now
    };
  }

  /**
   * Reset educational progress (for testing or new game)
   */
  public resetProgress(): void {
    this.encounteredEvents.clear();
    this.initializeProgress();
  }

  /**
   * Check if content uniqueness is preserved
   * @param eventId - The event ID to check
   * @returns True if the event hasn't been encountered before
   */
  public isContentUnique(eventId: string): boolean {
    return !this.encounteredEvents.has(eventId);
  }

  /**
   * Get regional variation acknowledgment for events with multiple versions
   * @param baseEventId - The base event identifier
   * @param availableVariations - Available regional variations
   * @returns Selected variation with proper attribution
   */
  public selectRegionalVariation(
    _baseEventId: string, 
    availableVariations: EducationalEvent[]
  ): EducationalEvent | null {
    // Filter variations that haven't been encountered
    const uniqueVariations = availableVariations.filter(variation => 
      this.isContentUnique(variation.id)
    );

    if (uniqueVariations.length === 0) return null;

    // Select variation from least covered region
    const sortedByRegionalCoverage = uniqueVariations.sort((a, b) => {
      const coverageA = this.regionalCoverage.get(a.regionalOrigin) || 0;
      const coverageB = this.regionalCoverage.get(b.regionalOrigin) || 0;
      return coverageA - coverageB;
    });

    return sortedByRegionalCoverage[0];
  }
}