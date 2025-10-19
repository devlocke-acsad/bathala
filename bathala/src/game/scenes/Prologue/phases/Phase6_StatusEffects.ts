import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { createButton } from '../../../ui/Button';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { DUWENDE_TRICKSTER, TIYANAK_AMBUSHER } from '../../../../data/enemies/Act1Enemies';
import { HandEvaluator } from '../../../../utils/HandEvaluator';

export class Phase6_StatusEffects extends TutorialPhase {
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
                this.showBuffs();
                break;
            case 2:
                this.showDebuffs();
                break;
            case 3:
                this.cleanseDebuffs();
                break;
            default:
                this.onComplete();
                break;
        }
    }

    private showBuffs(): void {
        const dialogue = "Status effects shape battles. First, BUFFS:\n\n💪 STRENGTH: +[X] damage per stack\n✨ DEXTERITY: +[X] block per stack\n🛡️ BLOCK: Absorbs damage this turn (resets next turn)\n\nUse a Lupa (Earth) Special to gain Strength.";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practiceBuffs();
        });
        this.container.add(dialogueBox);
    }

    private practiceBuffs(): void {
        const enemyData = { ...DUWENDE_TRICKSTER, id: 'tutorial_duwende' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'Use a Lupa (Earth) Special to gain Strength.', {
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

        // Manipulate the hand to guarantee a Lupa flush
        this.tutorialUI.drawHand(3);
        const flushCards: PlayingCard[] = [
            { id: '1-Lupa', rank: '1', suit: 'Lupa', element: 'earth', selected: false, playable: true },
            { id: '2-Lupa', rank: '2', suit: 'Lupa', element: 'earth', selected: false, playable: true },
            { id: '3-Lupa', rank: '3', suit: 'Lupa', element: 'earth', selected: false, playable: true },
            { id: '4-Lupa', rank: '4', suit: 'Lupa', element: 'earth', selected: false, playable: true },
            { id: '5-Lupa', rank: '5', suit: 'Lupa', element: 'earth', selected: false, playable: true },
        ];
        this.tutorialUI.addCardsToHand(flushCards);
        this.tutorialUI.updateHandDisplay();

        const specialButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Special', () => {
            if (this.tutorialUI.selectedCards.length === 5) {
                const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "special");
                if (evaluation.type === 'flush') {
                    const dominantElement = HandEvaluator.getDominantElement(this.tutorialUI.selectedCards);
                    if (dominantElement === 'earth') {
                        this.player.statusEffects.push({ id: 'strength', name: 'Strength', type: 'buff', duration: -1, value: 3, description: '', emoji: '' });
                        instructions.setText('You gained 3 Strength!\nNotice your damage increased!');

                        this.scene.time.delayedCall(3000, () => {
                            this.nextSection();
                        });
                    }
                }
            }
        });

        this.container.add([instructions, enemyName, enemyHP, this.tutorialUI.handContainer, specialButton]);
    }

    private showDebuffs(): void {
        const dialogue = "Now DEBUFFS - enemies inflict these:\n\n⚠️ WEAK: -25% damage dealt\n💔 VULNERABLE: +50% damage taken\n🔥 BURN: [X] damage at turn end\n😵 STUN: Skip your next turn\n🚫 SEAL: Can\'t use Special abilities\n\nThe Tiyanak\'s attack inflicts Vulnerable!";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practiceDebuffs();
        });
        this.container.add(dialogueBox);
    }

    private practiceDebuffs(): void {
        const enemyData = { ...TIYANAK_AMBUSHER, id: 'tutorial_tiyanak' };

        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'The Tiyanak\'s attack inflicts Vulnerable!', {
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

        this.scene.time.delayedCall(2000, () => {
            this.player.statusEffects.push({ id: 'vulnerable', name: 'Vulnerable', type: 'debuff', duration: -1, value: 1.5, description: '', emoji: '' });
            instructions.setText('You are now Vulnerable! You will take 50% more damage.');

            // Show vulnerable icon on player
            const vulnerableIcon = this.scene.add.text(this.player.x, this.player.y - 50, '💔', { fontSize: 48 });
            this.container.add(vulnerableIcon);

            this.scene.time.delayedCall(3000, () => {
                this.nextSection();
            });
        });

        this.container.add([instructions, enemyName, enemyHP]);
    }

    private cleanseDebuffs(): void {
        const dialogue = "Use a Tubig (Water) Special to heal AND cleanse debuffs.";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practiceCleanse();
        });
        this.container.add(dialogueBox);
    }

    private practiceCleanse(): void {
        // Manipulate the hand to guarantee a Tubig flush
        this.tutorialUI.drawHand(3);
        const flushCards: PlayingCard[] = [
            { id: '1-Tubig', rank: '1', suit: 'Tubig', element: 'water', selected: false, playable: true },
            { id: '2-Tubig', rank: '2', suit: 'Tubig', element: 'water', selected: false, playable: true },
            { id: '3-Tubig', rank: '3', suit: 'Tubig', element: 'water', selected: false, playable: true },
            { id: '4-Tubig', rank: '4', suit: 'Tubig', element: 'water', selected: false, playable: true },
            { id: '5-Tubig', rank: '5', suit: 'Tubig', element: 'water', selected: false, playable: true },
        ];
        this.tutorialUI.addCardsToHand(flushCards);
        this.tutorialUI.updateHandDisplay();

        const specialButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Special', () => {
            if (this.tutorialUI.selectedCards.length === 5) {
                const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, "special");
                if (evaluation.type === 'flush') {
                    const dominantElement = HandEvaluator.getDominantElement(this.tutorialUI.selectedCards);
                    if (dominantElement === 'water') {
                        this.player.statusEffects = this.player.statusEffects.filter(e => e.id !== 'vulnerable');
                        this.player.currentHealth += 20;
                        const instructions = this.scene.add.text(this.scene.cameras.main.width / 2, 100, 'You cleansed the debuff and healed!\nWater is your salvation in dire moments.', { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff', align: 'center', wordWrap: { width: this.scene.cameras.main.width * 0.8 } }).setOrigin(0.5);
                        this.container.add(instructions);

                        this.scene.time.delayedCall(3000, () => {
                            this.nextSection();
                        });
                    }
                }
            }
        });

        this.container.add([this.tutorialUI.handContainer, specialButton]);
    }
}
