import { Scene } from 'phaser';

export function showDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);
    
    const outerBorder = scene.add.rectangle(0, 0, scene.cameras.main.width * 0.8 + 8, 128, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = scene.add.rectangle(0, 0, scene.cameras.main.width * 0.8, 120, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = scene.add.rectangle(0, 0, scene.cameras.main.width * 0.8, 120, 0x150E10).setInteractive();
    
    const dialogueText = scene.add.text(0, 0, '', { 
        fontFamily: 'dungeon-mode', 
        fontSize: 22, 
        color: '#77888C', 
        align: 'center', 
        wordWrap: { width: scene.cameras.main.width * 0.75 } 
    }).setOrigin(0.5);
    
    const continueIndicator = scene.add.text(bg.width/2 - 40, bg.height/2 - 20, '▼', { 
        fontFamily: 'dungeon-mode',
        fontSize: 20, 
        color: '#77888C' 
    }).setOrigin(0.5).setVisible(false);
    
    dialogueContainer.add([outerBorder, innerBorder, bg, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(2000);
    
    dialogueContainer.setAlpha(0);
    scene.tweens.add({ targets: dialogueContainer, alpha: 1, duration: 400, ease: 'Power2' });
    
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
                delay: 30,
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
        continueIndicator.setVisible(true);
        scene.tweens.add({ targets: continueIndicator, y: '+=8', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    
    bg.on('pointerdown', () => {
        if (!typingComplete) {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            dialogueText.setText(text);
            typingComplete = true;
            continueIndicator.setVisible(true);
            scene.tweens.add({ targets: continueIndicator, y: '+=8', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        } else {
            if (typingTimer) typingTimer.remove();
            scene.tweens.killTweensOf(continueIndicator);
            bg.removeAllListeners('pointerdown');
            scene.tweens.add({ targets: dialogueContainer, alpha: 0, duration: 300, ease: 'Power2', onComplete: () => { dialogueContainer.destroy(); onComplete(); } });
        }
    });

    return dialogueContainer;
}
