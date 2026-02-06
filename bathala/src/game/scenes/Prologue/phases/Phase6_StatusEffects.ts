import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { createButton } from '../../../ui/Button';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { DUWENDE_TRICKSTER, TIYANAK_AMBUSHER, TIKBALANG_SCOUT } from '../../../../data/enemies/Act1Enemies';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

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
        
        if (this.currentSection > 1) {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.showNextContent();
                }
            });
        } else {
            this.showNextContent();
        }
    }

    private showNextContent(): void {
        switch (this.currentSection) {
            case 1:
                this.showBuffsIntro();
                break;
            case 2:
                this.showDebuffsIntro();
                break;
            case 3:
                this.showElementalAffinities();
                break;
            default:
                this.onComplete();
                break;
        }
    }

    private showBuffsIntro(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Status Effects: Buffs',
            'Beneficial effects that enhance your power'
        );
        this.container.add(header);

        const dialogue = "Status effects shape battles. First, BUFFS:\n\n💪 STRENGTH: +3 damage per stack\n🛡️ PLATED ARMOR: Grants block at start of turn, reduces by 1\n💚 REGENERATION: Heals HP at start of turn, reduces by 1\n✨ RITUAL: Grants +1 Strength at end of turn\n\nBuffs stack up! Use them strategically to overpower enemies.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Earth Special grants Plated Armor - perfect for defense!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(2000, () => {
                    this.nextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showDebuffsIntro(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Status Effects: Debuffs',
            'Harmful effects that weaken combatants'
        );
        this.container.add(header);

        const dialogue = "Now DEBUFFS - harmful effects:\n\n🔥 BURN: You inflict this on enemies with Fire Special\n   Deals damage at start of enemy's turn, reduces by 1\n\n☠️ POISON: Enemies inflict this on you\n   Deals damage at start of your turn, reduces by 1\n\n⚠️ WEAK: Reduces attack damage by 25% per stack\n🛡️💔 VULNERABLE: Take 50% more damage from all sources\n🔻 FRAIL: Defend actions grant 25% less block per stack\n\nBurn and Poison work the same way - just different names!";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Fire Special applies Burn to enemies - watch them suffer!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(2500, () => {
                    this.nextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showElementalAffinities(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Elemental Affinities',
            'Exploit weaknesses, avoid resistances'
        );
        this.container.add(header);

        const dialogue = "Every enemy has elemental affinities:\n\nWEAKNESS: Enemy takes 1.5× damage from this element\nRESISTANCE: Enemy takes 0.75× damage from this element\n\n🔥 Apoy (Fire)  💧 Tubig (Water)\n🌿 Lupa (Earth)  💨 Hangin (Air)\n\nLook for symbols above enemy health bars!\nMatch your cards to exploit weaknesses for massive damage.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                // Create a visual example showing enemy with weakness/resistance icons
                const exampleContainer = this.createAffinityExample();
                this.container.add(exampleContainer);

                this.scene.time.delayedCall(3500, () => {
                    this.nextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private createAffinityExample(): Phaser.GameObjects.Container {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        const container = this.scene.add.container(screenWidth / 2, screenHeight * 0.55);
        
        // Example enemy sprite (Tikbalang Scout)
        const enemySprite = this.scene.add.sprite(0, 0, 'tikbalang_combat');
        enemySprite.setScale(1.5);
        if (enemySprite.texture) {
            enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
        container.add(enemySprite);
        
        // Weakness indicator (above enemy) - Tikbalang is weak to Fire
        const weaknessText = this.scene.add.text(-80, -120, '🔥 Weak', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        container.add(weaknessText);
        
        // Resistance indicator (above enemy) - Tikbalang resists Air
        const resistanceText = this.scene.add.text(80, -120, '💨 Resist', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#5BA3D0',
            align: 'center'
        }).setOrigin(0.5);
        container.add(resistanceText);
        
        // Info box below
        const infoText = this.scene.add.text(0, 100, 'Use Fire cards for 1.5× damage!\nAvoid Air cards (only 0.75× damage)', {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);
        container.add(infoText);
        
        return container;
    }
}
