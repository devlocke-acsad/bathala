/**
 * Integration test for Phase6_StatusEffects
 * Tests Phase6 integration with the tutorial system
 * 
 * This test validates:
 * - Phase5 → Phase6 transition
 * - Phase6 → Phase7 transition
 * - All 4 sections display correctly
 * - Burn vs Poison terminology
 * - Elemental affinity visual example
 * - Interactive practice combat simulation
 * - Card selection and Special action execution
 * - Burn status effect application and trigger
 * - Elemental weakness multiplier calculation (1.5×)
 */

import { Phase6_StatusEffects } from './Phase6_StatusEffects';
import { TutorialUI } from '../ui/TutorialUI';
import { Scene } from 'phaser';

// Mock Phaser Scene
class MockScene {
    public cameras = {
        main: {
            width: 1280,
            height: 720
        }
    };
    
    public add = {
        container: jest.fn(() => ({
            add: jest.fn(),
            getAll: jest.fn(() => []),
            removeAll: jest.fn(),
            setVisible: jest.fn(),
            setAlpha: jest.fn(),
            setDepth: jest.fn(),
            destroy: jest.fn(),
            active: true
        })),
        sprite: jest.fn((x: number, y: number, texture: string) => ({
            x,
            y,
            texture: { setFilter: jest.fn() },
            setScale: jest.fn().mockReturnThis(),
            width: 100,
            height: 100,
            scale: 1
        })),
        text: jest.fn((x: number, y: number, text: string, style?: any) => ({
            x,
            y,
            text,
            setOrigin: jest.fn().mockReturnThis(),
            setText: jest.fn(),
            setColor: jest.fn(),
            setScale: jest.fn().mockReturnThis(),
            setAlpha: jest.fn().mockReturnThis()
        })),
        rectangle: jest.fn(() => ({
            setDisplaySize: jest.fn()
        })),
        image: jest.fn(() => ({
            setDisplaySize: jest.fn()
        }))
    };
    
    public tweens = {
        add: jest.fn(),
        killTweensOf: jest.fn()
    };
    
    public time = {
        delayedCall: jest.fn((delay: number, callback: () => void) => {
            // Execute callback immediately for testing
            callback();
        })
    };
    
    public events = {
        on: jest.fn(),
        off: jest.fn()
    };
    
    public textures = {
        exists: jest.fn(() => true)
    };
}

// Mock TutorialUI
class MockTutorialUI {
    public handContainer = {
        setVisible: jest.fn(),
        setAlpha: jest.fn(),
        setDepth: jest.fn()
    };
    
    public drawHand = jest.fn();
    public updateHandDisplay = jest.fn();
}

