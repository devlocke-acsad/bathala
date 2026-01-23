import { FilipinoValue } from '../../data/events/EventTypes';
import { ValuesAssessmentEngine, ChoiceEvaluationResult } from './ValuesAssessmentEngine';

/**
 * Choice Outcome
 * Represents the result of a moral choice with comprehensive feedback
 */
export interface ChoiceOutcome {
  choiceText: string;
  moralImplications: string;
  valuesBasedFeedback: string;
  communityImpact: string;
  contemporaryRelevance: string;
  alignedValues: FilipinoValue[];
  conflictedValues: FilipinoValue[];
  consequenceLevel: 'positive' | 'neutral' | 'negative' | 'mixed';
  culturalWisdom: string;
}

/**
 * Community Interaction Context
 * Represents the context for community-based moral choices
 */
export interface CommunityInteractionContext {
  interactionType: 'family' | 'neighborhood' | 'workplace' | 'religious' | 'civic' | 'educational';
  stakeholders: string[];
  communityValues: FilipinoValue[];
  socialDynamics: string;
  expectedBehavior: string;
}

/**
 * Contemporary Relevance Connection
 * Links traditional values to modern situations
 */
export interface ContemporaryRelevanceConnection {
  traditionalContext: string;
  modernApplication: string;
  bridgingExplanation: string;
  practicalExamples: string[];
  socialMediaRelevance?: string;
  workplaceRelevance?: string;
  familyRelevance?: string;
}

/**
 * Moral Choice Feedback System
 * 
 * Creates choice outcome evaluation with moral implications, values-based feedback generation,
 * community values emphasis, and contemporary relevance connections.
 */
export class MoralChoiceFeedbackSystem {
  private static instance: MoralChoiceFeedbackSystem;
  private valuesEngine: ValuesAssessmentEngine;
  private communityValuesPriority: Map<string, FilipinoValue[]> = new Map();
  private contemporaryConnections: Map<FilipinoValue, ContemporaryRelevanceConnection[]> = new Map();

  private constructor() {
    this.valuesEngine = ValuesAssessmentEngine.getInstance();
    this.initializeCommunityValuesPriority();
    this.initializeContemporaryConnections();
  }

  public static getInstance(): MoralChoiceFeedbackSystem {
    if (!MoralChoiceFeedbackSystem.instance) {
      MoralChoiceFeedbackSystem.instance = new MoralChoiceFeedbackSystem();
    }
    return MoralChoiceFeedbackSystem.instance;
  }

  /**
   * Evaluate a moral choice and provide comprehensive feedback
   * @param choiceText - The text of the choice made by the player
   * @param context - The situational context of the choice
   * @param relevantValues - Filipino values relevant to this choice
   * @param communityContext - Optional community interaction context
   * @returns Complete choice outcome with moral implications and feedback
   */
  public evaluateChoice(
    choiceText: string,
    context: string,
    relevantValues: FilipinoValue[],
    communityContext?: CommunityInteractionContext
  ): ChoiceOutcome {
    // Get basic evaluation from values engine
    const evaluation = this.valuesEngine.evaluateChoice(choiceText, context, relevantValues);

    // Generate values-based feedback
    const valuesBasedFeedback = this.generateValuesBasedFeedback(evaluation, relevantValues);

    // Generate community impact assessment
    const communityImpact = this.generateCommunityImpact(evaluation, communityContext);

    // Generate contemporary relevance
    const contemporaryRelevance = this.generateContemporaryRelevance(evaluation, choiceText);

    // Determine consequence level
    const consequenceLevel = this.determineConsequenceLevel(evaluation);

    return {
      choiceText,
      moralImplications: evaluation.moralImplications,
      valuesBasedFeedback,
      communityImpact,
      contemporaryRelevance,
      alignedValues: evaluation.alignedValues,
      conflictedValues: evaluation.conflictedValues,
      consequenceLevel,
      culturalWisdom: evaluation.culturalWisdom
    };
  }

