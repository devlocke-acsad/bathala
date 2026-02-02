import { FilipinoValue, ValuesLesson } from '../../data/events/EventTypes';

/**
 * Choice Evaluation Result
 * Represents the outcome of evaluating a player's choice against Filipino values
 */
export interface ChoiceEvaluationResult {
  alignedValues: FilipinoValue[];
  conflictedValues: FilipinoValue[];
  moralImplications: string;
  culturalWisdom: string;
  contemporaryRelevance: string;
  communityImpact?: string;
}

/**
 * Ethical Dilemma
 * Represents a moral choice scenario with multiple value considerations
 */
export interface EthicalDilemma {
  scenario: string;
  choices: EthicalChoice[];
  primaryValues: FilipinoValue[];
  culturalContext: string;
}

/**
 * Ethical Choice
 * Represents a single choice option in an ethical dilemma
 */
export interface EthicalChoice {
  text: string;
  alignedValues: FilipinoValue[];
  conflictedValues: FilipinoValue[];
  consequences: string;
  moralReasoning: string;
}

/**
 * Values Assessment Engine
 * 
 * Implements Filipino values assessment with moral theme and ethical dilemma handling.
 * Provides cultural wisdom storage and modern application explanations.
 * Includes values-based choice evaluation system.
 */
export class ValuesAssessmentEngine {
  private static instance: ValuesAssessmentEngine;
  private valuesDefinitions: Map<FilipinoValue, ValuesDefinition> = new Map();
  private culturalWisdomDatabase: Map<FilipinoValue, string[]> = new Map();
  private modernApplications: Map<FilipinoValue, string[]> = new Map();

  private constructor() {
    this.initializeValuesDefinitions();
    this.initializeCulturalWisdom();
    this.initializeModernApplications();
  }

  public static getInstance(): ValuesAssessmentEngine {
    if (!ValuesAssessmentEngine.instance) {
      ValuesAssessmentEngine.instance = new ValuesAssessmentEngine();
    }
    return ValuesAssessmentEngine.instance;
  }

  /**
   * Create a ValuesLesson with comprehensive moral theme and ethical dilemma handling
   * @param primaryValue - The main Filipino value being taught
   * @param moralTheme - The central moral theme of the lesson
   * @param ethicalDilemma - Optional ethical dilemma for deeper engagement
   * @returns A complete ValuesLesson instance
   */
  public createValuesLesson(
    primaryValue: FilipinoValue,
    moralTheme: string,
    ethicalDilemma?: string
  ): ValuesLesson {
    const valueDefinition = this.valuesDefinitions.get(primaryValue);
    if (!valueDefinition) {
      throw new Error(`Unknown Filipino value: ${primaryValue}`);
    }

    const culturalWisdom = this.getCulturalWisdom(primaryValue);
    const applicationToModernLife = this.getModernApplication(primaryValue);

    return {
      primaryValue,
      moralTheme,
      ethicalDilemma,
      culturalWisdom,
      applicationToModernLife
    };
  }

  /**
   * Evaluate a player's choice against Filipino values
   * @param choice - The choice made by the player
   * @param context - The cultural and situational context
   * @param relevantValues - Values that apply to this situation
   * @returns Detailed evaluation result with moral implications
   */
  public evaluateChoice(
    choice: string,
    context: string,
    relevantValues: FilipinoValue[]
  ): ChoiceEvaluationResult {
    const alignedValues: FilipinoValue[] = [];
    const conflictedValues: FilipinoValue[] = [];

    // Analyze choice against each relevant value
    relevantValues.forEach(value => {
      if (this.isChoiceAlignedWithValue(choice, value, context)) {
        alignedValues.push(value);
      } else {
        conflictedValues.push(value);
      }
    });

    const moralImplications = this.generateMoralImplications(alignedValues, conflictedValues);
    const culturalWisdom = this.generateCulturalWisdomForChoice(alignedValues);
    const contemporaryRelevance = this.generateContemporaryRelevance(alignedValues, choice);
    const communityImpact = this.generateCommunityImpact(alignedValues, conflictedValues);

    return {
      alignedValues,
      conflictedValues,
      moralImplications,
      culturalWisdom,
      contemporaryRelevance,
      communityImpact
    };
  }

