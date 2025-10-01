import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, HandEvaluation, Suit, Rank } from '../../core/types/CombatTypes';

enum TutorialStep {
    PAIR_HAND,
    PAIR_ACTION,
    FLUSH_HAND,
    FLUSH_ACTION,
    END
}

export class Prologue extends Scene {
    private slides: { text: string }[];
    private currentSlideIndex: number = 0;
    private displayedText: GameObjects.Text;
    private imagePlaceholder: GameObjects.Rectangle;
    private continuePrompt: GameObjects.Text;

    private tutorialStep: TutorialStep;
    private isStoryPhase: boolean = true;
    private isTransitioning: boolean = false;

    // Game Objects that are frequently recreated
    private tutorialContainer: GameObjects.Container;

    constructor() {
        super('Prologue');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.isStoryPhase = true;

        this.slides = [
            { text: "Long ago, two gods, Bathala, the sky-father, and Amihan, the sea-mother, created the islands." },
            { text: "These islands were a paradise for the anito, spirits of nature, who lived in harmony." },
            { text: "But the engkanto, spirits of deceit, grew jealous. They wove lies and discord, turning the anito against each other." },
            { text: "A hero is needed to restore balance." },
            { text: "You must channel the power of the four elements - Apoy, Tubig, Lupa, and Hangin - through sacred cards." },
            { text: "Combine these cards to form powerful hands, and vanquish the corrupted spirits." },
        ];

        this.imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222).setAlpha(0);
        this.displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { fontFamily: 'dungeon-mode', fontSize: 32, color: '#FFFFFF', align: 'center', wordWrap: { width: this.cameras.main.width - 100 } }).setOrigin(0.5).setAlpha(0);
        this.continuePrompt = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click to continue...', { fontFamily: 'dungeon-mode', fontSize: 24, color: '#888888', align: 'center' }).setOrigin(0.5).setVisible(false);
        
        this.showSlide(0);

        this.input.on('pointerdown', () => {
            if (this.isStoryPhase) {
                this.nextSlide();
            }
        });
    }

    private showSlide(index: number) {
        if (index >= this.slides.length) {
            this.startTutorial();
            return;
        }
        this.currentSlideIndex = index;
        this.displayedText.setText(this.slides[index].text);
        this.tweens.add({ targets: [this.imagePlaceholder, this.displayedText], alpha: 1, duration: 500 });
    }

    private nextSlide() {
        this.currentSlideIndex++;
        if (this.currentSlideIndex >= this.slides.length) {
            this.isStoryPhase = false;
            this.startTutorial();
        } else {
            this.showSlide(this.currentSlideIndex);
        }
    }

    private startTutorial() {
        this.tweens.add({
            targets: [this.imagePlaceholder, this.displayedText, this.continuePrompt],
            alpha: 0, duration: 500,
            onComplete: () => {
                this.imagePlaceholder.destroy();
                this.displayedText.destroy();
                this.continuePrompt.destroy();
                this.tutorialContainer = this.add.container(0, 0);
                this.renderTutorialStep(TutorialStep.PAIR_HAND);
            }
        });
    }

    private renderTutorialStep(step: TutorialStep) {
        this.isTransitioning = true;
        this.tutorialStep = step;
        this.tutorialContainer.removeAll(true);

        // --- Create Static UI ---
        const tikbalang = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'tikbalang').setScale(1.5);
        this.anims.play('tikbalang_idle', tikbalang);
        const tutorialText = this.add.text(this.cameras.main.width / 2, 50, '', { fontFamily: 'dungeon-mode', fontSize: 24, color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        this.tutorialContainer.add([tikbalang, tutorialText]);

        let handConfig: {rank: Rank, suit: Suit}[];
        let hand: PlayingCard[];
        const selectedCards: PlayingCard[] = [];

        const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};

        const playHandButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Play Hand', () => {});
        playHandButton.setVisible(false);
        this.tutorialContainer.add(playHandButton);

        const showActionButtons = (onAction: (action: string) => void) => {
            const actions = ['Attack', 'Defend', 'Special'];
            const actionButtons = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
            this.tutorialContainer.add(actionButtons);
            actions.forEach((action, i) => {
                const button = this.createButton(-220 + i * 220, 0, action, () => onAction(action.toLowerCase()));
                actionButtons.add(button);
            });
        };

        switch (step) {
            case TutorialStep.PAIR_HAND:
                tutorialText.setText('To fight, select 5 cards to form a poker hand.\nThis hand has a PAIR.');
                handConfig = [{rank: '5', suit: 'Apoy'}, {rank: '5', suit: 'Tubig'}, {rank: '2', suit: 'Lupa'}, {rank: '7', suit: 'Hangin'}, {rank: '9', suit: 'Apoy'}, {rank: 'Datu', suit: 'Tubig'}, {rank: '3', suit: 'Lupa'}, {rank: '4', suit: 'Hangin'}];
                hand = handConfig.map((def, i) => ({...def, id: `p_${i}`, selected: false, playable: true, element: 'neutral'}));
                this.drawCards(hand, (selectedSprites) => {
                    const evaluation = HandEvaluator.evaluateHand(selectedSprites.map(s => s.getData('card')), 'attack');
                    if (evaluation.type === 'pair') {
                        this.renderTutorialStep(TutorialStep.PAIR_ACTION);
                    } else {
                        tutorialText.setText('That\'s not a PAIR. Try again.');
                        this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.PAIR_HAND));
                    }
                });
                break;

            case TutorialStep.PAIR_ACTION:
                tutorialText.setText('A PAIR! Now choose an action.\nAttack deals damage. For now, let\'s ATTACK.');
                showActionButtons((action) => {
                    if (action === 'attack') {
                        this.renderTutorialStep(TutorialStep.FLUSH_HAND);
                    } else {
                        tutorialText.setText('Let\'s stick to ATTACK for now.');
                    }
                });
                break;

            case TutorialStep.FLUSH_HAND:
                tutorialText.setText('Good! Now for a stronger hand.\nForm a FLUSH (5 cards of the same suit).');
                handConfig = [{rank: '2', suit: 'Apoy'}, {rank: '5', suit: 'Apoy'}, {rank: '7', suit: 'Apoy'}, {rank: '9', suit: 'Apoy'}, {rank: 'Datu', suit: 'Apoy'}, {rank: '3', suit: 'Tubig'}, {rank: '8', suit: 'Lupa'}, {rank: '6', suit: 'Hangin'}];
                hand = handConfig.map((def, i) => ({...def, id: `f_${i}`, selected: false, playable: true, element: 'neutral'}));
                this.drawCards(hand, (selectedSprites) => {
                    const evaluation = HandEvaluator.evaluateHand(selectedSprites.map(s => s.getData('card')), 'attack');
                    if (evaluation.type === 'flush') {
                        this.renderTutorialStep(TutorialStep.FLUSH_ACTION);
                    } else {
                        tutorialText.setText('That\'s not a FLUSH. Try again.');
                        this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.FLUSH_HAND));
                    }
                });
                break;

            case TutorialStep.FLUSH_ACTION:
                tutorialText.setText('A FLUSH! This unlocks a powerful SPECIAL attack.');
                showActionButtons((action) => {
                    if (action === 'special') {
                        this.renderTutorialStep(TutorialStep.END);
                    } else {
                        tutorialText.setText('Use the SPECIAL attack!');
                    }
                });
                break;

            case TutorialStep.END:
                tutorialText.setText('You have learned the basics. Your journey begins now.');
                this.tweens.add({ targets: this.tutorialContainer, alpha: 0, duration: 1000 });
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera, progress) => {
                    if (progress === 1) this.scene.start('Overworld');
                });
                break;
        }
        this.isTransitioning = false;
    }

    private drawCards(hand: PlayingCard[], onHandComplete: (selected: GameObjects.Sprite[]) => void) {
        const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};
        const handSprites: GameObjects.Sprite[] = [];
        const selectedSprites: GameObjects.Sprite[] = [];
        
        const cardWidth = 200 * 0.35;
        const handWidth = hand.length * (cardWidth * 0.9);
        const startX = this.cameras.main.width / 2 - handWidth / 2;
        const y = this.cameras.main.height - 220;

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
                cardData.selected = !cardData.selected;

                if (cardData.selected) {
                    if (selectedSprites.length < 5) {
                        cardSprite.y -= 30;
                        selectedSprites.push(cardSprite);
                    }
                } else {
                    cardSprite.y += 30;
                    const index = selectedSprites.findIndex(s => s.getData('card').id === cardData.id);
                    if (index > -1) selectedSprites.splice(index, 1);
                }

                if (selectedSprites.length === 5) {
                    const playButton = this.tutorialContainer.getAt(2) as GameObjects.Container; // Assuming it's the 3rd element
                    playButton.setVisible(true);
                    playButton.setInteractive().once('pointerdown', () => {
                        if(this.isTransitioning) return;
                        this.isTransitioning = true;
                        playButton.disableInteractive().setVisible(false);
                        handSprites.forEach(s => s.disableInteractive());
                        onHandComplete(selectedSprites);
                    });
                }
            });
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): GameObjects.Container {
        const button = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2f3542).setStrokeStyle(2, 0x57606f);
        const buttonText = this.add.text(0, 0, text, { fontFamily: "dungeon-mode", fontSize: 24, color: "#e8eced", align: "center" }).setOrigin(0.5);
        button.add([bg, buttonText]);
        button.setSize(200, 50);
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains).on('pointerdown', callback);
        return button;
    }
}