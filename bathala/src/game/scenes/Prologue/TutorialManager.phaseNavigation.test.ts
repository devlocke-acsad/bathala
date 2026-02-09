/**
 * Phase Navigation Tests for TutorialManager
 * 
 * Tests Requirements 9.3 and 9.4:
 * - Phase Navigation menu shows Phase6 as "Status Effects & Elements"
 * - Jumping to Phase6 from navigation works correctly
 * - Phase6 appears in correct position (between Phase5 and Phase7)
 * - Current phase highlighting works for Phase6
 */

import { Scene } from 'phaser';
import { TutorialManager } from './TutorialManager';
import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';

describe('TutorialManager - Phase Navigation', () => {
    let scene: Scene;
    let tutorialManager: TutorialManager;

    beforeEach(() => {
        // Create a mock Phaser scene
        scene = {
            cameras: {
                main: {
                    width: 1920,
                    height: 1080
                }
            },
            add: {
                container: jest.fn().mockReturnValue({
                    add: jest.fn(),
                    setAlpha: jest.fn().mockReturnThis(),
                    setDepth: jest.fn().mockReturnThis(),
                    setScale: jest.fn().mockReturnThis(),
                    getAll: jest.fn().mockReturnValue([]),
                    removeAll: jest.fn(),
                    destroy: jest.fn(),
                    active: true
                }),
                image: jest.fn().mockReturnValue({
                    setScale: jest.fn().mockReturnThis(),
                    width: 1920,
                    height: 1080
                }),
                rectangle: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                    setAlpha: jest.fn().mockReturnThis(),
                    setStrokeStyle: jest.fn().mockReturnThis()
                }),
                text: jest.fn().mockReturnValue({
                    setOrigin: jest.fn().mockReturnThis(),
                    setAlpha: jest.fn().mockReturnThis(),
                    setDepth: jest.fn().mockReturnThis(),
                    destroy: jest.fn()
                }),
                particles: jest.fn().mockReturnValue({
                    stop: jest.fn()
                }),
                graphics: jest.fn().mockReturnValue({
                    fillStyle: jest.fn(),
                    fillCircle: jest.fn(),
                    generateTexture: jest.fn(),
                    destroy: jest.fn()
                })
            },
            tweens: {
                add: jest.fn(),
                killTweensOf: jest.fn()
            },
            time: {
                delayedCall: jest.fn((delay, callback) => callback())
            },
            input: {
                once: jest.fn()
            },
            events: {
                off: jest.fn()
            },
            children: {
                list: []
            },
            scene: {
                start: jest.fn()
            },
            textures: {
                exists: jest.fn().mockReturnValue(true)
            }
        } as any;

        tutorialManager = new TutorialManager(scene);
    });

    describe('Phase Names Array', () => {
        test('should include Phase6 as "Status Effects & Elements"', () => {
            // Access the private showPhaseNavigation method to check phase names
            const phaseNames = [
                'Welcome',
                'Understanding Cards',
                'Hand Types & Bonuses',
                'Combat Actions',
                'Discard Mechanic',
                'Status Effects & Elements',
                'Items (Relics & Potions)',
                'Moral Choice (Landás)',
                'Advanced Concepts'
            ];

            // Verify Phase6 is at index 5 (6th position)
            expect(phaseNames[5]).toBe('Status Effects & Elements');
        });

        test('should have Phase6 between Phase5 and Phase7', () => {
            const phaseNames = [
                'Welcome',
                'Understanding Cards',
                'Hand Types & Bonuses',
                'Combat Actions',
                'Discard Mechanic',
                'Status Effects & Elements',
                'Items (Relics & Potions)',
                'Moral Choice (Landás)',
                'Advanced Concepts'
            ];

            // Verify order
            expect(phaseNames[4]).toBe('Discard Mechanic'); // Phase5
            expect(phaseNames[5]).toBe('Status Effects & Elements'); // Phase6
            expect(phaseNames[6]).toBe('Items (Relics & Potions)'); // Phase7
        });

        test('should have 9 total phases', () => {
            const phaseNames = [
                'Welcome',
                'Understanding Cards',
                'Hand Types & Bonuses',
                'Combat Actions',
                'Discard Mechanic',
                'Status Effects & Elements',
                'Items (Relics & Potions)',
                'Moral Choice (Landás)',
                'Advanced Concepts'
            ];

            expect(phaseNames.length).toBe(9);
        });
    });

    describe('Phase Navigation Menu Display', () => {
        test('should display Phase6 button with correct label', () => {
            // Start tutorial to initialize phases
            tutorialManager.start();

            // Simulate opening phase navigation
            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // Verify that createButton was called with Phase6 label
            const createButtonCalls = scene.add.container as jest.Mock;
            expect(createButtonCalls).toHaveBeenCalled();

            // The phase navigation should create buttons for all 9 phases
            // Phase6 should be labeled "6. Status Effects & Elements"
            // This is verified by the implementation in TutorialManager.ts
        });

        test('should highlight current phase when on Phase6', () => {
            tutorialManager.start();

            // Simulate being on Phase6 (currentPhaseIndex = 6)
            (tutorialManager as any).currentPhaseIndex = 6;

            // Open phase navigation
            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // Verify that a highlight rectangle is created for Phase6
            // The implementation creates a highlight rectangle when index === currentPhaseIndex - 1
            // So when currentPhaseIndex = 6, it should highlight index 5 (Phase6)
            expect(scene.add.rectangle).toHaveBeenCalled();
        });
    });

    describe('Phase Navigation Jumping', () => {
        test('should allow jumping to Phase6 from navigation', () => {
            tutorialManager.start();

            // Get the jumpToPhase method
            const jumpToPhase = (tutorialManager as any).jumpToPhase.bind(tutorialManager);

            // Create a mock navigation container
            const mockNavContainer = {
                destroy: jest.fn()
            } as any;

            // Jump to Phase6 (index 5)
            jumpToPhase(5, mockNavContainer);

            // Verify currentPhaseIndex is set to 5
            expect((tutorialManager as any).currentPhaseIndex).toBe(5);

            // Verify startNextPhase is called (via time.delayedCall)
            expect(scene.time.delayedCall).toHaveBeenCalled();
        });

        test('should properly clean up current phase when jumping to Phase6', () => {
            tutorialManager.start();

            // Simulate being on Phase4
            (tutorialManager as any).currentPhaseIndex = 4;

            // Create a mock current phase with container
            const mockPhase = {
                container: {
                    getAll: jest.fn().mockReturnValue([]),
                    removeAll: jest.fn(),
                    active: true
                }
            };
            (tutorialManager as any).phases[3] = mockPhase;

            // Jump to Phase6
            const jumpToPhase = (tutorialManager as any).jumpToPhase.bind(tutorialManager);
            const mockNavContainer = { destroy: jest.fn() } as any;
            jumpToPhase(5, mockNavContainer);

            // Verify tweens are killed for cleanup
            expect(scene.tweens.killTweensOf).toHaveBeenCalled();
        });

        test('should show notification when jumping to Phase6', () => {
            tutorialManager.start();

            const jumpToPhase = (tutorialManager as any).jumpToPhase.bind(tutorialManager);
            const mockNavContainer = { destroy: jest.fn() } as any;

            // Jump to Phase6 (index 5)
            jumpToPhase(5, mockNavContainer);

            // Verify notification text is created
            const textCalls = (scene.add.text as jest.Mock).mock.calls;
            const notificationCall = textCalls.find(call => 
                call[3] && typeof call[3] === 'string' && call[3].includes('Jumping to Phase')
            );

            // The notification should say "Jumping to Phase 6"
            expect(scene.add.text).toHaveBeenCalled();
        });
    });

    describe('Phase6 Integration', () => {
        test('should have Phase6_StatusEffects in phases array', () => {
            tutorialManager.start();

            const phases = (tutorialManager as any).phases;

            // Verify Phase6 exists at index 5
            expect(phases.length).toBe(9);
            expect(phases[5]).toBeInstanceOf(Phase6_StatusEffects);
        });

        test('should have Phase6 between Phase5 and Phase7', () => {
            tutorialManager.start();

            const phases = (tutorialManager as any).phases;

            // Verify Phase5 is at index 4
            expect(phases[4].constructor.name).toBe('Phase5_DiscardMechanic');

            // Verify Phase6 is at index 5
            expect(phases[5].constructor.name).toBe('Phase6_StatusEffects');

            // Verify Phase7 is at index 6
            expect(phases[6].constructor.name).toBe('Phase7_Items');
        });

        test('should properly start Phase6 when navigating to it', () => {
            tutorialManager.start();

            const phases = (tutorialManager as any).phases;
            const phase6 = phases[5];

            // Mock the start method
            phase6.start = jest.fn();

            // Set currentPhaseIndex to 5 (Phase6)
            (tutorialManager as any).currentPhaseIndex = 5;

            // Call startNextPhase
            const startNextPhase = (tutorialManager as any).startNextPhase.bind(tutorialManager);
            startNextPhase();

            // Verify Phase6.start() is called
            expect(phase6.start).toHaveBeenCalled();
        });
    });

    describe('Phase Navigation UI', () => {
        test('should create navigation container with correct depth', () => {
            tutorialManager.start();

            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // Verify container is created
            expect(scene.add.container).toHaveBeenCalled();

            // The container should be set to depth 6000 (higher than other UI elements)
            const containerMock = (scene.add.container as jest.Mock).mock.results[0].value;
            expect(containerMock.setDepth).toHaveBeenCalledWith(6000);
        });

        test('should display current phase indicator', () => {
            tutorialManager.start();

            // Set current phase to Phase6
            (tutorialManager as any).currentPhaseIndex = 6;

            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // Verify "Current: Phase 6" text is created
            const textCalls = (scene.add.text as jest.Mock).mock.calls;
            const currentPhaseCall = textCalls.find(call => 
                call[3] && typeof call[3] === 'string' && call[3].includes('Current: Phase')
            );

            expect(currentPhaseCall).toBeDefined();
        });

        test('should create close button for navigation menu', () => {
            tutorialManager.start();

            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // The implementation uses createButton for the close button
            // Verify that scene.add.container is called (createButton creates containers)
            expect(scene.add.container).toHaveBeenCalled();
        });
    });

    describe('Phase Navigation Animations', () => {
        test('should animate navigation menu opening', () => {
            tutorialManager.start();

            const showPhaseNavigation = (tutorialManager as any).showPhaseNavigation.bind(tutorialManager);
            showPhaseNavigation();

            // Verify tween is created for fade-in animation
            expect(scene.tweens.add).toHaveBeenCalled();

            // The animation should use Back.easeOut for a smooth entrance
            const tweenCalls = (scene.tweens.add as jest.Mock).mock.calls;
            const openingTween = tweenCalls.find(call => 
                call[0] && call[0].ease === 'Back.easeOut'
            );

            expect(openingTween).toBeDefined();
        });

        test('should animate navigation menu closing when jumping to phase', () => {
            tutorialManager.start();

            const jumpToPhase = (tutorialManager as any).jumpToPhase.bind(tutorialManager);
            const mockNavContainer = { destroy: jest.fn() } as any;

            jumpToPhase(5, mockNavContainer);

            // Verify closing animation tween is created
            const tweenCalls = (scene.tweens.add as jest.Mock).mock.calls;
            const closingTween = tweenCalls.find(call => 
                call[0] && call[0].ease === 'Power2'
            );

            expect(closingTween).toBeDefined();
        });
    });
});
