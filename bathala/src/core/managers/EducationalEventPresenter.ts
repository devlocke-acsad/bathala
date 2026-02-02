import { EducationalEvent, AcademicReference } from "../../data/events/EventTypes";

/**
 * **Feature: educational-events-system, Requirement 7.3, 1.4**
 * 
 * Presenter for Educational Events.
 * Prepares event data for display in the UI, ensuring that 
 * cultural context and academic references are formatted correctly.
 */
export class EducationalEventPresenter {
    
    /**
     * Format academic references as a single string block for display (e.g., in a tooltip or details panel).
     * Follows APA-like style: Author (Year). Title.
     */
    public static formatReferences(references: AcademicReference[]): string {
        return references.map(ref => {
            return `${ref.author} (${ref.publicationYear}). ${ref.title}.`;
        }).join('\n');
    }

    /**
     * Get the formatted cultural context display text.
     */
    public static getCulturalContextDisplay(event: EducationalEvent): { title: string, content: string }[] {
        const context = event.culturalContext;
        return [
            { 
                title: "Significance", 
                content: context.culturalSignificance 
            },
            { 
                title: "Tradition", 
                content: context.traditionalMeaning 
            },
            { 
                title: "Relevance", 
                content: context.contemporaryRelevance 
            }
        ];
    }

    /**
     * Get the formatted values lesson display.
     */
    public static getValuesLessonDisplay(event: EducationalEvent): string {
        return `Value: ${event.valuesLesson.primaryValue.toUpperCase()}\n\n${event.valuesLesson.moralTheme}`;
    }
}
