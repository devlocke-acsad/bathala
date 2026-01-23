import { CulturalContext, RegionalOrigin } from '../../data/events/EventTypes';

/**
 * Cultural Context Manager
 * 
 * Manages cultural context for educational events, providing validation,
 * regional origin tracking, and cultural significance storage for Filipino folklore.
 */
export class CulturalContextManager {
  private static instance: CulturalContextManager;
  private culturalDatabase: Map<string, CulturalContext> = new Map();
  private regionalMythologyMap: Map<RegionalOrigin, string[]> = new Map();

  private constructor() {
    this.initializeCulturalDatabase();
    this.initializeRegionalMythology();
  }

  public static getInstance(): CulturalContextManager {
    if (!CulturalContextManager.instance) {
      CulturalContextManager.instance = new CulturalContextManager();
    }
    return CulturalContextManager.instance;
  }

  /**
   * Initialize the cultural context database with key Filipino mythological creatures
   */
  private initializeCulturalDatabase(): void {
    const contexts: Array<{ key: string; context: CulturalContext }> = [
      {
        key: 'kapre',
        context: {
          mythologicalCreature: 'Kapre',
          folkloreType: 'alamat',
          culturalSignificance: 'Forest guardian spirit that teaches respect for nature and ancestral wisdom',
          traditionalMeaning: 'Protector of trees and forests, often smoking tobacco and playing pranks on humans who disrespect nature',
          contemporaryRelevance: 'Represents environmental stewardship and the importance of preserving natural habitats in modern times'
        }
      },
      {
        key: 'tikbalang',
        context: {
          mythologicalCreature: 'Tikbalang',
          folkloreType: 'alamat',
          culturalSignificance: 'Half-man, half-horse creature that leads travelers astray to teach humility',
          traditionalMeaning: 'Mischievous spirit that tests human pride and the importance of asking for help when lost',
          contemporaryRelevance: 'Symbolizes the value of community guidance and humility in facing life\'s challenges'
        }
      },
      {
        key: 'bakunawa',
        context: {
          mythologicalCreature: 'Bakunawa',
          folkloreType: 'alamat',
          culturalSignificance: 'Dragon that devours the moon, explaining lunar eclipses and cosmic balance',
          traditionalMeaning: 'Represents the eternal struggle between light and darkness, order and chaos',
          contemporaryRelevance: 'Teaches about natural phenomena and the importance of balance in life and society'
        }
      },
      {
        key: 'diwata',
        context: {
          mythologicalCreature: 'Diwata',
          folkloreType: 'alamat',
          culturalSignificance: 'Nature spirit that rewards kindness and punishes those who harm the environment',
          traditionalMeaning: 'Divine feminine guardian of natural places, embodying the connection between humans and nature',
          contemporaryRelevance: 'Represents environmental consciousness and the feminine principle in Filipino spirituality'
        }
      },
      {
        key: 'aswang',
        context: {
          mythologicalCreature: 'Aswang',
          folkloreType: 'kwentong-bayan',
          culturalSignificance: 'Shape-shifting creature that tests moral character and community vigilance',
          traditionalMeaning: 'Represents the fear of the unknown and the importance of discerning true character',
          contemporaryRelevance: 'Symbolizes the need for critical thinking and community protection against deception'
        }
      },
      {
        key: 'sirena',
        context: {
          mythologicalCreature: 'Sirena',
          folkloreType: 'alamat',
          culturalSignificance: 'Mermaid guardian of seas and rivers, protector of marine life',
          traditionalMeaning: 'Beautiful sea spirit that embodies the bounty and danger of the ocean',
          contemporaryRelevance: 'Represents marine conservation and sustainable fishing practices'
        }
      },
      {
        key: 'anito',
        context: {
          mythologicalCreature: 'Anito',
          folkloreType: 'alamat',
          culturalSignificance: 'Ancestral spirits that guide and protect their descendants',
          traditionalMeaning: 'Deified ancestors who continue to influence the living world through blessings and warnings',
          contemporaryRelevance: 'Emphasizes respect for elders and the continuity of family traditions'
        }
      },
      {
        key: 'bantay_tubig',
        context: {
          mythologicalCreature: 'Bantay Tubig',
          folkloreType: 'alamat',
          culturalSignificance: 'Water guardian spirit that protects rivers, lakes, and springs',
          traditionalMeaning: 'Spiritual protector of water sources, ensuring their purity and availability',
          contemporaryRelevance: 'Represents water conservation and the protection of freshwater resources'
        }
      }
    ];

    contexts.forEach(({ key, context }) => {
      this.culturalDatabase.set(key, context);
    });
  }

