import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { BUNGISNGIS } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase8_EnemyIntents extends TutorialPhase {
    private turn: number = 0;
    private maxTurns: number = 3;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 8, 11);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Enemy Intents',
            'Learn to read and respond to enemy actions'
        );
        this.container.add(header);

        const dialogue = "Enemies telegraph their next move - their INTENT:\n\nATTACK [X]: Will deal X damage\nDEFEND: Will gain Block\nBUFF: Will gain beneficial status\nSPECIAL: Will use unique ability\nUNKNOWN: Unpredictable\n\nThis Bungisngis shows its intent each turn. Adapt your strategy!";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Watch the intent and choose your action wisely!',
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
                            this.practiceIntents();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private practiceIntents(): void {
        this.turn++;

        // Progress indicator
        const progress = createProgressIndicator(this.scene, 8, 11);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            `Turn ${this.turn} of ${this.maxTurns}`,
            'React to the enemy intent'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            const enemyData = { ...BUNGISNGIS, id: 'tutorial_bungisngis' };
            const intentPattern = ['Attack 8', 'Defend', 'Buff'];
            const currentIntent = intentPattern[(this.turn - 1) % intentPattern.length];

            // Enemy display
            const enemyContainer = this.scene.add.container(this.scene.cameras.main.width / 2, 280);
            
            const enemyNameShadow = this.scene.add.text(2, 2, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 32,
                color: '#000000'
            }).setOrigin(0.5).setAlpha(0.5);

            const enemyName = this.scene.add.text(0, 0, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 32,
                color: '#ff6b6b'
            }).setOrigin(0.5);

            const enemyHP = this.scene.add.text(0, 45, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#E8E8E8'
            }).setOrigin(0.5);

            // Intent with icon
            const intentIcon = this.getIntentIcon(currentIntent);
            const enemyIntent = this.scene.add.text(0, 85, `${intentIcon} Intent: ${currentIntent}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 26,
                color: '#FFD700'
            }).setOrigin(0.5);

            enemyContainer.add([enemyNameShadow, enemyName, enemyHP, enemyIntent]);
            this.container.add(enemyContainer);

            // Draw hand
            this.tutorialUI.drawHand(8);

            this.scene.events.on('selectCard', (card: any) => {
                this.tutorialUI.selectCard(card);
            });

            // Action buttons
            const attackButton = createButton(
                this.scene,
                this.scene.cameras.main.width / 2 - 120,
                this.scene.cameras.main.height - 120,
                'Attack',
                () => this.handlePlayerAction()
            );

            const defendButton = createButton(
                this.scene,
                this.scene.cameras.main.width / 2 + 120,
                this.scene.cameras.main.height - 120,
                'Defend',
                () => this.handlePlayerAction()
            );

            this.container.add([attackButton, defendButton]);
        });
    }

    private getIntentIcon(intent: string): string {
        if (intent.includes('Attack')) return '⚔️';
        if (intent.includes('Defend')) return '🛡️';
        if (intent.includes('Buff')) return '💪';
        return '🔮';
    }

    private handlePlayerAction(): void {
        this.scene.events.off('selectCard');

        if (this.turn >= this.maxTurns) {
            const success = createInfoBox(
                this.scene,
                'Perfect! Reading intents is key to survival!',
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(2500, () => {
                this.scene.tweens.add({
                    targets: this.container.getAll(),
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => this.onComplete()
                });
            });
            return;
        }

        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                this.practiceIntents();
            }
        });
    }
}
