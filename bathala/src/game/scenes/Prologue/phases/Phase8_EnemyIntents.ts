import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { BUNGISNGIS } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';
import { HandEvaluator } from '../../../../utils/HandEvaluator';

export class Phase8_EnemyIntents extends TutorialPhase {
    private turn: number = 1;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Enemies telegraph their next move - their INTENT:\n\n⚔️ Attack [X]: Will deal X damage\n🛡️ Defend: Will gain Block\n💪 Buff: Will gain beneficial status\n🔮 Special: Will use unique ability\n❓ Unknown: Unpredictable\n\nThis Bungisngis shows its intent each turn. Adapt your strategy!";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practiceIntents();
        });
        this.container.add(dialogueBox);
    }

    private practiceIntents(): void {
        const enemyData = { ...BUNGISNGIS, id: 'tutorial_bungisngis' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, `Turn ${this.turn}: The Bungisngis will use ${enemyData.attackPattern[this.turn - 1]}!`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff', align: 'center', wordWrap: { width: this.scene.cameras.main.width * 0.8 } }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, { fontFamily: 'dungeon-mode', fontSize: 24, color: '#ff0000' }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const enemyIntent = this.scene.add.text(this.scene.cameras.main.width / 2, 260, `Intent: ${enemyData.attackPattern[this.turn - 1]}`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        this.tutorialUI.drawHand(8);

        const attackButton = createButton(this.scene, this.scene.cameras.main.width / 2 - 150, 500, 'Attack', () => {
            this.handlePlayerAction(enemyData, instructions, enemyHP, enemyIntent);
        });

        const defendButton = createButton(this.scene, this.scene.cameras.main.width / 2 + 150, 500, 'Defend', () => {
            this.handlePlayerAction(enemyData, instructions, enemyHP, enemyIntent);
        });

        this.container.add([instructions, enemyName, enemyHP, enemyIntent, this.tutorialUI.handContainer, attackButton, defendButton]);
    }

    private handlePlayerAction(enemyData: any, instructions: Phaser.GameObjects.Text, enemyHP: Phaser.GameObjects.Text, enemyIntent: Phaser.GameObjects.Text): void {
        this.turn++;
        if (this.turn > enemyData.attackPattern.length) {
            instructions.setText('You have survived the Bungisngis!\nReading intents is key to survival!');
            this.scene.time.delayedCall(3000, () => {
                this.onComplete();
            });
            return;
        }

        instructions.setText(`Turn ${this.turn}: The Bungisngis will use ${enemyData.attackPattern[this.turn - 1]}!`);
        enemyIntent.setText(`Intent: ${enemyData.attackPattern[this.turn - 1]}`);
        this.tutorialUI.drawHand(8);
    }
}