  /**
   * Initialize regional mythology mapping
   */
  private initializeRegionalMythology(): void {
    this.regionalMythologyMap.set(RegionalOrigin.LUZON_TAGALOG, [
      'kapre', 'tikbalang', 'diwata', 'anito', 'aswang'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.LUZON_ILOCANO, [
      'kapre', 'anito', 'diwata'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.LUZON_BICOLANO, [
      'diwata', 'anito', 'bantay_tubig'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.VISAYAS_CEBUANO, [
      'bakunawa', 'sirena', 'diwata', 'aswang'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.VISAYAS_HILIGAYNON, [
      'aswang', 'sirena', 'diwata', 'bantay_tubig'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.MINDANAO_MARANAO, [
      'diwata', 'anito', 'bantay_tubig'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.MINDANAO_TAUSUG, [
      'sirena', 'diwata', 'bantay_tubig'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.CORDILLERA, [
      'anito', 'diwata', 'kapre'
    ]);
    
    this.regionalMythologyMap.set(RegionalOrigin.PALAWAN, [
      'diwata', 'sirena', 'bantay_tubig'
    ]);
  }

  /**
   * Validate a cultural context for completeness and cultural attribution
   * @param context - The cultural context to validate
   * @param regionalOrigin - The regional origin for cultural attribution
   * @returns Validation result with any issues found
   */
  public validateCulturalContext(
    context: CulturalContext, 
    regionalOrigin?: RegionalOrigin
  ): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Required fields validation
    if (!context.folkloreType) {
      issues.push('Folklore type is required');
    } else {
      const validFolkloreTypes = ['alamat', 'kwentong-bayan', 'pabula', 'legend'];
      if (!validFolkloreTypes.includes(context.folkloreType)) {
        issues.push(`Folklore type must be one of: ${validFolkloreTypes.join(', ')}`);
      }
    }

    if (!context.culturalSignificance || context.culturalSignificance.trim() === '') {
      issues.push('Cultural significance is required');
    }

    if (!context.traditionalMeaning || context.traditionalMeaning.trim() === '') {
      issues.push('Traditional meaning is required');
    }

    if (!context.contemporaryRelevance || context.contemporaryRelevance.trim() === '') {
      issues.push('Contemporary relevance is required');
    }

    // Content quality validation
    if (context.culturalSignificance && context.culturalSignificance.length < 20) {
      issues.push('Cultural significance should be more descriptive (minimum 20 characters)');
    }

    if (context.traditionalMeaning && context.traditionalMeaning.length < 20) {
      issues.push('Traditional meaning should be more descriptive (minimum 20 characters)');
    }

    if (context.contemporaryRelevance && context.contemporaryRelevance.length < 20) {
      issues.push('Contemporary relevance should be more descriptive (minimum 20 characters)');
    }

    // Regional attribution validation
    if (regionalOrigin && context.mythologicalCreature) {
      const regionalCreatures = this.regionalMythologyMap.get(regionalOrigin) || [];
      const creatureKey = context.mythologicalCreature.toLowerCase().replace(/\s+/g, '_');
      
      if (!regionalCreatures.includes(creatureKey)) {
        issues.push(`Mythological creature "${context.mythologicalCreature}" is not traditionally associated with region "${regionalOrigin}"`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get cultural context by creature name
   * @param creatureName - The name of the mythological creature
   * @returns The cultural context if found
   */
  public getCulturalContext(creatureName: string): CulturalContext | undefined {
    const key = creatureName.toLowerCase().replace(/\s+/g, '_');
    return this.culturalDatabase.get(key);
  }

  /**
   * Get all mythological creatures for a specific region
   * @param region - The regional origin
   * @returns Array of creature names associated with the region
   */
  public getRegionalCreatures(region: RegionalOrigin): string[] {
    return this.regionalMythologyMap.get(region) || [];
  }

  /**
   * Get all regions where a creature is found
   * @param creatureName - The name of the mythological creature
   * @returns Array of regional origins where the creature is found
   */
  public getCreatureRegions(creatureName: string): RegionalOrigin[] {
    const key = creatureName.toLowerCase().replace(/\s+/g, '_');
    const regions: RegionalOrigin[] = [];

    this.regionalMythologyMap.forEach((creatures, region) => {
      if (creatures.includes(key)) {
        regions.push(region);
      }
    });

    return regions;
  }

  /**
   * Add a new cultural context to the database
   * @param creatureName - The name of the mythological creature
   * @param context - The cultural context to add
   * @param regions - The regions where this creature is found
   * @returns Success status and any validation issues
   */
  public addCulturalContext(
    creatureName: string,
    context: CulturalContext,
    regions: RegionalOrigin[] = []
  ): {
    success: boolean;
    issues: string[];
  } {
    const validation = this.validateCulturalContext(context);
    
    if (!validation.isValid) {
      return {
        success: false,
        issues: validation.issues
      };
    }

    const key = creatureName.toLowerCase().replace(/\s+/g, '_');
    this.culturalDatabase.set(key, context);

    // Add to regional mappings
    regions.forEach(region => {
      const existingCreatures = this.regionalMythologyMap.get(region) || [];
      if (!existingCreatures.includes(key)) {
        existingCreatures.push(key);
        this.regionalMythologyMap.set(region, existingCreatures);
      }
    });

    return {
      success: true,
      issues: []
    };
  }

  /**
   * Search cultural contexts by folklore type
   * @param folkloreType - The type of folklore to search for
   * @returns Array of matching cultural contexts with creature names
   */
  public searchByFolkloreType(folkloreType: CulturalContext['folkloreType']): Array<{
    creatureName: string;
    context: CulturalContext;
  }> {
    const results: Array<{ creatureName: string; context: CulturalContext }> = [];

    this.culturalDatabase.forEach((context, key) => {
      if (context.folkloreType === folkloreType) {
        results.push({
          creatureName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          context
        });
      }
    });

    return results;
  }

  /**
   * Get cultural contexts that emphasize specific themes
   * @param theme - The theme to search for (e.g., "environment", "community", "wisdom")
   * @returns Array of matching cultural contexts
   */
  public searchByTheme(theme: string): Array<{
    creatureName: string;
    context: CulturalContext;
  }> {
    const results: Array<{ creatureName: string; context: CulturalContext }> = [];
    const searchTerm = theme.toLowerCase();

    this.culturalDatabase.forEach((context, key) => {
      const searchableText = [
        context.culturalSignificance,
        context.traditionalMeaning,
        context.contemporaryRelevance
      ].join(' ').toLowerCase();

      if (searchableText.includes(searchTerm)) {
        results.push({
          creatureName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          context
        });
      }
    });

    return results;
  }

  /**
   * Validate cultural attribution completeness for an event
   * @param context - The cultural context
   * @param regionalOrigin - The regional origin
   * @param communityAttribution - Optional community attribution
   * @returns Validation result for cultural attribution
   */
  public validateCulturalAttribution(
    context: CulturalContext,
    regionalOrigin: RegionalOrigin,
    communityAttribution?: string
  ): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic context validation
    const contextValidation = this.validateCulturalContext(context, regionalOrigin);
    issues.push(...contextValidation.issues);

    // Regional appropriateness check
    if (context.mythologicalCreature) {
      const creatureRegions = this.getCreatureRegions(context.mythologicalCreature);
      
      if (creatureRegions.length > 0 && !creatureRegions.includes(regionalOrigin)) {
        issues.push(`Creature "${context.mythologicalCreature}" is not traditionally from region "${regionalOrigin}"`);
        suggestions.push(`Consider using regions: ${creatureRegions.join(', ')}`);
      }
    }

    // Community attribution suggestions
    if (!communityAttribution) {
      suggestions.push('Consider adding specific community or ethnic group attribution for cultural sensitivity');
    }

    // Cultural sensitivity checks
    if (context.folkloreType === 'alamat' && !context.traditionalMeaning.includes('spirit')) {
      suggestions.push('Alamat typically involve spiritual elements - consider emphasizing spiritual significance');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Get all cultural contexts in the database
   * @returns Array of all cultural contexts with creature names
   */
  public getAllCulturalContexts(): Array<{
    creatureName: string;
    context: CulturalContext;
    regions: RegionalOrigin[];
  }> {
    const results: Array<{
      creatureName: string;
      context: CulturalContext;
      regions: RegionalOrigin[];
    }> = [];

    this.culturalDatabase.forEach((context, key) => {
      const creatureName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const regions = this.getCreatureRegions(creatureName);
      
      results.push({
        creatureName,
        context,
        regions
      });
    });

    return results;
  }

  /**
   * Check cultural database integrity
   * @returns Integrity check results
   */
  public checkCulturalIntegrity(): {
    totalContexts: number;
    validContexts: number;
    invalidContexts: Array<{ creatureName: string; issues: string[] }>;
    regionalCoverage: Map<RegionalOrigin, number>;
  } {
    const allContexts = this.getAllCulturalContexts();
    const invalidContexts: Array<{ creatureName: string; issues: string[] }> = [];
    const regionalCoverage = new Map<RegionalOrigin, number>();

    // Initialize regional coverage
    Object.values(RegionalOrigin).forEach(region => {
      regionalCoverage.set(region, 0);
    });

    let validCount = 0;

    allContexts.forEach(({ creatureName, context, regions }) => {
      const validation = this.validateCulturalContext(context);
      
      if (validation.isValid) {
        validCount++;
        
        // Count regional coverage
        regions.forEach(region => {
          const current = regionalCoverage.get(region) || 0;
          regionalCoverage.set(region, current + 1);
        });
      } else {
        invalidContexts.push({
          creatureName,
          issues: validation.issues
        });
      }
    });

    return {
      totalContexts: allContexts.length,
      validContexts: validCount,
      invalidContexts,
      regionalCoverage
    };
  }
}