import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { AMOMONGO } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';
import { createPhaseHeader, createSectionDivider } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase7_Items extends TutorialPhase {
    private currentSection: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Clear any lingering cards from previous phases
        this.tutorialUI.handContainer.setVisible(false);
        this.tutorialUI.handContainer.removeAll(true);
        this.tutorialUI.cardSprites = [];
        
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
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 8);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Items: Relics',
            'Permanent passive bonuses for your journey'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        const dialogue = "Relics provide permanent passive bonuses:\n\n• Babaylan's Talisman: Treat hands as one tier higher\n• Agimat of Swift Wind: +1 discard charge\n• Earthwarden's Plate: Start combat with 5 Block\n\nYou can hold up to 6 relics. They activate automatically!\n\nHere, take this starter relic:";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tutorialAmulet = { 
                    id: 'tutorial-amulet', 
                    name: 'Tutorial Amulet', 
                    description: 'Gain 3 Block at combat start.', 
                    emoji: '' 
                };
                this.player.relics.push(tutorialAmulet);
                this.tutorialUI.updateRelicsDisplay(this.player.relics);

                const success = createInfoBox(
                    this.scene,
                    'Tutorial Amulet acquired! You\'ll gain 3 block at combat start.',
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
            });
            this.container.add(dialogueBox);
        });
    }

    private showPotions(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 8);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Items: Potions',
            'Single-use combat items for critical moments'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        const dialogue = "Potions are single-use combat items:\n\n• Potion of Clarity: Draw 3 cards\n• Elixir of Fortitude: Gain 15 Block\n• Phial of Elements: Choose dominant element\n\nYou can hold up to 3 potions. Use them strategically!\n\nHere's a potion to try:";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Click the button below to use the potion!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(1800, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, info],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.practicePotions();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private practicePotions(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 8);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Use a Potion',
            'See how potions can help in combat'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        this.scene.time.delayedCall(600, () => {
            const enemyData = { ...AMOMONGO, id: 'tutorial_amomongo' };

            // Enemy sprite display (centered, moved down to avoid inventory)
            const enemyX = this.scene.cameras.main.width / 2;
            const enemyY = 320;
            
            const enemySpriteKey = this.getEnemySpriteKey(enemyData.name);
            const enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
            
            // Scale the enemy sprite appropriately
            const targetWidth = 200;
            const targetHeight = 200;
            const scaleX = targetWidth / enemySprite.width;
            const scaleY = targetHeight / enemySprite.height;
            const finalScale = Math.min(scaleX, scaleY);
            enemySprite.setScale(finalScale);
            
            if (enemySprite.texture) {
                enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            this.container.add(enemySprite);

            // Calculate proper Y position for name/HP (below sprite)
            const enemySpriteScaledHeight = enemySprite.height * finalScale;
            const enemyNameY = enemyY + (enemySpriteScaledHeight / 2) + 20;
            const enemyHPY = enemyNameY + 30;

            // Enemy display container
            const enemyContainer = this.scene.add.container(enemyX, enemyNameY);

            const enemyName = this.scene.add.text(0, 0, enemyData.name, { 
                fontFamily: 'dungeon-mode', 
                fontSize: 24, 
                color: '#ff6b6b' 
            }).setOrigin(0.5);

            const enemyHP = this.scene.add.text(0, 30, `HP: ${enemyData.currentHealth}/${enemyData.maxHealth}`, { 
                fontFamily: 'dungeon-mode', 
                fontSize: 20, 
                color: '#E8E8E8' 
            }).setOrigin(0.5);

            enemyContainer.add([enemyName, enemyHP]);
            this.container.add(enemyContainer);

            // Add potion to player
            const elixirOfFortitude = { 
                id: 'elixir-of-fortitude', 
                name: 'Elixir of Fortitude', 
                description: 'Gain 15 Block', 
                emoji: '' 
            } as any; // Type assertion for tutorial
            this.player.potions.push(elixirOfFortitude);
            this.tutorialUI.updatePotionsDisplay(this.player.potions);

            // Player block display (moved down to give more space)
            const playerBlock = this.scene.add.text(
                this.scene.cameras.main.width / 2, 
                this.scene.cameras.main.height - 200, 
                `Your Block: ${this.player.block}`, 
                { 
                    fontFamily: 'dungeon-mode', 
                    fontSize: 24, 
                    color: '#77888C' 
                }
            ).setOrigin(0.5);
            this.container.add(playerBlock);

            const usePotionButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2, 
                this.scene.cameras.main.height - 120, 
                'Use Elixir of Fortitude', 
                () => {
                    this.player.block += 15;
                    playerBlock.setText(`Your Block: ${this.player.block} (+15!)`);
                    playerBlock.setColor('#4CAF50');
                    
                    this.player.potions = [];
                    this.tutorialUI.updatePotionsDisplay(this.player.potions);
                    usePotionButton.destroy();

                    const success = createInfoBox(
                        this.scene,
                        'Potion used! You gained 15 Block. Potions can turn the tide of battle!',
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(3000, () => {
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => this.nextSection()
                        });
                    });
                }
            );

            this.container.add(usePotionButton);
        });
    }

    /**
     * Get enemy sprite key (same as Phase4_CombatActions)
     */
    private getEnemySpriteKey(enemyName: string): string {
        const lowerCaseName = enemyName.toLowerCase();
        
        if (lowerCaseName.includes("tikbalang")) return "tikbalang_combat";
        if (lowerCaseName.includes("balete")) return "balete_combat";
        if (lowerCaseName.includes("sigbin")) return "sigbin_combat";
        if (lowerCaseName.includes("duwende")) return "duwende_combat";
        if (lowerCaseName.includes("tiyanak")) return "tiyanak_combat";
        if (lowerCaseName.includes("amomongo")) return "amomongo_combat";
        if (lowerCaseName.includes("bungisngis")) return "bungisngis_combat";
        if (lowerCaseName.includes("kapre")) return "kapre_combat";
        if (lowerCaseName.includes("tawong")) return "tawong_lipod_combat";
        
        return "tikbalang_combat"; // fallback
    }
}
