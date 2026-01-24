import { EducationalEventBuilder } from './EducationalEventBuilder';
import { CulturalLocalizationManager } from './CulturalLocalizationManager';
import { EducationalEventPresenter } from './EducationalEventPresenter';
import { FilipinoValue, RegionalOrigin } from '../../data/events/EventTypes';

describe('Educational System Components Integration', () => {
    
    describe('EducationalEventBuilder', () => {
        it('should build a valid event when all fields are provided', () => {
             const builder = new EducationalEventBuilder('test-id', 'Test Event');
             const event = builder
                .withDescription(['Desc'])
                .withCulturalContext({
                    mythologicalCreature: 'Creature',
                    folkloreType: 'alamat',
                    culturalSignificance: 'Sig',
                    traditionalMeaning: 'Mean',
                    contemporaryRelevance: 'Rel'
                })
                .withValuesLesson({
                    primaryValue: FilipinoValue.MALASAKIT,
                    moralTheme: 'Theme',
                    culturalWisdom: 'Wis',
                    applicationToModernLife: 'App'
                })
                .fromRegion(RegionalOrigin.LUZON_TAGALOG)
                .addObjective('Obj')
                .addReference({ author: 'Auth', title: 'Title', publicationYear: 2020, sourceType: 'book' })
                .build();
            
             expect(event.id).toBe('test-id');
             expect(event.dayEvent).toBe(true); // Default
        });

        it('should throw an error if built without required fields', () => {
            const builder = new EducationalEventBuilder('fail-id', 'Fail Event');
             // Missing context, values, etc.
             expect(() => builder.build()).toThrow();
        });
    });

    describe('CulturalLocalizationManager', () => {
        it('should identify immutable terms', () => {
            const manager = CulturalLocalizationManager.getInstance();
            const text = "The spirit of Bayanihan lives on.";
            const validation = manager.validateCulturalTerms(text);
            
            expect(validation.foundTerms).toContain('Bayanihan');
        });

        it('should allow registering new terms', () => {
            const manager = CulturalLocalizationManager.getInstance();
            manager.registerImmutableTerm('Bathala');
            const validation = manager.validateCulturalTerms('Bathala guides us.');
            expect(validation.foundTerms).toContain('Bathala');
        });
    });

    describe('EducationalEventPresenter', () => {
        it('should format references correctly', () => {
            const refs = [
                { author: 'Ramos', title: 'Creatures', publicationYear: 1990, sourceType: 'book' as const }
            ];
            const formatted = EducationalEventPresenter.formatReferences(refs);
            expect(formatted).toBe('Ramos (1990). Creatures.');
        });
    });
});
