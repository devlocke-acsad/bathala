import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { AMOMONGO } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';

export class Phase7_Items extends TutorialPhase {
    private currentSection: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        this.nextSection();
    }

    private nextSection(): void {
        this.currentSection++;
        switch (this.currentSection) {
            case 1:
                this.showRelics();
                break;
            case 2:
                this.showPotions();
                break;
            default:
                this.onComplete();
                break;
        }
    }

    private showRelics(): void {
        const dialogue = "Relics provide permanent passive bonuses:\n\nExamples:\n- Babaylan's Talisman: Treat hands as one tier higher\n- Agimat of Swift Wind: +1 discard charge\n- Earthwarden's Plate: Start combat with 5 Block\n\nYou can hold up to 6 relics. They activate automatically.\n\nHere, take this starter relic:";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            const tutorialAmulet = { id: 'tutorial-amulet', name: 'Tutorial Amulet', description: 'Gain 3 Block at combat start.', emoji: '🛡️' };
            this.player.relics.push(tutorialAmulet);
            this.tutorialUI.updateRelicsDisplay(this.player.relics);
            this.scene.time.delayedCall(2000, () => {
                this.nextSection();
            });
        });
        this.container.add(dialogueBox);
    }

    private showPotions(): void {
        const dialogue = "Potions are single-use combat items:\n\nExamples:\n- Potion of Clarity: Draw 3 cards\n- Elixir of Fortitude: Gain 15 Block\n- Phial of Elements: Choose dominant element\n\nYou can hold up to 3 potions. Use them strategically!\n\nHere's a potion:";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practicePotions();
        });
        this.container.add(dialogueBox);
    }

    private practicePotions(): void {
        const enemyData = { ...AMOMONGO, id: 'tutorial_amomongo' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'Try using it now by clicking the potion.', { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff', align: 'center', wordWrap: { width: this.scene.cameras.main.width * 0.8 } }).setOrigin(0.5);

        const enemyName = this.scene.add.text(this.scene.cameras.main.width / 2, 200, enemyData.name, { fontFamily: 'dungeon-mode', fontSize: 24, color: '#ff0000' }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(this.scene.cameras.main.width / 2, 230, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);

        const elixirOfFortitude = { id: 'elixir-of-fortitude', name: 'Elixir of Fortitude', description: 'Gain 15 Block', emoji: '🧪' };
        this.player.potions.push(elixirOfFortitude);
        this.tutorialUI.updatePotionsDisplay(this.player.potions);

        const usePotionButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Use Potion', () => {
            this.player.block += 15;
            instructions.setText('You gained 15 Block!\nPotions can turn the tide - but use them wisely!');
            this.player.potions = [];
            this.tutorialUI.updatePotionsDisplay(this.player.potions);

            this.scene.time.delayedCall(3000, () => {
                this.nextSection();
            });
        });

        this.container.add([instructions, enemyName, enemyHP, this.tutorialUI.potionsContainer, usePotionButton]);
    }
}
