import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Map } from "./scenes/Map";
import { Combat } from "./scenes/Combat";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, Map, Combat, MainGame, GameOver],

  // Keep antialias off for crisp rendering, but don't force pixelArt globally
  // render: {
  //   antialias: true,
  // },

  // // Scale settings for proper display
  // scale: {
  //   mode: Phaser.Scale.FIT,
  //   autoCenter: Phaser.Scale.CENTER_BOTH,
  // },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
