import { 
  EducationalEvent, 
  EventChoice,
  CulturalContext,
  AcademicReference,
  ValuesLesson,
  MiniGameMechanic,
  RegionalOrigin
} from '../../data/events/EventTypes';
import { EducationalEventManager } from './EducationalEventManager';

/**
 * **Feature: educational-events-system, Requirement 8.1, 8.3**
 * 
 * Builder pattern for creating Educational Events.
 * Ensures all required fields are populated before an event is built.
 */
export class EducationalEventBuilder {
  private event: Partial<EducationalEvent>;

  constructor(id: string, name: string) {
    this.event = {
      id,
      name,
      description: [],
      choices: [],
      dayEvent: true, // Default
      educationalObjectives: [],
      academicReferences: [],
    };
  }

  public withDescription(description: string[]): this {
    this.event.description = description;
    return this;
  }

  public isDayEvent(isDay: boolean): this {
    this.event.dayEvent = isDay;
    return this;
  }

  public withCulturalContext(context: CulturalContext): this {
      this.event.culturalContext = context;
      return this;
  }

  public withValuesLesson(lesson: ValuesLesson): this {
      this.event.valuesLesson = lesson;
      return this;
  }

  public fromRegion(region: RegionalOrigin): this {
      this.event.regionalOrigin = region;
      return this;
  }

  public addChoice(choice: EventChoice): this {
      if (!this.event.choices) this.event.choices = [];
      this.event.choices.push(choice);
      return this;
  }

  public addObjective(objective: string): this {
      if (!this.event.educationalObjectives) this.event.educationalObjectives = [];
      this.event.educationalObjectives.push(objective);
      return this;
  }

  public addReference(reference: AcademicReference): this {
      if (!this.event.academicReferences) this.event.academicReferences = [];
      this.event.academicReferences.push(reference);
      return this;
  }

  public withMiniGame(miniGame: MiniGameMechanic): this {
      this.event.miniGameMechanic = miniGame;
      return this;
  }

  public build(): EducationalEvent {
      const builtEvent = this.event as EducationalEvent;
      
      // Validate using the manager's logic to ensure consistency
      const manager = EducationalEventManager.getInstance();
      const validation = manager.validateEducationalEvent(builtEvent);
      
      if (!validation.isValid) {
          throw new Error(`Invalid educational event configuration: ${validation.issues.join(', ')}`);
      }

      return builtEvent;
  }
}
