import * as Phaser from 'phaser';
import { GameScene } from './game-scene';
import { CullingMode } from './viewport-culling';

/*
  Entry Point (main.ts)
  ---------------------
  Responsibility: Boot the Phaser game instance, wire basic DOM UI controls to the
  active scene, and perform lightweight UX concerns (button disabling, resize).

  High-level call chain when the user clicks "Generate Level":
    1. User clicks #generate-btn (DOM) -> click handler here.
    2. Handler calls GameScene.onGenerateButtonClick().
    3. GameScene.onGenerateButtonClick() collects input values and calls GameScene.generateLevel().
    4. GameScene.generateLevel() updates generator settings and calls HeIsComingGenerator.generateLayout().
    5. HeIsComingGenerator.generateLayout():
         - generateRegionPoints()
         - Delaunay triangulation -> edges
         - A* path carving across edges (findPath + findPathSegment)
         - fixDoubleWidePaths()
         - analyzeAndFixDeadEnds() (external deadend-analyzer.ts pipeline)
         - returns IntGrid
    6. GameScene stores IntGrid, draws grid (drawGrid()), updates info text.

  Variables in this file:
    config      : Phaser.GameConfig object passed to Phaser.Game constructor.
    game        : The Phaser.Game instance (engine + scenes + rendering loop).
    gameScene   : Reference to the active GameScene (obtained after scene boot).

  Why setTimeout() for scene retrieval?
    Phaser asynchronously boots and adds scenes; a short delay ensures the scene
    is created before we attempt to grab it. Alternative would be to listen for
    Phaser events (e.g., scene events) but this lightweight approach suffices here.
*/

// Phaser game configuration (fills the entire browser viewport)
// Tunable timing & UX constants
const SCENE_BOOT_DELAY_MS = 100;   // Delay before grabbing scene reference.
const GENERATION_DEFER_MS = 10;    // Short defer to let UI repaint before heavy work.
const BG_COLOR = '#2c3e50';        // Game background color (also referenced in config).
const BTN_TEXT_IDLE = 'Generate Level';
const BTN_TEXT_BUSY = 'Generating...';
const INFO_COLOR_NORMAL = '#bdc3c7';
const INFO_COLOR_ERROR = '#e74c3c';

const config: Phaser.GameConfig = {
    type: Phaser.AUTO,                 // Let Phaser pick WebGL or Canvas
    width: window.innerWidth,          // Initial width = current window
    height: window.innerHeight,        // Initial height = current window
    parent: 'game-container',          // DOM element that hosts the <canvas>
    backgroundColor: BG_COLOR,          // Dark slate style background
    scene: [GameScene]                 // Array so we can extend with more scenes later
};

// Create the Phaser runtime (constructs renderer, boot process, etc.)
const game = new Phaser.Game(config);

// Will hold the actual scene instance after Phaser has booted it.
let gameScene: GameScene;

// Defer until the scene is guaranteed to exist; small delay is adequate here.
setTimeout(() => {
    gameScene = game.scene.getScene('GameScene') as unknown as GameScene;
    setupUI();
}, SCENE_BOOT_DELAY_MS);

/**
 * setupUI()
 * Binds DOM controls to scene methods. Keeps DOM logic separated from scene/game logic.
 */
function setupUI(): void {
    const generateButton = document.getElementById('generate-btn');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            if (!gameScene) return; // Defensive; scene not ready yet.

            // Optimistic UI lock: prevent double clicks / rapid spamming.
            generateButton.setAttribute('disabled', 'true');
            generateButton.textContent = BTN_TEXT_BUSY;

            // Neutralize prior error color if any.
            const infoElement = document.getElementById('info-text');
            if (infoElement) {
                infoElement.style.color = INFO_COLOR_NORMAL;
            }

            // Small timeout ensures repaint before heavy generation (avoid perceived freeze).
            setTimeout(() => {
                try {
                    gameScene.onGenerateButtonClick();
                } catch (error) {
                    console.error('Generation error:', error);
                    if (infoElement) {
                        infoElement.textContent = 'Generation failed. Please try different settings.';
                        infoElement.style.color = INFO_COLOR_ERROR;
                    }
                } finally {
                    // Always restore button state.
                    generateButton.removeAttribute('disabled');
                    generateButton.textContent = BTN_TEXT_IDLE;
                }
            }, GENERATION_DEFER_MS);
        });
    }

    // Culling mode radio buttons: handle culling mode changes
    const cullingModeInputs = document.querySelectorAll('input[name="culling-mode"]');
    cullingModeInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (gameScene && input instanceof HTMLInputElement && input.checked) {
                let mode: string = input.value;
                // Convert string to CullingMode enum
                if (mode === 'viewport') {
                    gameScene.onCullingModeChange(CullingMode.VIEWPORT);
                } else if (mode === 'chunk') {
                    gameScene.onCullingModeChange(CullingMode.CHUNK);
                } else if (mode === 'fog-of-war') {
                    gameScene.onCullingModeChange(CullingMode.FOG_OF_WAR);
                }
            }
        });
    });

    // Fog-of-war focus area buffer: update when changed
    const fogFocusAreaInput = document.getElementById('fog-focus-area');
    if (fogFocusAreaInput) {
        fogFocusAreaInput.addEventListener('input', () => {
            if (gameScene) {
                gameScene.onFogOfWarFocusAreaChange();
            }
        });
    }

    // Fog of war checkbox: toggles visibility effects
    const fogOfWarCheckbox = document.getElementById('fog-of-war');
    if (fogOfWarCheckbox) {
        fogOfWarCheckbox.addEventListener('change', () => {
            if (gameScene) {
                gameScene.onFogOfWarToggle();
            }
        });
    }

    // Visibility settings: update when changed
    const clearRadiusInput = document.getElementById('clear-radius');
    const maxRadiusInput = document.getElementById('max-radius');
    const fogIntensityInput = document.getElementById('fog-intensity');
    
    if (clearRadiusInput) {
        clearRadiusInput.addEventListener('input', () => {
            if (gameScene) {
                gameScene.onVisibilitySettingsChange();
            }
        });
    }
    
    if (maxRadiusInput) {
        maxRadiusInput.addEventListener('input', () => {
            if (gameScene) {
                gameScene.onVisibilitySettingsChange();
            }
        });
    }
    
    if (fogIntensityInput) {
        fogIntensityInput.addEventListener('input', () => {
            if (gameScene) {
                gameScene.onVisibilitySettingsChange();
            }
        });
    }

    // Keep Phaser canvas sized to window (simple responsive behavior).
    window.addEventListener('resize', () => {
        if (game.scale && game.scale.resize) {
            game.scale.resize(window.innerWidth, window.innerHeight);
        }
    });
}

// Expose for quick debugging / experimentation in browser dev tools.
(window as any).game = game;