  /**
   * Generate values-based feedback for player decisions
   * @param evaluation - The choice evaluation result
   * @param relevantValues - Values relevant to the choice
   * @returns Comprehensive values-based feedback
   */
  private generateValuesBasedFeedback(
    evaluation: ChoiceEvaluationResult,
    relevantValues: FilipinoValue[]
  ): string {
    const { alignedValues, conflictedValues } = evaluation;

    if (alignedValues.length > 0 && conflictedValues.length === 0) {
      const primaryValue = alignedValues[0];
      return `Your choice demonstrates strong alignment with ${this.getValueDisplayName(primaryValue)}. ` +
             `This reflects the Filipino cultural emphasis on ${this.getValueCulturalEmphasis(primaryValue)}. ` +
             `By choosing this path, you honor traditional wisdom while making decisions that strengthen ` +
             `both personal character and community relationships.`;
    }

    if (conflictedValues.length > 0 && alignedValues.length === 0) {
      const primaryConflict = conflictedValues[0];
      return `Your choice conflicts with ${this.getValueDisplayName(primaryConflict)}, which is ` +
             `highly valued in Filipino culture. This may lead to ${this.getValueConflictConsequences(primaryConflict)}. ` +
             `Consider how this decision affects not only yourself but also your relationships with family and community. ` +
             `Reflecting on traditional wisdom might guide you toward a more harmonious path.`;
    }

    if (alignedValues.length > 0 && conflictedValues.length > 0) {
      const primaryAligned = alignedValues[0];
      const primaryConflicted = conflictedValues[0];
      return `Your choice presents a complex moral situation. While it aligns with ${this.getValueDisplayName(primaryAligned)}, ` +
             `it conflicts with ${this.getValueDisplayName(primaryConflicted)}. This reflects the reality that moral decisions ` +
             `often require balancing different values. Consider seeking guidance from elders or community members to find ` +
             `a path that honors multiple Filipino values while achieving your goals.`;
    }

    return `Your choice represents a neutral moral position. While it doesn't strongly conflict with Filipino values, ` +
           `it also doesn't actively promote them. Consider how you might incorporate values like ${relevantValues.map(v => this.getValueDisplayName(v)).join(', ')} ` +
           `into your decision-making to strengthen both personal character and community bonds.`;
  }

  /**
   * Generate community impact assessment with emphasis on Filipino community values
   * @param evaluation - The choice evaluation result
   * @param communityContext - Optional community context
   * @returns Community impact assessment
   */
  private generateCommunityImpact(
    evaluation: ChoiceEvaluationResult,
    communityContext?: CommunityInteractionContext
  ): string {
    const { alignedValues, conflictedValues } = evaluation;
    const communityValues = [FilipinoValue.BAYANIHAN, FilipinoValue.PAKIKIPAGKAPWA, FilipinoValue.KAPAMILYA];
    
    const alignedCommunityValues = alignedValues.filter(v => communityValues.includes(v));
    const conflictedCommunityValues = conflictedValues.filter(v => communityValues.includes(v));

    if (communityContext) {
      return this.generateContextualCommunityImpact(
        alignedCommunityValues,
        conflictedCommunityValues,
        communityContext
      );
    }

    if (alignedCommunityValues.length > 0) {
      return `Your choice strengthens community bonds by embodying ${alignedCommunityValues.map(v => this.getValueDisplayName(v)).join(' and ')}. ` +
             `This decision contributes to the collective well-being and demonstrates the Filipino spirit of mutual support. ` +
             `Your actions inspire others to prioritize community harmony and shared responsibility.`;
    }

    if (conflictedCommunityValues.length > 0) {
      return `Your choice may weaken community relationships by conflicting with ${conflictedCommunityValues.map(v => this.getValueDisplayName(v)).join(' and ')}. ` +
             `This could lead to social tension and reduced cooperation within your community. ` +
             `Consider how you might repair these relationships and demonstrate renewed commitment to collective well-being.`;
    }

    return `Your choice has moderate impact on community relationships. While it doesn't actively harm community bonds, ` +
           `it also doesn't strengthen them. Look for opportunities to demonstrate bayanihan spirit and pakikipagkapwa ` +
           `in future decisions to build stronger, more supportive community connections.`;
  }