  /**
   * Create an ethical dilemma with multiple value considerations
   * @param scenario - The dilemma scenario description
   * @param choices - Available choices with their value implications
   * @param primaryValues - Main values being tested
   * @param culturalContext - Cultural background for the dilemma
   * @returns A complete EthicalDilemma instance
   */
  public createEthicalDilemma(
    scenario: string,
    choices: EthicalChoice[],
    primaryValues: FilipinoValue[],
    culturalContext: string
  ): EthicalDilemma {
    return {
      scenario,
      choices,
      primaryValues,
      culturalContext
    };
  }

  /**
   * Get cultural wisdom associated with a specific Filipino value
   * @param value - The Filipino value
   * @returns Cultural wisdom saying or principle
   */
  public getCulturalWisdom(value: FilipinoValue): string {
    const wisdom = this.culturalWisdomDatabase.get(value);
    if (!wisdom || wisdom.length === 0) {
      return `Traditional wisdom emphasizes the importance of ${value} in Filipino culture.`;
    }
    
    // Return a random wisdom saying for variety
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }

  /**
   * Get modern application explanation for a Filipino value
   * @param value - The Filipino value
   * @returns Modern application explanation
   */
  public getModernApplication(value: FilipinoValue): string {
    const applications = this.modernApplications.get(value);
    if (!applications || applications.length === 0) {
      return `${value} remains relevant in modern Filipino society through community practices and social interactions.`;
    }
    
    // Return a random application for variety
    return applications[Math.floor(Math.random() * applications.length)];
  }

  /**
   * Assess if a choice aligns with a specific Filipino value
   * @param choice - The choice text or action
   * @param value - The Filipino value to check against
   * @param context - The situational context
   * @returns True if the choice aligns with the value
   */
  private isChoiceAlignedWithValue(choice: string, value: FilipinoValue, context: string): boolean {
    const lowerChoice = choice.toLowerCase();
    const lowerContext = context.toLowerCase();

    switch (value) {
      case FilipinoValue.KAPAMILYA:
        return lowerChoice.includes('family') || lowerChoice.includes('relative') || 
               lowerChoice.includes('help family') || lowerChoice.includes('protect family');

      case FilipinoValue.BAYANIHAN:
        return lowerChoice.includes('help community') || lowerChoice.includes('work together') ||
               lowerChoice.includes('cooperate') || lowerChoice.includes('unite');

      case FilipinoValue.UTANG_NA_LOOB:
        return lowerChoice.includes('repay') || lowerChoice.includes('grateful') ||
               lowerChoice.includes('return favor') || lowerChoice.includes('acknowledge help');

      case FilipinoValue.MALASAKIT:
        return lowerChoice.includes('care for') || lowerChoice.includes('compassion') ||
               lowerChoice.includes('help others') || lowerChoice.includes('show concern');

      case FilipinoValue.PAKIKIPAGKAPWA:
        return lowerChoice.includes('share') || lowerChoice.includes('include others') ||
               lowerChoice.includes('treat as equal') || lowerChoice.includes('empathy');

      case FilipinoValue.HIYA:
        return lowerChoice.includes('respectful') || lowerChoice.includes('proper behavior') ||
               lowerChoice.includes('avoid shame') || lowerChoice.includes('maintain dignity');

      case FilipinoValue.DELICADEZA:
        return lowerChoice.includes('appropriate') || lowerChoice.includes('proper conduct') ||
               lowerChoice.includes('ethical') || lowerChoice.includes('moral');

      case FilipinoValue.PAKIKIPAGBIGAYAN:
        return lowerChoice.includes('compromise') || lowerChoice.includes('give way') ||
               lowerChoice.includes('accommodate') || lowerChoice.includes('mutual understanding');

      case FilipinoValue.AMOR_PROPIO:
        return lowerChoice.includes('self-respect') || lowerChoice.includes('dignity') ||
               lowerChoice.includes('honor') || lowerChoice.includes('maintain reputation');

      case FilipinoValue.PAKIKIPAGKUNWARE:
        return lowerChoice.includes('conform') || lowerChoice.includes('go along') ||
               lowerChoice.includes('accommodate') || lowerChoice.includes('avoid conflict');

      default:
        return false;
    }
  }

