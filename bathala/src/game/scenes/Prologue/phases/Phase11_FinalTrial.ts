import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { TAWONG_LIPOD } from '../../../../data/enemies/Act1Enemies';
import { createButton } from '../../../ui/Button';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase11_FinalTrial extends TutorialPhase {
    private turn: number = 0;
    private enemyHP: number = 60;
    private enemyMaxHP: number = 60;
    private playerHP: number = 100;
    private playerBlock: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 9, 9);
        this.container.add(progress);

        // Epic header
        const header = createPhaseHeader(
            this.scene,
            '⚡ FINAL TRIAL ⚡',
            'Face the Tawong Lipod - Prove your mastery!'
        );
        this.container.add(header);

        const dialogue = "Your final trial: A true battle using everything you've learned!\n\nThe Tawong Lipod is a cunning invisible wind spirit:\n• Alternates between Attack (15), Defend, and Buff\n• Has 60 HP - you must defeat it!\n• Uses all mechanics you've learned\n• Your skill determines victory!\n\nDefeat it to complete your training!";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const warning = createInfoBox(
                    this.scene,
                    'This is a real fight - use everything you\'ve learned!',
                    'warning'
                );
                this.container.add(warning);

                this.scene.time.delayedCall(2500, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, warning],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.startTrial();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private startTrial(): void {
        this.turn++;

        // Clear cards from previous turn
        this.tutorialUI.handContainer.removeAll(true);
        this.tutorialUI.cardSprites = [];

        // Progress indicator - always visible
        const progress = createProgressIndicator(this.scene, 9, 9);
        this.container.add(progress);

        // Turn counter
        const turnText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            50,
            `Turn ${this.turn}`,
            {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#FFD700',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.container.add(turnText);

        // Enemy sprite display
        const enemyX = this.scene.cameras.main.width / 2;
        const enemyY = 160;
        
        const enemyData = { ...TAWONG_LIPOD };
        const enemySpriteKey = this.getEnemySpriteKey(enemyData.name);
        const enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
        
        // Scale the enemy sprite
        const targetWidth = 180;
        const targetHeight = 180;
        const scaleX = targetWidth / enemySprite.width;
        const scaleY = targetHeight / enemySprite.height;
        const finalScale = Math.min(scaleX, scaleY);
        enemySprite.setScale(finalScale);
        
        if (enemySprite.texture) {
            enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
        this.container.add(enemySprite);
        
        // Enemy shadow
        const enemyShadow = this.scene.add.ellipse(
            enemyX,
            enemyY + 70,
            90,
            22,
            0x000000,
            0.3
        );
        this.container.add(enemyShadow);

        // Calculate proper Y position for enemy info (below sprite)
        const enemySpriteScaledHeight = enemySprite.height * finalScale;
        const enemyInfoY = enemyY + (enemySpriteScaledHeight / 2) + 20;

        // Enemy display container
        const enemyContainer = this.scene.add.container(enemyX, enemyInfoY);
        
        const enemyNameShadow = this.scene.add.text(2, 2, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 26,
            color: '#000000'
        }).setOrigin(0.5).setAlpha(0.5);

        const enemyName = this.scene.add.text(0, 0, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 26,
            color: '#ff6b6b'
        }).setOrigin(0.5);

        const enemyHP = this.scene.add.text(0, 30, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 22,
            color: '#E8E8E8'
        }).setOrigin(0.5);

        // Intent
        const intentPattern = ['Attack 15', 'Defend +10', 'Buff +2 STR'];
        const currentIntent = intentPattern[(this.turn - 1) % intentPattern.length];
        const intentIcon = this.getIntentIcon(currentIntent);
        
        const enemyIntent = this.scene.add.text(0, 60, `${intentIcon} ${currentIntent}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#FFD700'
        }).setOrigin(0.5);

        enemyContainer.add([enemyNameShadow, enemyName, enemyHP, enemyIntent]);
        this.container.add(enemyContainer);

        // Player stats
        const playerStats = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            320,
            `Your HP: ${this.playerHP}/100 | Block: ${this.playerBlock}`,
            {
                fontFamily: 'dungeon-mode',
                fontSize: 22,
                color: '#4CAF50'
            }
        ).setOrigin(0.5);
        this.container.add(playerStats);

        // Draw hand
        this.tutorialUI.drawHand(8);

        this.scene.events.on('selectCard', (card: PlayingCard) => {
            this.tutorialUI.selectCard(card);
        });

        // Action buttons
        const attackButton = createButton(
            this.scene,
            this.scene.cameras.main.width / 2 - 180,
            this.scene.cameras.main.height - 100,
            '⚔️ Attack',
            () => this.handlePlayerAction('attack', enemyHP, playerStats)
        );

        const defendButton = createButton(
            this.scene,
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 100,
            '🛡️ Defend',
            () => this.handlePlayerAction('defend', enemyHP, playerStats)
        );

        const specialButton = createButton(
            this.scene,
            this.scene.cameras.main.width / 2 + 180,
            this.scene.cameras.main.height - 100,
            '✨ Special',
            () => this.handlePlayerAction('special', enemyHP, playerStats)
        );

        this.container.add([attackButton, defendButton, specialButton]);
    }

    private getIntentIcon(intent: string): string {
        if (intent.includes('Attack')) return '⚔️';
        if (intent.includes('Defend')) return '🛡️';
        if (intent.includes('Buff')) return '💪';
        return '🔮';
    }

    private handlePlayerAction(
        action: 'attack' | 'defend' | 'special',
        enemyHPText: Phaser.GameObjects.Text,
        playerStatsText: Phaser.GameObjects.Text
    ): void {
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

        const evaluation = HandEvaluator.evaluateHand(this.tutorialUI.selectedCards, action);

        // Player action
        if (action === 'attack') {
            const damage = 10 + evaluation.totalValue;
            this.enemyHP -= damage;
            enemyHPText.setText(`HP: ${this.enemyHP}/${this.enemyMaxHP}`);
            
            if (this.enemyHP <= 0) {
                this.victorySequence();
                return;
            }
        } else if (action === 'defend') {
            const block = 5 + evaluation.totalValue;
            this.playerBlock += block;
            playerStatsText.setText(`Your HP: ${this.playerHP}/100 | Block: ${this.playerBlock}`);
        } else if (action === 'special') {
            if (evaluation.type === 'flush' || evaluation.type === 'straight_flush') {
                const damage = 15 + evaluation.totalValue;
                this.enemyHP -= damage;
                enemyHPText.setText(`HP: ${this.enemyHP}/${this.enemyMaxHP}`);
                
                if (this.enemyHP <= 0) {
                    this.victorySequence();
                    return;
                }
            }
        }

        // Enemy turn
        const intentPattern = ['Attack 15', 'Defend +10', 'Buff +2 STR'];
        const currentIntent = intentPattern[(this.turn - 1) % intentPattern.length];
        
        if (currentIntent.includes('Attack')) {
            let damage = 15;
            if (this.playerBlock > 0) {
                if (this.playerBlock >= damage) {
                    this.playerBlock -= damage;
                    damage = 0;
                } else {
                    damage -= this.playerBlock;
                    this.playerBlock = 0;
                }
            }
            this.playerHP -= damage;
            
            if (this.playerHP <= 0) {
                this.defeatSequence();
                return;
            }
        }

        // Reset for next turn
        this.scene.events.off('selectCard');
        this.playerBlock = 0; // Block resets each turn
        
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                this.startTrial();
            }
        });
    }

    private victorySequence(): void {
        this.scene.events.off('selectCard');
        
        const success = createInfoBox(
            this.scene,
            '🎉 VICTORY! You have mastered the fundamentals! 🎉',
            'success'
        );
        this.container.add(success);

        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => this.onComplete()
            });
        });
    }

    private defeatSequence(): void {
        this.scene.events.off('selectCard');
        
        const warning = createInfoBox(
            this.scene,
            'Defeated... but that\'s okay! Try again in the real game!',
            'warning'
        );
        this.container.add(warning);

        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => this.onComplete()
            });
        });
    }

    /**
     * Get enemy sprite key (same as Phase4_CombatActions and Phase7_Items)
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
