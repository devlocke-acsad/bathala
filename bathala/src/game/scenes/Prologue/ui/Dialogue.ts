import { Scene } from 'phaser';

export function showDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);

    const dialogueText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 24,
        color: '#E8E8E8',
        align: 'center',
        wordWrap: { width: scene.cameras.main.width * 0.7 },
        lineSpacing: 8
    }).setOrigin(0.5);

    const textHeight = dialogueText.getBounds().height;
    const boxWidth = scene.cameras.main.width * 0.75;
    const boxHeight = textHeight + 80;

    // Glow effect (outer shadow)
    const glowOuter = scene.add.rectangle(0, 0, boxWidth + 20, boxHeight + 20, 0x77888C, 0.15);
    glowOuter.setBlendMode(Phaser.BlendModes.ADD);
    
    // Subtle inner glow
    const glowInner = scene.add.rectangle(0, 0, boxWidth + 12, boxHeight + 12, 0xAAAAAA, 0.1);
    glowInner.setBlendMode(Phaser.BlendModes.ADD);

    // Triple border for depth
    const outerBorder = scene.add.rectangle(0, 0, boxWidth + 8, boxHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x99A0A5);
    const middleBorder = scene.add.rectangle(0, 0, boxWidth + 4, boxHeight + 4, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
    const innerBorder = scene.add.rectangle(0, 0, boxWidth, boxHeight, undefined, 0)
        .setStrokeStyle(2, 0x556065);

    // Background with subtle gradient effect (simulated with overlays)
    const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x1A1215).setInteractive();
    const bgGradient = scene.add.rectangle(0, -boxHeight * 0.3, boxWidth, boxHeight * 0.4, 0x2A1E25, 0.6);

    dialogueText.setText(''); // Clear text for typing effect

    // Enhanced continue indicator with pulsing effect
    const continueIndicator = scene.add.text(boxWidth/2 - 50, boxHeight/2 - 30, '▼ Click to Continue', {
        fontFamily: 'dungeon-mode',
        fontSize: 18,
        color: '#99A0A5'
    }).setOrigin(0.5).setVisible(false);

    dialogueContainer.add([glowOuter, glowInner, outerBorder, middleBorder, bg, bgGradient, innerBorder, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(2000);

    // Fade in with scale animation
    dialogueContainer.setAlpha(0).setScale(0.95);
    scene.tweens.add({ 
        targets: dialogueContainer, 
        alpha: 1, 
        scale: 1,
        duration: 500, 
        ease: 'Back.easeOut'
    });

    let typingComplete = false;
    let typingTimer: Phaser.Time.TimerEvent | null = null;

    const typeText = (textObject: Phaser.GameObjects.Text, text: string): Promise<void> => {
        if (typingTimer) typingTimer.remove();
        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }
            textObject.setText('');
            let charIndex = 0;
            typingTimer = scene.time.addEvent({
                delay: 25, // Slightly faster typing
                callback: () => {
                    if (!textObject || !textObject.active) {
                        if (typingTimer) {
                            typingTimer.remove();
                            typingTimer = null;
                        }
                        resolve();
                        return;
                    }
                    const currentText = textObject.text || '';
                    textObject.setText(currentText + text[charIndex++]);
                    if (charIndex === text.length) {
                        typingTimer = null;
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }

    typeText(dialogueText, text).then(() => {
        typingComplete = true;
        continueIndicator.setVisible(true).setAlpha(0);
        scene.tweens.add({ 
            targets: continueIndicator, 
            alpha: 1,
            y: '+=10', 
            duration: 800, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
    });

    bg.on('pointerdown', () => {
        if (!typingComplete) {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            dialogueText.setText(text);
            typingComplete = true;
            continueIndicator.setVisible(true).setAlpha(0);
            scene.tweens.add({ 
                targets: continueIndicator, 
                alpha: 1,
                y: '+=10', 
                duration: 800, 
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' 
            });
        } else {
            if (typingTimer) typingTimer.remove();
            scene.tweens.killTweensOf(continueIndicator);
            bg.removeAllListeners('pointerdown');
            scene.tweens.add({ 
                targets: dialogueContainer, 
                alpha: 0,
                scale: 0.95,
                duration: 400, 
                ease: 'Power2', 
                onComplete: () => { 
                    dialogueContainer.destroy(); 
                    onComplete(); 
                } 
            });
        }
    });

    return dialogueContainer;
}
