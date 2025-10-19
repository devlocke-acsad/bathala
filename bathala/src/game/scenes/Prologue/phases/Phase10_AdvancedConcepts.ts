import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader, createSectionDivider } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase10_AdvancedConcepts extends TutorialPhase {
    private sectionIndex: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Clear any lingering cards from previous phases
        this.tutorialUI.handContainer.setVisible(false);
        this.tutorialUI.handContainer.removeAll(true);
        this.tutorialUI.cardSprites = [];
        
        this.showNextSection();
    }

    private showNextSection(): void {
        this.sectionIndex++;
        
        if (this.sectionIndex > 3) {
            this.onComplete();
            return;
        }

        // Clear previous
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                
                // Progress indicator
                const progress = createProgressIndicator(this.scene, 8, 9);
                this.container.add(progress);

                switch (this.sectionIndex) {
                    case 1:
                        this.showDeckSculpting(progress);
                        break;
                    case 2:
                        this.showDayNightCycle(progress);
                        break;
                    case 3:
                        this.showJourney(progress);
                        break;
                }
            }
        });
    }

    private showDeckSculpting(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Advanced: Deck-Sculpting',
            'Shape your deck throughout your journey'
        );
        this.container.add(header);

        const dialogue = "Master deck-sculpting to grow stronger:\n\n🛒 PURIFY (Shop): Remove unwanted cards\n     Slim down your deck for consistency\n\n🔮 ATTUNE (Rest Sites): Upgrade card values\n     Make your cards more powerful\n\n⚡ INFUSE (After Elites/Bosses): Add powerful cards\n     Expand your arsenal with rare cards\n\nA lean, upgraded deck is key to victory!";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Quality over quantity - a small, focused deck is often best!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(2500, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showDayNightCycle(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Advanced: Day/Night Cycle',
            'Time affects the dangers you face'
        );
        this.container.add(header);

        const dialogue = "The realm cycles between day and night:\n\n☀️ DAY (50 actions):\n   • Neutral, standard enemies\n   • Safer exploration\n   • Normal rewards\n\n🌙 NIGHT (50 actions):\n   • Aggressive, dangerous enemies\n   • Higher risk encounters\n   • Better rewards!\n\n👹 BOSS: Appears after 5 complete cycles (~500 actions)";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Risk vs reward - night is dangerous but lucrative!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(2500, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showJourney(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Your Journey Begins',
            'Restore balance to the corrupted realms'
        );
        this.container.add(header);

        const dialogue = "THE PATH AHEAD:\n\n🗺️ Navigate the overworld\n   Choose your route carefully\n\n💪 Grow stronger\n   Collect relics, upgrade cards, master combos\n\n🎭 Face chapter bosses\n   Three mighty foes await:\n   • Mangangaway (Corrupted Forest)\n   • Bakunawa (Submerged Barangays)\n   • False Bathala (Skyward Citadel)\n\n⚖️ Restore balance\n   Purify the realms and save the spirits!";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const success = createInfoBox(
                    this.scene,
                    'You are ready! Your training is nearly complete!',
                    'success'
                );
                this.container.add(success);

                this.scene.time.delayedCall(3000, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }
}
