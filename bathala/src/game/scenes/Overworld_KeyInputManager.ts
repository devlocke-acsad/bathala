import { Scene } from 'phaser';

/**
 * Overworld_KeyInputManager
 * 
 * Centralizes all keyboard and pointer/mouse input handling for the Overworld scene.
 * Manages:
 * - Movement keys (WASD, Arrow keys)
 * - Action keys (Enter, M for shop, C/E for debug combat)
 * - Debug keys (P for adding actions)
 * - Pointer/mouse tracking for UI interactions
 * 
 * Design: Provides a clean API for checking input states without direct keyboard access
 */
export class Overworld_KeyInputManager {
  private scene: Scene;
  
  // Keyboard inputs
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shopKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private debugActionKey!: Phaser.Input.Keyboard.Key; // P key
  private debugCombatKey!: Phaser.Input.Keyboard.Key; // C key
  private debugEliteKey!: Phaser.Input.Keyboard.Key; // E key
  
  // Pointer tracking
  private pointerPosition: { x: number; y: number } = { x: 0, y: 0 };
  private isPointerTracking: boolean = false;

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   */
  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initialize all keyboard inputs
   */
  initialize(): void {
    if (!this.scene.input || !this.scene.input.keyboard) {
      console.warn("Keyboard input not available");
      return;
    }

    // Arrow keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // WASD keys
    this.wasdKeys = this.scene.input.keyboard.addKeys({
      'W': Phaser.Input.Keyboard.KeyCodes.W,
      'A': Phaser.Input.Keyboard.KeyCodes.A,
      'S': Phaser.Input.Keyboard.KeyCodes.S,
      'D': Phaser.Input.Keyboard.KeyCodes.D
    }) as { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Action keys
    this.shopKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    // Debug keys
    this.debugActionKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.debugCombatKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.debugEliteKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    console.log('✅ KeyInputManager: Initialized');
  }

  /**
   * Initialize pointer/mouse tracking
   * @param enableDebugLogging - Enable debug logging for pointer events
   */
  initializePointerTracking(enableDebugLogging: boolean = false): void {
    this.isPointerTracking = true;
    
    // Track pointer movement
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerPosition = { x: pointer.x, y: pointer.y };
      
      // Occasional debug logging to avoid spam
      if (enableDebugLogging && Math.random() < 0.01) {
        console.log('🖱️ Pointer move:', this.pointerPosition);
      }
    });
    
    // Track pointer down events
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (enableDebugLogging) {
        console.log('🖱️ Pointer down:', { x: pointer.x, y: pointer.y });
      }
    });
    
    console.log('✅ KeyInputManager: Pointer tracking enabled');
  }

  // ============================================================================
  // MOVEMENT INPUT QUERIES
  // ============================================================================

  /**
   * Check if left movement is pressed (A or Left Arrow)
   */
  isLeftPressed(): boolean {
    return this.cursors.left.isDown || this.wasdKeys['A'].isDown;
  }

  /**
   * Check if right movement is pressed (D or Right Arrow)
   */
  isRightPressed(): boolean {
    return this.cursors.right.isDown || this.wasdKeys['D'].isDown;
  }

  /**
   * Check if up movement is pressed (W or Up Arrow)
   */
  isUpPressed(): boolean {
    return this.cursors.up.isDown || this.wasdKeys['W'].isDown;
  }

  /**
   * Check if down movement is pressed (S or Down Arrow)
   */
  isDownPressed(): boolean {
    return this.cursors.down.isDown || this.wasdKeys['S'].isDown;
  }

  // ============================================================================
  // ACTION INPUT QUERIES
  // ============================================================================

  /**
   * Check if Enter key was just pressed (for node interactions)
   */
  isEnterJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.enterKey);
  }

  /**
   * Check if Shop key (M) was just pressed
   */
  isShopKeyJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.shopKey);
  }

  // ============================================================================
  // DEBUG INPUT QUERIES
  // ============================================================================

  /**
   * Check if debug action key (P) was just pressed
   * Used to add 100 actions for testing boss trigger
   */
  isDebugActionKeyJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debugActionKey);
  }

  /**
   * Check if debug combat key (C) was just pressed
   * Used to trigger combat for testing
   */
  isDebugCombatKeyJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debugCombatKey);
  }

  /**
   * Check if debug elite key (E) was just pressed
   * Used to trigger elite combat for testing
   */
  isDebugEliteKeyJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debugEliteKey);
  }

  // ============================================================================
  // POINTER/MOUSE QUERIES
  // ============================================================================

  /**
   * Get current pointer position
   */
  getPointerPosition(): { x: number; y: number } {
    return { ...this.pointerPosition };
  }

  /**
   * Check if pointer tracking is enabled
   */
  isPointerTrackingEnabled(): boolean {
    return this.isPointerTracking;
  }

  // ============================================================================
  // INPUT MANAGEMENT
  // ============================================================================

  /**
   * Enable input processing
   */
  enableInput(): void {
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = true;
      console.log('✅ KeyInputManager: Input enabled');
    }
  }

  /**
   * Disable input processing
   */
  disableInput(): void {
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = false;
      console.log('⏸️ KeyInputManager: Input disabled');
    }
  }

  /**
   * Get raw keyboard object (for special cases)
   * @deprecated Use specific query methods instead
   */
  getRawKeyboard(): Phaser.Input.Keyboard.KeyboardPlugin | null {
    return this.scene.input.keyboard || null;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Clean up resources
   */
  destroy(): void {
    // Remove pointer event listeners
    if (this.isPointerTracking) {
      this.scene.input.off('pointermove');
      this.scene.input.off('pointerdown');
    }
    
    console.log('🧹 KeyInputManager: Cleaned up');
  }
}
