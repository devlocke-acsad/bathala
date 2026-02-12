import { Scene, GameObjects } from 'phaser';
import { createButton } from '../../../ui/Button';
import { TIKBALANG_SCOUT, BALETE_WRAITH, SIGBIN_CHARGER } from '../../../../data/enemies/Act1Enemies';
import { Enemy, PlayingCard, HandType } from '../../../../core/types/CombatTypes';
import { DeckManager } from '../../../../utils/DeckManager';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialPhase } from './TutorialPhase';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';
import { showDialogue } from '../ui/Dialogue';

/**
 * Phase4_CombatActions - Teaches combat mechanics with REAL combat simulation
 * Step-by-step guidance: See cards → Select cards → Execute action
 */
export class Phase4_CombatActions extends TutorialPhase {
    private onComplete: () => void;
    private currentSection: number = 0;
    private combatPhase: 'card_selection' | 'action_selection' = 'card_selection';
    
    // Combat simulation state
    private selectedCards: PlayingCard[] = [];
    private playedCards: PlayingCard[] = [];
    private playerHP: number = 100;
    private playerBlock: number = 0;
    private enemyHP: number = 0;
    private enemyMaxHP: number = 0;
    
    // Visual elements
    private playerSprite!: Phaser.GameObjects.Sprite;
    private enemySprite!: Phaser.GameObjects.Sprite;
    private playHandButton!: Phaser.GameObjects.Container;
    private actionButtons!: Phaser.GameObjects.Container;
    private instructionText!: Phaser.GameObjects.Text;
    private selectionCounter!: Phaser.GameObjects.Text;
    private playedHandContainer!: Phaser.GameObjects.Container;

    constructor(scene: Scene, tutorialUI: TutorialUI, onComplete: () => void) {
        super(scene, tutorialUI);
        this.onComplete = onComplete;
    }

    start() {
        // Reset internal state for re-entry (when jumping back to this phase)
        this.currentSection = 0;
        this.selectedCards = [];
        this.playedCards = [];
        this.playerHP = 100;
        this.playerBlock = 0;
        this.combatPhase = 'card_selection';
        
        this.nextSection();
    }

    public shutdown() {
        // Remove all selectCard event listeners
        this.scene.events.off('selectCard');
        
        // Hide the shared TutorialUI hand container (lives outside phase container)
        if (this.tutorialUI && this.tutorialUI.handContainer) {
            this.scene.tweens.killTweensOf(this.tutorialUI.handContainer);
            this.tutorialUI.handContainer.setVisible(false);
            this.tutorialUI.handContainer.setAlpha(0);
        }
        
        // Kill all tweens and clean up container children (but don't destroy the container itself)
        if (this.container && this.container.active) {
            this.scene.tweens.killTweensOf(this.container);
            this.container.getAll().forEach((child: any) => {
                this.scene.tweens.killTweensOf(child);
            });
            this.container.removeAll(true);
        }
    }

