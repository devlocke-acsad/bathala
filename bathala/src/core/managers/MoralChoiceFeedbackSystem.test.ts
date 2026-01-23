import * as fc from 'fast-check';
import { MoralChoiceFeedbackSystem, CommunityInteractionContext } from './MoralChoiceFeedbackSystem';
import { FilipinoValue } from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 9: Choice feedback completeness**
 * **Validates: Requirements 5.2**
 */

describe('MoralChoiceFeedbackSystem Property Tests', () => {
  let feedbackSystem: MoralChoiceFeedbackSystem;

  beforeEach(() => {
    feedbackSystem = MoralChoiceFeedbackSystem.getInstance();
  });

  /**
   * Property 9: Choice feedback completeness
   * For any player choice in moral dilemmas, the outcome must include moral implications explanation and values-based feedback
   */
  test('Property 9: Choice feedback completeness', () => {
    const choiceTextArb = fc.string({ minLength: 1 });
    const contextArb = fc.string({ minLength: 1 });
    const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
    const relevantValuesArb = fc.array(filipinoValueArb, { minLength: 1, maxLength: 5 });

    fc.assert(
      fc.property(
        choiceTextArb,
        contextArb,
        relevantValuesArb,
        (choiceText, context, relevantValues) => {
          const outcome = feedbackSystem.evaluateChoice(
            choiceText,
            context,
            relevantValues
          );

          // Verify all required components are present and meaningful
          expect(outcome.choiceText).toBe(choiceText);
          
          expect(outcome.moralImplications).toBeDefined();
          expect(outcome.moralImplications.length).toBeGreaterThan(10);
          expect(typeof outcome.moralImplications).toBe('string');

          expect(outcome.valuesBasedFeedback).toBeDefined();
          expect(outcome.valuesBasedFeedback.length).toBeGreaterThan(20);
          expect(typeof outcome.valuesBasedFeedback).toBe('string');

          expect(outcome.communityImpact).toBeDefined();
          expect(outcome.communityImpact.length).toBeGreaterThan(10);
          expect(typeof outcome.communityImpact).toBe('string');

          expect(outcome.contemporaryRelevance).toBeDefined();
          expect(outcome.contemporaryRelevance.length).toBeGreaterThan(10);
          expect(typeof outcome.contemporaryRelevance).toBe('string');

          expect(outcome.culturalWisdom).toBeDefined();
          expect(outcome.culturalWisdom.length).toBeGreaterThan(10);
          expect(typeof outcome.culturalWisdom).toBe('string');

          // Verify arrays are properly defined
          expect(Array.isArray(outcome.alignedValues)).toBe(true);
          expect(Array.isArray(outcome.conflictedValues)).toBe(true);

          // All values should be valid Filipino values
          outcome.alignedValues.forEach(value => {
            expect(Object.values(FilipinoValue)).toContain(value);
          });

          outcome.conflictedValues.forEach(value => {
            expect(Object.values(FilipinoValue)).toContain(value);
          });

          // Values should not appear in both arrays
          const alignedSet = new Set(outcome.alignedValues);
          const conflictedSet = new Set(outcome.conflictedValues);
          const intersection = [...alignedSet].filter(value => conflictedSet.has(value));
          expect(intersection).toHaveLength(0);

          // Consequence level should be valid
          expect(['positive', 'neutral', 'negative', 'mixed']).toContain(outcome.consequenceLevel);

          // Values-based feedback should reference Filipino values or cultural concepts
          const feedback = outcome.valuesBasedFeedback.toLowerCase();
          const hasCulturalContent = 
            feedback.includes('filipino') ||
            feedback.includes('cultural') ||
            feedback.includes('traditional') ||
            feedback.includes('community') ||
            feedback.includes('family') ||
            feedback.includes('values') ||
            feedback.includes('kapamilya') ||
            feedback.includes('bayanihan') ||
            feedback.includes('malasakit') ||
            feedback.includes('pakikipagkapwa') ||
            feedback.includes('utang na loob') ||
            feedback.includes('hiya') ||
            feedback.includes('delicadeza') ||
            feedback.includes('amor propio') ||
            feedback.includes('pakikipagbigayan') ||
            feedback.includes('pakikipagkunware') ||
            feedback.includes('wisdom') ||
            feedback.includes('harmony') ||
            feedback.includes('relationships') ||
            feedback.includes('character') ||
            feedback.includes('moral');

          expect(hasCulturalContent).toBe(true);

          // Community impact should reference community concepts
          const impact = outcome.communityImpact.toLowerCase();
          const hasCommunityContent = 
            impact.includes('community') ||
            impact.includes('relationships') ||
            impact.includes('bonds') ||
            impact.includes('social') ||
            impact.includes('collective') ||
            impact.includes('cooperation') ||
            impact.includes('harmony') ||
            impact.includes('support') ||
            impact.includes('well-being') ||
            impact.includes('solidarity') ||
            impact.includes('connection') ||
            impact.includes('impact') ||
            impact.includes('strengthen') ||
            impact.includes('weaken') ||
            impact.includes('moderate');

          expect(hasCommunityContent).toBe(true);

          // Contemporary relevance should reference modern concepts
          const relevance = outcome.contemporaryRelevance.toLowerCase();
          const hasModernContent = 
            relevance.includes('modern') ||
            relevance.includes('contemporary') ||
            relevance.includes('today') ||
            relevance.includes('current') ||
            relevance.includes('society') ||
            relevance.includes('world') ||
            relevance.includes('global') ||
            relevance.includes('digital') ||
            relevance.includes('technology') ||
            relevance.includes('social media') ||
            relevance.includes('workplace') ||
            relevance.includes('professional') ||
            relevance.includes('business') ||
            relevance.includes('education') ||
            relevance.includes('challenges') ||
            relevance.includes('adaptation') ||
            relevance.includes('relevant') ||
            relevance.includes('applies') ||
            relevance.includes('context');

          expect(hasModernContent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Choice feedback with community context provides enhanced community impact', () => {
    const choiceTextArb = fc.string({ minLength: 1 });
    const contextArb = fc.string({ minLength: 1 });
    const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
    const relevantValuesArb = fc.array(filipinoValueArb, { minLength: 1, maxLength: 3 });
    const interactionTypeArb = fc.constantFrom('family', 'neighborhood', 'workplace', 'religious', 'civic', 'educational');
    const stakeholdersArb = fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 });
    const communityValuesArb = fc.array(filipinoValueArb, { minLength: 1, maxLength: 3 });

    const communityContextArb = fc.record({
      interactionType: interactionTypeArb,
      stakeholders: stakeholdersArb,
      communityValues: communityValuesArb,
      socialDynamics: fc.string({ minLength: 1 }),
      expectedBehavior: fc.string({ minLength: 1 })
    }) as fc.Arbitrary<CommunityInteractionContext>;

    fc.assert(
      fc.property(
        choiceTextArb,
        contextArb,
        relevantValuesArb,
        communityContextArb,
        (choiceText, context, relevantValues, communityContext) => {
          const outcome = feedbackSystem.evaluateChoice(
            choiceText,
            context,
            relevantValues,
            communityContext
          );

          // Community impact should reference the specific context
          const impact = outcome.communityImpact.toLowerCase();
          const contextType = communityContext.interactionType.toLowerCase();
          
          expect(impact.includes(contextType) || 
                 impact.includes('community') || 
                 impact.includes('relationships')).toBe(true);

          // Should reference stakeholders or community elements
          const hasStakeholderReference = 
            communityContext.stakeholders.some(stakeholder => 
              impact.includes(stakeholder.toLowerCase())
            ) ||
            impact.includes('stakeholder') ||
            impact.includes('member') ||
            impact.includes('participant') ||
            impact.includes('relationship');

          expect(hasStakeholderReference).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Singleton pattern ensures consistent instance', () => {
    const system1 = MoralChoiceFeedbackSystem.getInstance();
    const system2 = MoralChoiceFeedbackSystem.getInstance();
    
    expect(system1).toBe(system2);
    expect(system1).toBe(feedbackSystem);
  });

  test('Choice evaluation produces consistent consequence levels', () => {
    const choiceTextArb = fc.string({ minLength: 1 });
    const contextArb = fc.string({ minLength: 1 });
    const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
    const relevantValuesArb = fc.array(filipinoValueArb, { minLength: 1, maxLength: 3 });

    fc.assert(
      fc.property(
        choiceTextArb,
        contextArb,
        relevantValuesArb,
        (choiceText, context, relevantValues) => {
          const outcome = feedbackSystem.evaluateChoice(
            choiceText,
            context,
            relevantValues
          );

          // Consequence level should be consistent with aligned/conflicted values
          if (outcome.alignedValues.length > 0 && outcome.conflictedValues.length === 0) {
            expect(outcome.consequenceLevel).toBe('positive');
          } else if (outcome.conflictedValues.length > 0 && outcome.alignedValues.length === 0) {
            expect(outcome.consequenceLevel).toBe('negative');
          } else if (outcome.alignedValues.length > 0 && outcome.conflictedValues.length > 0) {
            expect(outcome.consequenceLevel).toBe('mixed');
          } else {
            expect(outcome.consequenceLevel).toBe('neutral');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});