  /**
   * Generate moral implications explanation based on value alignment
   */
  private generateMoralImplications(alignedValues: FilipinoValue[], conflictedValues: FilipinoValue[]): string {
    if (alignedValues.length > 0 && conflictedValues.length === 0) {
      return `Your choice strongly reflects Filipino values of ${alignedValues.join(', ')}, showing moral alignment with traditional wisdom.`;
    } else if (conflictedValues.length > 0 && alignedValues.length === 0) {
      return `Your choice conflicts with Filipino values of ${conflictedValues.join(', ')}, which may lead to social or personal consequences.`;
    } else if (alignedValues.length > 0 && conflictedValues.length > 0) {
      return `Your choice reflects a complex moral situation, aligning with ${alignedValues.join(', ')} while potentially conflicting with ${conflictedValues.join(', ')}.`;
    } else {
      return 'Your choice represents a neutral moral position that neither strongly aligns with nor conflicts with traditional Filipino values.';
    }
  }

  /**
   * Generate cultural wisdom relevant to the aligned values
   */
  private generateCulturalWisdomForChoice(alignedValues: FilipinoValue[]): string {
    if (alignedValues.length === 0) {
      return 'Traditional Filipino wisdom teaches that every action has consequences for both self and community.';
    }

    const primaryValue = alignedValues[0];
    return this.getCulturalWisdom(primaryValue);
  }

  /**
   * Generate contemporary relevance explanation
   */
  private generateContemporaryRelevance(alignedValues: FilipinoValue[], choice: string): string {
    if (alignedValues.length === 0) {
      return 'In modern society, individual choices still impact community relationships and social harmony.';
    }

    const primaryValue = alignedValues[0];
    return this.getModernApplication(primaryValue);
  }

  /**
   * Generate community impact assessment
   */
  private generateCommunityImpact(alignedValues: FilipinoValue[], conflictedValues: FilipinoValue[]): string {
    if (alignedValues.includes(FilipinoValue.BAYANIHAN) || alignedValues.includes(FilipinoValue.PAKIKIPAGKAPWA)) {
      return 'Your choice strengthens community bonds and promotes collective well-being.';
    } else if (conflictedValues.includes(FilipinoValue.BAYANIHAN) || conflictedValues.includes(FilipinoValue.PAKIKIPAGKAPWA)) {
      return 'Your choice may weaken community relationships and reduce social cohesion.';
    } else {
      return 'Your choice has moderate impact on community relationships.';
    }
  }

  /**
   * Initialize comprehensive definitions for all Filipino values
   */
  private initializeValuesDefinitions(): void {
    this.valuesDefinitions.set(FilipinoValue.KAPAMILYA, {
      name: 'Kapamilya',
      description: 'Family-centeredness and loyalty to family members',
      culturalImportance: 'Central to Filipino identity and social structure'
    });

    this.valuesDefinitions.set(FilipinoValue.BAYANIHAN, {
      name: 'Bayanihan',
      description: 'Community spirit and collective cooperation',
      culturalImportance: 'Represents Filipino unity and mutual assistance'
    });

    this.valuesDefinitions.set(FilipinoValue.UTANG_NA_LOOB, {
      name: 'Utang na Loob',
      description: 'Debt of gratitude and reciprocal obligation',
      culturalImportance: 'Maintains social relationships and mutual support systems'
    });

    this.valuesDefinitions.set(FilipinoValue.MALASAKIT, {
      name: 'Malasakit',
      description: 'Compassionate care and concern for others',
      culturalImportance: 'Demonstrates Filipino empathy and social responsibility'
    });

    this.valuesDefinitions.set(FilipinoValue.PAKIKIPAGKAPWA, {
      name: 'Pakikipagkapwa',
      description: 'Shared identity and humaneness',
      culturalImportance: 'Promotes equality and mutual respect among people'
    });

    this.valuesDefinitions.set(FilipinoValue.HIYA, {
      name: 'Hiya',
      description: 'Shame, propriety, and social appropriateness',
      culturalImportance: 'Maintains social order and respectful behavior'
    });

    this.valuesDefinitions.set(FilipinoValue.DELICADEZA, {
      name: 'Delicadeza',
      description: 'Sense of propriety and ethical conduct',
      culturalImportance: 'Ensures moral behavior and social integrity'
    });

    this.valuesDefinitions.set(FilipinoValue.PAKIKIPAGBIGAYAN, {
      name: 'Pakikipagbigayan',
      description: 'Mutual accommodation and compromise',
      culturalImportance: 'Promotes harmony and peaceful conflict resolution'
    });

    this.valuesDefinitions.set(FilipinoValue.AMOR_PROPIO, {
      name: 'Amor Propio',
      description: 'Self-esteem and personal dignity',
      culturalImportance: 'Maintains individual honor within community context'
    });

    this.valuesDefinitions.set(FilipinoValue.PAKIKIPAGKUNWARE, {
      name: 'Pakikipagkunware',
      description: 'Accommodation and conformity to avoid conflict',
      culturalImportance: 'Preserves social harmony through adaptive behavior'
    });
  }

