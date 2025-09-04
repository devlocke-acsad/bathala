import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Overworld } from "./scenes/Overworld";
import { Combat } from "./scenes/Combat";
import { Shop } from "./scenes/Shop";
import { Campfire } from "./scenes/Campfire";
import { Treasure } from "./scenes/Treasure";
import { Discover } from "./scenes/Discover";
import { Credits } from "./scenes/Credits";
import { Settings } from "./scenes/Settings";
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
  backgroundColor: "#150E10",
  scene: [Boot, Preloader, MainMenu, Settings, Overworld, Combat, Shop, Campfire, Treasure, Discover, Credits, DDADebugScene, MainGame, GameOver],

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
  
  // Enable DOM elements for UI components
  dom: {
    createContainer: true
  }
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
