/**
 * Manual Integration Test for Phase Navigation
 * 
 * This test verifies Requirements 9.3 and 9.4 by checking the actual implementation
 * in TutorialManager.ts without requiring a full Phaser environment.
 * 
 * Requirements:
 * - 9.3: Phase Navigation menu shows Phase6 as "Status Effects & Elements"
 * - 9.4: Jumping to Phase6 from navigation works correctly
 * - Phase6 appears in correct position (between Phase5 and Phase7)
 * - Current phase highlighting works for Phase6
 */

import * as fs from 'fs';
import * as path from 'path';

describe('TutorialManager - Phase Navigation (Manual Verification)', () => {
    let tutorialManagerSource: string;

    beforeAll(() => {
        // Read the TutorialManager source code
        const filePath = path.join(__dirname, 'TutorialManager.ts');
        tutorialManagerSource = fs.readFileSync(filePath, 'utf-8');
    });

    describe('Requirement 9.3: Phase Navigation Menu', () => {
        test('should have Phase6 import statement uncommented', () => {
            // Verify Phase6_StatusEffects is imported
            expect(tutorialManagerSource).toContain("import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';");
            
            // Verify it's not commented out
            expect(tutorialManagerSource).not.toContain("// import { Phase6_StatusEffects }");
        });

        test('should include Phase6 in phases array', () => {
            // Verify Phase6_StatusEffects is instantiated in phases array
            expect(tutorialManagerSource).toContain('new Phase6_StatusEffects(this.scene, tutorialUI, this.startNextPhase.bind(this))');
        });

        test('should have "Status Effects & Elements" in phaseNames array', () => {
            // Verify the phase name is correct
            expect(tutorialManagerSource).toContain("'Status Effects & Elements'");
        });

        test('should have Phase6 between Phase5 and Phase7 in phaseNames', () => {
            // Extract the phaseNames array
            const phaseNamesMatch = tutorialManagerSource.match(/const phaseNames = \[([\s\S]*?)\];/);
            expect(phaseNamesMatch).toBeTruthy();

            if (phaseNamesMatch) {
                const phaseNamesContent = phaseNamesMatch[1];
                const phaseNames = phaseNamesContent
                    .split(',')
                    .map(name => name.trim().replace(/'/g, ''))
                    .filter(name => name.length > 0);

                // Verify order
                expect(phaseNames[4]).toBe('Discard Mechanic'); // Phase5
                expect(phaseNames[5]).toBe('Status Effects & Elements'); // Phase6
                expect(phaseNames[6]).toBe('Items (Relics & Potions)'); // Phase7
            }
        });

        test('should have 9 total phases in phaseNames array', () => {
            const phaseNamesMatch = tutorialManagerSource.match(/const phaseNames = \[([\s\S]*?)\];/);
            expect(phaseNamesMatch).toBeTruthy();

            if (phaseNamesMatch) {
                const phaseNamesContent = phaseNamesMatch[1];
                const phaseNames = phaseNamesContent
                    .split(',')
                    .map(name => name.trim().replace(/'/g, ''))
                    .filter(name => name.length > 0);

                expect(phaseNames.length).toBe(9);
            }
        });
    });

    describe('Requirement 9.4: Phase Navigation Jumping', () => {
        test('should have jumpToPhase method', () => {
            // Verify jumpToPhase method exists
            expect(tutorialManagerSource).toContain('private jumpToPhase(phaseIndex: number');
        });

        test('should set currentPhaseIndex when jumping', () => {
            // Verify the method sets currentPhaseIndex
            const jumpToPhaseMatch = tutorialManagerSource.match(/private jumpToPhase\([\s\S]*?\{([\s\S]*?)\n    \}/);
            expect(jumpToPhaseMatch).toBeTruthy();

            if (jumpToPhaseMatch) {
                const methodBody = jumpToPhaseMatch[1];
                expect(methodBody).toContain('this.currentPhaseIndex = phaseIndex');
            }
        });

        test('should call startNextPhase after jumping', () => {
            const jumpToPhaseMatch = tutorialManagerSource.match(/private jumpToPhase\([\s\S]*?\{([\s\S]*?)\n    \}/);
            expect(jumpToPhaseMatch).toBeTruthy();

            if (jumpToPhaseMatch) {
                const methodBody = jumpToPhaseMatch[1];
                expect(methodBody).toContain('this.startNextPhase()');
            }
        });

        test('should clean up current phase before jumping', () => {
            const jumpToPhaseMatch = tutorialManagerSource.match(/private jumpToPhase\([\s\S]*?\{([\s\S]*?)\n    \}/);
            expect(jumpToPhaseMatch).toBeTruthy();

            if (jumpToPhaseMatch) {
                const methodBody = jumpToPhaseMatch[1];
                // Should kill tweens for cleanup
                expect(methodBody).toContain('killTweensOf');
            }
        });
    });

    describe('Phase6 Position in Phases Array', () => {
        test('should have Phase6 between Phase5 and Phase7 in phases array', () => {
            // Extract the phases array initialization
            const phasesMatch = tutorialManagerSource.match(/this\.phases = \[([\s\S]*?)\];/);
            expect(phasesMatch).toBeTruthy();

            if (phasesMatch) {
                const phasesContent = phasesMatch[1];
                const phases = phasesContent
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('new Phase'));

                // Verify Phase5 is at index 4
                expect(phases[4]).toContain('Phase5_DiscardMechanic');

                // Verify Phase6 is at index 5
                expect(phases[5]).toContain('Phase6_StatusEffects');

                // Verify Phase7 is at index 6
                expect(phases[6]).toContain('Phase7_Items');
            }
        });

        test('should have 9 total phases in phases array', () => {
            const phasesMatch = tutorialManagerSource.match(/this\.phases = \[([\s\S]*?)\];/);
            expect(phasesMatch).toBeTruthy();

            if (phasesMatch) {
                const phasesContent = phasesMatch[1];
                const phases = phasesContent
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('new Phase'));

                expect(phases.length).toBe(9);
            }
        });
    });

    describe('Current Phase Highlighting', () => {
        test('should create highlight rectangle for current phase', () => {
            // Verify showPhaseNavigation creates a highlight for current phase
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should check if index === currentPhaseIndex - 1
                expect(methodBody).toContain('index === this.currentPhaseIndex - 1');
                
                // Should create a highlight rectangle
                expect(methodBody).toContain('const highlight = this.scene.add.rectangle');
            }
        });

        test('should use correct color for highlight', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should use a visible color (0xFFAA00 is the highlight color)
                expect(methodBody).toContain('0xFFAA00');
            }
        });
    });

    describe('Phase Navigation Button Creation', () => {
        test('should create button for each phase', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should iterate through phaseNames
                expect(methodBody).toContain('phaseNames.forEach');
                
                // Should create a button for each phase
                expect(methodBody).toContain('createButton');
            }
        });

        test('should format button label with phase number and name', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Button label should be formatted as "X. Phase Name"
                expect(methodBody).toContain('`${index + 1}. ${phaseName}`');
            }
        });

        test('should call jumpToPhase when button is clicked', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Button callback should call jumpToPhase
                expect(methodBody).toContain('this.jumpToPhase(index, navContainer)');
            }
        });
    });

    describe('Phase Navigation UI Elements', () => {
        test('should display current phase indicator', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should show "Current: Phase X"
                expect(methodBody).toContain('Current: Phase');
                expect(methodBody).toContain('this.currentPhaseIndex');
            }
        });

        test('should have close button', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should have a close button
                expect(methodBody).toContain("'Close'");
            }
        });

        test('should set navigation container to high depth', () => {
            const showPhaseNavigationMatch = tutorialManagerSource.match(/private showPhaseNavigation\(\)([\s\S]*?)private jumpToPhase/);
            expect(showPhaseNavigationMatch).toBeTruthy();

            if (showPhaseNavigationMatch) {
                const methodBody = showPhaseNavigationMatch[1];
                
                // Should set depth to 6000 (higher than other UI)
                expect(methodBody).toContain('setDepth(6000)');
            }
        });
    });

    describe('Integration Summary', () => {
        test('should have all required components for Phase6 navigation', () => {
            // Summary check: all key components are present
            const checks = [
                tutorialManagerSource.includes("import { Phase6_StatusEffects }"),
                tutorialManagerSource.includes("new Phase6_StatusEffects"),
                tutorialManagerSource.includes("'Status Effects & Elements'"),
                tutorialManagerSource.includes("private jumpToPhase"),
                tutorialManagerSource.includes("private showPhaseNavigation"),
                tutorialManagerSource.includes("index === this.currentPhaseIndex - 1")
            ];

            // All checks should pass
            expect(checks.every(check => check === true)).toBe(true);
        });
    });
});
