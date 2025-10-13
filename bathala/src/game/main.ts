import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Prologue } from "./scenes/Prologue";
import { Overworld } from "./scenes/Overworld";
import { Combat } from "./scenes/Combat";
import { Shop } from "./scenes/Shop";
import { Campfire } from "./scenes/Campfire";
import { Treasure } from "./scenes/Treasure";
import { Discover } from "./scenes/Discover";
import { Credits } from "./scenes/Credits";
import { Settings } from "./scenes/Settings";
import { DDADebugScene } from "./scenes/debug/DDADebugScene";
import { PokerHandReference } from "./scenes/PokerHandReference";
import { EventScene } from './scenes/Event';
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024, // Fixed width to prevent scaling issues
  height: 768, // Fixed height to prevent scaling issues
  parent: "game-container",
  backgroundColor: "#150E10",
  scene: [Boot, Preloader, MainMenu, Prologue, Settings, Overworld, Combat, Shop, Campfire, Treasure, Discover, Credits, DDADebugScene, MainGame, GameOver, PokerHandReference, EventScene],

  // Keep antialias off for crisp rendering, but don't force pixelArt globally
  // render: {
  //   antialias: true,
  // },

  // Scale settings - DISABLED to prevent card positioning bugs
  scale: {
    mode: Phaser.Scale.NONE, // Disable auto-scaling to prevent coordinate issues
    autoCenter: Phaser.Scale.NO_CENTER,
    width: 1024, // Fixed width
    height: 768, // Fixed height
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
