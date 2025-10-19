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
        this.nextSection();
    }

    public shutdown() {
        this.scene.events.off('selectCard');
        if (this.playedHandContainer) {
            this.playedHandContainer.destroy();
        }
        this.container.destroy();
    }

    private nextSection() {
        this.currentSection++;
        
        // Fade out previous content
        if (this.currentSection > 1) {
            // Cleanup played hand container if it exists (it's at scene level, not in main container)
            if (this.playedHandContainer) {
                console.log('[Phase4] Destroying previous played hand container');
                this.playedHandContainer.removeAll(true);
                this.playedHandContainer.destroy(true);
                this.playedHandContainer = null as any;
            }
            
            // Also cleanup TutorialUI hand if visible
            if (this.tutorialUI && this.tutorialUI.handContainer) {
                this.tutorialUI.handContainer.setVisible(false);
            }
            
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
        const progress = createProgressIndicator(this.scene, 4, 11);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Combat Actions',
            'Three ways to engage in battle'
        );
        this.container.add(header);

        const dialogue = "Three actions determine combat:\n\n⚔️ ATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus + Buffs\n\n🛡️ DEFEND: Gain Block to absorb damage\n   Base block = 5 + Hand Bonus + Buffs\n\n✨ SPECIAL: Elemental ability (requires Flush or better)\n   Effect varies by dominant element";

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
        
        // Reset state for this section
        this.selectedCards = [];
        this.playedCards = [];
        
        this.createCombatScene('Attack', enemyData, () => {
            // Reset for next section
            this.selectedCards = [];
            this.playedCards = [];
            this.playerBlock = 0;
            this.nextSection();
        });
    }

    private defendPractice() {
        const enemyData = { ...BALETE_WRAITH, id: 'tutorial_wraith' };
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        // Reset state for this section
        this.selectedCards = [];
        this.playedCards = [];
        
        this.createCombatScene('Defend', enemyData, () => {
            this.selectedCards = [];
            this.playedCards = [];
            this.nextSection();
        });
    }

    private specialPractice() {
        const enemyData = { ...SIGBIN_CHARGER, id: 'tutorial_sigbin' };
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        // Reset state for this section
        this.selectedCards = [];
        this.playedCards = [];
        
        this.createCombatScene('Special', enemyData, () => {
            this.selectedCards = [];
            this.playedCards = [];
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
        const progress = createProgressIndicator(this.scene, 4, 11);
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

            // Player shadow
            const playerShadow = this.scene.add.ellipse(
                playerX,
                playerY + 60,
                80,
                20,
                0x000000,
                0.3
            );
            this.container.add(playerShadow);

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

            // Enemy shadow
            const enemyShadow = this.scene.add.ellipse(
                enemyX,
                enemyY + 100,
                120,
                30,
                0x000000,
                0.3
            );
            this.container.add(enemyShadow);

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

            const enemyIntent = this.scene.add.text(enemyX, enemyHealthY + 25, `⚔️ Intent: Attack ${enemyData.damage || 15}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 18,
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(enemyIntent);

            // Played hand container (center, hidden initially)
            // DO NOT add to container - keep it at scene level for proper visibility
            this.playedHandContainer = this.scene.add.container(screenWidth / 2, screenHeight * 0.55);
            this.playedHandContainer.setVisible(false);
            this.playedHandContainer.setDepth(2000); // Very high depth to ensure visibility above all
            this.playedHandContainer.setAlpha(1); // Full opacity
            this.playedHandContainer.setActive(true); // Ensure active
            
            console.log('[Phase4] Created NEW played hand container for', actionType, 'at:', screenWidth / 2, screenHeight * 0.55);
            console.log('[Phase4] Container initial state:', {
                exists: !!this.playedHandContainer,
                visible: this.playedHandContainer.visible,
                alpha: this.playedHandContainer.alpha,
                depth: this.playedHandContainer.depth,
                active: this.playedHandContainer.active
            });

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

            // Draw cards
            if (actionType === 'Special') {
                this.tutorialUI.drawHand(3);
                const flushCards: PlayingCard[] = [
                    { id: '7-Apoy', rank: '7', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                    { id: '8-Apoy', rank: '8', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                    { id: '9-Apoy', rank: '9', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                    { id: '10-Apoy', rank: '10', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                    { id: '11-Apoy', rank: 'Mandirigma', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                ];
                this.tutorialUI.addCardsToHand(flushCards);
            } else {
                this.tutorialUI.drawHand(8);
            }
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
                    // Enable Play Hand button
                    this.playHandButton.setAlpha(1);
                    const buttonChildren = this.playHandButton.getAll();
                    buttonChildren.forEach(child => {
                        if (child instanceof Phaser.GameObjects.Rectangle) {
                            const rect = child as Phaser.GameObjects.Rectangle;
                            rect.setInteractive({ useHandCursor: true });
                            // Re-add click listener
                            rect.removeAllListeners('pointerdown');
                            rect.on('pointerdown', () => {
                                this.playHand(actionType, enemyHPText, playerBlockText, onSuccess, selectCardHandler);
                            });
                        }
                    });
                } else if (this.playHandButton) {
                    // Disable Play Hand button
                    this.playHandButton.setAlpha(0.5);
                    const buttonChildren = this.playHandButton.getAll();
                    buttonChildren.forEach(child => {
                        if (child instanceof Phaser.GameObjects.Rectangle) {
                            const rect = child as Phaser.GameObjects.Rectangle;
                            rect.disableInteractive();
                            rect.removeAllListeners('pointerdown');
                        }
                    });
                }
            };

            this.scene.events.on('selectCard', selectCardHandler);

            // PHASE 1: Play Hand button (starts disabled)
            this.playHandButton = createButton(
                this.scene,
                screenWidth / 2,
                screenHeight - 100,
                'Play Hand',
                () => this.playHand(actionType, enemyHPText, playerBlockText, onSuccess, selectCardHandler)
            );
            this.playHandButton.setAlpha(0.5);
            const playButtonChildren = this.playHandButton.getAll();
            playButtonChildren.forEach(child => {
                if (child instanceof Phaser.GameObjects.Rectangle) {
                    (child as any).disableInteractive();
                }
            });
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
        console.log('[Phase4] playHand called with', this.selectedCards.length, 'cards');
        console.log('[Phase4] Current combat phase:', this.combatPhase);
        
        if (this.selectedCards.length !== 5) {
            console.warn('[Phase4] Cannot play hand: need 5 cards, have', this.selectedCards.length);
            return;
        }
        if (this.combatPhase !== 'card_selection') {
            console.warn('[Phase4] Cannot play hand: not in card_selection phase');
            return; // Prevent double execution
        }
        
        console.log('[Phase4] Playing hand for', actionType);
        
        // Move to played hand
        this.playedCards = [...this.selectedCards];
        this.combatPhase = 'action_selection';
        
        console.log('[Phase4] Played cards:', this.playedCards);
        
        // Disable Play Hand button
        if (this.playHandButton) {
            const buttonChildren = this.playHandButton.getAll();
            buttonChildren.forEach(child => {
                if (child instanceof Phaser.GameObjects.Rectangle) {
                    const rect = child as Phaser.GameObjects.Rectangle;
                    rect.disableInteractive();
                    rect.removeAllListeners('pointerdown');
                }
            });
            this.playHandButton.setAlpha(0.5);
        }
        
        // Update instruction for Phase 2
        this.instructionText.setText(`Step 2: Click "${actionType}" to execute your action`);
        this.instructionText.setColor('#4CAF50');
        this.selectionCounter.setVisible(false);
        
        // Hide hand display, show played cards
        console.log('[Phase4] Hiding hand container, showing played hand container');
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
        
        const buttonText = actionType === 'Attack' ? '⚔️ Attack' :
                          actionType === 'Defend' ? '🛡️ Defend' :
                          '✨ Special';
        
        const actionButton = createButton(
            this.scene,
            0,
            0,
            buttonText,
            () => this.performAction(actionType, enemyHPText, playerBlockText, onSuccess, selectCardHandler)
        );
        this.actionButtons.add(actionButton);
        
        console.log('[Phase4] Action button created for', actionType);
    }
    
    /**
     * Display played cards in the center area using REAL card sprites
     */
    private displayPlayedCards() {
        console.log('[Phase4] === DISPLAY PLAYED CARDS START ===');
        console.log('[Phase4] Container exists?', !!this.playedHandContainer);
        
        if (!this.playedHandContainer) {
            console.error('[Phase4] ERROR: playedHandContainer is null/undefined!');
            return;
        }
        
        console.log('[Phase4] Container active?', this.playedHandContainer.active);
        console.log('[Phase4] Container scene?', !!this.playedHandContainer.scene);
        
        this.playedHandContainer.removeAll(true);
        
        const cardSpacing = 90;
        const startX = -(this.playedCards.length - 1) * cardSpacing / 2;
        
        console.log('[Phase4] Displaying played cards:', this.playedCards.map(c => `${c.rank} of ${c.suit}`));
        console.log('[Phase4] Played hand container BEFORE adding cards:', {
            x: this.playedHandContainer.x,
            y: this.playedHandContainer.y,
            visible: this.playedHandContainer.visible,
            alpha: this.playedHandContainer.alpha,
            depth: this.playedHandContainer.depth,
            active: this.playedHandContainer.active,
            childCount: this.playedHandContainer.list.length
        });
        
        this.playedCards.forEach((card, index) => {
            const cardX = startX + (index * cardSpacing);
            
            console.log(`[Phase4] Creating card sprite ${index + 1}/${this.playedCards.length}: ${card.rank} of ${card.suit}`);
            
            // Use REAL card sprites from the game
            const cardSprite = this.createCardSprite(card, cardX, 0);
            cardSprite.setAlpha(1); // Ensure visible
            cardSprite.setVisible(true); // Ensure visible
            cardSprite.setDepth(2100); // Ensure above everything (higher than container)
            cardSprite.setActive(true); // Ensure active
            this.playedHandContainer.add(cardSprite);
            
            console.log(`[Phase4] Added card sprite ${index + 1} to container:`, {
                visible: cardSprite.visible,
                alpha: cardSprite.alpha,
                depth: cardSprite.depth,
                active: cardSprite.active,
                children: cardSprite.list?.length || 0
            });
        });
        
        // Ensure container is visible and properly positioned
        this.playedHandContainer.setVisible(true);
        this.playedHandContainer.setAlpha(1);
        this.playedHandContainer.setActive(true);
        this.playedHandContainer.setDepth(2000); // Ensure above everything
        
        console.log('[Phase4] Played hand container AFTER adding cards:', {
            position: { x: this.playedHandContainer.x, y: this.playedHandContainer.y },
            children: this.playedHandContainer.list.length,
            visible: this.playedHandContainer.visible,
            alpha: this.playedHandContainer.alpha,
            depth: this.playedHandContainer.depth,
            active: this.playedHandContainer.active
        });
        console.log('[Phase4] === DISPLAY PLAYED CARDS END ===');
        
        // Force render update
        this.scene.sys.displayList.queueDepthSort();
    }
    
    /**
     * Create card sprite (same as CombatUI.ts)
     */
    private createCardSprite(
        card: PlayingCard,
        x: number,
        y: number
    ): Phaser.GameObjects.Container {
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
        console.log(`[Phase4] Creating card sprite: ${card.rank} of ${card.suit} → texture key: ${textureKey}`);
        console.log(`[Phase4] Texture exists: ${this.scene.textures.exists(textureKey)}`);
        
        let cardSprite: Phaser.GameObjects.GameObject;
        
        if (this.scene.textures.exists(textureKey)) {
            cardSprite = this.scene.add.image(0, 0, textureKey);
            (cardSprite as Phaser.GameObjects.Image).setDisplaySize(cardWidth, cardHeight);
            (cardSprite as Phaser.GameObjects.Image).setVisible(true);
            (cardSprite as Phaser.GameObjects.Image).setAlpha(1);
            (cardSprite as Phaser.GameObjects.Image).setDepth(2100);
            console.log(`[Phase4] Using real card texture: ${textureKey}`);
        } else {
            // Fallback to rectangle if texture doesn't exist
            console.warn(`[Phase4] Texture not found: ${textureKey}, using fallback`);
            const rect = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0x2C2F33);
            rect.setVisible(true);
            rect.setAlpha(1);
            rect.setDepth(2100);
            cardSprite = rect;
            
            const rankText = this.scene.add.text(-cardWidth/2 + 5, -cardHeight/2 + 5, card.rank, {
                fontFamily: "dungeon-mode",
                fontSize: 14,
                color: "#FFFFFF",
            }).setOrigin(0, 0);
            rankText.setDepth(2110); // Higher than card
            cardContainer.add(rankText);
            
            const suitEmoji = card.suit === 'Apoy' ? '🔥' :
                            card.suit === 'Tubig' ? '💧' :
                            card.suit === 'Lupa' ? '🌿' : '💨';
            const suitText = this.scene.add.text(cardWidth/2 - 5, -cardHeight/2 + 5, suitEmoji, {
                fontSize: 16,
            }).setOrigin(1, 0);
            suitText.setDepth(2110); // Higher than card
            cardContainer.add(suitText);
        }
        
        // Add border
        const border = this.scene.add.rectangle(0, 0, cardWidth + 4, cardHeight + 4, 0x000000, 0);
        border.setStrokeStyle(2, 0xFFD700);
        border.setVisible(true);
        border.setDepth(2101); // Slightly higher than sprite
        
        // Add background first, then sprite, then border
        cardContainer.add([cardSprite, border]);
        cardContainer.setVisible(true);
        cardContainer.setAlpha(1);
        cardContainer.setDepth(2100); // Ensure container is at high depth
        
        console.log(`[Phase4] Card container created at (${x}, ${y}) with ${cardContainer.list.length} children`, {
            visible: cardContainer.visible,
            alpha: cardContainer.alpha,
            depth: cardContainer.depth
        });
        
        return cardContainer;
    }
    /**
     * Perform combat action (Phase 2: Execute the action with played cards)
     * Tutorial version: Proceeds after ONE action (no need to defeat enemy)
     */
    private performAction(
        actionType: 'Attack' | 'Defend' | 'Special',
        enemyHPText: Phaser.GameObjects.Text,
        playerBlockText: Phaser.GameObjects.Text,
        onSuccess: () => void,
        selectCardHandler: (card: PlayingCard) => void
    ) {
        // Disable action buttons to prevent repeated clicks
        if (this.actionButtons) {
            this.actionButtons.setVisible(false);
            this.actionButtons.disableInteractive();
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

            // Tutorial: Proceed after action (no need to defeat enemy)
            const success = createInfoBox(
                this.scene,
                `Great! You dealt ${damage} damage! This is how Attack works.`,
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(2000, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                
                // Clean up played hand container
                if (this.playedHandContainer) {
                    this.playedHandContainer.destroy();
                    this.playedHandContainer = null as any;
                }
                
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
                '🛡️',
                { fontSize: 48 }
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
                `Perfect! You gained ${block} block! This will absorb incoming damage.`,
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(2000, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                
                // Clean up played hand container
                if (this.playedHandContainer) {
                    this.playedHandContainer.destroy();
                    this.playedHandContainer = null as any;
                }
                
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
            if (evaluation.type !== 'flush' && evaluation.type !== 'straight_flush') {
                const warning = createInfoBox(
                    this.scene,
                    'You need a Flush or better to use Special! Try again.',
                    'warning',
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height - 200
                );
                this.container.add(warning);
                this.scene.time.delayedCall(1500, () => warning.destroy());
                
                // Re-enable button
                if (this.actionButtons) {
                    this.actionButtons.setVisible(true);
                    this.actionButtons.setInteractive();
                }
                this.instructionText.setText(`Step 2: Click "${actionType}" to execute your action`);
                this.instructionText.setColor('#4CAF50');
                return;
            }

            const damage = 15 + evaluation.totalValue;
            this.enemyHP -= damage;
            enemyHPText.setText(`HP: ${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);

            // Animate special effect
            const fireEffect = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                '🔥',
                { fontSize: 96 }
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
                `Excellent! 🔥 Apoy Special dealt ${damage} damage and applied Burn!`,
                'success'
            );
            this.container.add(success);

            this.scene.time.delayedCall(2000, () => {
                this.scene.events.off('selectCard', selectCardHandler);
                
                // Clean up played hand container
                if (this.playedHandContainer) {
                    this.playedHandContainer.destroy();
                    this.playedHandContainer = null as any;
                }
                
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