    private nextSection() {
        this.currentSection++;
        
        // Fade out previous content
        if (this.currentSection > 1) {
            // Nullify played hand container reference so it can be recreated
            // (it will be destroyed automatically with container.removeAll)
            this.playedHandContainer = null as any;
            
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.continueSection();
                }
            });
        } else {
            this.continueSection();
        }
    }

    private continueSection() {
        // Reset played hand container for new section
        if (this.playedHandContainer && !this.playedHandContainer.scene) {
            this.playedHandContainer = null as any;
        }
        
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
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Combat Actions',
            'Three ways to engage in battle'
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
                    this.shutdown();
                    this.onComplete();
                }
            });
        });

        const dialogue = "Three actions determine combat:\n\nATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus\n\nDEFEND: Gain Block to absorb damage\n   Base block = 5 + Hand Bonus\n\nSPECIAL: Elemental ability\n   Effect varies by dominant element";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Select 5 cards to form your hand, then choose your action!',
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
                            this.nextSection();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private attackPractice() {
        const enemyData = { ...TIKBALANG_SCOUT, id: 'tutorial_tikbalang' };
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        this.createCombatScene('Attack', enemyData, () => {
            // Reset for next section
            this.selectedCards = [];
            this.playerBlock = 0;
            this.nextSection();
        });
    }

    private defendPractice() {
        const enemyData = { ...BALETE_WRAITH, id: 'tutorial_wraith' };
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        this.createCombatScene('Defend', enemyData, () => {
            this.selectedCards = [];
            this.nextSection();
        });
    }

    private specialPractice() {
        const enemyData = { ...SIGBIN_CHARGER, id: 'tutorial_sigbin' };
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        this.createCombatScene('Special', enemyData, () => {
            this.selectedCards = [];
            this.nextSection();
        });
    }

    /**
     * Create a real combat scene simulation with TWO-PHASE system (like real combat)
     * Phase 1: Card Selection → Play Hand button
     * Phase 2: Action Selection → Attack/Defend/Special buttons
     */
    private createCombatScene(actionType: 'Attack' | 'Defend' | 'Special', enemyData: any, onSuccess: () => void) {
        this.combatPhase = 'card_selection'; // Start in card selection
        this.selectedCards = [];
        this.playedCards = [];
        
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 4, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            `Practice: ${actionType}`,
            actionType === 'Attack' ? 'Deal damage to defeat the enemy' :
            actionType === 'Defend' ? 'Gain block to absorb incoming damage' :
            'Unleash elemental abilities with Flush or better'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;

            // Create player sprite (left side) - EXACT position as Combat.ts
            const playerX = screenWidth * 0.25;
            const playerY = screenHeight * 0.4;
            
            this.playerSprite = this.scene.add.sprite(playerX, playerY, 'combat_player');
            this.playerSprite.setScale(2);
            if (this.playerSprite.texture) {
                this.playerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            this.container.add(this.playerSprite);

            // Calculate proper Y offsets
            const playerScale = 2;
            const playerSpriteScaledHeight = this.playerSprite.height * playerScale;
            const playerNameY = playerY - (playerSpriteScaledHeight / 2) - 20;
            const playerHealthY = playerY + (playerSpriteScaledHeight / 2) + 20;

            // Player info
            const playerName = this.scene.add.text(playerX, playerNameY, 'You', {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#4CAF50',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(playerName);

            const playerHP = this.scene.add.text(playerX, playerHealthY, `HP: ${this.playerHP}/100`, {
                fontFamily: 'dungeon-mode',
                fontSize: 20,
                color: '#E8E8E8',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(playerHP);

            const playerBlockText = this.scene.add.text(playerX, playerHealthY + 25, `Block: ${this.playerBlock}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 18,
                color: '#77888C',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(playerBlockText);

            // Create enemy sprite (right side)
            const enemyX = screenWidth * 0.75;
            const enemyY = screenHeight * 0.4;
            
            const enemySpriteKey = this.getEnemySpriteKey(enemyData.name);
            this.enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
            
            // Scale adjustment
            const lowerCaseName = enemyData.name.toLowerCase();
            let targetWidth = 250;
            let targetHeight = 250;
            
            if (lowerCaseName.includes("tiyanak") || lowerCaseName.includes("duwende")) {
                targetWidth = 150;
                targetHeight = 150;
            }
            
            const scaleX = targetWidth / this.enemySprite.width;
            const scaleY = targetHeight / this.enemySprite.height;
            const finalScale = Math.min(scaleX, scaleY);
            this.enemySprite.setScale(finalScale);
            
            if (this.enemySprite.texture) {
                this.enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            this.container.add(this.enemySprite);

            // Calculate enemy offsets
            const enemySpriteScaledHeight = this.enemySprite.height * finalScale;
            const enemyNameY = enemyY - (enemySpriteScaledHeight / 2) - 20;
            const enemyHealthY = enemyY + (enemySpriteScaledHeight / 2) + 20;

            // Enemy info
            const enemyNameText = this.scene.add.text(enemyX, enemyNameY, enemyData.name, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#ff6b6b',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(enemyNameText);

            const enemyHPText = this.scene.add.text(enemyX, enemyHealthY, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 20,
                color: '#E8E8E8',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(enemyHPText);

            // Played hand container (center, hidden initially)
            this.playedHandContainer = this.scene.add.container(screenWidth / 2, screenHeight * 0.55);
            this.playedHandContainer.setVisible(false);
            this.container.add(this.playedHandContainer);

            // PHASE 1 instruction
            this.instructionText = this.scene.add.text(
                screenWidth / 2,
                screenHeight - 250,
                'Step 1: Select 5 cards, then click "Play Hand"',
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: 20,
                    color: '#FFD700',
                    align: 'center',
                    wordWrap: { width: screenWidth * 0.8 }
                }
            ).setOrigin(0.5);
            this.container.add(this.instructionText);

            // Selection counter
            this.selectionCounter = this.scene.add.text(
                screenWidth / 2,
                screenHeight - 220,
                'Selected: 0/5',
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: 24,
                    color: '#99A0A5',
                    align: 'center'
                }
            ).setOrigin(0.5);
            this.container.add(this.selectionCounter);

            // Ensure hand container is visible and at correct position
            this.tutorialUI.handContainer.setVisible(true);
            this.tutorialUI.handContainer.setAlpha(1);
            this.tutorialUI.handContainer.setDepth(1500);
            
            // Draw cards - normal draw for all actions
            this.tutorialUI.drawHand(8);
            
            this.tutorialUI.updateHandDisplay();

            // Card selection listener
            const selectCardHandler = (card: PlayingCard) => {
                if (this.combatPhase !== 'card_selection') return; // Only allow in card selection phase
                
                const index = this.selectedCards.findIndex(c => c.id === card.id);
                
                if (index !== -1) {
                    this.selectedCards.splice(index, 1);
                    card.selected = false;
                } else {
                    if (this.selectedCards.length < 5) {
                        this.selectedCards.push(card);
                        card.selected = true;
                    }
                }
                
                this.tutorialUI.updateHandDisplay();
                this.selectionCounter.setText(`Selected: ${this.selectedCards.length}/5`);
                
                // Enable/disable Play Hand button
                if (this.selectedCards.length === 5 && this.playHandButton) {
                    this.playHandButton.setAlpha(1);
                    this.playHandButton.setInteractive();
                    (this.playHandButton as any).isEnabled = true;
                } else if (this.playHandButton) {
                    this.playHandButton.setAlpha(0.5);
                    this.playHandButton.disableInteractive();
                    (this.playHandButton as any).isEnabled = false;
                }
            };

            this.scene.events.on('selectCard', selectCardHandler);

            // PHASE 1: Play Hand button (starts disabled)
            this.playHandButton = createButton(
                this.scene,
                screenWidth / 2,
                screenHeight - 100,
                'Play Hand',
                () => {
                    // Only allow click if enabled
                    if ((this.playHandButton as any).isEnabled) {
                        this.playHand(actionType, enemyHPText, playerBlockText, onSuccess, selectCardHandler);
                    }
                }
            );
            this.playHandButton.setAlpha(0.5);
            this.playHandButton.disableInteractive();
            (this.playHandButton as any).isEnabled = false;
            this.container.add(this.playHandButton);
        });
    }

    /**
     * Play the selected 5 cards (Phase 1 → Phase 2)
     */
    private playHand(
        actionType: 'Attack' | 'Defend' | 'Special',
        enemyHPText: Phaser.GameObjects.Text,
        playerBlockText: Phaser.GameObjects.Text,
        onSuccess: () => void,
        selectCardHandler: (card: PlayingCard) => void
    ) {
        if (this.selectedCards.length !== 5) return;
        if (this.combatPhase !== 'card_selection') return; // Prevent double-click
        
        // Disable Play Hand button completely
        if (this.playHandButton) {
            this.playHandButton.disableInteractive();
            this.playHandButton.setAlpha(0.5);
            (this.playHandButton as any).isEnabled = false;
        }
        
        // Move to played hand
        this.playedCards = [...this.selectedCards];
        this.combatPhase = 'action_selection';
        
        // Update instruction for Phase 2
        this.instructionText.setText(`Step 2: Click "${actionType}" to execute your action`);
        this.instructionText.setColor('#4CAF50');
        this.selectionCounter.setVisible(false);
        
        // Hide hand display, show played cards
        this.tutorialUI.handContainer.setVisible(false);
        this.playedHandContainer.setVisible(true);
        
        // Display played cards in center
        this.displayPlayedCards();
        
        // Hide Play Hand button, show action buttons
        if (this.playHandButton) {
            this.playHandButton.setVisible(false);
        }
        
        // Create action buttons (Attack/Defend/Special)
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        this.actionButtons = this.scene.add.container(screenWidth / 2, screenHeight - 100);
        this.container.add(this.actionButtons);
        
        const buttonText = actionType === 'Attack' ? 'Attack' :
                          actionType === 'Defend' ? 'Defend' :
                          'Special';
        
        const actionButton = createButton(
            this.scene,
            0,
            0,
            buttonText,
            () => this.performAction(actionType, enemyHPText, playerBlockText, onSuccess, selectCardHandler)
        );
        this.actionButtons.add(actionButton);
    }
    
    /**
     * Display played cards in the center area using actual card sprites
     */
    private displayPlayedCards() {
        this.playedHandContainer.removeAll(true);
        
        const cardSpacing = 90;
        const startX = -(this.playedCards.length - 1) * cardSpacing / 2;
        
        this.playedCards.forEach((card, index) => {
            const cardX = startX + (index * cardSpacing);
            
            // Use the same card sprite creation as the hand display
            const cardSprite = this.createCardSpriteForPlayed(card, cardX, 0);
            this.playedHandContainer.add(cardSprite);
        });
    }
    
    /**
     * Create card sprite for played hand (non-interactive)
     */
    private createCardSpriteForPlayed(card: PlayingCard, x: number, y: number): Phaser.GameObjects.Container {
        const cardContainer = this.scene.add.container(x, y);

        const cardWidth = 80;
        const cardHeight = 112;

        const rankMap: Record<string, string> = {
            "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
            "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
            "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
        };
        const spriteRank = rankMap[card.rank] || "1";

        const suitMap: Record<string, string> = {
            "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
        };
        const spriteSuit = suitMap[card.suit] || "apoy";

        const textureKey = `card_${spriteRank}_${spriteSuit}`;
        let cardSprite;

        if (this.scene.textures.exists(textureKey)) {
            cardSprite = this.scene.add.image(0, 0, textureKey);
        } else {
            // Fallback to basic rectangle if texture not found
            cardSprite = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff);

            const rankText = this.scene.add.text(-cardWidth / 2 + 5, -cardHeight / 2 + 5, card.rank, {
                fontFamily: "dungeon-mode",
                fontSize: 10,
                color: "#000000",
            }).setOrigin(0, 0);
            cardContainer.add(rankText);

            const display = DeckManager.getCardDisplay(card);
            const suitText = this.scene.add.text(cardWidth / 2 - 5, -cardHeight / 2 + 5, display.symbol, {
                fontFamily: "dungeon-mode",
                fontSize: 10,
                color: display.color,
            }).setOrigin(1, 0);
            cardContainer.add(suitText);
        }

        cardSprite.setDisplaySize(cardWidth, cardHeight);
        cardContainer.add(cardSprite);

        return cardContainer;
    }
    /**
     * Perform combat action (Phase 2: Execute the action with played cards)
     */
    private performAction(
        actionType: 'Attack' | 'Defend' | 'Special',
        enemyHPText: Phaser.GameObjects.Text,
        playerBlockText: Phaser.GameObjects.Text,
        onSuccess: () => void,
        selectCardHandler: (card: PlayingCard) => void
    ) {
        // Disable action buttons
        if (this.actionButtons) {
            this.actionButtons.setVisible(false);
        }
        
        // Update instruction
        this.instructionText.setText('Executing action...');
        this.instructionText.setColor('#77888C');

        // Evaluate hand using PLAYED cards (not selected)
        const evaluation = HandEvaluator.evaluateHand(this.playedCards, actionType.toLowerCase() as any);

        // Execute action
        if (actionType === 'Attack') {
            const damage = 10 + evaluation.totalValue;
            this.enemyHP -= damage;
            enemyHPText.setText(`HP: ${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);

            // Animate player attack
            this.scene.tweens.add({
                targets: this.playerSprite,
                x: '+=50',
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });

            // Animate enemy hit
            this.scene.tweens.add({
                targets: this.enemySprite,
                tint: 0xff0000,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });

            // Show damage
            const damageText = this.scene.add.text(
                this.enemySprite.x,
                this.enemySprite.y - 50,
                `-${damage}`,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: 32,
                    color: '#ff6b6b'
                }
            ).setOrigin(0.5);
            this.container.add(damageText);

            this.scene.tweens.add({
                targets: damageText,
                y: '-=40',
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => damageText.destroy()
            });

            // Create success message
            const successMessage = this.enemyHP <= 0 
                ? 'Victory! You defeated the enemy!'
                : `Great attack! You dealt ${damage} damage!`;
            
            const success = createInfoBox(
                this.scene,
                successMessage,
                'success'
            );
            this.container.add(success);

            // Always proceed after delay
            this.scene.time.delayedCall(2500, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                this.scene.tweens.add({
                    targets: this.container.getAll(),
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        this.container.removeAll(true);
                        onSuccess();
                    }
                });
            });

        } else if (actionType === 'Defend') {
            const block = 5 + evaluation.totalValue;
            this.playerBlock += block;
            playerBlockText.setText(`Block: ${this.playerBlock}`);
            playerBlockText.setColor('#4CAF50');

            // Animate shield
            const shieldIcon = this.scene.add.text(
                this.playerSprite.x,
                this.playerSprite.y,
                'DEFEND',
                { fontSize: 32, fontFamily: 'dungeon-mode', color: '#5BA3D0' }
            ).setOrigin(0.5);
            this.container.add(shieldIcon);

            this.scene.tweens.add({
                targets: shieldIcon,
                scale: 1.5,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => shieldIcon.destroy()
            });

            const success = createInfoBox(
                this.scene,
                `You gained ${block} block! This will absorb incoming damage!`,
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(2500, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                this.scene.tweens.add({
                    targets: this.container.getAll(),
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        this.container.removeAll(true);
                        onSuccess();
                    }
                });
            });

        } else if (actionType === 'Special') {
            // Special ability works with any hand
            const damage = 15 + evaluation.totalValue;
            this.enemyHP -= damage;
            enemyHPText.setText(`HP: ${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);

            // Animate special effect
            const fireEffect = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                'BURN',
                { fontSize: 64, fontFamily: 'dungeon-mode', color: '#FF6B35' }
            ).setOrigin(0.5).setAlpha(0);
            this.container.add(fireEffect);

            this.scene.tweens.add({
                targets: fireEffect,
                scale: 2,
                alpha: 1,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: fireEffect,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => fireEffect.destroy()
                    });
                }
            });

            // Animate enemy hit
            this.scene.tweens.add({
                targets: this.enemySprite,
                tint: 0xff6600,
                duration: 300,
                yoyo: true,
                repeat: 2,
                ease: 'Power2'
            });

            const success = createInfoBox(
                this.scene,
                `Apoy Special! You dealt ${damage} damage and applied Burn!`,
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(3000, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                this.scene.tweens.add({
                    targets: this.container.getAll(),
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        this.container.removeAll(true);
                        onSuccess();
                    }
                });
            });
        }
    }

    /**
     * Get enemy sprite key (EXACT as real combat CombatUI.ts)
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
