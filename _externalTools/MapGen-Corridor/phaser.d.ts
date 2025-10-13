declare module 'phaser' {
    export = Phaser;
}

declare namespace Phaser {
    export class Scene {
        add: GameObjects.GameObjectFactory;
        input: Input.InputPlugin;
        cameras: Cameras.Scene2D.CameraManager;
        scale: Scale.ScaleManager;
        
        constructor(config?: string | Phaser.Types.Scenes.SettingsConfig);
        create?(): void;
    }

    export namespace GameObjects {
        export class Graphics {
            clear(): this;
            fillStyle(color: number, alpha?: number): this;
            fillRect(x: number, y: number, width: number, height: number): this;
            lineStyle(lineWidth: number, color: number, alpha?: number): this;
            strokeRect(x: number, y: number, width: number, height: number): this;
        }

        export class GameObjectFactory {
            graphics(): Graphics;
        }
    }

    export namespace Input {
        export class InputPlugin {
            on(event: string, fn: Function, context?: any): this;
            off(event: string, fn?: Function, context?: any): this;
        }

        export class Pointer {
            x: number;
            y: number;
            isDown: boolean;
            leftButtonDown(): boolean;
            prevPosition: { x: number; y: number };
        }
    }

    export namespace Cameras.Scene2D {
        export class CameraManager {
            main: Camera;
        }

        export class Camera {
            zoom: number;
            scrollX: number;
            scrollY: number;
            setZoom(zoom: number): this;
            setBounds(x: number, y: number, width: number, height: number): this;
        }
    }

    export namespace Scale {
        export class ScaleManager {
            width: number;
            height: number;
            resize(width: number, height: number): void;
        }
        export const RESIZE: number;
        export const CENTER_BOTH: number;
    }

    export namespace Math {
        export function Clamp(value: number, min: number, max: number): number;
    }

    export namespace Types.Scenes {
        export interface SettingsConfig {
            key?: string;
        }
    }

    export class Game {
        scale: Scale.ScaleManager;
        scene: Scenes.SceneManager;
        events: Events.EventEmitter;
        
        constructor(config: GameConfig);
        pause(): void;
        resume(): void;
    }

    export namespace Scenes {
        export class SceneManager {
            getScene(key: string): Scene;
        }
    }

    export namespace Events {
        export class EventEmitter {
            once(event: string, fn: Function, context?: any): this;
        }
    }

    export interface GameConfig {
        type?: number;
        width?: number;
        height?: number;
        parent?: string;
        backgroundColor?: string;
        scene?: any[];
        physics?: any;
        scale?: any;
    }

    export const AUTO: number;
}

declare const Phaser: typeof Phaser;