  /**
   * Generate contemporary relevance connections
   * @param evaluation - The choice evaluation result
   * @param choiceText - The original choice text
   * @returns Contemporary relevance explanation
   */
  private generateContemporaryRelevance(
    evaluation: ChoiceEvaluationResult,
    choiceText: string
  ): string {
    const { alignedValues } = evaluation;

    if (alignedValues.length === 0) {
      return `In today's interconnected world, moral choices have far-reaching consequences. ` +
             `Your decision reflects modern individualistic thinking, but consider how incorporating ` +
             `traditional Filipino values could enhance both personal fulfillment and social harmony ` +
             `in contemporary settings like social media, workplace interactions, and global citizenship.`;
    }

    const primaryValue = alignedValues[0];
    const connections = this.contemporaryConnections.get(primaryValue) || [];
    
    if (connections.length > 0) {
      const connection = connections[Math.floor(Math.random() * connections.length)];
      return `Your choice demonstrates how ${this.getValueDisplayName(primaryValue)} remains relevant in modern life. ` +
             `${connection.bridgingExplanation} This traditional value finds expression in contemporary contexts ` +
             `such as ${connection.practicalExamples.join(', ')}. By honoring this value, you contribute to ` +
             `preserving Filipino cultural identity while adapting to modern challenges.`;
    }

    return `Your choice reflects the enduring relevance of ${this.getValueDisplayName(primaryValue)} in contemporary society. ` +
           `This traditional Filipino value provides guidance for navigating modern challenges while maintaining ` +
           `cultural authenticity and social responsibility in an increasingly globalized world.`;
  }

  /**
   * Generate contextual community impact based on specific community context
   */
  private generateContextualCommunityImpact(
    alignedCommunityValues: FilipinoValue[],
    conflictedCommunityValues: FilipinoValue[],
    context: CommunityInteractionContext
  ): string {
    const contextualEmphasis = this.getContextualEmphasis(context.interactionType);
    
    if (alignedCommunityValues.length > 0) {
      return `In the context of ${context.interactionType} interactions, your choice strengthens ${contextualEmphasis} ` +
             `by demonstrating ${alignedCommunityValues.map(v => this.getValueDisplayName(v)).join(' and ')}. ` +
             `This decision positively affects ${context.stakeholders.join(', ')} and reinforces the ` +
             `${context.expectedBehavior} that is valued in this community setting.`;
    }

    if (conflictedCommunityValues.length > 0) {
      return `In the context of ${context.interactionType} interactions, your choice may undermine ${contextualEmphasis} ` +
             `by conflicting with ${conflictedCommunityValues.map(v => this.getValueDisplayName(v)).join(' and ')}. ` +
             `This could negatively impact your relationships with ${context.stakeholders.join(', ')} and ` +
             `challenge the ${context.expectedBehavior} expected in this community setting.`;
    }

    return `In the context of ${context.interactionType} interactions, your choice has neutral impact on ${contextualEmphasis}. ` +
           `Consider how you might better align with community expectations of ${context.expectedBehavior} ` +
           `to strengthen relationships with ${context.stakeholders.join(', ')}.`;
  }

  /**
   * Determine the overall consequence level of a choice
   */
  private determineConsequenceLevel(evaluation: ChoiceEvaluationResult): 'positive' | 'neutral' | 'negative' | 'mixed' {
    const { alignedValues, conflictedValues } = evaluation;

    if (alignedValues.length > 0 && conflictedValues.length === 0) {
      return 'positive';
    }

    if (conflictedValues.length > 0 && alignedValues.length === 0) {
      return 'negative';
    }

    if (alignedValues.length > 0 && conflictedValues.length > 0) {
      return 'mixed';
    }

    return 'neutral';
  }

  /**
   * Get display name for a Filipino value
   */
  private getValueDisplayName(value: FilipinoValue): string {
    const displayNames: Record<FilipinoValue, string> = {
      [FilipinoValue.KAPAMILYA]: 'kapamilya (family-centeredness)',
      [FilipinoValue.BAYANIHAN]: 'bayanihan (community spirit)',
      [FilipinoValue.UTANG_NA_LOOB]: 'utang na loob (debt of gratitude)',
      [FilipinoValue.MALASAKIT]: 'malasakit (compassionate care)',
      [FilipinoValue.PAKIKIPAGKAPWA]: 'pakikipagkapwa (shared identity)',
      [FilipinoValue.HIYA]: 'hiya (sense of propriety)',
      [FilipinoValue.DELICADEZA]: 'delicadeza (ethical conduct)',
      [FilipinoValue.PAKIKIPAGBIGAYAN]: 'pakikipagbigayan (mutual accommodation)',
      [FilipinoValue.AMOR_PROPIO]: 'amor propio (self-respect)',
      [FilipinoValue.PAKIKIPAGKUNWARE]: 'pakikipagkunware (adaptive accommodation)'
    };

    return displayNames[value] || value;
  }

