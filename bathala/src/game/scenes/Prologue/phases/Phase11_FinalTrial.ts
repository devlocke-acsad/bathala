import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { TAWONG_LIPOD } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';
import { HandEvaluator } from '../../../../utils/HandEvaluator';

export class Phase11_FinalTrial extends TutorialPhase {
    private turn: number = 1;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Your final trial: A true battle using everything you\\'ve learned.\n\nThe Tawong Lipod is a cunning invisible wind spirit:\n- Alternates between Attack (30 damage), Defend, and Buff\n- Has permanent Dexterity buff (+2 block when defending)\n- Uses varied intents to test your adaptability\n- Combines all mechanics you\\'ve learned\n\nDefeat it to complete your training!";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.startTrial();
        });
        this.container.add(dialogueBox);
    }

    private startTrial(): void {
        const enemyData = { ...TAWONG_LIPOD, id: 'tutorial_tawong_lipod' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'Defeat the Tawong Lipod!', { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff', align: 'center', wordWrap: { width: this.scene.cameras.main.width * 0.8 } }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, { fontFamily: 'dungeon-mode', fontSize: 24, color: '#ff0000' }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const enemyIntent = this.scene.add.text(this.scene.cameras.main.width / 2, 260, `Intent: ${enemyData.attackPattern[0]}`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        this.tutorialUI.drawHand(8);

        const attackButton = createButton(this.scene, this.scene.cameras.main.width / 2 - 150, 500, 'Attack', () => {
            this.handlePlayerAction('attack', enemyData, instructions, enemyHP, enemyIntent);
        });

        const defendButton = createButton(this.scene, this.scene.cameras.main.width / 2 + 150, 500, 'Defend', () => {
            this.handlePlayerAction('defend', enemyData, instructions, enemyHP, enemyIntent);
        });

        this.container.add([instructions, enemyName, enemyHP, enemyIntent, this.tutorialUI.handContainer, attackButton, defendButton]);
    }

    private handlePlayerAction(action: 'attack' | 'defend', enemyData: any, instructions: Phaser.GameObjects.Text, enemyHP: Phaser.GameObjects.Text, enemyIntent: Phaser.GameObjects.Text): void {
        if (this.tutorialUI.selectedCards.length !== 5) {
            return;
        }

        const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, action);

        if (action === 'attack') {
            const damage = 10 + evaluation.totalValue;
            enemyData.currentHealth -= damage;
            enemyHP.setText(`HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`);
        } else {
            const block = 5 + evaluation.totalValue;
            this.player.block += block;
        }

        if (enemyData.currentHealth <= 0) {
            instructions.setText('Excellent! You have mastered the fundamentals.');
            this.scene.time.delayedCall(3000, () => {
                this.onComplete();
            });
            return;
        }

        this.handleEnemyTurn(enemyData, instructions, enemyHP, enemyIntent);
    }

    private handleEnemyTurn(enemyData: any, instructions: Phaser.GameObjects.Text, enemyHP: Phaser.GameObjects.Text, enemyIntent: Phaser.GameObjects.Text): void {
        this.turn++;
        const intent = enemyData.attackPattern[(this.turn - 1) % enemyData.attackPattern.length];
        enemyIntent.setText(`Intent: ${intent}`);

        switch (intent) {
            case 'attack':
                const damage = enemyData.damage - this.player.block;
                if (damage > 0) {
                    this.player.currentHealth -= damage;
                }
                this.player.block = 0;
                break;
            case 'defend':
                enemyData.block += 10;
                break;
            case 'buff':
                enemyData.statusEffects.push({ id: 'strength', name: 'Strength', type: 'buff', duration: -1, value: 2, description: '', emoji: '' });
                break;
        }

        this.tutorialUI.drawHand(8);
    }
}