  /**
   * Initialize cultural wisdom database with traditional sayings and principles
   */
  private initializeCulturalWisdom(): void {
    this.culturalWisdomDatabase.set(FilipinoValue.KAPAMILYA, [
      'Ang pamilya ang pundasyon ng lipunan - The family is the foundation of society',
      'Kapag may tiyaga, may nilaga - With patience and perseverance, there will be reward',
      'Ang hindi marunong lumingon sa pinanggalingan ay hindi makararating sa paroroonan - Those who do not look back to where they came from will not reach their destination'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.BAYANIHAN, [
      'Sama-sama tayong babangon - Together we will rise',
      'Ang lakas ng pamilya ay nasa pagkakaisa - The strength of the family lies in unity',
      'Kapag nagkakaisa, walang hindi kaya - When united, nothing is impossible'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.UTANG_NA_LOOB, [
      'Ang utang na loob ay hindi nasusukat sa pera - Debt of gratitude cannot be measured in money',
      'Walang utang na hindi dapat bayaran - No debt should remain unpaid',
      'Ang taong walang utang na loob ay walang dangal - A person without gratitude has no honor'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.MALASAKIT, [
      'Ang malasakit ay nagmumula sa puso - Compassion comes from the heart',
      'Kapag may malasakit, may pag-asa - Where there is compassion, there is hope',
      'Ang tunay na yaman ay ang malasakit sa kapwa - True wealth is compassion for others'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.PAKIKIPAGKAPWA, [
      'Tayo ay iisa sa diwa at layunin - We are one in spirit and purpose',
      'Ang kapwa ay hindi ibang tao, kundi ikaw din - Others are not strangers, but part of yourself',
      'Sa pakikipagkapwa, nagiging mas malakas ang bawat isa - Through shared identity, everyone becomes stronger'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.HIYA, [
      'Ang walang hiya ay walang dangal - Those without shame have no honor',
      'Mas mabuti ang mahiya kaysa mapahiya - Better to be modest than to be shamed',
      'Ang hiya ay gabay sa tamang asal - Shame guides proper behavior'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.DELICADEZA, [
      'Ang delicadeza ay susi sa respeto - Propriety is the key to respect',
      'Sa tamang asal, nakakamit ang kapayapaan - Through proper conduct, peace is achieved',
      'Ang may delicadeza ay may mataas na pagpapahalaga sa sarili - Those with propriety have high self-regard'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.PAKIKIPAGBIGAYAN, [
      'Sa pakikipagbigayan, walang natatalo - In mutual accommodation, no one loses',
      'Ang pagbibigayan ay daan sa kapayapaan - Compromise is the path to peace',
      'Mas mabuti ang magbigayan kaysa mag-away - Better to give way than to fight'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.AMOR_PROPIO, [
      'Ang dangal ay hindi nabibili - Honor cannot be bought',
      'Pahalagahan ang sariling dignidad - Value your own dignity',
      'Ang respeto sa sarili ay simula ng respeto sa iba - Self-respect is the beginning of respect for others'
    ]);

    this.culturalWisdomDatabase.set(FilipinoValue.PAKIKIPAGKUNWARE, [
      'Minsan kailangan magpakumbaba para sa kapayapaan - Sometimes one must humble oneself for peace',
      'Ang pakikipagkunware ay hindi kahinaan kundi karunungan - Accommodation is not weakness but wisdom',
      'Sa tamang panahon, lalabas din ang katotohanan - In due time, the truth will emerge'
    ]);
  }

  /**
   * Initialize modern applications for each Filipino value
   */
  private initializeModernApplications(): void {
    this.modernApplications.set(FilipinoValue.KAPAMILYA, [
      'Modern Filipino families maintain strong bonds through technology, regular communication, and mutual support in education and career decisions.',
      'OFW families demonstrate kapamilya through financial support and maintaining emotional connections despite physical distance.',
      'Extended family networks provide social safety nets in urban communities, sharing resources and childcare responsibilities.'
    ]);

    this.modernApplications.set(FilipinoValue.BAYANIHAN, [
      'Community pantries during the pandemic showed modern bayanihan through voluntary food sharing and mutual aid.',
      'Disaster response efforts demonstrate bayanihan as communities unite to help affected families rebuild their lives.',
      'Cooperative businesses and community-based organizations embody bayanihan principles in economic development.'
    ]);

    this.modernApplications.set(FilipinoValue.UTANG_NA_LOOB, [
      'Professional mentorship relationships often involve utang na loob, where mentees support their mentors\' future endeavors.',
      'Educational scholarships create utang na loob relationships that motivate recipients to give back to their communities.',
      'Political and business networks are strengthened through utang na loob, creating lasting professional relationships.'
    ]);

    this.modernApplications.set(FilipinoValue.MALASAKIT, [
      'Healthcare workers demonstrate malasakit through compassionate patient care beyond professional requirements.',
      'Corporate social responsibility programs reflect institutional malasakit toward communities and environment.',
      'Social media campaigns for charitable causes mobilize collective malasakit for various social issues.'
    ]);

    this.modernApplications.set(FilipinoValue.PAKIKIPAGKAPWA, [
      'Inclusive workplace policies promote pakikipagkapwa by ensuring equal opportunities regardless of background.',
      'Community-based mental health programs recognize pakikipagkapwa in addressing collective well-being.',
      'Environmental conservation efforts embody pakikipagkapwa through shared responsibility for future generations.'
    ]);

    this.modernApplications.set(FilipinoValue.HIYA, [
      'Professional ethics and workplace conduct are guided by hiya in maintaining reputation and relationships.',
      'Social media behavior reflects hiya as people consider how their online presence affects their family and community.',
      'Educational discipline systems incorporate hiya to encourage self-regulation and responsible behavior.'
    ]);

    this.modernApplications.set(FilipinoValue.DELICADEZA, [
      'Political leaders are expected to demonstrate delicadeza by resigning when involved in scandals or conflicts of interest.',
      'Business ethics require delicadeza in fair dealing, transparent practices, and responsible corporate governance.',
      'Academic integrity policies reflect delicadeza in maintaining honest scholarly and research practices.'
    ]);

    this.modernApplications.set(FilipinoValue.PAKIKIPAGBIGAYAN, [
      'Traffic management relies on pakikipagbigayan as drivers accommodate each other in congested urban areas.',
      'Workplace collaboration requires pakikipagbigayan in project management and resource sharing.',
      'Community dispute resolution uses pakikipagbigayan to find mutually acceptable solutions.'
    ]);

    this.modernApplications.set(FilipinoValue.AMOR_PROPIO, [
      'Professional development and career advancement are motivated by amor propio in achieving personal excellence.',
      'Educational achievement reflects amor propio as students strive to bring honor to their families.',
      'Entrepreneurship is often driven by amor propio in building successful businesses and creating employment.'
    ]);

    this.modernApplications.set(FilipinoValue.PAKIKIPAGKUNWARE, [
      'Diplomatic relations require pakikipagkunware in maintaining peaceful international relationships.',
      'Customer service excellence often involves pakikipagkunware in accommodating diverse client needs.',
      'Multicultural workplaces benefit from pakikipagkunware in adapting to different cultural practices.'
    ]);
  }
}

/**
 * Values Definition Interface
 * Internal structure for storing value definitions
 */
interface ValuesDefinition {
  name: string;
  description: string;
  culturalImportance: string;
}