  /**
   * Get cultural emphasis for a Filipino value
   */
  private getValueCulturalEmphasis(value: FilipinoValue): string {
    const emphases: Record<FilipinoValue, string> = {
      [FilipinoValue.KAPAMILYA]: 'family loyalty and mutual support within kinship networks',
      [FilipinoValue.BAYANIHAN]: 'collective cooperation and community solidarity',
      [FilipinoValue.UTANG_NA_LOOB]: 'reciprocal obligations and gratitude in relationships',
      [FilipinoValue.MALASAKIT]: 'compassionate concern for others\' well-being',
      [FilipinoValue.PAKIKIPAGKAPWA]: 'shared humanity and interconnectedness',
      [FilipinoValue.HIYA]: 'social appropriateness and respectful behavior',
      [FilipinoValue.DELICADEZA]: 'moral integrity and ethical conduct',
      [FilipinoValue.PAKIKIPAGBIGAYAN]: 'harmonious compromise and mutual understanding',
      [FilipinoValue.AMOR_PROPIO]: 'personal dignity and honorable conduct',
      [FilipinoValue.PAKIKIPAGKUNWARE]: 'adaptive flexibility for social harmony'
    };

    return emphases[value] || 'traditional moral principles';
  }

  /**
   * Get consequences of conflicting with a Filipino value
   */
  private getValueConflictConsequences(value: FilipinoValue): string {
    const consequences: Record<FilipinoValue, string> = {
      [FilipinoValue.KAPAMILYA]: 'strained family relationships and loss of kinship support',
      [FilipinoValue.BAYANIHAN]: 'social isolation and reduced community cooperation',
      [FilipinoValue.UTANG_NA_LOOB]: 'damaged trust and broken reciprocal relationships',
      [FilipinoValue.MALASAKIT]: 'perception as uncaring and socially insensitive',
      [FilipinoValue.PAKIKIPAGKAPWA]: 'alienation from community and loss of social connection',
      [FilipinoValue.HIYA]: 'social embarrassment and loss of respectability',
      [FilipinoValue.DELICADEZA]: 'loss of moral credibility and social standing',
      [FilipinoValue.PAKIKIPAGBIGAYAN]: 'increased conflict and social tension',
      [FilipinoValue.AMOR_PROPIO]: 'loss of personal dignity and self-respect',
      [FilipinoValue.PAKIKIPAGKUNWARE]: 'social friction and relationship strain'
    };

    return consequences[value] || 'social and personal difficulties';
  }

  /**
   * Get contextual emphasis for different interaction types
   */
  private getContextualEmphasis(interactionType: string): string {
    const emphases: Record<string, string> = {
      'family': 'family harmony and kinship bonds',
      'neighborhood': 'community solidarity and neighborly cooperation',
      'workplace': 'professional relationships and collaborative success',
      'religious': 'spiritual community and shared faith values',
      'civic': 'civic responsibility and collective citizenship',
      'educational': 'learning community and academic cooperation'
    };

    return emphases[interactionType] || 'social relationships and community well-being';
  }

