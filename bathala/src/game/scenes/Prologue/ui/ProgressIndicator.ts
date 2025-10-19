import { Scene } from 'phaser';

/**
 * Creates an elegant progress indicator for the tutorial
 * @param scene - The Phaser scene
 * @param currentPhase - Current phase number (1-11)
 * @param totalPhases - Total number of phases (11)
 * @returns A container with the progress indicator
 */
export function createProgressIndicator(
    scene: Scene, 
    currentPhase: number, 
    totalPhases: number = 11
): Phaser.GameObjects.Container {
    const { width } = scene.cameras.main;
    const container = scene.add.container(width / 2, 50);

    // Background bar
    const barWidth = 400;
    const barHeight = 8;
    
    const barBg = scene.add.rectangle(0, 0, barWidth, barHeight, 0x2A2A2A, 0.8);
    const barBgBorder = scene.add.rectangle(0, 0, barWidth + 4, barHeight + 4, undefined, 0)
        .setStrokeStyle(2, 0x556065);
    
    // Progress fill with gradient effect
    const progressWidth = (currentPhase / totalPhases) * barWidth;
    const progressBar = scene.add.rectangle(-barWidth/2, 0, 0, barHeight, 0x77888C)
        .setOrigin(0, 0.5);
    
    // Glow for progress bar
    const progressGlow = scene.add.rectangle(-barWidth/2, 0, 0, barHeight + 6, 0x99A0A5, 0.4)
        .setOrigin(0, 0.5)
        .setBlendMode(Phaser.BlendModes.ADD);

    // Animate progress bar fill
    scene.tweens.add({
        targets: [progressBar, progressGlow],
        width: progressWidth,
        duration: 800,
        ease: 'Power2.easeOut'
    });

    // Phase dots
    const dotContainer = scene.add.container(0, 25);
    const dotSpacing = barWidth / (totalPhases - 1);
    const startX = -barWidth / 2;

    for (let i = 0; i < totalPhases; i++) {
        const x = startX + (i * dotSpacing);
        const isComplete = i < currentPhase;
        const isCurrent = i === currentPhase - 1;
        
        // Dot background
        const dotBg = scene.add.circle(x, 0, isCurrent ? 8 : 6, 0x2A2A2A);
        
        // Dot fill
        const dotColor = isComplete || isCurrent ? 0x77888C : 0x3A3A3A;
        const dot = scene.add.circle(x, 0, isCurrent ? 6 : 4, dotColor);
        
        // Add glow to current dot
        if (isCurrent) {
            const dotGlow = scene.add.circle(x, 0, 10, 0x99A0A5, 0.3)
                .setBlendMode(Phaser.BlendModes.ADD);
            dotContainer.add(dotGlow);
            
            // Pulse animation for current dot
            scene.tweens.add({
                targets: dotGlow,
                alpha: 0.6,
                scale: 1.2,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        dotContainer.add([dotBg, dot]);
    }

    // Phase text
    const phaseText = scene.add.text(0, -25, `Phase ${currentPhase} of ${totalPhases}`, {
        fontFamily: 'dungeon-mode',
        fontSize: 18,
        color: '#99A0A5',
        align: 'center'
    }).setOrigin(0.5);

    container.add([barBgBorder, barBg, progressGlow, progressBar, dotContainer, phaseText]);
    container.setDepth(1500);
    container.setAlpha(0);

    // Fade in animation
    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 600,
        ease: 'Power2'
    });

    return container;
}

/**
 * Updates an existing progress indicator
 */
export function updateProgressIndicator(
    container: Phaser.GameObjects.Container,
    newPhase: number,
    totalPhases: number = 11
): void {
    if (!container || !container.active) return;

    const scene = container.scene;
    
    // Fade out and recreate
    scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            const position = { x: container.x, y: container.y };
            container.destroy();
            const newIndicator = createProgressIndicator(scene, newPhase, totalPhases);
            newIndicator.setPosition(position.x, position.y);
        }
    });
}
