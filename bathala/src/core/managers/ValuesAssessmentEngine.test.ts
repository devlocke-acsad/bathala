import * as fc from 'fast-check';
import { ValuesAssessmentEngine } from './ValuesAssessmentEngine';
import { FilipinoValue } from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 4: Values education grounding**
 * **Validates: Requirements 2.4, 5.1, 5.3**
 */

describe('ValuesAssessmentEngine Tests', () => {
  let engine: ValuesAssessmentEngine;

  beforeEach(() => {
    engine = ValuesAssessmentEngine.getInstance();
  });

  test('should create values lesson', () => {
    const lesson = engine.createValuesLesson(
      FilipinoValue.KAPAMILYA,
      'Family values',
      'Should I prioritize family over career?'
    );

    expect(lesson.primaryValue).toBe(FilipinoValue.KAPAMILYA);
    expect(lesson.moralTheme).toBe('Family values');
    expect(lesson.ethicalDilemma).toBe('Should I prioritize family over career?');
    expect(lesson.culturalWisdom).toBeDefined();
    expect(lesson.applicationToModernLife).toBeDefined();
  });

  test('should provide cultural wisdom', () => {
    const wisdom = engine.getCulturalWisdom(FilipinoValue.BAYANIHAN);
    expect(wisdom).toBeDefined();
    expect(wisdom.length).toBeGreaterThan(0);
  });

  test('should provide modern application', () => {
    const application = engine.getModernApplication(FilipinoValue.MALASAKIT);
    expect(application).toBeDefined();
    expect(application.length).toBeGreaterThan(0);
  });

  /**
   * Property 4: Values education grounding
   * For any event presenting moral lessons, it must reference specific Filipino values and explain their cultural importance
   */
  test('Property 4: Values education grounding', () => {
    const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
    const moralThemeArb = fc.string({ minLength: 1 });
    const ethicalDilemmaArb = fc.option(fc.string({ minLength: 1 }), { nil: undefined });

    fc.assert(
      fc.property(
        filipinoValueArb,
        moralThemeArb,
        ethicalDilemmaArb,
        (primaryValue, moralTheme, ethicalDilemma) => {
          const valuesLesson = engine.createValuesLesson(
            primaryValue,
            moralTheme,
            ethicalDilemma
          );

          // Verify the lesson is properly grounded in Filipino values
          expect(valuesLesson.primaryValue).toBe(primaryValue);
          expect(valuesLesson.moralTheme).toBe(moralTheme);
          expect(valuesLesson.ethicalDilemma).toBe(ethicalDilemma);

          // Verify cultural wisdom is provided and meaningful
          expect(valuesLesson.culturalWisdom).toBeDefined();
          expect(valuesLesson.culturalWisdom.length).toBeGreaterThan(10);
          expect(typeof valuesLesson.culturalWisdom).toBe('string');

          // Verify modern application is provided and meaningful
          expect(valuesLesson.applicationToModernLife).toBeDefined();
          expect(valuesLesson.applicationToModernLife.length).toBeGreaterThan(10);
          expect(typeof valuesLesson.applicationToModernLife).toBe('string');

          // Verify the primary value is a valid Filipino value
          expect(Object.values(FilipinoValue)).toContain(valuesLesson.primaryValue);

          // Cultural wisdom should not be the default fallback
          const isNotDefaultWisdom = !valuesLesson.culturalWisdom.includes('Traditional wisdom emphasizes the importance of');
          expect(isNotDefaultWisdom).toBe(true);

          // Modern application should not be the default fallback
          const isNotDefaultApplication = !valuesLesson.applicationToModernLife.includes('remains relevant in modern Filipino society through community practices and social interactions');
          expect(isNotDefaultApplication).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});