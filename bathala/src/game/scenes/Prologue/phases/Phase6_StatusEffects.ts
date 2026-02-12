import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { createButton } from '../../../ui/Button';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { TIKBALANG_SCOUT } from '../../../../data/enemies/Act1Enemies';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';
import { DeckManager } from '../../../../utils/DeckManager';
import { StatusEffectManager } from '../../../../core/managers/StatusEffectManager';
import { ElementalAffinitySystem } from '../../../../core/managers/ElementalAffinitySystem';
import { DamageCalculator } from '../../../../utils/DamageCalculator';

export class Phase6_StatusEffects extends TutorialPhase {
    private currentSection: number = 0;
    
    // Combat simulation state (for Section 4)
    private selectedCards: PlayingCard[] = [];
    private playedCards: PlayingCard[] = [];
    private playerHP: number = 100;
    private playerBlock: number = 0;
    private enemyHP: number = 0;
    private enemyMaxHP: number = 0;
    
    // Visual elements (for Section 4)
    private playerSprite!: Phaser.GameObjects.Sprite;
    private enemySprite!: Phaser.GameObjects.Sprite;
    private playHandButton!: Phaser.GameObjects.Container;
    private actionButtons!: Phaser.GameObjects.Container;
    private instructionText!: Phaser.GameObjects.Text;
    private selectionCounter!: Phaser.GameObjects.Text;
    private playedHandContainer!: Phaser.GameObjects.Container;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    /**
     * Start the Phase 6 tutorial section.
     * Initiates the first section of the status effects and elemental affinities tutorial.
     * Resets internal state for re-entry when jumping back to this phase.
     * 
     * @public
     */
    public start(): void {
        // Ensure StatusEffectManager is initialized (it's normally initialized in Combat scene,
        // but Phase6 runs in Prologue scene and needs access to status effect definitions)
        StatusEffectManager.initialize();
        
        // Reset internal state for re-entry (when jumping back to this phase)
        this.currentSection = 0;
        this.selectedCards = [];
        this.playedCards = [];
        this.playerHP = 100;
        this.playerBlock = 0;
        
        this.nextSection();
    }

    /**
     * Advance to the next section of the tutorial phase.
     * Handles transitions between sections with fade animations.
     * 
     * @private
     */
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

