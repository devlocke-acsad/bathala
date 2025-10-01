import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, HandEvaluation, Suit, Rank } from '../../core/types/CombatTypes';

enum TutorialStep {
    START,
    PAIR_HAND,
    PAIR_ACTION,
    TIP_PAIR,
    HIGH_CARD_HAND,
    HIGH_CARD_ACTION,
    TIP_HIGH_CARD,
    TWO_PAIR_HAND,
    TWO_PAIR_ACTION,
    TIP_TWO_PAIR,
    THREE_OF_KIND_HAND,
    THREE_OF_KIND_ACTION,
    TIP_THREE_OF_KIND,
    STRAIGHT_HAND,
    STRAIGHT_ACTION,
    TIP_STRAIGHT,
    FLUSH_HAND,
    FLUSH_ACTION,
    TIP_FLUSH,
    FULL_HOUSE_HAND,
    FULL_HOUSE_ACTION,
    TIP_FULL_HOUSE,
    FINAL_BATTLE,
    END
}

export class Prologue extends Scene {
    private isStoryPhase: boolean = true;
    private isTransitioning: boolean = false;
    private tutorialContainer: GameObjects.Container;

    constructor() {
        super('Prologue');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.startStoryPhase();
    }

    private startStoryPhase() {
        this.isStoryPhase = true;
        const slides = [
            "Long ago, two gods, Bathala, the sky-father, and Amihan, the sea-mother, created the islands.",
            "These islands were a paradise for the anito, spirits of nature, who lived in harmony.",
            "But the engkanto, spirits of deceit, grew jealous. They wove lies and discord, turning the anito against each other.",
            "A hero is needed to restore balance.",
            "You must channel the power of the four elements - Apoy, Tubig, Lupa, and Hangin - through sacred cards.",
            "Combine these cards to form powerful hands, and vanquish the corrupted spirits."
        ];
        let currentSlide = 0;

        // Create a background image for the story slides
        const imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222)
            .setStrokeStyle(3, 0x4a90e2)
            .setAlpha(0);
        // Add a decorative border
        const border = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, undefined, 0)
            .setStrokeStyle(6, 0x8e44ad)
            .setAlpha(0);
        
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 28, 
            color: '#FFFFFF', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width - 100 } 
        }).setOrigin(0.5);

        // Add instructional text for controls
        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click or press SPACE to continue', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 18, 
            color: '#AAAAAA', 
            align: 'center' 
        }).setOrigin(0.5);
        
        const self = this;  // Capture 'this' context to avoid issues in nested functions
        const showNextSlide = function() {
            if (self.isTransitioning) return;
            if (currentSlide >= slides.length) {
                self.isStoryPhase = false;
                self.input.off('pointerdown', showNextSlide);
                self.input.keyboard?.off('keydown-SPACE');
                
                // Smooth transition to tutorial
                self.tweens.add({ 
                    targets: [imagePlaceholder, border, displayedText, controlsText], 
                    alpha: 0, 
                    duration: 1000, 
                    ease: 'Power2',
                    onComplete: () => {
                        imagePlaceholder.destroy();
                        border.destroy();
                        displayedText.destroy();
                        controlsText.destroy();
                        self.startTutorial();
                    }
                });
                return;
            }

            self.isTransitioning = true;
            
            // Animate the image and border
            self.tweens.add({ 
                targets: [imagePlaceholder, border], 
                alpha: 1, 
                duration: 500,
                ease: 'Power2'
            });
            
            // Type out the text
            self.typeText(displayedText, slides[currentSlide]).then(() => {
                self.isTransitioning = false;
            });
            currentSlide++;
        };

        // Set up keyboard input
        this.input.keyboard?.on('keydown-SPACE', showNextSlide);

        this.input.on('pointerdown', showNextSlide);
        showNextSlide();
    }

    private startTutorial() {
        // Add a smooth transition effect before starting tutorial
        const fadeInOverlay = this.add.rectangle(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000
        ).setAlpha(0.7);
        
        this.tweens.add({
            targets: fadeInOverlay,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                fadeInOverlay.destroy();
                this.tutorialContainer = this.add.container(0, 0);
                this.renderTutorialStep(TutorialStep.START);
            }
        });
    }

    private renderTutorialStep(step: TutorialStep) {
        this.isTransitioning = true;
        
        // Remove all previous elements to ensure clean state
        this.tutorialContainer.removeAll(true);

        // Add background for tutorial section
        const tutorialBg = this.add.rectangle(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x1a1a2a
        ).setAlpha(0.7);
        this.tutorialContainer.add(tutorialBg);

        const tikbalang = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'tikbalang').setScale(1.5);
        this.anims.play('tikbalang_idle', tikbalang);
        const tutorialText = this.add.text(this.cameras.main.width / 2, 50, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 24, 
            color: '#FFFFFF', 
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);
        this.tutorialContainer.add([tikbalang, tutorialText]);

        // Add a highlight effect for the tutorial text (this creates the purple highlight)
        const textHighlight = this.add.graphics();
        textHighlight.fillStyle(0x8e44ad, 0.3); // Purple color
        textHighlight.fillRoundedRect(
            tutorialText.x - tutorialText.width / 2 - 20,
            tutorialText.y - tutorialText.height / 2 - 10,
            tutorialText.width + 40,
            tutorialText.height + 20,
            10
        );
        // Add textHighlight to container and ensure proper layering
        this.tutorialContainer.add(textHighlight);
        this.tutorialContainer.bringToTop(tutorialText); // Bring text above highlight

        switch (step) {
            case TutorialStep.START:
                this.showDialogue("You dare challenge me, mortal? Let's see if you understand the sacred cards!", () => this.renderTutorialStep(TutorialStep.PAIR_HAND));
                break;

            case TutorialStep.PAIR_HAND:
                this.typeText(tutorialText, 'First, let\'s try a PAIR - two cards of the same rank.\nThis is the most basic combination in poker.\nTry forming a PAIR now.').then(() => this.isTransitioning = false);
                this.drawCards('pair', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'pair') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.7,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.PAIR_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for a PAIR.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.PAIR_HAND)));
                    }
                });
                break;

            case TutorialStep.PAIR_ACTION:
                this.typeText(tutorialText, 'A PAIR! This is the foundation of poker strategy.\nNow choose an action.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '2', () => this.showDialogue("Not bad for a start. Let me show you other hands.", () => this.renderTutorialStep(TutorialStep.TIP_PAIR)));
                    } else {
                        this.typeText(tutorialText, 'Choose ATTACK to continue learning.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.PAIR_ACTION);
                        });
                    }
                });
                break;
                
            case TutorialStep.TIP_PAIR:
                this.typeText(tutorialText, 'TIP: A PAIR is the most basic combination.\nTWO PAIR beats a PAIR.\nTHREE OF A KIND beats TWO PAIR.\nBut not all hands need combinations - let\'s look at HIGH CARD.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.HIGH_CARD_HAND);
                    });
                });
                break;

            case TutorialStep.HIGH_CARD_HAND:
                this.typeText(tutorialText, 'Now let\'s understand the weakest hand - HIGH CARD.\nThis has no combinations, just the highest card value.\nThis is weaker than any combination.\nTry selecting 5 cards with different values and suits.').then(() => this.isTransitioning = false);
                this.drawCards('high_card', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'high_card') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.5,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.HIGH_CARD_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for a HIGH CARD with no combinations.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.HIGH_CARD_HAND)));
                    }
                });
                break;

            case TutorialStep.HIGH_CARD_ACTION:
                this.typeText(tutorialText, 'A HIGH CARD! This is the weakest possible hand.\nYou can still ATTACK with it, but it won\'t be very effective.\nLet\'s try a stronger hand - choose ATTACK to continue.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '1', () => this.showDialogue("Is that all you've got? Try forming combinations next time.", () => this.renderTutorialStep(TutorialStep.TIP_HIGH_CARD)));
                    } else {
                        this.typeText(tutorialText, 'Choose ATTACK to continue learning.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.HIGH_CARD_ACTION);
                        });
                    }
                });
                break;
                
            case TutorialStep.TIP_HIGH_CARD:
                this.typeText(tutorialText, 'TIP: HIGH CARD is the weakest hand.\nA PAIR beats a HIGH CARD.\nNow let\'s look at stronger hands - TWO PAIR.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.TWO_PAIR_HAND);
                    });
                });
                break;

            case TutorialStep.TWO_PAIR_HAND:
                this.typeText(tutorialText, 'Now try forming TWO PAIR (two different pairs).\nThis hand is stronger than a single PAIR.\nTry forming TWO PAIR now.').then(() => this.isTransitioning = false);
                this.drawCards('two_pair', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'two_pair') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.7,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.TWO_PAIR_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for TWO PAIR.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.TWO_PAIR_HAND)));
                    }
                });
                break;

            case TutorialStep.TWO_PAIR_ACTION:
                this.typeText(tutorialText, 'TWO PAIR! Stronger than a single PAIR.\nNow choose an action.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '4', () => this.showDialogue("Your power grows, but you could do better!", () => this.renderTutorialStep(TutorialStep.TIP_TWO_PAIR)));
                    } else {
                        this.typeText(tutorialText, 'Choose ATTACK to continue learning.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.TWO_PAIR_ACTION);
                        });
                    }
                });
                break;
                
            case TutorialStep.TIP_TWO_PAIR:
                this.typeText(tutorialText, 'TIP: TWO PAIR beats a PAIR.\nTHREE OF A KIND beats TWO PAIR.\nSTRAIGHT beats THREE OF A KIND.\nLet\'s try THREE OF A KIND next.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.THREE_OF_KIND_HAND);
                    });
                });
                break;

            case TutorialStep.THREE_OF_KIND_HAND:
                this.typeText(tutorialText, 'Now try forming THREE OF A KIND (trips).\nThis hand is stronger than TWO PAIR.\nTry forming THREE OF A KIND now.').then(() => this.isTransitioning = false);
                this.drawCards('trips', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'three_of_kind') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.8,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.THREE_OF_KIND_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for THREE OF A KIND.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.THREE_OF_KIND_HAND)));
                    }
                });
                break;

            case TutorialStep.THREE_OF_KIND_ACTION:
                this.typeText(tutorialText, 'THREE OF A KIND! Stronger than TWO PAIR.\nNow choose an action.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '7', () => this.showDialogue("The spirit weakens! But you could be stronger!", () => this.renderTutorialStep(TutorialStep.TIP_THREE_OF_KIND)));
                    } else {
                        this.typeText(tutorialText, 'Choose ATTACK to continue learning.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.THREE_OF_KIND_ACTION);
                        });
                    }
                });
                break;
                
            case TutorialStep.TIP_THREE_OF_KIND:
                this.typeText(tutorialText, 'TIP: THREE OF A KIND beats TWO PAIR.\nSTRAIGHT beats THREE OF A KIND.\nFLUSH beats STRAIGHT.\nLet\'s look at STRAIGHT next.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.STRAIGHT_HAND);
                    });
                });
                break;

            case TutorialStep.STRAIGHT_HAND:
                this.typeText(tutorialText, 'Now try forming a STRAIGHT - 5 cards in sequence (like 5,6,7,8,9).\nSuits don\'t matter for a STRAIGHT.\nTry forming a STRAIGHT now.').then(() => this.isTransitioning = false);
                this.drawCards('straight', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'straight') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.8,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.STRAIGHT_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for a STRAIGHT.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.STRAIGHT_HAND)));
                    }
                });
                break;

            case TutorialStep.STRAIGHT_ACTION:
                this.typeText(tutorialText, 'STRAIGHT! Stronger than THREE OF A KIND.\nNow choose an action.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '10', () => this.showDialogue("Impressive! But there are stronger hands!", () => this.renderTutorialStep(TutorialStep.TIP_STRAIGHT)));
                    } else {
                        this.typeText(tutorialText, 'Choose ATTACK to continue learning.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.STRAIGHT_ACTION);
                        });
                    }
                });
                break;
                
            case TutorialStep.TIP_STRAIGHT:
                this.typeText(tutorialText, 'TIP: STRAIGHT beats THREE OF A KIND.\nFLUSH beats STRAIGHT.\nFULL HOUSE beats FLUSH.\nLet\'s try a FLUSH next.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.FLUSH_HAND);
                    });
                });
                break;

            case TutorialStep.FLUSH_HAND:
                this.typeText(tutorialText, 'Now try forming a FLUSH - 5 cards of the same suit.\nRanks don\'t matter for a FLUSH.\nTry forming a FLUSH now.').then(() => this.isTransitioning = false);
                this.drawCards('flush', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'flush') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 1.9,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.FLUSH_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for a FLUSH.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.FLUSH_HAND)));
                    }
                });
                break;

            case TutorialStep.FLUSH_ACTION:
                this.typeText(tutorialText, 'A FLUSH! This unlocks a powerful SPECIAL attack.\nNow choose SPECIAL to see its power.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'special') {
                        this.playAttackAnimation(tikbalang, '14', () => this.showDialogue("Strong! But there\'s an even more powerful hand!", () => this.renderTutorialStep(TutorialStep.TIP_FLUSH)));
                    } else {
                        this.typeText(tutorialText, 'Choose SPECIAL to see its power.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.FLUSH_ACTION);
                        });
                    }
                }, ['special']);
                break;
                
            case TutorialStep.TIP_FLUSH:
                this.typeText(tutorialText, 'TIP: FLUSH beats STRAIGHT.\nFULL HOUSE beats FLUSH.\nFOUR OF A KIND beats FULL HOUSE.\nLet\'s try a FULL HOUSE next.').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.FULL_HOUSE_HAND);
                    });
                });
                break;

            case TutorialStep.FULL_HOUSE_HAND:
                this.typeText(tutorialText, 'Now try forming a FULL HOUSE - a PAIR and THREE OF A KIND together.\nThis is a very strong hand.\nTry forming a FULL HOUSE now.').then(() => this.isTransitioning = false);
                this.drawCards('full_house', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'full_house') {
                        // Add visual feedback for successful selection
                        this.tweens.add({
                            targets: tikbalang,
                            scale: 2.0,
                            duration: 200,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut'
                        });
                        this.renderTutorialStep(TutorialStep.FULL_HOUSE_ACTION);
                    } else {
                        // Add visual feedback for incorrect selection
                        this.tweens.add({
                            targets: tutorialText,
                            tint: 0xff3300,
                            duration: 300,
                            yoyo: true,
                            repeat: 0,
                            ease: 'Sine.easeInOut',
                            onComplete: () => tutorialText.clearTint()
                        });
                        this.typeText(tutorialText, `That's a ${evaluation.type.replace('_', ' ')}! Try for a FULL HOUSE.`).then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.FULL_HOUSE_HAND)));
                    }
                });
                break;

            case TutorialStep.FULL_HOUSE_ACTION:
                this.typeText(tutorialText, 'A FULL HOUSE! This is a very strong hand.\nNow choose SPECIAL to see its devastating power.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'special') {
                        this.playAttackAnimation(tikbalang, '18', () => this.showDialogue("Impossible! How can this be?!", () => this.renderTutorialStep(TutorialStep.TIP_FULL_HOUSE)));
                    } else {
                        this.typeText(tutorialText, 'Choose SPECIAL to see its power.').then(() => {
                            this.isTransitioning = false;
                            this.renderTutorialStep(TutorialStep.FULL_HOUSE_ACTION);
                        });
                    }
                }, ['special']);
                break;
                
            case TutorialStep.TIP_FULL_HOUSE:
                this.typeText(tutorialText, 'TIP: FULL HOUSE beats FLUSH.\nFOUR OF A KIND beats FULL HOUSE.\nSTRAIGHT FLUSH beats FOUR OF A KIND.\nFIVE OF A KIND is the strongest possible hand.\nNow face me with all your knowledge!').then(() => {
                    this.time.delayedCall(2000, () => {
                        this.renderTutorialStep(TutorialStep.FINAL_BATTLE);
                    });
                });
                break;

            case TutorialStep.FINAL_BATTLE:
                // The enemy is defeated, now present the moral choice
                this.typeText(tutorialText, "You have proven your mastery over the sacred cards!\nNow you must choose:\nWill you Slay for power, or Spare to restore their spirit?").then(() => {
                    this.isTransitioning = false;
                    
                    const choices = ['Slay (Gain Power)', 'Spare (Restore Spirit)'];
                    const choiceContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
                    this.tutorialContainer.add(choiceContainer);
                    
                    // Add a subtle background for choice area
                    const choiceAreaBg = this.add.rectangle(
                        this.cameras.main.width / 2, 
                        this.cameras.main.height - 100, 
                        700, 
                        80,
                        0x2c3e50
                    ).setAlpha(0.3);
                    this.tutorialContainer.add(choiceAreaBg);
                    
                    choices.forEach((choiceText, i) => {
                        const choice = i === 0 ? 'slay' : 'spare';
                        const button = this.createButton(-220 + i * 440, 0, choiceText, () => {
                            if (this.isTransitioning) return;
                            
                            // Add visual feedback when button is clicked
                            this.cameras.main.shake(50, 0.005);
                            
                            this.isTransitioning = true;
                            choiceContainer.destroy();
                            choiceAreaBg.destroy();
                            
                            // Show different dialogue based on choice
                            if (choice === 'slay') {
                                this.showDialogue(`You chose the path of power.`, () => {
                                    // Player gains power/reward for slay
                                    this.typeText(tutorialText, "You have gained power from the defeated spirit.").then(() => {
                                        this.time.delayedCall(1000, () => {
                                            this.renderTutorialStep(TutorialStep.END);
                                        });
                                    });
                                });
                            } else { // spare
                                // Get the tikbalang sprite for the spare animation
                                let tikbalang: GameObjects.Sprite | null = null;
                                for (let k = 0; k < this.tutorialContainer.length; k++) {
                                    const obj = this.tutorialContainer.getAt(k);
                                    if (obj.type === 'Sprite' && (obj as GameObjects.Sprite).texture.key.includes('tikbalang')) {
                                        tikbalang = obj as GameObjects.Sprite;
                                        break;
                                    }
                                }
                                
                                if (tikbalang) {
                                    // Show spirit restoration effect
                                    this.playSpareAnimation(tikbalang, () => {
                                        this.typeText(tutorialText, "You have restored the spirit and gained their respect.").then(() => {
                                            this.time.delayedCall(1000, () => {
                                                this.renderTutorialStep(TutorialStep.END);
                                            });
                                        });
                                    });
                                } else {
                                    this.typeText(tutorialText, "You have restored the spirit and gained their respect.").then(() => {
                                        this.time.delayedCall(1000, () => {
                                            this.renderTutorialStep(TutorialStep.END);
                                        });
                                    });
                                }
                            }
                        });
                        choiceContainer.add(button);
                    });
                });
                break;

            case TutorialStep.END:
                this.endTutorial();
                break;
        }
    }

    private async endTutorial() {
        const tutorialText = this.tutorialContainer.getAt(2) as GameObjects.Text; // Now index is 2 due to added background
        const tikbalang = this.tutorialContainer.getAt(1) as GameObjects.Sprite;
        
        // Make the tutorial text more prominent during the ending
        tutorialText.setFontSize(26).setWordWrap({ width: this.cameras.main.width * 0.8 });
        
        await this.typeText(tutorialText, "You have vanquished the corrupted spirit...");
        this.tweens.add({
            targets: tikbalang,
            alpha: 0.5,
            duration: 500,
            ease: 'Power2'
        });
        await this.waitForClick();
        
        await this.typeText(tutorialText, "But the engkanto's deceit runs deep. Many more anito are twisted by their lies.");
        await this.waitForClick();
        
        await this.typeText(tutorialText, "Your mission: Journey through the islands, from the Shattered Grove to the Skyward Citadel.");
        await this.waitForClick();
        
        await this.typeText(tutorialText, "Face the corrupted. You may Slay them for power, or Spare them to restore their spirit.");
        await this.waitForClick();
        
        await this.typeText(tutorialText, "The choice will shape your journey. Now, go forth.");
        await this.waitForClick();

        // Create a dramatic transition effect
        const transitionOverlay = this.add.graphics();
        this.tutorialContainer.add(transitionOverlay);
        
        // Animate the transition
        this.tweens.add({
            targets: this.tutorialContainer,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });
        
        // Draw expanding circle effect
        this.time.delayedCall(500, () => {
            let radius = 0;
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            const circleTween = this.tweens.addCounter({
                from: 0,
                to: Math.max(this.cameras.main.width, this.cameras.main.height) * 0.7,
                duration: 1000,
                onUpdate: (tween) => {
                    radius = tween.getValue();
                    transitionOverlay.clear();
                    transitionOverlay.fillStyle(0x000000, 1);
                    transitionOverlay.fillCircle(centerX, centerY, radius);
                },
                onComplete: () => {
                    this.scene.start('Overworld');
                }
            });
        });
    }

    private drawCards(type: 'high_card' | 'pair' | 'two_pair' | 'trips' | 'straight' | 'flush' | 'full_house', onHandComplete: (selected: PlayingCard[]) => void) {
        let handConfig;
        switch(type) {
            case 'high_card':
                handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}];
                break;
            case 'pair':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            case 'two_pair':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '9', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: '2', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            case 'trips':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '5', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            case 'straight':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '6', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '8', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: '2', s: 'Tubig'}, {r: 'Datu', s: 'Lupa'}, {r: '3', s: 'Hangin'}];
                break;
            case 'flush':
                handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Apoy'}, {r: '7', s: 'Apoy'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '8', s: 'Lupa'}, {r: '6', s: 'Hangin'}];
                break;
            case 'full_house':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '5', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            default:
                handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}];
                break;
        }
        
        const hand = handConfig.map((def, i) => ({ id: `p_${i}`, rank: def.r as Rank, suit: def.s as Suit, selected: false, playable: true, element: 'neutral' }));
        const selectedCards: PlayingCard[] = [];
        const handSprites: GameObjects.Sprite[] = [];

        const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};
        const cardWidth = 200 * 0.35;
        const handWidth = hand.length * (cardWidth * 0.9);
        const startX = this.cameras.main.width / 2 - handWidth / 2;
        const y = this.cameras.main.height - 250;

        // Add a subtle background for the card area
        const cardAreaBg = this.add.rectangle(
            this.cameras.main.width / 2, 
            y, 
            handWidth + 50, 
            cardWidth * 0.5 + 80,
            0x2c3e50
        ).setAlpha(0.3);
        this.tutorialContainer.add(cardAreaBg);

        const playHandButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Play Hand', () => {});
        playHandButton.setVisible(false);
        this.tutorialContainer.add(playHandButton);

        // Add visual indicator for selected card count
        const selectionIndicator = this.add.text(
            this.cameras.main.width / 2, 
            y + 80, 
            'Selected: 0/5', 
            { fontFamily: 'dungeon-mode', fontSize: 18, color: '#FFFFFF' }
        ).setOrigin(0.5);
        this.tutorialContainer.add(selectionIndicator);

        hand.forEach((card, i) => {
            const spriteRank = rankMap[card.rank] || "1";
            const spriteSuit = card.suit.toLowerCase();
            const cardSprite = this.add.sprite(startX + i * (cardWidth * 0.9), y, `card_${spriteRank}_${spriteSuit}`).setInteractive().setScale(0.35);
            cardSprite.setData('card', card);
            handSprites.push(cardSprite);
            this.tutorialContainer.add(cardSprite);

            cardSprite.on('pointerdown', () => {
                if (this.isTransitioning) return;

                const cardData = cardSprite.getData('card') as PlayingCard;
                card.selected = !card.selected;

                if (card.selected) {
                    if (selectedCards.length < 5) {
                        cardSprite.y -= 30;
                        // Add a selection glow effect
                        cardSprite.setTint(0x4a90e2);
                        selectedCards.push(card);
                    }
                } else {
                    cardSprite.y += 30;
                    cardSprite.clearTint();
                    const index = selectedCards.findIndex(c => c.id === card.id);
                    if (index > -1) selectedCards.splice(index, 1);
                }

                // Update selection indicator
                selectionIndicator.setText(`Selected: ${selectedCards.length}/5`);
                
                // Change indicator color based on selection count
                if (selectedCards.length === 5) {
                    selectionIndicator.setColor('#4ade80'); // Green when complete
                } else {
                    selectionIndicator.setColor('#ffffff'); // White otherwise
                }

                if (selectedCards.length === 5) {
                    playHandButton.setVisible(true).setInteractive().once('pointerdown', () => {
                        if(this.isTransitioning) return;
                        this.isTransitioning = true;
                        playHandButton.destroy();
                        selectionIndicator.destroy();
                        cardAreaBg.destroy();
                        handSprites.forEach(s => s.disableInteractive());
                        onHandComplete(selectedCards);
                    });
                }
            });
        });
    }

    private showActionButtons(onAction: (action: string) => void, enabled: string[] = ['attack', 'defend', 'special']) {
        const actions = ['Attack', 'Defend', 'Special'];
        const actionButtons = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        this.tutorialContainer.add(actionButtons);
        
        // Add a subtle background for action area
        const actionAreaBg = this.add.rectangle(
            this.cameras.main.width / 2, 
            this.cameras.main.height - 100, 
            700, 
            80,
            0x2c3e50
        ).setAlpha(0.3);
        this.tutorialContainer.add(actionAreaBg);
        
        actions.forEach((action, i) => {
            const lowerCaseAction = action.toLowerCase();
            const isEnabled = enabled.includes(lowerCaseAction);
            const button = this.createButton(-220 + i * 220, 0, action, () => {
                if (this.isTransitioning || !isEnabled) return;
                
                // Add visual feedback when button is clicked
                this.cameras.main.shake(50, 0.005);
                
                this.isTransitioning = true;
                actionButtons.destroy();
                actionAreaBg.destroy();
                onAction(lowerCaseAction);
            });
            if (!isEnabled) {
                (button.getAt(0) as GameObjects.Rectangle).setFillStyle(0x1a1a1a, 0.5);
                (button.getAt(1) as GameObjects.Text).setAlpha(0.5);
            }
            actionButtons.add(button);
        });
    }

    private playAttackAnimation(target: GameObjects.Sprite, damage: string, onComplete: () => void) {
        this.isTransitioning = true;
        this.cameras.main.shake(100, 0.01);
        target.setTint(0xff0000);
        const damageText = this.add.text(target.x, target.y, damage, { fontFamily: 'dungeon-mode', fontSize: 48, color: '#ff0000' }).setOrigin(0.5);
        this.tutorialContainer.add(damageText);
        this.tweens.add({ targets: damageText, y: target.y - 100, alpha: 0, duration: 1000, ease: 'Power1' });
        this.time.delayedCall(200, () => target.clearTint());
        this.time.delayedCall(1000, onComplete);
    }

    private showDialogue(text: string, onComplete: () => void) {
        this.isTransitioning = true;
        const dialogueContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 180);
        this.tutorialContainer.add(dialogueContainer);
        
        // Create a more visually appealing dialogue box
        const bg = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 120, 0x1a1a2e, 0.9).setStrokeStyle(3, 0x8e44ad).setInteractive();
        const dialogueText = this.add.text(0, -20, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 22, 
            color: '#ecf0f1', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width * 0.75 } 
        }).setOrigin(0.5);
        
        // Add character icon or visual element
        const speakerIcon = this.add.sprite(-bg.width/2 + 50, 0, 'tikbalang').setScale(0.4);
        
        // Create continue indicator with better styling
        const continueIndicator = this.add.text(bg.width/2 - 40, bg.height/2 - 10, '▼', { 
            fontSize: 28, 
            color: '#e74c3c'
        }).setOrigin(0.5).setVisible(false);
        
        dialogueContainer.add([bg, speakerIcon, dialogueText, continueIndicator]);
        
        // Add entry animation for the dialogue box
        dialogueContainer.setScale(0).setAlpha(0);
        this.tweens.add({
            targets: dialogueContainer,
            scale: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.Out'
        });
        
        this.typeText(dialogueText, text).then(() => {
            this.isTransitioning = false;
            continueIndicator.setVisible(true);
            
            // Add pulsing animation to the continue indicator
            this.tweens.add({
                targets: continueIndicator,
                y: '+=8',
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Make the background respond to interaction
            bg.once('pointerdown', () => {
                // Add visual feedback for click
                this.cameras.main.shake(20, 0.005);
                
                this.tweens.add({ 
                    targets: dialogueContainer, 
                    alpha: 0, 
                    scale: 0.8,
                    duration: 300, 
                    ease: 'Power2',
                    onComplete: () => {
                        dialogueContainer.destroy();
                        onComplete();
                    }
                });
            });
            
            // Also allow space bar to continue
            const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            spaceKey.once('down', () => {
                this.input.keyboard?.removeKey(spaceKey);
                bg.emit('pointerdown');
            });
        });
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        return new Promise(resolve => {
            textObject.setText('').setAlpha(1);
            let charIndex = 0;
            const timer = this.time.addEvent({
                delay: 30, // Slightly slower for better readability
                callback: () => {
                    textObject.setText(textObject.text + text[charIndex++]);
                    if (charIndex === text.length) {
                        timer.remove();
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }

    private waitForClick(): Promise<void> {
        return new Promise(resolve => {
            this.input.once('pointerdown', resolve);
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): GameObjects.Container {
        const button = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2f3542).setStrokeStyle(2, 0x57606f);
        const buttonText = this.add.text(0, 0, text, { fontFamily: "dungeon-mode", fontSize: 24, color: "#e8eced", align: "center" }).setOrigin(0.5);
        button.add([bg, buttonText]);
        button.setSize(200, 50);
        const interactiveArea = new Phaser.Geom.Rectangle(-100, -25, 200, 50);
        button.setInteractive(interactiveArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                // Add more visual feedback when button is clicked
                bg.setFillStyle(0x1e2a38); // Darker color on click
                this.cameras.main.shake(30, 0.01); // Small screen shake
                this.time.delayedCall(100, () => {
                    // Reset color after click
                    bg.setFillStyle(0x2f3542);
                });
                callback(); // Execute the original callback
            })
            .on('pointerover', () => {
                bg.setFillStyle(0x3d4454);
            })
            .on('pointerout', () => {
                bg.setFillStyle(0x2f3542);
            });
        return button;
    }

    private showMoralChoiceAfterDefeat(onComplete: () => void, isSpecialAttack: boolean = false) {
        // We need to find the current tutorial text in the container
        // Look for the text object by checking the object type
        let tutorialText: GameObjects.Text | null = null;
        for (let i = 0; i < this.tutorialContainer.length; i++) {
            const obj = this.tutorialContainer.getAt(i);
            if (obj.type === 'Text' && obj.text !== undefined) {
                tutorialText = obj as GameObjects.Text;
                break;
            }
        }
        
        // If we couldn't find it, return early to avoid errors
        if (!tutorialText) {
            console.error("Could not find tutorial text object");
            onComplete();
            return;
        }
        
        // Update text to explain moral choice
        this.typeText(tutorialText, "The corrupted spirit is weakened. You now have a choice:\nSlay for power, or Spare to restore their spirit?").then(() => {
            this.isTransitioning = false;
            
            const choices = ['Slay (Gain Power)', 'Spare (Restore Spirit)'];
            const choiceContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
            this.tutorialContainer.add(choiceContainer);
            
            // Add a subtle background for choice area
            const choiceAreaBg = this.add.rectangle(
                this.cameras.main.width / 2, 
                this.cameras.main.height - 100, 
                700, 
                80,
                0x2c3e50
            ).setAlpha(0.3);
            this.tutorialContainer.add(choiceAreaBg);
            
            choices.forEach((choiceText, i) => {
                const choice = i === 0 ? 'slay' : 'spare';
                const button = this.createButton(-220 + i * 440, 0, choiceText, () => {
                    if (this.isTransitioning) return;
                    
                    // Add visual feedback when button is clicked
                    this.cameras.main.shake(50, 0.005);
                    
                    this.isTransitioning = true;
                    choiceContainer.destroy();
                    choiceAreaBg.destroy();
                    
                    // Show different dialogue based on choice
                    if (choice === 'slay') {
                        this.showDialogue(`You chose the path of power.`, () => {
                            // Player gains power/reward for slay
                            this.typeText(tutorialText, "You have gained power from the defeated spirit.").then(() => {
                                onComplete();
                            });
                        });
                    } else { // spare
                        this.showDialogue(`You chose to restore the spirit.`, () => {
                            // Find the text object again as the context might have changed
                            let finalTutorialText: GameObjects.Text | null = null;
                            for (let j = 0; j < this.tutorialContainer.length; j++) {
                                const obj = this.tutorialContainer.getAt(j);
                                if (obj.type === 'Text' && obj.text !== undefined) {
                                    finalTutorialText = obj as GameObjects.Text;
                                    break;
                                }
                            }
                            
                            if (finalTutorialText) {
                                // Get the tikbalang sprite for the spare animation
                                let tikbalang: GameObjects.Sprite | null = null;
                                for (let k = 0; k < this.tutorialContainer.length; k++) {
                                    const obj = this.tutorialContainer.getAt(k);
                                    if (obj.type === 'Sprite' && (obj as GameObjects.Sprite).texture.key.includes('tikbalang')) {
                                        tikbalang = obj as GameObjects.Sprite;
                                        break;
                                    }
                                }
                                
                                if (tikbalang) {
                                    // Show spirit restoration effect
                                    this.playSpareAnimation(tikbalang, () => {
                                        this.typeText(finalTutorialText, "You have restored the spirit and gained their respect.").then(() => {
                                            onComplete();
                                        });
                                    });
                                } else {
                                    console.error("Could not find tikbalang sprite for spare animation");
                                    this.typeText(finalTutorialText, "You have restored the spirit and gained their respect.").then(() => {
                                        onComplete();
                                    });
                                }
                            } else {
                                console.error("Could not find tutorial text object for spare");
                                onComplete();
                            }
                        });
                    }
                });
                choiceContainer.add(button);
            });
        });
    }

    private playSpareAnimation(target: GameObjects.Sprite, onComplete: () => void) {
        this.isTransitioning = true;
        
        // Create a healing/light effect
        const spareEffect = this.add.particles(0, 0, 'pixel', {
            x: target.x,
            y: target.y,
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'add',
            frequency: 20,
            lifespan: 800,
            quantity: 5,
            tint: 0x2ecc71 // Green for healing/spare
        });
        
        // Make target flicker with a lighter color
        this.tweens.add({
            targets: target,
            tint: 0x2ecc71,
            duration: 200,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                target.clearTint();
                spareEffect.destroy();
                onComplete();
            }
        });
    }
}
