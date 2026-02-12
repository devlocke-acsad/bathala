import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
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

        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;

        // === MATCH ACTUAL COMBAT LAYOUT ===
        
        // Player section (left side) - EXACT as Combat.ts
        const playerX = screenWidth * 0.25;
        const playerY = screenHeight * 0.4;

        // Player sprite
        const playerSprite = this.scene.add.sprite(playerX, playerY, 'combat_player');
        playerSprite.setScale(2);
        if (playerSprite.texture) {
            playerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
        this.container.add(playerSprite);

        // Calculate dynamic Y offsets for player (EXACT as Combat.ts)
        const playerScale = 2;
        const playerSpriteScaledHeight = playerSprite.height * playerScale;
        const playerNameY = playerY - (playerSpriteScaledHeight / 2) - 20;
        const playerHealthY = playerY + (playerSpriteScaledHeight / 2) + 20;
        const playerBlockY = playerHealthY + 25;

        // Player name
        const playerName = this.scene.add.text(playerX, playerNameY, 'You', {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#77888C',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(playerName);

        // Player health
        const playerHealthText = this.scene.add.text(playerX, playerHealthY, `HP: ${this.playerHP}/100`, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(playerHealthText);

        // Player block
        const playerBlockText = this.scene.add.text(playerX, playerBlockY, `Block: ${this.playerBlock}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#4ecdc4',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(playerBlockText);

        // Enemy section (right side) - EXACT as Combat.ts
        const enemyX = screenWidth * 0.75;
        const enemyY = screenHeight * 0.4;
        
        const enemyData = this.createTutorialEnemy('tawong_lipod', 'tutorial_tawong_lipod');
        const enemySpriteKey = this.getEnemyCombatSpriteKey(enemyData.name);
        const enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
        
        // Scale enemy sprite (EXACT as Combat.ts)
        const lowerCaseName = enemyData.name.toLowerCase();
        let targetWidth = 250;
        let targetHeight = 250;
        
        if (lowerCaseName.includes("tiyanak") || lowerCaseName.includes("duwende")) {
            targetWidth = 150;
            targetHeight = 150;
        }
        
        const scaleX = targetWidth / enemySprite.width;
        const scaleY = targetHeight / enemySprite.height;
        const finalScale = Math.min(scaleX, scaleY);
        enemySprite.setScale(finalScale);
        
        if (enemySprite.texture) {
            enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
        this.container.add(enemySprite);

        // Calculate dynamic Y offsets for enemy (EXACT as Combat.ts)
        const enemySpriteScaledHeight = enemySprite.height * finalScale;
        const enemyNameY = enemyY - (enemySpriteScaledHeight / 2) - 20;
        const enemyHealthY = enemyY + (enemySpriteScaledHeight / 2) + 20;
        const enemyBlockY = enemyHealthY + 25;
        const enemyIntentY = enemyBlockY + 25;

        // Enemy name
        const enemyName = this.scene.add.text(enemyX, enemyNameY, enemyData.name, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(enemyName);

        // Enemy health
        const enemyHP = this.scene.add.text(enemyX, enemyHealthY, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(enemyHP);

        // Enemy block (if any)
        const enemyBlockText = this.scene.add.text(enemyX, enemyBlockY, 'Block: 0', {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#4ecdc4',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(enemyBlockText);

        // Enemy intent
        const intentPattern = ['Attack 15', 'Defend +10', 'Buff +2 STR'];
        const currentIntent = intentPattern[(this.turn - 1) % intentPattern.length];
        const intentIcon = this.getIntentIcon(currentIntent);
        
        const enemyIntent = this.scene.add.text(enemyX, enemyIntentY, `${intentIcon} ${currentIntent}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#ffd700',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(enemyIntent);

        // Turn counter (top center)
        const turnText = this.scene.add.text(
            screenWidth / 2,
            40,
            `Turn ${this.turn}`,
            {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#ffd700',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.container.add(turnText);

        // Progress indicator (top left corner, small)
        const progress = createProgressIndicator(this.scene, 9, 9);
        progress.setPosition(80, 30);
        progress.setScale(0.8);
        this.container.add(progress);

        // Draw hand (bottom center) - EXACT as Combat.ts
        this.tutorialUI.handContainer.setVisible(true);
        this.tutorialUI.drawHand(8);

        this.scene.events.on('selectCard', (card: PlayingCard) => {
            this.tutorialUI.selectCard(card);
        });

        // Action buttons (bottom center) - EXACT as Combat.ts layout
        const buttonY = screenHeight - 100;
        const buttonSpacing = 200;
        const centerX = screenWidth / 2;

        const attackButton = createButton(
            this.scene,
            centerX - buttonSpacing,
            buttonY,
            '⚔️ Attack',
            () => this.handlePlayerAction('attack', enemyHP, playerHealthText, playerBlockText, enemyBlockText)
        );

        const defendButton = createButton(
            this.scene,
            centerX,
            buttonY,
            '🛡️ Defend',
            () => this.handlePlayerAction('defend', enemyHP, playerHealthText, playerBlockText, enemyBlockText)
        );

        const specialButton = createButton(
            this.scene,
            centerX + buttonSpacing,
            buttonY,
            '✨ Special',
            () => this.handlePlayerAction('special', enemyHP, playerHealthText, playerBlockText, enemyBlockText)
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
        playerHPText: Phaser.GameObjects.Text,
        playerBlockText: Phaser.GameObjects.Text,
        enemyBlockText: Phaser.GameObjects.Text
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
            enemyHPText.setText(`HP: ${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);
            
            if (this.enemyHP <= 0) {
                this.victorySequence();
                return;
            }
        } else if (action === 'defend') {
            const block = 5 + evaluation.totalValue;
            this.playerBlock += block;
            playerBlockText.setText(`Block: ${this.playerBlock}`);
        } else if (action === 'special') {
            // Special works with any hand now (no flush requirement)
            const damage = 15 + evaluation.totalValue;
            this.enemyHP -= damage;
            enemyHPText.setText(`HP: ${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);
            
            if (this.enemyHP <= 0) {
                this.victorySequence();
                return;
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
            playerHPText.setText(`HP: ${Math.max(0, this.playerHP)}/100`);
            playerBlockText.setText(`Block: ${this.playerBlock}`);
            
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

}
