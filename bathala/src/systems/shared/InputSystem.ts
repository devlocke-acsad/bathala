import { Scene } from 'phaser';

/**
 * InputSystem
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
export class InputSystem {
  private scene: Scene;
  
  // Keyboard inputs
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shopKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private debugActionKey!: Phaser.Input.Keyboard.Key; // P key
  private debugCombatKey!: Phaser.Input.Keyboard.Key; // C key
  private debugEliteKey!: Phaser.Input.Keyboard.Key; // E key

  // Virtual directional inputs (touch controls)
  private virtualDirections: Record<'left' | 'right' | 'up' | 'down', boolean> = {
    left: false,
    right: false,
    up: false,
    down: false
  };
  
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
    
    console.log('✅ InputSystem: Initialized');
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
    
    console.log('✅ InputSystem: Pointer tracking enabled');
  }

  // ============================================================================
  // MOVEMENT INPUT QUERIES
  // ============================================================================

  /**
   * Check if left movement is pressed (A or Left Arrow)
   */
  isLeftPressed(): boolean {
    const keyboardPressed = !!(this.cursors?.left?.isDown || this.wasdKeys?.['A']?.isDown);
    return keyboardPressed || this.virtualDirections.left;
  }

  /**
   * Check if right movement is pressed (D or Right Arrow)
   */
  isRightPressed(): boolean {
    const keyboardPressed = !!(this.cursors?.right?.isDown || this.wasdKeys?.['D']?.isDown);
    return keyboardPressed || this.virtualDirections.right;
  }

  /**
   * Check if up movement is pressed (W or Up Arrow)
   */
  isUpPressed(): boolean {
    const keyboardPressed = !!(this.cursors?.up?.isDown || this.wasdKeys?.['W']?.isDown);
    return keyboardPressed || this.virtualDirections.up;
  }

  /**
   * Check if down movement is pressed (S or Down Arrow)
   */
  isDownPressed(): boolean {
    const keyboardPressed = !!(this.cursors?.down?.isDown || this.wasdKeys?.['S']?.isDown);
    return keyboardPressed || this.virtualDirections.down;
  }

  // ============================================================================
  // ACTION INPUT QUERIES
  // ============================================================================

  /**
   * Check if Enter key was just pressed (for node interactions)
   */
  isEnterJustPressed(): boolean {
    if (!this.enterKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.enterKey);
  }

  /**
   * Check if Shop key (M) was just pressed
   */
  isShopKeyJustPressed(): boolean {
    if (!this.shopKey) {
      return false;
    }
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
    if (!this.debugActionKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.debugActionKey);
  }

  /**
   * Check if debug combat key (C) was just pressed
   * Used to trigger combat for testing
   */
  isDebugCombatKeyJustPressed(): boolean {
    if (!this.debugCombatKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.debugCombatKey);
  }

  /**
   * Check if debug elite key (E) was just pressed
   * Used to trigger elite combat for testing
   */
  isDebugEliteKeyJustPressed(): boolean {
    if (!this.debugEliteKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.debugEliteKey);
  }

  /**
   * Set a virtual direction pressed state (for touch controls).
   */
  setVirtualDirection(direction: 'left' | 'right' | 'up' | 'down', pressed: boolean): void {
    this.virtualDirections[direction] = pressed;
  }

  /**
   * Clears all virtual directional states.
   */
  resetVirtualDirections(): void {
    this.virtualDirections.left = false;
    this.virtualDirections.right = false;
    this.virtualDirections.up = false;
    this.virtualDirections.down = false;
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
      console.log('✅ InputSystem: Input enabled');
    }
  }

  /**
   * Disable input processing
   */
  disableInput(): void {
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = false;
      console.log('⏸️ InputSystem: Input disabled');
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

    this.resetVirtualDirections();
    
    console.log('🧹 InputSystem: Cleaned up');
  }
}