  /**
   * Initialize community values priority for different contexts
   */
  private initializeCommunityValuesPriority(): void {
    this.communityValuesPriority.set('family', [
      FilipinoValue.KAPAMILYA,
      FilipinoValue.UTANG_NA_LOOB,
      FilipinoValue.MALASAKIT
    ]);

    this.communityValuesPriority.set('neighborhood', [
      FilipinoValue.BAYANIHAN,
      FilipinoValue.PAKIKIPAGKAPWA,
      FilipinoValue.PAKIKIPAGBIGAYAN
    ]);

    this.communityValuesPriority.set('workplace', [
      FilipinoValue.DELICADEZA,
      FilipinoValue.PAKIKIPAGBIGAYAN,
      FilipinoValue.AMOR_PROPIO
    ]);

    this.communityValuesPriority.set('religious', [
      FilipinoValue.MALASAKIT,
      FilipinoValue.PAKIKIPAGKAPWA,
      FilipinoValue.HIYA
    ]);

    this.communityValuesPriority.set('civic', [
      FilipinoValue.BAYANIHAN,
      FilipinoValue.DELICADEZA,
      FilipinoValue.PAKIKIPAGKAPWA
    ]);

    this.communityValuesPriority.set('educational', [
      FilipinoValue.UTANG_NA_LOOB,
      FilipinoValue.HIYA,
      FilipinoValue.PAKIKIPAGBIGAYAN
    ]);
  }

  /**
   * Initialize contemporary relevance connections
   */
  private initializeContemporaryConnections(): void {
    this.contemporaryConnections.set(FilipinoValue.KAPAMILYA, [
      {
        traditionalContext: 'Extended family support systems in rural communities',
        modernApplication: 'OFW families maintaining connections through technology',
        bridgingExplanation: 'Family bonds transcend physical distance through digital communication and financial support',
        practicalExamples: ['video calls with overseas relatives', 'remittances for family needs', 'shared family group chats'],
        familyRelevance: 'Maintaining family unity despite geographical separation'
      },
      {
        traditionalContext: 'Multi-generational households sharing resources',
        modernApplication: 'Urban families pooling resources for major expenses',
        bridgingExplanation: 'Collective family decision-making adapts to modern financial challenges',
        practicalExamples: ['shared housing costs', 'collaborative education funding', 'family business ventures'],
        familyRelevance: 'Economic cooperation within family units'
      }
    ]);

    this.contemporaryConnections.set(FilipinoValue.BAYANIHAN, [
      {
        traditionalContext: 'Community house-moving and harvest cooperation',
        modernApplication: 'Community pantries and disaster response networks',
        bridgingExplanation: 'Collective action principles apply to modern social challenges',
        practicalExamples: ['community pantries during pandemic', 'neighborhood watch programs', 'crowdfunding for local causes'],
        workplaceRelevance: 'Team collaboration and mutual support in professional settings'
      },
      {
        traditionalContext: 'Village-wide participation in festivals and ceremonies',
        modernApplication: 'Social media campaigns for community causes',
        bridgingExplanation: 'Digital platforms enable broader community participation and support',
        practicalExamples: ['online fundraising campaigns', 'virtual community events', 'social media awareness drives'],
        socialMediaRelevance: 'Digital community building and collective action'
      }
    ]);

    this.contemporaryConnections.set(FilipinoValue.MALASAKIT, [
      {
        traditionalContext: 'Caring for sick community members without expectation of return',
        modernApplication: 'Healthcare workers\' dedication during health crises',
        bridgingExplanation: 'Compassionate care extends beyond family to serve broader community needs',
        practicalExamples: ['frontline healthcare service', 'volunteer medical missions', 'mental health support programs'],
        workplaceRelevance: 'Employee wellness programs and supportive management practices'
      }
    ]);

    this.contemporaryConnections.set(FilipinoValue.PAKIKIPAGKAPWA, [
      {
        traditionalContext: 'Treating strangers as extended family members',
        modernApplication: 'Inclusive workplace policies and diversity initiatives',
        bridgingExplanation: 'Shared humanity principles guide equitable treatment in modern institutions',
        practicalExamples: ['inclusive hiring practices', 'accessibility accommodations', 'cultural sensitivity training'],
        workplaceRelevance: 'Creating inclusive and equitable work environments'
      }
    ]);

    this.contemporaryConnections.set(FilipinoValue.DELICADEZA, [
      {
        traditionalContext: 'Leaders stepping down when honor is questioned',
        modernApplication: 'Corporate executives taking responsibility for organizational failures',
        bridgingExplanation: 'Ethical accountability remains crucial in modern leadership roles',
        practicalExamples: ['executive resignations during scandals', 'transparent corporate governance', 'ethical business practices'],
        workplaceRelevance: 'Professional integrity and ethical leadership'
      }
    ]);
  }
}