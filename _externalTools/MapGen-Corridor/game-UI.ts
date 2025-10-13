// game-UI.ts
// Handles all DOM UI logic for the game, decoupled from GameScene

import { CullingMode } from './viewport-culling';

export class GameUI {
    private infoElement: HTMLElement | null;
    private cullingModeInputs: NodeListOf<HTMLInputElement> | null;
    private fogFocusAreaInput: HTMLInputElement | null;
    private widthInput: HTMLInputElement | null;
    private heightInput: HTMLInputElement | null;
    private regionsInput: HTMLInputElement | null;
    private distanceInput: HTMLInputElement | null;
    
    // Fog of war controls
    private fogOfWarInput: HTMLInputElement | null;
    private clearRadiusInput: HTMLInputElement | null;
    private maxRadiusInput: HTMLInputElement | null;
    private fogIntensityInput: HTMLInputElement | null;
    
    private indicators: { [key: string]: HTMLElement } = {};

    constructor() {
        this.infoElement = document.getElementById('info-text');
        this.cullingModeInputs = document.querySelectorAll('input[name="culling-mode"]');
        this.fogFocusAreaInput = document.getElementById('fog-focus-area') as HTMLInputElement;
        this.widthInput = document.getElementById('width') as HTMLInputElement;
        this.heightInput = document.getElementById('height') as HTMLInputElement;
        this.regionsInput = document.getElementById('regions') as HTMLInputElement;
        this.distanceInput = document.getElementById('distance') as HTMLInputElement;
        
        // Fog of war controls
        this.fogOfWarInput = document.getElementById('fog-of-war') as HTMLInputElement;
        this.clearRadiusInput = document.getElementById('clear-radius') as HTMLInputElement;
        this.maxRadiusInput = document.getElementById('max-radius') as HTMLInputElement;
        this.fogIntensityInput = document.getElementById('fog-intensity') as HTMLInputElement;
        
        this.createDirectionIndicators();
    }

    updateInfo(text: string) {
        if (this.infoElement) {
            this.infoElement.textContent = text;
        }
    }

    setInfoColor(color: string) {
        if (this.infoElement) {
            this.infoElement.style.color = color;
        }
    }

    resetInfoColor() {
        if (this.infoElement) {
            this.infoElement.style.color = '#bdc3c7';
        }
    }

    getCullingMode(): CullingMode {
        if (!this.cullingModeInputs) return CullingMode.VIEWPORT;
        
        if (this.cullingModeInputs) {
            for (let i = 0; i < this.cullingModeInputs.length; i++) {
                const input = this.cullingModeInputs[i];
                if (input.checked) {
                    switch (input.value) {
                        case 'viewport':
                            return CullingMode.VIEWPORT;
                        case 'chunk':
                            return CullingMode.CHUNK;
                        case 'fog-of-war':
                            return CullingMode.FOG_OF_WAR;
                        default:
                            return CullingMode.VIEWPORT;
                    }
                }
            }
        }
        return CullingMode.VIEWPORT; // Default fallback
    }

    // Legacy methods for backward compatibility
    getCullingChecked(): boolean {
        return true; // Always enabled now, just different modes
    }

    getChunkCullingChecked(): boolean {
        return this.getCullingMode() === CullingMode.CHUNK;
    }

    getFogOfWarFocusAreaBuffer(): number {
        return this.fogFocusAreaInput ? parseInt(this.fogFocusAreaInput.value) || 5 : 5;
    }

    // --- Input Value Getters ---
    getWidth(): number {
        return this.widthInput ? parseInt(this.widthInput.value) || 50 : 50;
    }

    getHeight(): number {
        return this.heightInput ? parseInt(this.heightInput.value) || 50 : 50;
    }

    getRegions(): number {
        return this.regionsInput ? parseInt(this.regionsInput.value) || 0 : 0;
    }

    getDistance(): number {
        return this.distanceInput ? parseInt(this.distanceInput.value) || 3 : 3;
    }

    // --- Fog of War Control Getters ---
    getFogOfWarChecked(): boolean {
        return this.fogOfWarInput ? this.fogOfWarInput.checked : true;
    }

    getClearRadius(): number {
        return this.clearRadiusInput ? parseInt(this.clearRadiusInput.value) || 5 : 5;
    }

    getMaxRadius(): number {
        return this.maxRadiusInput ? parseInt(this.maxRadiusInput.value) || 8 : 8;
    }

    getFogIntensity(): number {
        return this.fogIntensityInput ? parseInt(this.fogIntensityInput.value) || 80 : 80;
    }

    // --- Directional Indicators ---
    private createDirectionIndicators() {
        const container = document.getElementById('game-container');
        if (!container) return;
        // Remove old indicators if any
        Object.values(this.indicators).forEach(el => el.remove());
        this.indicators = {};

        // North
        const north = document.createElement('div');
        north.textContent = 'N';
        north.style.position = 'absolute';
        north.style.top = '8px';
        north.style.left = '50%';
        north.style.transform = 'translateX(-50%)';
        north.style.fontSize = '16px';
        north.style.fontWeight = 'bold';
        north.style.color = '#eee';
        north.style.userSelect = 'none';
        north.style.pointerEvents = 'none';
        container.appendChild(north);
        this.indicators['N'] = north;

        // South
        const south = document.createElement('div');
        south.textContent = 'S';
        south.style.position = 'absolute';
        south.style.bottom = '8px';
        south.style.left = '50%';
        south.style.transform = 'translateX(-50%)';
        south.style.fontSize = '16px';
        south.style.fontWeight = 'bold';
        south.style.color = '#eee';
        south.style.userSelect = 'none';
        south.style.pointerEvents = 'none';
        container.appendChild(south);
        this.indicators['S'] = south;

        // East (vertical)
        const east = document.createElement('div');
        east.textContent = 'E';
        east.style.position = 'absolute';
        east.style.top = '50%';
        east.style.right = '8px';
        east.style.transform = 'translateY(-50%) rotate(90deg)';
        east.style.fontSize = '16px';
        east.style.fontWeight = 'bold';
        east.style.color = '#eee';
        east.style.userSelect = 'none';
        east.style.pointerEvents = 'none';
        container.appendChild(east);
        this.indicators['E'] = east;

        // West (vertical)
        const west = document.createElement('div');
        west.textContent = 'W';
        west.style.position = 'absolute';
        west.style.top = '50%';
        west.style.left = '8px';
        west.style.transform = 'translateY(-50%) rotate(90deg)';
        west.style.fontSize = '16px';
        west.style.fontWeight = 'bold';
        west.style.color = '#eee';
        west.style.userSelect = 'none';
        west.style.pointerEvents = 'none';
        container.appendChild(west);
        this.indicators['W'] = west;
    }
}
