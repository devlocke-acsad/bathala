import { Scene, GameObjects } from 'phaser';
import { createButton } from '../../../ui/Button';
import { TIKBALANG_SCOUT, BALETE_WRAITH, SIGBIN_CHARGER } from '../../../../data/enemies/Act1Enemies';
import { Enemy, PlayingCard, HandType } from '../../../../core/types/CombatTypes';
import { DeckManager } from '../../../../utils/DeckManager';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialPhase } from './TutorialPhase';
import { TutorialUI } from '../ui/TutorialUI';

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
        const text = `"Three actions determine combat:\n\n⚔️ ATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus + Buffs\n\n🛡️ DEFEND: Gain Block to absorb damage\n   Base block = 5 + Hand Bonus + Buffs\n\n✨ SPECIAL: Elemental ability (requires Flush or better)\n   Effect varies by dominant element"`;

        const textPanel = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, text, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.scene.cameras.main.width * 0.6 }
        }).setOrigin(0.5);

        const continueButton = createButton(this.scene, this.scene.cameras.main.width / 2, this.scene.cameras.main.height * 0.8, 'Continue', () => {
            textPanel.destroy();
            continueButton.destroy();
            this.nextSection();
        });

        this.container.add([textPanel, continueButton]);
    }

    private attackPractice() {
        const enemyData = { ...TIKBALANG_SCOUT, id: 'tutorial_tikbalang' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'A Tikbalang Scout appears! Its intent shows it will attack for 21 damage.\n\nForm a strong hand and ATTACK to defeat it.', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.scene.cameras.main.width * 0.8 }
        }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#ff0000'
        }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const enemyIntent = this.scene.add.text(this.scene.cameras.main.width / 2, 260, `Intent: ${enemyData.intent.type} ${enemyData.intent.value}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        this.tutorialUI.drawHand(8);

        this.scene.events.on('selectCard', (card: PlayingCard) => {
            this.tutorialUI.selectCard(card);
        });

        const attackButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Attack', () => {
            if (this.tutorialUI.selectedCards.length === 5) {
                const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "attack");
                const damage = 10 + evaluation.totalValue;
                enemyData.currentHealth -= damage;
                enemyHP.setText(`HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`);

                if (enemyData.currentHealth <= 0) {
                    instructions.setText('You defeated the Tikbalang Scout!');
                    this.scene.time.delayedCall(2000, () => {
                        this.container.destroy();
                        this.nextSection();
                    });
                } else {
                    // Handle enemy attack if it survives
                }
            }
        });

        this.container.add([instructions, enemyName, enemyHP, enemyIntent, this.tutorialUI.handContainer, attackButton]);
    }

    private defendPractice() {
        const enemyData = { ...BALETE_WRAITH, id: 'tutorial_balete' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'This wraith strikes hard! Sometimes survival requires defense.\n\nForm a hand and use DEFEND to block its attack.', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.scene.cameras.main.width * 0.8 }
        }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#ff0000'
        }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const enemyIntent = this.scene.add.text(this.scene.cameras.main.width / 2, 260, `Intent: ${enemyData.intent.type} ${enemyData.intent.value}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        this.tutorialUI.drawHand(8);

        const defendButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Defend', () => {
            if (this.tutorialUI.selectedCards.length === 5) {
                const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "defend");
                const block = 5 + evaluation.totalValue;
                instructions.setText(`You gained ${block} block!`);

                this.scene.time.delayedCall(2000, () => {
                    const damage = enemyData.damage - block;
                    if (damage > 0) {
                        instructions.setText(`The wraith attacks! You take ${damage} damage.`);
                    } else {
                        instructions.setText('The wraith attacks! You blocked all the damage!');
                    }

                    this.scene.time.delayedCall(2000, () => {
                        this.container.destroy();
                        this.nextSection();
                    });
                });
            }
        });

        this.container.add([instructions, enemyName, enemyHP, enemyIntent, this.tutorialUI.handContainer, defendButton]);
    }

    private specialPractice() {
        const enemyData = { ...SIGBIN_CHARGER, id: 'tutorial_sigbin' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'Face a Sigbin! Use SPECIAL to unleash elemental power.\n\nForm a FLUSH (5 cards of same element) to unlock Special.', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.scene.cameras.main.width * 0.8 }
        }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#ff0000'
        }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const enemyIntent = this.scene.add.text(this.scene.cameras.main.width / 2, 260, `Intent: ${enemyData.intent.type} ${enemyData.intent.value}`,
            { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        // Manipulate the hand to guarantee a flush
        this.tutorialUI.drawHand(3);
        const flushCards: PlayingCard[] = [
            { id: '1-Apoy', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            { id: '2-Apoy', rank: '2', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            { id: '3-Apoy', rank: '3', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            { id: '4-Apoy', rank: '4', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            { id: '5-Apoy', rank: '5', suit: 'Apoy', element: 'fire', selected: false, playable: true },
        ];
        this.tutorialUI.addCardsToHand(flushCards);
        this.tutorialUI.updateHandDisplay();


        const specialButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Special', () => {
            if (this.tutorialUI.selectedCards.length === 5) {
                const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "special");
                if (evaluation.type === 'flush') {
                    const dominantElement = HandEvaluator.getDominantElement(this.tutorialUI.selectedCards);
                    let specialText = '';
                    switch (dominantElement) {
                        case 'fire':
                            specialText = 'Apoy: Heavy damage + Burn';
                            break;
                        case 'water':
                            specialText = 'Tubig: Moderate damage + Heal';
                            break;
                        case 'earth':
                            specialText = 'Lupa: Damage + Strength buff';
                            break;
                        case 'air':
                            specialText = 'Hangin: Damage + Dexterity buff';
                            break;
                    }
                    instructions.setText(`Your dominant element is ${dominantElement}!\n${specialText}`);

                    this.scene.time.delayedCall(3000, () => {
                        this.container.destroy();
                        this.nextSection();
                    });
                } else {
                    instructions.setText('You need a Flush (5 cards of the same element) to use a Special action.');
                }
            }
        });

        this.container.add([instructions, enemyName, enemyHP, enemyIntent, this.tutorialUI.handContainer, specialButton]);
    }
}

