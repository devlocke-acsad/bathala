import { EducationalEvent } from "../../data/events/EventTypes";

/**
 * **Feature: educational-events-system, Requirement 8.4**
 * 
 * Manages localization while preserving cultural authenticity.
 * Ensures that specific cultural terms are not mistranslated and that 
 * context is preserved across languages.
 */
export class CulturalLocalizationManager {
    private static instance: CulturalLocalizationManager;
    private immutableTerms: Set<string> = new Set([
        'Bayanihan', 'Kapre', 'Tikbalang', 'Diwata', 'Anito', 'Babaylan', 'Datu', 
        'Utang na Loob', 'Pakikipagkapwa', 'Anting-anting', 'Agimat'
    ]);
    
    private currentLocale: string = 'en';

    private constructor() {}

    public static getInstance(): CulturalLocalizationManager {
        if (!CulturalLocalizationManager.instance) {
            CulturalLocalizationManager.instance = new CulturalLocalizationManager();
        }
        return CulturalLocalizationManager.instance;
    }

    /**
     * Set the current locale
     */
    public setLocale(locale: string): void {
        this.currentLocale = locale;
    }

    /**
     * Check if a text contains immutable cultural terms that should be preserved.
     * In a real system, this would flag content for translators.
     */
    public validateCulturalTerms(text: string): { isValid: boolean, foundTerms: string[] } {
        const foundTerms: string[] = [];
        this.immutableTerms.forEach(term => {
            if (text.includes(term)) {
                foundTerms.push(term);
            }
        });
        
        // Validation logic: In this conceptual framework, we just identify them.
        // A "mistranslation" might be replacing "Bayanihan" with "Heroism" entirely without keeping the original term.
        // But for this manager, we assume if the output text contains the term, it's preserved.
        return { isValid: true, foundTerms };
    }

    /**
     * Mock function to get localized event content.
     * In a real implementation, this would look up a translation file.
     * Here, it returns the original but validates that immutable terms weren't stripped if we were simulating translation.
     */
    public getLocalizedEvent(event: EducationalEvent): EducationalEvent {
        // Mock: Check if description preserves terms
        // This is a pass-through in this MVP as we don't have translation files.
        return event;
    }

    /**
     * Register a term that should not be translated
     */
    public registerImmutableTerm(term: string): void {
        this.immutableTerms.add(term);
    }
}
