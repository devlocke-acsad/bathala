import { Scene, GameObjects } from 'phaser';
import { createButton } from '../../../ui/Button';
import { TIKBALANG_SCOUT, BALETE_WRAITH, SIGBIN_CHARGER } from '../../../../data/enemies/Act1Enemies';
import { Enemy, PlayingCard, HandType } from '../../../../core/types/CombatTypes';
import { DeckManager } from '../../../../utils/DeckManager';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialPhase } from './TutorialPhase';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';
import { showDialogue } from '../ui/Dialogue';

export class Phase4_CombatActions extends TutorialPhase {
    private onComplete: () => void;
    private currentSection: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, onComplete: () => void) {
        super(scene, tutorialUI);
        this.onComplete = onComplete;
    }

    start() {
        this.nextSection();
    }

    public shutdown() {
        this.scene.events.off('selectCard');
        this.container.destroy();
    }

    private nextSection() {
        this.currentSection++;
        switch (this.currentSection) {
            case 1:
                this.showThreeActions();
                break;
            case 2:
                this.attackPractice();
                break;
            case 3:
                this.defendPractice();
                break;
            case 4:
                this.specialPractice();
                break;
            default:
                this.shutdown();
                this.onComplete();
                break;
        }
    }

    private showThreeActions() {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 11);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Combat Actions',
            'Three ways to engage in battle'
        );
        this.container.add(header);

        const dialogue = "Three actions determine combat:\n\n⚔️ ATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus + Buffs\n\n🛡️ DEFEND: Gain Block to absorb damage\n   Base block = 5 + Hand Bonus + Buffs\n\n✨ SPECIAL: Elemental ability (requires Flush or better)\n   Effect varies by dominant element";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Choose your action wisely based on the situation!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(1800, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, tip],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.nextSection();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private attackPractice() {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 11);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Attack',
            'Deal damage to defeat the enemy'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            const enemyData = { ...TIKBALANG_SCOUT, id: 'tutorial_tikbalang' };

            // Enemy display
            const enemyContainer = this.scene.add.container(this.scene.cameras.main.width / 2, 240);
            
            const enemyNameShadow = this.scene.add.text(2, 2, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#000000'
            }).setOrigin(0.5).setAlpha(0.5);

            const enemyName = this.scene.add.text(0, 0, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#ff6b6b'
            }).setOrigin(0.5);

            const enemyHP = this.scene.add.text(0, 40, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#E8E8E8'
            }).setOrigin(0.5);

            const enemyIntent = this.scene.add.text(0, 75, `⚔️ Intent: Attack ${enemyData.intent.value}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 22,
                color: '#FFD700'
            }).setOrigin(0.5);

            enemyContainer.add([enemyNameShadow, enemyName, enemyHP, enemyIntent]);
            this.container.add(enemyContainer);

            this.tutorialUI.drawHand(8);

            this.scene.events.on('selectCard', (card: PlayingCard) => {
                this.tutorialUI.selectCard(card);
            });

            const attackButton = createButton(
                this.scene,
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height - 100,
                '⚔️ Attack',
                () => {
                    if (this.tutorialUI.selectedCards.length !== 5) {
                        const warning = createInfoBox(
                            this.scene,
                            'Select 5 cards to form your hand!',
                            'warning',
                            this.scene.cameras.main.width / 2,
                            this.scene.cameras.main.height - 200
                        );
                        this.container.add(warning);
                        this.scene.time.delayedCall(1500, () => warning.destroy());
                        return;
                    }

                    const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "attack");
                    const damage = 10 + evaluation.totalValue;
                    enemyData.currentHealth -= damage;
                    enemyHP.setText(`HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`);

                    if (enemyData.currentHealth <= 0) {
                        this.scene.events.off('selectCard');
                        const success = createInfoBox(
                            this.scene,
                            'Victory! You defeated the Tikbalang Scout!',
                            'success'
                        );
                        this.container.add(success);

                        this.scene.time.delayedCall(2500, () => {
                            this.scene.tweens.add({
                                targets: this.container.getAll(),
                                alpha: 0,
                                duration: 400,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.container.removeAll(true);
                                    this.nextSection();
                                }
                            });
                        });
                    }
                }
            );

            this.container.add(attackButton);
        });
    }

    private defendPractice() {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 11);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Defend',
            'Gain block to absorb incoming damage'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            const enemyData = { ...BALETE_WRAITH, id: 'tutorial_wraith' };

            // Enemy display
            const enemyContainer = this.scene.add.container(this.scene.cameras.main.width / 2, 240);
            
            const enemyNameShadow = this.scene.add.text(2, 2, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#000000'
            }).setOrigin(0.5).setAlpha(0.5);

            const enemyName = this.scene.add.text(0, 0, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#ff6b6b'
            }).setOrigin(0.5);

            const enemyHP = this.scene.add.text(0, 40, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#E8E8E8'
            }).setOrigin(0.5);

            const enemyIntent = this.scene.add.text(0, 75, `⚔️ Intent: Attack 12`, {
                fontFamily: 'dungeon-mode',
                fontSize: 22,
                color: '#FFD700'
            }).setOrigin(0.5);

            enemyContainer.add([enemyNameShadow, enemyName, enemyHP, enemyIntent]);
            this.container.add(enemyContainer);

            // Player block display
            const blockText = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                340,
                `Your Block: 0`,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: 24,
                    color: '#77888C'
                }
            ).setOrigin(0.5);
            this.container.add(blockText);

            this.tutorialUI.drawHand(8);

            this.scene.events.on('selectCard', (card: PlayingCard) => {
                this.tutorialUI.selectCard(card);
            });

            const defendButton = createButton(
                this.scene,
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height - 100,
                '🛡️ Defend',
                () => {
                    if (this.tutorialUI.selectedCards.length !== 5) {
                        const warning = createInfoBox(
                            this.scene,
                            'Select 5 cards to form your hand!',
                            'warning',
                            this.scene.cameras.main.width / 2,
                            this.scene.cameras.main.height - 200
                        );
                        this.container.add(warning);
                        this.scene.time.delayedCall(1500, () => warning.destroy());
                        return;
                    }

                    const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "defend");
                    const block = 5 + evaluation.totalValue;
                    this.player.block += block;
                    blockText.setText(`Your Block: ${this.player.block}`);
                    blockText.setColor('#4CAF50');

                    this.scene.events.off('selectCard');
                    const success = createInfoBox(
                        this.scene,
                        `You gained ${block} block! This will absorb the enemy's attack!`,
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(2500, () => {
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 400,
                            ease: 'Power2',
                            onComplete: () => {
                                this.container.removeAll(true);
                                this.nextSection();
                            }
                        });
                    });
                }
            );

            this.container.add(defendButton);
        });
    }

    private specialPractice() {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 11);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Special',
            'Unleash elemental abilities with Flush or better'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            const enemyData = { ...SIGBIN_CHARGER, id: 'tutorial_sigbin' };

            // Enemy display
            const enemyContainer = this.scene.add.container(this.scene.cameras.main.width / 2, 240);
            
            const enemyNameShadow = this.scene.add.text(2, 2, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#000000'
            }).setOrigin(0.5).setAlpha(0.5);

            const enemyName = this.scene.add.text(0, 0, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 30,
                color: '#ff6b6b'
            }).setOrigin(0.5);

            const enemyHP = this.scene.add.text(0, 40, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#E8E8E8'
            }).setOrigin(0.5);

            enemyContainer.add([enemyNameShadow, enemyName, enemyHP]);
            this.container.add(enemyContainer);

            // Give player a Flush hand
            this.tutorialUI.drawHand(3);
            const flushCards: PlayingCard[] = [
                { id: '7-Apoy', rank: '7', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                { id: '8-Apoy', rank: '8', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                { id: '9-Apoy', rank: '9', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                { id: '10-Apoy', rank: '10', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                { id: '11-Apoy', rank: 'Mandirigma', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            ];
            this.tutorialUI.addCardsToHand(flushCards);
            this.tutorialUI.updateHandDisplay();

            this.scene.events.on('selectCard', (card: PlayingCard) => {
                this.tutorialUI.selectCard(card);
            });

            const specialButton = createButton(
                this.scene,
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height - 100,
                '✨ Special (Apoy Flush)',
                () => {
                    if (this.tutorialUI.selectedCards.length !== 5) {
                        const warning = createInfoBox(
                            this.scene,
                            'Select all 5 Apoy cards to form a Flush!',
                            'warning',
                            this.scene.cameras.main.width / 2,
                            this.scene.cameras.main.height - 200
                        );
                        this.container.add(warning);
                        this.scene.time.delayedCall(1500, () => warning.destroy());
                        return;
                    }

                    const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "special");
                    
                    if (evaluation.type !== 'flush' && evaluation.type !== 'straight_flush') {
                        const warning = createInfoBox(
                            this.scene,
                            'You need a Flush or better to use Special!',
                            'warning',
                            this.scene.cameras.main.width / 2,
                            this.scene.cameras.main.height - 200
                        );
                        this.container.add(warning);
                        this.scene.time.delayedCall(1500, () => warning.destroy());
                        return;
                    }

                    const damage = 15 + evaluation.totalValue;
                    enemyData.currentHealth -= damage;
                    enemyHP.setText(`HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`);

                    this.scene.events.off('selectCard');
                    const success = createInfoBox(
                        this.scene,
                        `🔥 Apoy Special! You dealt ${damage} damage and applied Burn!`,
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(3000, () => {
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 400,
                            ease: 'Power2',
                            onComplete: () => {
                                this.container.removeAll(true);
                                this.nextSection();
                            }
                        });
                    });
                }
            );

            this.container.add(specialButton);
        });
    }
}