    /**
     * Display the content for the current section.
     * Routes to the appropriate section display method based on currentSection value.
     * 
     * @private
     */
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
            case 4:
                this.showInteractivePractice();
                break;
            default:
                this.onComplete();
                break;
        }
    }

    /**
     * Section 1: Display introduction to buff status effects.
     * Teaches players about beneficial status effects like Strength, Plated Armor, Regeneration, and Ritual.
     * Uses actual StatusEffectManager definitions for accuracy.
     * 
     * @private
     */
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

        // Get actual status effect definitions from StatusEffectManager
        const strength = StatusEffectManager.getDefinition('strength');
        const platedArmor = StatusEffectManager.getDefinition('plated_armor');
        const regeneration = StatusEffectManager.getDefinition('regeneration');
        const ritual = StatusEffectManager.getDefinition('ritual');

        const dialogue = `Status effects shape battles. First, BUFFS:\n\n${strength?.emoji} ${strength?.name.toUpperCase()}: ${strength?.description}\n${platedArmor?.emoji} ${platedArmor?.name.toUpperCase()}: ${platedArmor?.description}\n${regeneration?.emoji} ${regeneration?.name.toUpperCase()}: ${regeneration?.description}\n${ritual?.emoji} ${ritual?.name.toUpperCase()}: ${ritual?.description}\n\nBuffs stack up! Use them strategically to overpower enemies.`;

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

    /**
     * Section 2: Display introduction to debuff status effects.
     * Teaches players about harmful status effects like Burn, Poison, Weak, Vulnerable, and Frail.
     * 
     * **IMPORTANT DISTINCTION**: 
     * - Burn (🔥): Player inflicts on enemies via Fire Special actions
     * - Poison (☠️): Enemies inflict on player via poison actions
     * Both work identically (damage at start of turn, reduce by 1), just different names.
     * 
     * Uses actual StatusEffectManager definitions for accuracy.
     * 
     * @private
     */
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

        // Get actual status effect definitions from StatusEffectManager
        // Note: Burn uses the same definition as Poison (they work identically)
        const poison = StatusEffectManager.getDefinition('poison');
        const weak = StatusEffectManager.getDefinition('weak');
        const vulnerable = StatusEffectManager.getDefinition('vulnerable');
        const frail = StatusEffectManager.getDefinition('frail');

        const dialogue = `Now DEBUFFS - harmful effects:\n\n🔥 BURN: You inflict this on enemies with Fire Special\n   ${poison?.description}\n\n${poison?.emoji} ${poison?.name.toUpperCase()}: Enemies inflict this on you\n   ${poison?.description}\n\n${weak?.emoji} ${weak?.name.toUpperCase()}: ${weak?.description}\n${vulnerable?.emoji} ${vulnerable?.name.toUpperCase()}: ${vulnerable?.description}\n${frail?.emoji} ${frail?.name.toUpperCase()}: ${frail?.description}\n\nBurn and Poison work the same way - just different names!`;

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

    /**
     * Section 3: Display introduction to elemental affinities.
     * Teaches players about elemental weaknesses (1.5× damage) and resistances (0.75× damage).
     * Shows a visual example using a Tikbalang enemy with Fire weakness and Air resistance.
     * 
     * @private
     */
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

    /**
     * Create a visual example showing enemy elemental affinities.
     * Displays a Tikbalang sprite with weakness and resistance indicators.
     * Uses actual ElementalAffinitySystem for affinity display data.
     * 
     * @returns A Phaser container with the enemy sprite and affinity indicators
     * @private
     */
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
        
        // Get actual affinity display data from ElementalAffinitySystem
        const affinityData = ElementalAffinitySystem.getAffinityDisplayData(TIKBALANG_SCOUT.elementalAffinity);
        
        // Weakness indicator (above enemy) - Tikbalang is weak to Fire
        const weaknessText = this.scene.add.text(-80, -120, `${affinityData.weaknessIcon} Weak`, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        container.add(weaknessText);
        
        // Resistance indicator (above enemy) - Tikbalang resists Air
        const resistanceText = this.scene.add.text(80, -120, `${affinityData.resistanceIcon} Resist`, {
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

    /**
     * Section 4: Interactive Practice
     * Demonstrates applying Burn status effect and exploiting elemental weakness
     */
    private showInteractivePractice(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Practice: Status Effects',
            'Apply Burn and exploit elemental weakness'
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

        const dialogue = "Let's practice! You'll face a Tikbalang Scout.\n\nGOAL: Use Fire Special to apply Burn\nThe Tikbalang is WEAK to Fire (1.5× damage)!\n\nSelect 5 cards with Fire (Apoy) suits for maximum effect.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.startBurnPractice();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    /**
     * Starts the interactive Burn practice combat simulation.
     * Creates a tutorial combat scenario with a Tikbalang Scout enemy.
     * 
     * @private
     */
    private startBurnPractice(): void {
        // Create enemy data from TIKBALANG_SCOUT with tutorial ID
        const enemyData = { ...TIKBALANG_SCOUT, id: 'tutorial_tikbalang_burn' };
        
        // Create combat scene focused on Burn status effect
        this.createStatusEffectPracticeScene(enemyData);
    }

    /**
     * Create combat practice scene for status effects demonstration.
     * Similar to Phase4's createCombatScene but focused on Special action and Burn status effect.
     * Sets up the combat UI with player and enemy sprites, health displays, and card selection.
     * 
     * @param enemyData - The enemy data object containing stats and properties
     * @private
     */
    private createStatusEffectPracticeScene(enemyData: any): void {
        // Initialize combat state
        this.selectedCards = [];
        this.playedCards = [];
        this.playerHP = 100;
        this.playerBlock = 0;
        this.enemyHP = enemyData.currentHealth;
        this.enemyMaxHP = enemyData.maxHealth;
        
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Burn Status Effect',
            'Apply Burn and watch it trigger'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            // Remove event listener before skipping
            this.scene.events.off('selectCard', this.onCardSelected, this);
            
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
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;

            // Create player sprite (left side, 25% width)
            const playerX = screenWidth * 0.25;
            const playerY = screenHeight * 0.4;
            
            this.playerSprite = this.scene.add.sprite(playerX, playerY, 'combat_player');
            this.playerSprite.setScale(2);
            if (this.playerSprite.texture) {
                this.playerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            this.container.add(this.playerSprite);

            // Calculate player sprite offsets
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

            // Create enemy sprite (right side, 75% width)
            const enemyX = screenWidth * 0.75;
            const enemyY = screenHeight * 0.4;
            
            const enemySpriteKey = this.getEnemySpriteKey(enemyData.name);
            this.enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
            
            // Scale adjustment for enemy
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

            // Calculate enemy sprite offsets
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

            // Display enemy elemental affinity indicators using ElementalAffinitySystem
            const affinityData = ElementalAffinitySystem.getAffinityDisplayData(enemyData.elementalAffinity);
            
            const weaknessIcon = this.scene.add.text(enemyX - 60, enemyHealthY + 30, `${affinityData.weaknessIcon} Weak`, {
                fontFamily: 'dungeon-mode',
                fontSize: 16,
                color: '#ff6b6b',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(weaknessIcon);

            const resistanceIcon = this.scene.add.text(enemyX + 60, enemyHealthY + 30, `${affinityData.resistanceIcon} Resist`, {
                fontFamily: 'dungeon-mode',
                fontSize: 16,
                color: '#5BA3D0',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(resistanceIcon);

            // Played hand container (center, hidden initially)
            this.playedHandContainer = this.scene.add.container(screenWidth / 2, screenHeight * 0.55);
            this.playedHandContainer.setVisible(false);
            this.container.add(this.playedHandContainer);

            // Instruction text
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

            // Ensure hand container is visible
            this.tutorialUI.handContainer.setVisible(true);
            this.tutorialUI.handContainer.setAlpha(1);
            this.tutorialUI.handContainer.setDepth(1500);
            
            // Draw 8 cards
            this.tutorialUI.drawHand(8);
            this.tutorialUI.updateHandDisplay();

            // Set up card selection
            this.setupCardSelection();
        });
    }

    /**
     * Set up card selection event listener and Play Hand button.
     * Initializes the card selection phase where players choose 5 cards to play.
     * 
     * @private
     */
    private setupCardSelection(): void {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;

        // Create "Play Hand" button (disabled initially)
        this.playHandButton = this.createPlayHandButton(screenWidth / 2, screenHeight - 180);
        this.playHandButton.setAlpha(0.5); // Disabled state
        this.container.add(this.playHandButton);

        // Listen for card selection events
        this.scene.events.on('selectCard', this.onCardSelected, this);
    }

    /**
     * Create the "Play Hand" button.
     * Creates an interactive button that becomes enabled when 5 cards are selected.
     * 
     * @param x - The x-coordinate position for the button
     * @param y - The y-coordinate position for the button
     * @returns A Phaser container with the button
     * @private
     */
    private createPlayHandButton(x: number, y: number): Phaser.GameObjects.Container {
        const button = createButton(
            this.scene,
            x,
            y,
            'Play Hand',
            () => this.playHand(),
            200 // Fixed width
        );
        
        // Initially not interactive
        button.setInteractive(false);
        
        return button;
    }

    /**
     * Handle card selection event.
     * Toggles card selection state and updates the UI accordingly.
     * Enables the Play Hand button when exactly 5 cards are selected.
     * 
     * @param card - The playing card that was selected/deselected
     * @private
     */
    private onCardSelected(card: PlayingCard): void {
        // Check if card is already selected
        const cardIndex = this.selectedCards.findIndex(c => 
            c.rank === card.rank && c.suit === card.suit
        );

        if (cardIndex >= 0) {
            // Deselect card
            this.selectedCards.splice(cardIndex, 1);
        } else {
            // Select card (up to 5)
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
            }
        }

        // Update selection counter
        this.updateSelectionCounter();

        // Enable/disable Play Hand button based on selection count
        if (this.selectedCards.length === 5) {
            this.playHandButton.setAlpha(1);
            this.playHandButton.setInteractive(true);
        } else {
            this.playHandButton.setAlpha(0.5);
            this.playHandButton.setInteractive(false);
        }
    }

    /**
     * Update the selection counter display.
     * Shows how many cards are currently selected out of the required 5.
     * Changes color to green when 5 cards are selected.
     * 
     * @private
     */
    private updateSelectionCounter(): void {
        this.selectionCounter.setText(`Selected: ${this.selectedCards.length}/5`);
        
        // Change color based on selection count
        if (this.selectedCards.length === 5) {
            this.selectionCounter.setColor('#4CAF50'); // Green when ready
        } else {
            this.selectionCounter.setColor('#99A0A5'); // Gray when not ready
        }
    }

    /**
     * Transition from card selection to action selection.
     * Hides the hand and Play Hand button, displays the played cards,
     * and shows the Special action button.
     * 
     * @private
     */
    private playHand(): void {
        // Prevent double-clicking
        this.playHandButton.setInteractive(false);

        // Remove card selection listener
        this.scene.events.off('selectCard', this.onCardSelected, this);

        // Copy selected cards to played cards
        this.playedCards = [...this.selectedCards];

        // Hide hand container
        this.scene.tweens.add({
            targets: this.tutorialUI.handContainer,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.tutorialUI.handContainer.setVisible(false);
            }
        });

        // Hide Play Hand button
        this.scene.tweens.add({
            targets: this.playHandButton,
            alpha: 0,
            duration: 300,
            ease: 'Power2'
        });

        // Display played cards in center
        this.displayPlayedCards();
        this.playedHandContainer.setVisible(true);
        this.playedHandContainer.setAlpha(0);
        
        this.scene.tweens.add({
            targets: this.playedHandContainer,
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });

        // Update instruction text
        this.instructionText.setText('Step 2: Click "Special" to execute your action');

        // Show action buttons (only Special button for this tutorial)
        this.scene.time.delayedCall(500, () => {
            this.showActionButtons();
        });
    }

    /**
     * Get the sprite texture key for an enemy based on their name.
     * Maps enemy names to their corresponding combat sprite texture keys.
     * Reused from Phase4_CombatActions for consistency.
     * 
     * @param enemyName - The name of the enemy (e.g., "Tikbalang Scout")
     * @returns The texture key for the enemy's combat sprite (e.g., "tikbalang_combat")
     * @private
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

    /**
     * Create a card sprite container for displaying a played card (non-interactive).
     * Generates a visual representation of a card using either the actual card texture
     * or a fallback rectangle with text if the texture is not found.
     * Reused from Phase4_CombatActions for consistency.
     * 
     * @param card - The playing card to create a sprite for
     * @param x - The x-coordinate position within the parent container
     * @param y - The y-coordinate position within the parent container
     * @returns A Phaser container with the card sprite and any fallback elements
     * @private
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
     * Display the played cards in the center area using actual card sprites.
     * Creates visual representations of the cards that were selected and played.
     * Reused from Phase4_CombatActions for consistency.
     * 
     * @private
     */
    private displayPlayedCards(): void {
        this.playedHandContainer.removeAll(true);
        
        const cardSpacing = 90;
        const startX = -(this.playedCards.length - 1) * cardSpacing / 2;
        
        this.playedCards.forEach((card, index) => {
            const cardX = startX + (index * cardSpacing);
            const cardSprite = this.createCardSpriteForPlayed(card, cardX, 0);
            this.playedHandContainer.add(cardSprite);
        });
    }

    /**
     * Show action buttons (only Special button for this tutorial).
     * Creates and displays the Special action button with fade-in animation.
     * 
     * @private
     */
    private showActionButtons(): void {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;

        // Create action buttons container
        this.actionButtons = this.scene.add.container(screenWidth / 2, screenHeight - 100);
        
        // Only show Special button for this tutorial
        const specialButton = createButton(
            this.scene,
            0,
            0,
            'Special',
            () => this.performSpecialAction(),
            150
        );
        
        this.actionButtons.add(specialButton);
        this.container.add(this.actionButtons);
        
        // Fade in the button
        this.actionButtons.setAlpha(0);
        this.scene.tweens.add({
            targets: this.actionButtons,
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });
    }

    /**
     * Execute the Special action with Fire cards.
     * Demonstrates Burn status effect application and elemental weakness multiplier.
     * Uses DamageCalculator and ElementalAffinitySystem for accurate damage calculation.
     * 
     * @private
     */
    private performSpecialAction(): void {
        // Disable button to prevent double-clicking
        this.actionButtons.setInteractive(false);
        this.actionButtons.setAlpha(0.5);

        // Evaluate hand
        const evaluation = HandEvaluator.evaluateHand(this.playedCards, 'special');
        
        // Create a mock enemy entity for DamageCalculator
        const mockEnemy = {
            ...TIKBALANG_SCOUT,
            id: 'tutorial_tikbalang_burn',
            currentHealth: this.enemyHP,
            maxHealth: this.enemyMaxHP
        };
        
        // Use DamageCalculator for complete damage calculation
        const damageCalc = DamageCalculator.calculate(
            this.playedCards,
            evaluation.handType,
            'special',
            undefined, // No player entity needed for this tutorial
            mockEnemy,
            [] // No relic bonuses
        );
        
        const finalDamage = damageCalc.finalValue;
        
        // Show damage calculation breakdown
        this.showDamageBreakdown(damageCalc.baseValue, damageCalc.elementalMultiplier, finalDamage);
        
        // Apply damage after showing breakdown
        this.scene.time.delayedCall(1500, () => {
            // Apply Burn status effect (3 stacks)
            this.applyBurnEffect();
            
            // Show Fire Special animation
            this.animateFireSpecial();
            
            // Apply damage to enemy
            this.scene.time.delayedCall(800, () => {
                this.enemyHP = Math.max(0, this.enemyHP - finalDamage);
                this.updateEnemyHP();
                this.showDamageNumber(finalDamage);
                
                // Continue to Burn trigger simulation after damage
                this.scene.time.delayedCall(1500, () => {
                    this.simulateBurnTrigger();
                });
            });
        });
    }

    /**
     * Show damage calculation breakdown.
     * Displays the base damage, elemental multiplier, and final damage in a visual breakdown.
     * 
     * @param baseDamage - The base damage before multipliers
     * @param multiplier - The elemental multiplier (e.g., 1.5 for weakness)
     * @param finalDamage - The final damage after applying multiplier
     * @private
     */
    private showDamageBreakdown(baseDamage: number, multiplier: number, finalDamage: number): void {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        const breakdownContainer = this.scene.add.container(screenWidth / 2, screenHeight * 0.3);
        
        // Base damage
        const baseText = this.scene.add.text(0, 0, `Base Damage: ${baseDamage}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#E8E8E8',
            align: 'center'
        }).setOrigin(0.5);
        breakdownContainer.add(baseText);
        
        // Multiplier (if not 1.0)
        if (multiplier !== 1.0) {
            const fireIcon = ElementalAffinitySystem.getElementIcon('fire');
            const multiplierText = this.scene.add.text(0, 30, `${fireIcon} Fire Weakness: ×${multiplier}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#ff6b6b',
                align: 'center'
            }).setOrigin(0.5);
            breakdownContainer.add(multiplierText);
            
            // Final damage
            const finalText = this.scene.add.text(0, 60, `Final Damage: ${finalDamage}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 28,
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);
            breakdownContainer.add(finalText);
        }
        
        this.container.add(breakdownContainer);
        
        // Fade out after 1.5 seconds
        this.scene.time.delayedCall(1500, () => {
            this.scene.tweens.add({
                targets: breakdownContainer,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => breakdownContainer.destroy()
            });
        });
    }

    /**
     * Apply Burn status effect to enemy (3 stacks).
     * Creates and animates the Burn icon and stack count above the enemy sprite.
     * 
     * **BURN vs POISON**: Burn is what players inflict on enemies (via Fire Special).
     * Poison is what enemies inflict on players. Both function identically:
     * - Deal 2 damage per stack at start of turn
     * - Reduce by 1 stack at end of turn
     * 
     * Uses fire emoji (🔥) for Burn representation in tutorial.
     * 
     * @private
     */
    private applyBurnEffect(): void {
        const screenWidth = this.scene.cameras.main.width;
        const enemyX = screenWidth * 0.75;
        
        // Get enemy sprite position
        const enemyY = this.enemySprite.y;
        const enemyScale = this.enemySprite.scale;
        const enemySpriteScaledHeight = this.enemySprite.height * enemyScale;
        
        // Position Burn icon above enemy
        const burnIconY = enemyY - (enemySpriteScaledHeight / 2) - 60;
        
        // Get Burn emoji from StatusEffectManager (Burn uses same definition as Poison)
        // Note: In the actual game, Burn would have its own definition, but for now we use the fire emoji
        const burnEmoji = '🔥'; // Burn is represented by fire emoji in tutorial
        
        // Create Burn icon
        const burnIcon = this.scene.add.text(enemyX, burnIconY, burnEmoji, {
            fontFamily: 'dungeon-mode',
            fontSize: 32
        }).setOrigin(0.5);
        this.container.add(burnIcon);
        
        // Create stack count
        const stackCount = this.scene.add.text(enemyX + 20, burnIconY + 20, '3', {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#ff6b6b'
        }).setOrigin(0.5);
        this.container.add(stackCount);
        
        // Animate icon appearing (scale up)
        burnIcon.setScale(0);
        stackCount.setScale(0);
        
        this.scene.tweens.add({
            targets: [burnIcon, stackCount],
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Animate Fire Special effect.
     * Displays a "🔥 BURN" text that scales up and fades out over the enemy.
     * 
     * @private
     */
    private animateFireSpecial(): void {
        const screenWidth = this.scene.cameras.main.width;
        const enemyX = screenWidth * 0.75;
        const enemyY = this.enemySprite.y;
        
        // Create "BURN" text
        const burnText = this.scene.add.text(enemyX, enemyY, '🔥 BURN', {
            fontFamily: 'dungeon-mode',
            fontSize: 48,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(burnText);
        
        // Animate: scale up and fade out
        burnText.setScale(0.5);
        burnText.setAlpha(1);
        
        this.scene.tweens.add({
            targets: burnText,
            scale: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => burnText.destroy()
        });
    }

    /**
     * Show floating damage number.
     * Displays a damage number that floats upward and fades out.
     * 
     * @param damage - The amount of damage to display
     * @private
     */
    private showDamageNumber(damage: number): void {
        const screenWidth = this.scene.cameras.main.width;
        const enemyX = screenWidth * 0.75;
        const enemyY = this.enemySprite.y;
        
        const damageText = this.scene.add.text(enemyX, enemyY, `-${damage}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 36,
            color: '#ff6b6b',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(damageText);
        
        // Float up and fade out
        this.scene.tweens.add({
            targets: damageText,
            y: enemyY - 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    /**
     * Update enemy HP display.
     * Finds and updates the enemy HP text to reflect current health.
     * 
     * @private
     */
    private updateEnemyHP(): void {
        // Find the enemy HP text in the container
        const screenWidth = this.scene.cameras.main.width;
        const enemyX = screenWidth * 0.75;
        const enemyY = this.enemySprite.y;
        const enemyScale = this.enemySprite.scale;
        const enemySpriteScaledHeight = this.enemySprite.height * enemyScale;
        const enemyHealthY = enemyY + (enemySpriteScaledHeight / 2) + 20;
        
        // Remove old HP text and create new one
        const children = this.container.getAll();
        for (const child of children) {
            if (child instanceof Phaser.GameObjects.Text && 
                child.text.startsWith('HP:') && 
                Math.abs(child.y - enemyHealthY) < 5) {
                child.destroy();
                break;
            }
        }
        
        // Create new HP text
        const enemyHPText = this.scene.add.text(enemyX, enemyHealthY, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#E8E8E8',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(enemyHPText);
    }

    /**
     * Simulate enemy turn start and Burn status effect trigger.
     * Demonstrates how Burn deals damage at start of turn and reduces by 1 stack.
     * 
     * **BURN MECHANICS**: 
     * - Triggers at start of enemy's turn (since player applied it to enemy)
     * - Deals 2 damage per stack (3 stacks = 6 damage)
     * - Reduces by 1 stack after triggering (3 → 2)
     * 
     * This is the same mechanic as Poison, just applied to enemies instead of player.
     * 
     * @private
     */
    private simulateBurnTrigger(): void {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // Hide action buttons and instruction text
        this.scene.tweens.add({
            targets: [this.actionButtons, this.instructionText, this.selectionCounter],
            alpha: 0,
            duration: 300,
            ease: 'Power2'
        });
        
        // Display "Enemy's turn begins..." message
        const turnMessage = this.scene.add.text(
            screenWidth / 2,
            screenHeight * 0.25,
            "Enemy's turn begins...",
            {
                fontFamily: 'dungeon-mode',
                fontSize: 28,
                color: '#FFD700',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.container.add(turnMessage);
        
        // Fade in the message
        turnMessage.setAlpha(0);
        this.scene.tweens.add({
            targets: turnMessage,
            alpha: 1,
            duration: 400,
            ease: 'Power2'
        });
        
        // Wait 1 second, then trigger Burn effect
        this.scene.time.delayedCall(1000, () => {
            // Calculate Burn damage (3 stacks × 2 = 6 damage)
            const burnStacks = 3;
            const burnDamage = burnStacks * 2;
            
            // Find and animate the Burn icon (make it pulse/glow)
            const enemyX = screenWidth * 0.75;
            const enemyY = this.enemySprite.y;
            const enemyScale = this.enemySprite.scale;
            const enemySpriteScaledHeight = this.enemySprite.height * enemyScale;
            const burnIconY = enemyY - (enemySpriteScaledHeight / 2) - 60;
            
            // Find the Burn icon in the container
            const children = this.container.getAll();
            let burnIcon: Phaser.GameObjects.Text | null = null;
            let stackCountText: Phaser.GameObjects.Text | null = null;
            
            for (const child of children) {
                if (child instanceof Phaser.GameObjects.Text && child.text === '🔥') {
                    burnIcon = child;
                } else if (child instanceof Phaser.GameObjects.Text && child.text === '3') {
                    // Check if it's near the burn icon position
                    if (Math.abs(child.y - (burnIconY + 20)) < 5) {
                        stackCountText = child;
                    }
                }
            }
            
            // Animate Burn icon pulsing/glowing
            if (burnIcon) {
                this.scene.tweens.add({
                    targets: burnIcon,
                    scale: 1.5,
                    duration: 300,
                    yoyo: true,
                    repeat: 1,
                    ease: 'Sine.easeInOut'
                });
            }
            
            // Show Burn damage number
            const burnDamageText = this.scene.add.text(enemyX, enemyY, `-${burnDamage}`, {
                fontFamily: 'dungeon-mode',
                fontSize: 32,
                color: '#ff6b6b',
                align: 'center'
            }).setOrigin(0.5);
            this.container.add(burnDamageText);
            
            // Float up and fade out
            this.scene.tweens.add({
                targets: burnDamageText,
                y: enemyY - 60,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => burnDamageText.destroy()
            });
            
            // Update enemy HP
            this.enemyHP = Math.max(0, this.enemyHP - burnDamage);
            this.updateEnemyHP();
            
            // Reduce Burn stacks by 1 (3 → 2)
            this.scene.time.delayedCall(800, () => {
                if (stackCountText) {
                    stackCountText.setText('2');
                    
                    // Animate the stack count change
                    this.scene.tweens.add({
                        targets: stackCountText,
                        scale: 1.3,
                        duration: 200,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }
                
                // Show success message explaining what happened
                this.scene.time.delayedCall(500, () => {
                    // Fade out turn message
                    this.scene.tweens.add({
                        targets: turnMessage,
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => turnMessage.destroy()
                    });
                    
                    // Show success message
                    const successMessage = this.scene.add.text(
                        screenWidth / 2,
                        screenHeight * 0.3,
                        "🔥 Burn triggered!\n\nBurn dealt 6 damage (3 stacks × 2)\nand reduced to 2 stacks.\n\nStatus effects trigger at start of turn!",
                        {
                            fontFamily: 'dungeon-mode',
                            fontSize: 22,
                            color: '#4CAF50',
                            align: 'center',
                            wordWrap: { width: screenWidth * 0.7 }
                        }
                    ).setOrigin(0.5);
                    this.container.add(successMessage);
                    
                    // Fade in success message
                    successMessage.setAlpha(0);
                    this.scene.tweens.add({
                        targets: successMessage,
                        alpha: 1,
                        duration: 400,
                        ease: 'Power2'
                    });
                    
                    // Wait 2500ms before cleanup and transition
                    this.scene.time.delayedCall(2500, () => {
                        // Fade out everything
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 400,
                            ease: 'Power2',
                            onComplete: () => {
                                // Clean up and transition to next phase
                                this.container.removeAll(true);
                                this.onComplete();
                            }
                        });
                    });
                });
            });
        });
    }

    /**
     * Cleanup method to remove event listeners and clean up objects.
     * Called when the phase is being shut down to prevent memory leaks.
     * Removes all event listeners, kills active tweens, and clears containers.
     * Does NOT destroy the container so the phase can be re-entered.
     * 
     * @public
     */
    public shutdown(): void {
        // Remove event listeners
        this.scene.events.off('selectCard', this.onCardSelected, this);
        
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
}