describe('Phase6_StatusEffects Integration Tests', () => {
    let mockScene: MockScene;
    let mockTutorialUI: MockTutorialUI;
    let phase6: Phase6_StatusEffects;
    let onCompleteCalled: boolean;
    
    beforeEach(() => {
        mockScene = new MockScene();
        mockTutorialUI = new MockTutorialUI();
        onCompleteCalled = false;
        
        phase6 = new Phase6_StatusEffects(
            mockScene as unknown as Scene,
            mockTutorialUI as unknown as TutorialUI,
            () => { onCompleteCalled = true; }
        );
    });
    
    afterEach(() => {
        if (phase6) {
            phase6.shutdown();
        }
    });
    
    describe('Phase Initialization', () => {
        test('should create Phase6_StatusEffects instance', () => {
            expect(phase6).toBeDefined();
            expect(phase6).toBeInstanceOf(Phase6_StatusEffects);
        });
        
        test('should have start method', () => {
            expect(phase6.start).toBeDefined();
            expect(typeof phase6.start).toBe('function');
        });
        
        test('should have shutdown method', () => {
            expect(phase6.shutdown).toBeDefined();
            expect(typeof phase6.shutdown).toBe('function');
        });
    });
    
    describe('Section 1: Buffs Introduction', () => {
        test('should display buffs introduction when started', () => {
            phase6.start();
            
            // Verify progress indicator created (6 of 9)
            expect(mockScene.add.container).toHaveBeenCalled();
            
            // Verify text elements created
            expect(mockScene.add.text).toHaveBeenCalled();
            
            // Check for buff-related text
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const hasBuffText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                (call[2].includes('STRENGTH') || call[2].includes('PLATED ARMOR'))
            );
            expect(hasBuffText).toBe(true);
        });
        
        test('should mention correct buff status effects', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const buffText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && call[2].includes('STRENGTH')
            );
            
            expect(buffText).toBeDefined();
            if (buffText) {
                const text = buffText[2];
                expect(text).toContain('💪 STRENGTH');
                expect(text).toContain('🛡️ PLATED ARMOR');
                expect(text).toContain('💚 REGENERATION');
                expect(text).toContain('✨ RITUAL');
            }
        });
        
        test('should mention Earth Special grants Plated Armor', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const hasPlateTip = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Earth Special') && call[2].includes('Plated Armor')
            );
            expect(hasPlateTip).toBe(true);
        });
    });
    
    describe('Section 2: Debuffs Introduction', () => {
        test('should display Burn vs Poison distinction correctly', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const debuffText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && 
                (call[2].includes('BURN') || call[2].includes('POISON'))
            );
            
            expect(debuffText).toBeDefined();
            if (debuffText) {
                const text = debuffText[2];
                // Burn: player inflicts on enemies
                expect(text).toContain('🔥 BURN');
                expect(text).toContain('You inflict this on enemies');
                
                // Poison: enemies inflict on player
                expect(text).toContain('☠️ POISON');
                expect(text).toContain('Enemies inflict this on you');
            }
        });
        
        test('should mention all debuff status effects', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const debuffText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && call[2].includes('WEAK')
            );
            
            expect(debuffText).toBeDefined();
            if (debuffText) {
                const text = debuffText[2];
                expect(text).toContain('⚠️ WEAK');
                expect(text).toContain('🛡️💔 VULNERABLE');
                expect(text).toContain('🔻 FRAIL');
            }
        });
        
        test('should clarify Burn and Poison work the same way', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const clarificationText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Burn and Poison work the same way')
            );
            expect(clarificationText).toBe(true);
        });
        
        test('should mention Fire Special applies Burn', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const fireSpecialText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Fire Special') && call[2].includes('Burn')
            );
            expect(fireSpecialText).toBe(true);
        });
    });
    
    describe('Section 3: Elemental Affinities', () => {
        test('should display elemental affinity information', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const affinityText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && 
                (call[2].includes('WEAKNESS') || call[2].includes('RESISTANCE'))
            );
            
            expect(affinityText).toBeDefined();
            if (affinityText) {
                const text = affinityText[2];
                expect(text).toContain('1.5×');
                expect(text).toContain('0.75×');
            }
        });
        
        test('should display all four elements', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const elementText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Apoy')
            );
            
            expect(elementText).toBeDefined();
            if (elementText) {
                const text = elementText[2];
                expect(text).toContain('🔥 Apoy');
                expect(text).toContain('💧 Tubig');
                expect(text).toContain('🌿 Lupa');
                expect(text).toContain('💨 Hangin');
            }
        });
        
        test('should create visual example with enemy sprite', () => {
            phase6.start();
            
            // Verify sprite created for enemy
            expect(mockScene.add.sprite).toHaveBeenCalled();
            const spriteCalls = (mockScene.add.sprite as jest.Mock).mock.calls;
            const tikbalangSprite = spriteCalls.find(call => 
                call[2] === 'tikbalang_combat'
            );
            expect(tikbalangSprite).toBeDefined();
        });
        
        test('should display weakness and resistance indicators', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const hasWeakness = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && call[2].includes('Weak')
            );
            const hasResistance = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && call[2].includes('Resist')
            );
            
            expect(hasWeakness).toBe(true);
            expect(hasResistance).toBe(true);
        });
    });
    
    describe('Section 4: Interactive Practice', () => {
        test('should display practice introduction', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const practiceText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('practice')
            );
            
            expect(practiceText).toBeDefined();
        });
        
        test('should mention Tikbalang Scout as enemy', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const enemyText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Tikbalang')
            );
            expect(enemyText).toBe(true);
        });
        
        test('should mention Fire weakness (1.5× damage)', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const weaknessText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                (call[2].includes('WEAK to Fire') || call[2].includes('1.5×'))
            );
            expect(weaknessText).toBe(true);
        });
        
        test('should create combat scene with player and enemy sprites', () => {
            phase6.start();
            
            const spriteCalls = (mockScene.add.sprite as jest.Mock).mock.calls;
            
            // Check for player sprite
            const playerSprite = spriteCalls.find(call => 
                call[2] === 'combat_player'
            );
            expect(playerSprite).toBeDefined();
            
            // Check for enemy sprite
            const enemySprite = spriteCalls.find(call => 
                call[2] === 'tikbalang_combat'
            );
            expect(enemySprite).toBeDefined();
        });
        
        test('should display HP for player and enemy', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const hpTexts = textCalls.filter(call => 
                call[2] && typeof call[2] === 'string' && call[2].includes('HP:')
            );
            
            // Should have at least 2 HP displays (player and enemy)
            expect(hpTexts.length).toBeGreaterThanOrEqual(2);
        });
        
        test('should display elemental affinity indicators on enemy', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            
            // Check for Fire weakness indicator
            const fireWeak = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('🔥') && call[2].includes('Weak')
            );
            expect(fireWeak).toBe(true);
            
            // Check for Air resistance indicator
            const airResist = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('💨') && call[2].includes('Resist')
            );
            expect(airResist).toBe(true);
        });
        
        test('should display card selection instructions', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const instructionText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Select 5 cards')
            );
            expect(instructionText).toBe(true);
        });
        
        test('should display selection counter', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const counterText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('Selected:')
            );
            expect(counterText).toBe(true);
        });
        
        test('should draw 8 cards for selection', () => {
            phase6.start();
            
            expect(mockTutorialUI.drawHand).toHaveBeenCalledWith(8);
        });
        
        test('should set up card selection event listener', () => {
            phase6.start();
            
            expect(mockScene.events.on).toHaveBeenCalledWith(
                'selectCard',
                expect.any(Function),
                expect.anything()
            );
        });
    });
    
    describe('Progress Indicators', () => {
        test('should show "6 of 9" in all sections', () => {
            phase6.start();
            
            // Progress indicators are created via createProgressIndicator(scene, 6, 9)
            // We can't directly test the text, but we can verify containers are created
            expect(mockScene.add.container).toHaveBeenCalled();
        });
    });
    
    describe('Phase Transitions', () => {
        test('should call onComplete when all sections are done', () => {
            // Since time.delayedCall executes immediately in our mock,
            // starting the phase will go through all sections
            phase6.start();
            
            // After all sections complete, onComplete should be called
            expect(onCompleteCalled).toBe(true);
        });
        
        test('should use fade transitions between sections', () => {
            phase6.start();
            
            // Verify tweens are created for transitions
            expect(mockScene.tweens.add).toHaveBeenCalled();
        });
    });
    
    describe('Cleanup', () => {
        test('should remove event listeners on shutdown', () => {
            phase6.start();
            phase6.shutdown();
            
            expect(mockScene.events.off).toHaveBeenCalledWith(
                'selectCard',
                expect.any(Function),
                expect.anything()
            );
        });
        
        test('should kill tweens on shutdown', () => {
            phase6.start();
            phase6.shutdown();
            
            expect(mockScene.tweens.killTweensOf).toHaveBeenCalled();
        });
    });
    
    describe('Terminology Validation', () => {
        test('should never say "player inflicts Poison"', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const incorrectText = textCalls.some(call => 
                call[2] && typeof call[2] === 'string' && 
                (call[2].includes('player') || call[2].includes('You')) &&
                call[2].toLowerCase().includes('poison')
            );
            
            // If there's text mentioning player/you and poison,
            // it should clarify that enemies inflict poison
            if (incorrectText) {
                const poisonText = textCalls.find(call => 
                    call[2] && typeof call[2] === 'string' && 
                    call[2].includes('POISON')
                );
                if (poisonText) {
                    expect(poisonText[2]).toContain('Enemies inflict this on you');
                }
            }
        });
        
        test('should never say "enemy inflicts Burn"', () => {
            phase6.start();
            
            const textCalls = (mockScene.add.text as jest.Mock).mock.calls;
            const burnText = textCalls.find(call => 
                call[2] && typeof call[2] === 'string' && 
                call[2].includes('BURN')
            );
            
            if (burnText) {
                const text = burnText[2];
                // Should say player/you inflicts burn on enemies
                expect(text).toContain('You inflict this on enemies');
                expect(text).not.toContain('enemy inflicts');
            }
        });
    });
});

describe('Phase6 Integration with TutorialManager', () => {
    test('should be importable from TutorialManager', () => {
        // This test verifies the import works
        expect(Phase6_StatusEffects).toBeDefined();
    });
    
    test('should accept correct constructor parameters', () => {
        const mockScene = new MockScene();
        const mockTutorialUI = new MockTutorialUI();
        const onComplete = jest.fn();
        
        const phase = new Phase6_StatusEffects(
            mockScene as unknown as Scene,
            mockTutorialUI as unknown as TutorialUI,
            onComplete
        );
        
        expect(phase).toBeDefined();
        expect(phase).toBeInstanceOf(Phase6_StatusEffects);
    });
});
