import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, HandEvaluation, Suit, Rank } from '../../core/types/CombatTypes';

enum TutorialStep {
    START,
    PAIR_HAND,
    PAIR_ACTION,
    FLUSH_HAND,
    FLUSH_ACTION,
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

        const imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222).setAlpha(0);
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { fontFamily: 'dungeon-mode', fontSize: 32, color: '#FFFFFF', align: 'center', wordWrap: { width: this.cameras.main.width - 100 } }).setOrigin(0.5);

        const showNextSlide = () => {
            if (this.isTransitioning) return;
            if (currentSlide >= slides.length) {
                this.isStoryPhase = false;
                this.input.off('pointerdown', showNextSlide);
                this.tweens.add({ targets: [imagePlaceholder, displayedText], alpha: 0, duration: 500, onComplete: () => {
                    imagePlaceholder.destroy();
                    displayedText.destroy();
                    this.startTutorial();
                }});
                return;
            }

            this.isTransitioning = true;
            this.tweens.add({ targets: imagePlaceholder, alpha: 1, duration: 500 });
            this.typeText(displayedText, slides[currentSlide]).then(() => {
                this.isTransitioning = false;
            });
            currentSlide++;
        };

        this.input.on('pointerdown', showNextSlide);
        showNextSlide();
    }

    private startTutorial() {
        this.tutorialContainer = this.add.container(0, 0);
        this.renderTutorialStep(TutorialStep.START);
    }

    private renderTutorialStep(step: TutorialStep) {
        this.isTransitioning = true;
        this.tutorialContainer.removeAll(true);

        const tikbalang = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'tikbalang').setScale(1.5);
        this.anims.play('tikbalang_idle', tikbalang);
        const tutorialText = this.add.text(this.cameras.main.width / 2, 50, '', { fontFamily: 'dungeon-mode', fontSize: 24, color: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        this.tutorialContainer.add([tikbalang, tutorialText]);

        switch (step) {
            case TutorialStep.START:
                this.showDialogue("You dare challenge me, mortal?", () => this.renderTutorialStep(TutorialStep.PAIR_HAND));
                break;

            case TutorialStep.PAIR_HAND:
                this.typeText(tutorialText, 'To fight, select 5 cards to form a poker hand.\nThis hand has a PAIR.').then(() => this.isTransitioning = false);
                this.drawCards('pair', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type === 'pair') {
                        this.renderTutorialStep(TutorialStep.PAIR_ACTION);
                    } else {
                        this.typeText(tutorialText, 'That\'s not a PAIR. Try again.').then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.PAIR_HAND)));
                    }
                });
                break;

            case TutorialStep.PAIR_ACTION:
                this.typeText(tutorialText, 'A PAIR! Now choose an action.\nAttack deals damage. For now, let\'s ATTACK.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'attack') {
                        this.playAttackAnimation(tikbalang, '2', () => this.showDialogue("Is that all you've got?", () => this.renderTutorialStep(TutorialStep.FLUSH_HAND)));
                    } else {
                        this.typeText(tutorialText, 'Let\'s stick to ATTACK for now.');
                    }
                });
                break;

            case TutorialStep.FLUSH_HAND:
                this.typeText(tutorialText, 'Good! Now for a stronger hand.\nForm a FLUSH (5 cards of the same suit).').then(() => this.isTransitioning = false);
                this.drawCards('flush', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type === 'flush') {
                        this.renderTutorialStep(TutorialStep.FLUSH_ACTION);
                    } else {
                        this.typeText(tutorialText, 'That\'s not a FLUSH. Try again.').then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.FLUSH_HAND)));
                    }
                });
                break;

            case TutorialStep.FLUSH_ACTION:
                this.typeText(tutorialText, 'A FLUSH! This unlocks a powerful SPECIAL attack.').then(() => this.isTransitioning = false);
                this.showActionButtons((action) => {
                    if (action === 'special') {
                        this.playAttackAnimation(tikbalang, '14', () => this.showDialogue("Argh! The flames... I am defeated...", () => this.renderTutorialStep(TutorialStep.END)));
                    } else {
                        this.typeText(tutorialText, 'Use the SPECIAL attack!');
                    }
                });
                break;

            case TutorialStep.END:
                this.typeText(tutorialText, 'You have learned the basics. Your journey begins now.');
                this.tweens.add({ targets: this.tutorialContainer, alpha: 0, duration: 1000, delay: 1000 });
                this.cameras.main.fadeOut(3000, 0, 0, 0, (camera, progress) => {
                    if (progress === 1) this.scene.start('Overworld');
                });
                break;
        }
    }

    private drawCards(type: 'pair' | 'flush', onHandComplete: (selected: PlayingCard[]) => void) {
        const handConfig = type === 'pair'
            ? [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}]
            : [{r: '2', s: 'Apoy'}, {r: '5', s: 'Apoy'}, {r: '7', s: 'Apoy'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '8', s: 'Lupa'}, {r: '6', s: 'Hangin'}];
        
        const hand = handConfig.map((def, i) => ({ id: `p_${i}`, rank: def.r as Rank, suit: def.s as Suit, selected: false, playable: true, element: 'neutral' }));
        const selectedCards: PlayingCard[] = [];
        const handSprites: GameObjects.Sprite[] = [];

        const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};
        const cardWidth = 200 * 0.35;
        const handWidth = hand.length * (cardWidth * 0.9);
        const startX = this.cameras.main.width / 2 - handWidth / 2;
        const y = this.cameras.main.height - 250; // Increased gap

        const playHandButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Play Hand', () => {});
        playHandButton.setVisible(false);
        this.tutorialContainer.add(playHandButton);

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
                        selectedCards.push(card);
                    }
                } else {
                    cardSprite.y += 30;
                    const index = selectedCards.findIndex(c => c.id === card.id);
                    if (index > -1) selectedCards.splice(index, 1);
                }

                if (selectedCards.length === 5) {
                    playHandButton.setVisible(true).setInteractive().once('pointerdown', () => {
                        if(this.isTransitioning) return;
                        this.isTransitioning = true;
                        playHandButton.destroy();
                        handSprites.forEach(s => s.disableInteractive());
                        onHandComplete(selectedCards);
                    });
                }
            });
        });
    }

    private showActionButtons(onAction: (action: string) => void) {
        const actions = ['Attack', 'Defend', 'Special'];
        const actionButtons = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        this.tutorialContainer.add(actionButtons);
        actions.forEach((action, i) => {
            const button = this.createButton(-220 + i * 220, 0, action, () => {
                if (this.isTransitioning) return;
                onAction(action.toLowerCase());
            });
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
        const bg = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 100, 0x000000, 0.8).setStrokeStyle(2, 0xFFFFFF).setInteractive();
        const dialogueText = this.add.text(0, 0, '', { fontFamily: 'dungeon-mode', fontSize: 20, color: '#FFFFFF', align: 'center', wordWrap: { width: this.cameras.main.width * 0.75 } }).setOrigin(0.5);
        const continueIndicator = this.add.text(bg.width/2 - 30, bg.height/2 - 20, '▼', { fontSize: 24 }).setOrigin(0.5).setVisible(false);
        dialogueContainer.add([bg, dialogueText, continueIndicator]);
        
        this.typeText(dialogueText, text).then(() => {
            this.isTransitioning = false;
            continueIndicator.setVisible(true);
            this.tweens.add({ targets: continueIndicator, y: '+=5', duration: 500, yoyo: true, repeat: -1 });
            bg.once('pointerdown', () => {
                this.tweens.add({ targets: dialogueContainer, alpha: 0, duration: 300, onComplete: () => {
                    dialogueContainer.destroy();
                    onComplete();
                }});
            });
        });
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        return new Promise(resolve => {
            textObject.setText('').setAlpha(1);
            let charIndex = 0;
            const timer = this.time.addEvent({
                delay: 20,
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

    private createButton(x: number, y: number, text: string, callback: () => void): GameObjects.Container {
        const button = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2f3542).setStrokeStyle(2, 0x57606f);
        const buttonText = this.add.text(0, 0, text, { fontFamily: "dungeon-mode", fontSize: 24, color: "#e8eced", align: "center" }).setOrigin(0.5);
        button.add([bg, buttonText]);
        button.setSize(200, 50);
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', callback)
            .on('pointerover', () => bg.setFillStyle(0x3d4454))
            .on('pointerout', () => bg.setFillStyle(0x2f3542));
        return button;
    }
}
