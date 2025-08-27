import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Overworld } from "./scenes/Overworld";
import { Combat } from "./scenes/Combat";
import { Shop } from "./scenes/Shop";
import { Campfire } from "./scenes/Campfire";
import { Treasure } from "./scenes/Treasure";
import { DDADebugScene } from "./scenes/debug/DDADebugScene";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, Overworld, Combat, Shop, Campfire, Treasure, DDADebugScene, MainGame, GameOver],

  // Keep antialias off for crisp rendering, but don't force pixelArt globally
  // render: {
  //   antialias: true,
  // },

  // Scale settings for proper display
  scale: {
    mode: Phaser.Scale.ENVELOP, // Use ENVELOP to fill the screen while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
