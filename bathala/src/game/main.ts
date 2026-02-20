import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Disclaimer } from "./scenes/Disclaimer";
import { Prologue } from "./scenes/Prologue/Prologue";
import { Overworld } from "./scenes/Overworld";
import { Combat } from "./scenes/Combat";
import { Shop } from "./scenes/Shop";
import { Campfire } from "./scenes/Campfire";
import { Treasure } from "./scenes/Treasure";
import { Discover } from "./scenes/Discover";
import { Credits } from "./scenes/Credits";
import { Settings } from "./scenes/Settings";
import { DDADebugScene } from "./scenes/debug/DDADebugScene";
import { CombatDebugScene } from "./scenes/debug/CombatDebugScene";
import { EducationalEventsDebugScene } from "./scenes/debug/EducationalEventsDebugScene";
import { PokerHandReference } from "./scenes/PokerHandReference";
import { EventScene } from './scenes/Event';
import { ChapterTransition } from "./scenes/ChapterTransition";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1920, // 16:9 resolution width
  height: 1080, // 16:9 resolution height
  parent: "game-container",
  backgroundColor: "#150E10",
  scene: [Boot, Preloader, Disclaimer, MainMenu, Prologue, Settings, Overworld, Combat, Shop, Campfire, Treasure, Discover, Credits, ChapterTransition, DDADebugScene, CombatDebugScene, EducationalEventsDebugScene, GameOver, PokerHandReference, EventScene],

  // Keep antialias off for crisp rendering, but don't force pixelArt globally
  // render: {
  //   antialias: true,
  // },

  // Scale settings - fixed 16:9 internal resolution, FIT to viewport.
  // Browser/desktop zoom just scales the canvas uniformly instead of changing game resolution.
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
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
