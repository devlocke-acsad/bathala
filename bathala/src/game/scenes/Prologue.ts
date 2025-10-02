import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, HandEvaluation, Suit, Rank } from '../../core/types/CombatTypes';

enum TutorialStep {
    START,
    TUTORIAL_ATTACK,
    TUTORIAL_DEFEND,
    TUTORIAL_SPECIAL,
    FINAL_BATTLE,
    END
}

export class Prologue extends Scene {
    private isStoryPhase: boolean = true;
    private isTransitioning: boolean = false;
    private tutorialContainer: GameObjects.Container;
    private skipButton: GameObjects.Container;

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

        const imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222)
            .setStrokeStyle(3, 0x4a90e2)
            .setAlpha(0);
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

        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click or press SPACE to continue', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 18, 
            color: '#AAAAAA', 
            align: 'center' 
        }).setOrigin(0.5);

        this.skipButton = this.createButton(this.cameras.main.width - 120, 40, 'Skip Intro', () => {
            this.isStoryPhase = false;
            this.input.off('pointerdown', showNextSlide);
            this.input.keyboard?.off('keydown-SPACE');
            this.tweens.add({ 
                targets: [imagePlaceholder, border, displayedText, controlsText, this.skipButton], 
                alpha: 0, 
                duration: 500, 
                ease: 'Power2',
                onComplete: () => {
                    imagePlaceholder.destroy();
                    border.destroy();
                    displayedText.destroy();
                    controlsText.destroy();
                    this.skipButton.destroy();
                    this.startTutorial();
                }
            });
        });
        this.skipButton.setAlpha(0);
        
        const self = this;
        const showNextSlide = function() {
            if (self.isTransitioning) return;
            if (currentSlide >= slides.length) {
                self.isStoryPhase = false;
                self.input.off('pointerdown', showNextSlide);
                self.input.keyboard?.off('keydown-SPACE');
                
                self.tweens.add({ 
                    targets: [imagePlaceholder, border, displayedText, controlsText, self.skipButton], 
                    alpha: 0, 
                    duration: 1000, 
                    ease: 'Power2',
                    onComplete: () => {
                        imagePlaceholder.destroy();
                        border.destroy();
                        displayedText.destroy();
                        controlsText.destroy();
                        self.skipButton.destroy();
                        self.startTutorial();
                    }
                });
                return;
            }

            self.isTransitioning = true;
            
            self.tweens.add({ 
                targets: [imagePlaceholder, border, self.skipButton], 
                alpha: 1, 
                duration: 500,
                ease: 'Power2'
            });
            
            self.typeText(displayedText, slides[currentSlide]).then(() => {
                self.isTransitioning = false;
            });
            currentSlide++;
        };

        this.input.keyboard?.on('keydown-SPACE', showNextSlide);
        this.input.on('pointerdown', showNextSlide);
        showNextSlide();
    }

    private startTutorial() {
        const fadeInOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000)
            .setAlpha(0.7);
        
        this.tweens.add({
            targets: fadeInOverlay,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                fadeInOverlay.destroy();
                this.tutorialContainer = this.add.container(0, 0);
                this.skipButton = this.createButton(this.cameras.main.width - 120, 40, 'Skip Tutorial', () => {
                    this.endTutorial(true);
                });
                this.renderTutorialStep(TutorialStep.START);
            }
        });
    }

    private renderTutorialStep(step: TutorialStep) {
        this.isTransitioning = true;
        this.tutorialContainer.removeAll(true);

        const tutorialBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x1a1a2a).setAlpha(0.7);
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

        switch (step) {
            case TutorialStep.START:
                this.showDialogue("You dare challenge me, spirit-touched one? Show me your skill with the sacred cards!", () => this.renderTutorialStep(TutorialStep.TUTORIAL_ATTACK));
                break;

            case TutorialStep.TUTORIAL_ATTACK:
                this.typeText(tutorialText, 'First, let\'s ATTACK. Form a PAIR by selecting two cards of the same rank.').then(() => this.isTransitioning = false);
                this.drawCards('pair', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                    if (evaluation.type === 'pair') {
                        this.showActionButtons((action) => {
                            if (action === 'attack') {
                                this.playAttackAnimation(tikbalang, '2', () => this.showDialogue("Weak! Your attack barely scratched me! Now, prepare to DEFEND!", () => this.renderTutorialStep(TutorialStep.TUTORIAL_DEFEND)));
                            }
                        }, ['attack']);
                    } else {
                        this.typeText(tutorialText, 'Not quite. Select two cards with the same rank to form a PAIR.').then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.TUTORIAL_ATTACK)));
                    }
                });
                break;

            case TutorialStep.TUTORIAL_DEFEND:
                this.typeText(tutorialText, 'The enemy prepares to strike! Form a hand and DEFEND to gain block.').then(() => this.isTransitioning = false);
                this.drawCards('pair', (selected) => {
                    this.showActionButtons((action) => {
                        if (action === 'defend') {
                            this.typeText(tutorialText, 'You gained 2 protective block!').then(() => {
                                this.time.delayedCall(1500, () => {
                                    this.showDialogue("Hah! A measly defense won't save you forever!", () => this.renderTutorialStep(TutorialStep.TUTORIAL_SPECIAL));
                                });
                            });
                        }
                    }, ['defend']);
                });
                break;

            case TutorialStep.TUTORIAL_SPECIAL:
                this.typeText(tutorialText, 'Time for a powerful move! Form a THREE OF A KIND to unlock a SPECIAL action.').then(() => this.isTransitioning = false);
                this.drawCards('three_of_a_kind', (selected) => {
                    const evaluation = HandEvaluator.evaluateHand(selected, 'special');
                    if (evaluation.type === 'three_of_a_kind') {
                        this.showActionButtons((action) => {
                            if (action === 'special') {
                                this.playAttackAnimation(tikbalang, '10', () => this.showDialogue("Argh! A powerful blow!", () => this.renderTutorialStep(TutorialStep.FINAL_BATTLE)));
                            }
                        }, ['special']);
                    } else {
                        this.typeText(tutorialText, 'Almost. Select three cards with the same rank for a THREE OF A KIND.').then(() => this.time.delayedCall(1500, () => this.renderTutorialStep(TutorialStep.TUTORIAL_SPECIAL)));
                    }
                });
                break;

            case TutorialStep.FINAL_BATTLE:
                this.typeText(tutorialText, "You have learned the sacred arts! The spirit is weakened. Now, you must choose: Will you Slay for power, or Spare to restore their spirit?").then(() => {
                    this.isTransitioning = false;
                    this.showMoralChoiceAfterDefeat(() => {
                        this.renderTutorialStep(TutorialStep.END);
                    });
                });
                break;

            case TutorialStep.END:
                this.endTutorial();
                break;
        }
    }

    private async endTutorial(skipped = false) {
        if (this.skipButton) {
            this.skipButton.destroy();
        }
        if (skipped) {
            this.scene.start('Overworld');
            return;
        }

        const tutorialText = this.tutorialContainer.getAt(2) as GameObjects.Text;
        const tikbalang = this.tutorialContainer.getAt(1) as GameObjects.Sprite;
        
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

        const transitionOverlay = this.add.graphics();
        this.tutorialContainer.add(transitionOverlay);
        
        this.tweens.add({
            targets: this.tutorialContainer,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });
        
        this.time.delayedCall(500, () => {
            let radius = 0;
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            this.tweens.addCounter({
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

    private drawCards(type: 'pair' | 'three_of_a_kind', onHandComplete: (selected: PlayingCard[]) => void) {
        let handConfig;
        switch(type) {
            case 'pair':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            case 'three_of_a_kind':
                handConfig = [{r: '7', s: 'Apoy'}, {r: '7', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '2', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
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

        const cardAreaBg = this.add.rectangle(this.cameras.main.width / 2, y, handWidth + 50, cardWidth * 0.5 + 80, 0x2c3e50).setAlpha(0.3);
        this.tutorialContainer.add(cardAreaBg);

        const playHandButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Play Hand', () => {});
        playHandButton.setVisible(false);
        this.tutorialContainer.add(playHandButton);

        const selectionIndicator = this.add.text(this.cameras.main.width / 2, y + 80, 'Selected: 0/5', { fontFamily: 'dungeon-mode', fontSize: 18, color: '#FFFFFF' }).setOrigin(0.5);
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
                        cardSprite.setTint(0x4a90e2);
                        selectedCards.push(card);
                    } else {
                        card.selected = false; // deselect if trying to select more than 5
                    }
                } else {
                    cardSprite.y += 30;
                    cardSprite.clearTint();
                    const index = selectedCards.findIndex(c => c.id === card.id);
                    if (index > -1) selectedCards.splice(index, 1);
                }

                selectionIndicator.setText(`Selected: ${selectedCards.length}/5`);
                
                if (selectedCards.length === 5) {
                    selectionIndicator.setColor('#4ade80');
                    playHandButton.setVisible(true).setInteractive().once('pointerdown', () => {
                        if(this.isTransitioning) return;
                        this.isTransitioning = true;
                        playHandButton.destroy();
                        selectionIndicator.destroy();
                        cardAreaBg.destroy();
                        handSprites.forEach(s => s.destroy());
                        onHandComplete(selectedCards);
                    });
                } else {
                    selectionIndicator.setColor('#ffffff');
                    playHandButton.setVisible(false);
                }
            });
        });
    }

    private showActionButtons(onAction: (action: string) => void, enabled: string[] = ['attack', 'defend', 'special']) {
        const actions = ['Attack', 'Defend', 'Special'];
        const actionButtons = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        this.tutorialContainer.add(actionButtons);
        
        const actionAreaBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 100, 700, 80, 0x2c3e50).setAlpha(0.3);
        this.tutorialContainer.add(actionAreaBg);
        
        actions.forEach((action, i) => {
            const lowerCaseAction = action.toLowerCase();
            const isEnabled = enabled.includes(lowerCaseAction);
            const button = this.createButton(-220 + i * 220, 0, action, () => {
                if (this.isTransitioning || !isEnabled) return;
                
                this.cameras.main.shake(50, 0.005);
                
                this.isTransitioning = true;
                actionButtons.destroy();
                actionAreaBg.destroy();
                onAction(lowerCaseAction);
            });
            if (!isEnabled) {
                (button.getAt(0) as GameObjects.Rectangle).setFillStyle(0x1a1a1a, 0.5);
                (button.getAt(1) as GameObjects.Text).setAlpha(0.5);
            } else {
                // Highlight enabled buttons
                this.tweens.add({
                    targets: button.getAt(0),
                    scaleX: 1.05,
                    scaleY: 1.05,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    duration: 700
                });
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
        
        const bg = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 120, 0x1a1a2e, 0.9).setStrokeStyle(3, 0x8e44ad).setInteractive();
        const dialogueText = this.add.text(0, -20, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 22, 
            color: '#ecf0f1', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width * 0.75 } 
        }).setOrigin(0.5);
        
        const speakerIcon = this.add.sprite(-bg.width/2 + 50, 0, 'tikbalang').setScale(0.4);
        
        const continueIndicator = this.add.text(bg.width/2 - 40, bg.height/2 - 10, '▼', { 
            fontSize: 28, 
            color: '#e74c3c'
        }).setOrigin(0.5).setVisible(false);
        
        dialogueContainer.add([bg, speakerIcon, dialogueText, continueIndicator]);
        
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
            
            this.tweens.add({
                targets: continueIndicator,
                y: '+=8',
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            const onContinue = () => {
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
            };

            bg.once('pointerdown', onContinue);
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
                delay: 30,
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
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                if (button.getData('isPressed')) return;
                button.setData('isPressed', true);
                bg.setFillStyle(0x1e2a38);
                this.cameras.main.shake(30, 0.01);
                this.time.delayedCall(100, () => bg.setFillStyle(0x2f3542));
                this.time.delayedCall(200, () => button.setData('isPressed', false));
                callback();
            })
            .on('pointerover', () => bg.setFillStyle(0x3d4454))
            .on('pointerout', () => bg.setFillStyle(0x2f3542));
            
        return button;
    }

    private showMoralChoiceAfterDefeat(onComplete: () => void) {
        let tutorialText: GameObjects.Text | null = this.tutorialContainer.list.find(obj => obj.type === 'Text') as GameObjects.Text || null;
        
        if (!tutorialText) {
            console.error("Could not find tutorial text object");
            onComplete();
            return;
        }
        
        const choices = ['Slay (Gain Power)', 'Spare (Restore Spirit)'];
        const choiceContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        this.tutorialContainer.add(choiceContainer);
        
        const choiceAreaBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height - 100, 700, 80, 0x2c3e50).setAlpha(0.3);
        this.tutorialContainer.add(choiceAreaBg);
        
        choices.forEach((choiceText, i) => {
            const choice = i === 0 ? 'slay' : 'spare';
            const button = this.createButton(-220 + i * 440, 0, choiceText, () => {
                if (this.isTransitioning) return;
                
                this.cameras.main.shake(50, 0.005);
                
                this.isTransitioning = true;
                choiceContainer.destroy();
                choiceAreaBg.destroy();
                
                if (choice === 'slay') {
                    this.showDialogue(`You chose the path of power.`, () => {
                        this.typeText(tutorialText, "You have gained power from the defeated spirit.").then(onComplete);
                    });
                } else {
                    let tikbalang = this.tutorialContainer.list.find(obj => obj.type === 'Sprite') as GameObjects.Sprite;
                    if (tikbalang) {
                        this.playSpareAnimation(tikbalang, () => {
                            this.typeText(tutorialText, "You have restored the spirit and gained their respect.").then(onComplete);
                        });
                    } else {
                        this.typeText(tutorialText, "You have restored the spirit and gained their respect.").then(onComplete);
                    }
                }
            });
            choiceContainer.add(button);
        });
    }

    private playSpareAnimation(target: GameObjects.Sprite, onComplete: () => void) {
        this.isTransitioning = true;
        
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
            tint: 0x2ecc71
        });
        
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
