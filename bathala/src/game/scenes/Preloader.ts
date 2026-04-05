import { Scene, GameObjects } from "phaser";
import { MusicManager } from "../../core/managers/MusicManager";
import { bootstrapEnemies } from "../../data/enemies/EnemyBootstrap";

export class Preloader extends Scene {
  progressBar: Phaser.GameObjects.Rectangle;
  progressBox: Phaser.GameObjects.Rectangle;
  loadingText: GameObjects.Text;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;

  constructor() {
    super("Preloader");
  }

  init() {
    this.cameras.main.setBackgroundColor(0x000000);

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Full-cover hero artwork
    const bg = this.add.image(W / 2, H / 2, 'hero_bg');
    bg.setScale(Math.max(W / bg.width, H / bg.height)).setDepth(-10);

    // Dark overlay so text is legible
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(-5);

    // Soft edge vignette
    const vig = this.add.graphics().setDepth(-4);
    for (let i = 0; i < 10; i++) {
      vig.fillStyle(0x000000, 0.07);
      vig.fillCircle(W / 2, H / 2, Math.max(W, H) * (1.05 - i * 0.04));
    }

    // Game title - same font as MainMenu hero text
    const titleY = H * 0.5 - 30;
    this.add.text(W / 2, titleY, 'bathala', {
      fontFamily: 'Pixeled English Font',
      fontSize: 220,
      color: '#7a6a58',
    }).setOrigin(0.5).setDepth(2).setAlpha(0.9);

    // Loading bar - directly below title
    const barY = titleY + 150;
    const barW = Math.min(W * 0.36, 420);

    // Track
    this.progressBox = this.add.rectangle(W / 2, barY, barW, 2, 0x3a3028, 1)
      .setDepth(3).setOrigin(0.5);

    // Fill - grows left-to-right from the left edge of the track
    this.progressBar = this.add.rectangle(W / 2 - barW / 2, barY, 0, 2, 0xc8a878, 1)
      .setDepth(4).setOrigin(0, 0.5);

    // End-cap ornaments
    this.add.rectangle(W / 2 - barW / 2, barY, 1, 8, 0xc8a878, 0.6).setDepth(3);
    this.add.rectangle(W / 2 + barW / 2, barY, 1, 8, 0xc8a878, 0.6).setDepth(3);

    // Status label
    this.loadingText = this.add.text(W / 2, barY + 14, 'LOADING...', {
      fontFamily: 'dungeon-mode',
      fontSize: 11,
      color: '#6a5a4a',
      letterSpacing: 4,
    }).setOrigin(0.5, 0).setDepth(3);

    this.load.on("progress", (progress: number) => {
      this.progressBar.width = barW * progress;
      const pct = Math.floor(progress * 100);
      this.loadingText.setText(pct < 100 ? `LOADING...  ${pct}%` : 'PREPARING...');
    });

    // Scanlines
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x000000, 1); g.fillRect(0, 0, 4, 1);
    g.fillStyle(0x000000, 0); g.fillRect(0, 1, 4, 1);
    g.generateTexture('preloader_scanline', 4, 2);
    g.destroy();
    this.scanlines = this.add.tileSprite(0, 0, W, H, 'preloader_scanline')
      .setOrigin(0).setAlpha(0.05).setDepth(5);
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath("assets");

    // Healing potion asset for Treasure scene
    this.load.image("heal_potion", "potion/heal_potion.png");

    // Status effect icons (pixelarticons)
    this.load.svg("icon_strength",   "icons/status/sword.svg",         { width: 24, height: 24 });
    this.load.svg("icon_plated_armor","icons/status/shield.svg",       { width: 24, height: 24 });
    this.load.svg("icon_regeneration","icons/status/heart.svg",        { width: 24, height: 24 });
    this.load.svg("icon_ritual",      "icons/status/sparkle.svg",      { width: 24, height: 24 });
    this.load.svg("icon_burn",        "icons/status/fire.svg",         { width: 24, height: 24 });
    this.load.svg("icon_poison",      "icons/status/skull.svg",        { width: 24, height: 24 });
    this.load.svg("icon_weak",        "icons/status/arrow-big-down.svg",{ width: 24, height: 24 });
    this.load.svg("icon_vulnerable",  "icons/status/target.svg",       { width: 24, height: 24 });
    this.load.svg("icon_frail",       "icons/status/zap-off.svg",      { width: 24, height: 24 });
    this.load.svg("icon_unknown",     "icons/status/zap.svg",          { width: 24, height: 24 });
    // Elemental affinity icons
    this.load.svg("icon_element_fire",   "icons/status/element_fire.svg",    { width: 24, height: 24 });
    this.load.svg("icon_element_water",  "icons/status/element_water.svg",   { width: 24, height: 24 });
    this.load.svg("icon_element_earth",  "icons/status/element_earth.svg",   { width: 24, height: 24 });
    this.load.svg("icon_element_air",    "icons/status/element_air.svg",     { width: 24, height: 24 });
    this.load.svg("icon_element_neutral","icons/status/element_neutral.svg", { width: 24, height: 24 });
    // --- Action spritesheets (new) ---
    // Air / Hangin special
    this.load.spritesheet("action_air", "action/air/air.png", { frameWidth: 40, frameHeight: 40 }); // 360/40 = 9 frames exactly
    // Attack variations (weak: slash, medium: slash_curved, strong: slash_double, very strong: slash_double_curved)
    this.load.spritesheet("action_slash", "action/attack/slash.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("action_slash_curved", "action/attack/slash_curved.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("action_slash_double", "action/attack/slash_double.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("action_slash_double_curved", "action/attack/slash_double_curved.png", { frameWidth: 32, frameHeight: 32 });
    // Defend
    this.load.spritesheet("action_defend", "action/defend/defend.png", { frameWidth: 24, frameHeight: 26 });
    // Earth (Lupa) - two variants to alternate
    this.load.spritesheet("action_earth", "action/earth/earth.png", { frameWidth: 54, frameHeight: 48 }); // 540/54 = 10 frames exactly
    // Fire (Apoy)
    this.load.spritesheet("action_fire", "action/fire/fire.png", { frameWidth: 25, frameHeight: 30 });
    // Water (Tubig) - two variants to alternate
    this.load.spritesheet("action_water", "action/water/water.png", { frameWidth: 30, frameHeight: 41 }); // 270/30 = 9 frames exactly
    //  Load the assets for the game
    this.load.setPath("assets");

    // Basic assets
    this.load.image("logo", "logo.png");
    this.load.image("bg", "bg.png");
    this.load.image("forest_bg", "forest_bg.png");
    // hero_bg is loaded in Boot so it's available in Preloader.init()

    // Background assets
    this.load.image("floor1", "background/floor1.png");
    this.load.image("floor2", "background/floor2.png");
    this.load.image("floor3", "background/floor3.png");
    this.load.image("wall1", "background/wall1.png");
    this.load.image("wall2", "background/wall2.png");
    this.load.image("wall3", "background/wall3.png");
    this.load.image("wall4", "background/wall4.png");
    this.load.image("wall5", "background/wall5.png");
    this.load.image("wall6", "background/wall6.png");
    this.load.image("chap1_no_leaves_boss", "background/chap1_no_leaves_boss.png");
    this.load.image("chap1_combat_bg", "background/chap1_combat.jpg");
    this.load.image("chap2_combat_bg", "background/chap2_combat.jpg");
    this.load.image("chap3_combat_bg", "background/chap3_combat.jpg");

    // Act 2 overworld tile set - submerged village
    this.load.image("sv_path_grass_1", "background/submergedvillageAssets/pathTiles/Path_Grass1.png");
    this.load.image("sv_path_grass_2", "background/submergedvillageAssets/pathTiles/Path_Grass2.png");
    this.load.image("sv_path_grass_3", "background/submergedvillageAssets/pathTiles/Path_Grass3.png");
    this.load.image("sv_path_grass_4", "background/submergedvillageAssets/pathTiles/Path_Grass4.png");
    this.load.image("sv_path_sand_1", "background/submergedvillageAssets/pathTiles/Path_Sand1.png");
    this.load.image("sv_path_sand_2", "background/submergedvillageAssets/pathTiles/Path_Sand2.png");
    this.load.image("sv_path_sand_3", "background/submergedvillageAssets/pathTiles/Path_Sand3.png");
    this.load.image("sv_path_sand_4", "background/submergedvillageAssets/pathTiles/Path_Sand4.png");
    this.load.image("sv_path_3way_open_nse", "background/submergedvillageAssets/Update/pathTiles/path_3way_open_NSE.png");
    this.load.image("sv_path_3way_open_wne", "background/submergedvillageAssets/Update/pathTiles/path_3way_open_WNE.png");
    this.load.image("sv_path_3way_open_wns", "background/submergedvillageAssets/Update/pathTiles/path_3way_open_WNS.png");
    this.load.image("sv_path_3way_open_wse", "background/submergedvillageAssets/Update/pathTiles/path_3way_open_WSE.png");
    this.load.image("sv_path_4way", "background/submergedvillageAssets/Update/pathTiles/path_4way.png");
    this.load.image("sv_path_corner_open_ne", "background/submergedvillageAssets/Update/pathTiles/path_corner_open_NE.png");
    this.load.image("sv_path_corner_open_se", "background/submergedvillageAssets/Update/pathTiles/path_corner_open_SE.png");
    this.load.image("sv_path_corner_open_wn", "background/submergedvillageAssets/Update/pathTiles/path_corner_open_WN.png");
    this.load.image("sv_path_corner_open_ws", "background/submergedvillageAssets/Update/pathTiles/path_corner_open_WS.png");
    this.load.image("sv_path_horizontal_center", "background/submergedvillageAssets/Update/pathTiles/path_horizontal_center.png");
    this.load.image("sv_path_horizontal_end_e", "background/submergedvillageAssets/Update/pathTiles/path_horizontal_end_E.png");
    this.load.image("sv_path_horizontal_end_w", "background/submergedvillageAssets/Update/pathTiles/path_horizontal_end_W.png");
    this.load.image("sv_path_vertical_center", "background/submergedvillageAssets/Update/pathTiles/path_vertical_center.png");
    this.load.image("sv_path_vertical_end_n", "background/submergedvillageAssets/Update/pathTiles/path_vertical_end_N.png");
    this.load.image("sv_path_vertical_end_s", "background/submergedvillageAssets/Update/pathTiles/path_vertical_end_S.png");

    this.load.image("sv_grass_cliff_n", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_N.png");
    this.load.image("sv_grass_cliff_s", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_S.png");
    this.load.image("sv_grass_cliff_e", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_E.png");
    this.load.image("sv_grass_cliff_w", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_W.png");
    this.load.image("sv_grass_cliff_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_NE.png");
    this.load.image("sv_grass_cliff_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_NW.png");
    this.load.image("sv_grass_cliff_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_SE.png");
    this.load.image("sv_grass_cliff_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_SW.png");
    this.load.image("sv_grass_cliff_inner_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_NE.png");
    this.load.image("sv_grass_cliff_inner_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_NW.png");
    this.load.image("sv_grass_cliff_inner_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_SE.png");
    this.load.image("sv_grass_cliff_inner_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_SW.png");
    this.load.image("sv_grass_cliff_middle", "background/submergedvillageAssets/Update/obstacles/terrain/GrassCliff_Middle.png");

    this.load.image("sv_grass_hill_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_NE.png");
    this.load.image("sv_grass_hill_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_NW.png");
    this.load.image("sv_grass_hill_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_SE.png");
    this.load.image("sv_grass_hill_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_SW.png");
    this.load.image("sv_grass_hill_inner_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_NE.png");
    this.load.image("sv_grass_hill_inner_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_NW.png");
    this.load.image("sv_grass_hill_inner_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_SE.png");
    this.load.image("sv_grass_hill_inner_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassHill_SW.png");

    this.load.image("sv_patch_grass_sand_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_NW.png");
    this.load.image("sv_patch_grass_sand_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_NE.png");
    this.load.image("sv_patch_grass_sand_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_SW.png");
    this.load.image("sv_patch_grass_sand_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_SE.png");
    this.load.image("sv_patch_grass_sand_inner_nw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_NW.png");
    this.load.image("sv_patch_grass_sand_inner_ne", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_NE.png");
    this.load.image("sv_patch_grass_sand_inner_sw", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_SW.png");
    this.load.image("sv_patch_grass_sand_inner_se", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_SE.png");
    this.load.image("sv_patch_grass_sand_n", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_N.png");
    this.load.image("sv_patch_grass_sand_s", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_S.png");
    this.load.image("sv_patch_grass_sand_e", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_E.png");
    this.load.image("sv_patch_grass_sand_w", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_W.png");
    this.load.image("sv_patch_grass_sand_middle", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_Middle.png");
    this.load.image("sv_patch_sand_grass_nw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NW.png");
    this.load.image("sv_patch_sand_grass_ne", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NE.png");
    this.load.image("sv_patch_sand_grass_sw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SW.png");
    this.load.image("sv_patch_sand_grass_se", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SE.png");
    this.load.image("sv_patch_sand_grass_inner_nw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NW.png");
    this.load.image("sv_patch_sand_grass_inner_ne", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NE.png");
    this.load.image("sv_patch_sand_grass_inner_sw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SW.png");
    this.load.image("sv_patch_sand_grass_inner_se", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SE.png");
    this.load.image("sv_patch_sand_grass_middle", "background/submergedvillageAssets/Update/obstacles/terrain/GrassSandPatch_Middle.png");
    this.load.image("sv_patch_sand_grass_bush_nw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NW.png");
    this.load.image("sv_patch_sand_grass_bush_ne", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NE.png");
    this.load.image("sv_patch_sand_grass_bush_sw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SW.png");
    this.load.image("sv_patch_sand_grass_bush_se", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SE.png");
    // Dedicated aliases: use bush art as GrassSand patch inner corners without coupling to actual bush tiles.
    this.load.image("sv_patch_grass_sand_inner_bush_nw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NW.png");
    this.load.image("sv_patch_grass_sand_inner_bush_ne", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_NE.png");
    this.load.image("sv_patch_grass_sand_inner_bush_sw", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SW.png");
    this.load.image("sv_patch_grass_sand_inner_bush_se", "background/submergedvillageAssets/Update/obstacles/terrain/SandGrass_Bush_SE.png");

    // Obstacle underlay + tree variants for layered Act 2 rendering.
    this.load.image("sv_underlay_1", "background/submergedvillageAssets/Update/underlay/underlay_obstacle1.png");
    this.load.image("sv_underlay_2", "background/submergedvillageAssets/Update/underlay/underlay_obstacle2.png");
    this.load.image("sv_underlay_3", "background/submergedvillageAssets/Update/underlay/underlay_obstacle3.png");
    this.load.image("sv_underlay_4", "background/submergedvillageAssets/Update/underlay/underlay_obstacle4.png");
    this.load.image("sv_underlay_5", "background/submergedvillageAssets/Update/underlay/underlay_obstacle5.png");

    // Act 2 house autotile set (buildings are multi-tile obstacles over underlays).
    const act2HouseSuffixesAll: Array<{ key: string; file: string }> = [
      { key: "center", file: "Center" },
      { key: "n", file: "N" },
      { key: "s", file: "S" },
      { key: "e", file: "E" },
      { key: "w", file: "W" },
      { key: "ne", file: "NE" },
      { key: "nw", file: "NW" },
      { key: "se", file: "SE" },
      { key: "sw", file: "SW" },
    ];
    const act2HouseSuffixes2x3: Array<{ key: string; file: string }> = [
      { key: "e", file: "E" },
      { key: "w", file: "W" },
      { key: "ne", file: "NE" },
      { key: "nw", file: "NW" },
      { key: "se", file: "SE" },
      { key: "sw", file: "SW" },
    ];
    const act2HouseProfiles: Array<{ id: number; profile: string; suffixes?: Array<{ key: string; file: string }> }> = [
      { id: 1, profile: "H3xL3" },
      { id: 2, profile: "H3xL3" },
      { id: 3, profile: "H2xL3" },
      { id: 4, profile: "H2xL3" },
      { id: 5, profile: "H3xL2", suffixes: act2HouseSuffixes2x3 },
      { id: 6, profile: "H3xL3" },
      { id: 7, profile: "H3xL3" },
      { id: 8, profile: "H3xL3" },
      { id: 9, profile: "H3xL3" },
      { id: 10, profile: "H3xL3" },
    ];
    for (const houseProfile of act2HouseProfiles) {
      const suffixes = houseProfile.suffixes ?? act2HouseSuffixesAll;
      for (const suffix of suffixes) {
        this.load.image(
          `sv_house_${houseProfile.id}_${suffix.key}`,
          `background/submergedvillageAssets/Update/obstacles/houses/house${houseProfile.id}_${houseProfile.profile}_${suffix.file}.png`,
        );
      }
    }

    this.load.image("sv_tree_1", "background/submergedvillageAssets/Update/obstacles/trees/tree1.png");
    this.load.image("sv_tree_2", "background/submergedvillageAssets/Update/obstacles/trees/tree2.png");
    this.load.image("sv_tree_3", "background/submergedvillageAssets/Update/obstacles/trees/tree3.png");
    this.load.image("sv_tree_4", "background/submergedvillageAssets/Update/obstacles/trees/tree4.png");
    this.load.image("sv_tree_5", "background/submergedvillageAssets/Update/obstacles/trees/tree5.png");

    this.load.image("sv_stone_1", "background/submergedvillageAssets/Update/obstacles/stone/stoneStandalone1.png");
    this.load.image("sv_stone_2", "background/submergedvillageAssets/Update/obstacles/stone/stoneStandalone2.png");
    this.load.image("sv_stone_3", "background/submergedvillageAssets/Update/obstacles/stone/stoneStandalone3.png");
    this.load.image("sv_stone_4", "background/submergedvillageAssets/Update/obstacles/stone/stoneStandalone4.png");
    this.load.image("sv_stone_5", "background/submergedvillageAssets/Update/obstacles/stone/stoneStandalone5.png");

    this.load.image("sv_puddle_standalone_1", "background/submergedvillageAssets/Update/obstacles/water/puddleStandalone1.png");
    this.load.image("sv_puddle_small_w", "background/submergedvillageAssets/Update/obstacles/water/puddleSmall1_W.png");
    this.load.image("sv_puddle_small_e", "background/submergedvillageAssets/Update/obstacles/water/puddleSmall1_E.png");
    this.load.image("sv_puddle_big_nw", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_NW.png");
    this.load.image("sv_puddle_big_n", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_N.png");
    this.load.image("sv_puddle_big_ne", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_NE.png");
    this.load.image("sv_puddle_big_w", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_W.png");
    this.load.image("sv_puddle_big_middle", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_Middle.png");
    this.load.image("sv_puddle_big_e", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_E.png");
    this.load.image("sv_puddle_big_sw", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_SW.png");
    this.load.image("sv_puddle_big_s", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_S.png");
    this.load.image("sv_puddle_big_se", "background/submergedvillageAssets/Update/obstacles/water/puddleBig1_SE.png");

    // Act 2 water: lakes/rivers use the Update cliff + debris set.
    this.load.image("sv_water_middle", "background/submergedvillageAssets/Update/obstacles/water/water_debris4.png");
    this.load.image("sv_water_shore_n", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_N.png");
    this.load.image("sv_water_shore_s", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_S.png");
    this.load.image("sv_water_shore_e", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_E.png");
    this.load.image("sv_water_shore_w", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_W.png");
    this.load.image("sv_water_shore_ne", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NE.png");
    this.load.image("sv_water_shore_nw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NW.png");
    this.load.image("sv_water_shore_se", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SE.png");
    this.load.image("sv_water_shore_sw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SW.png");
    this.load.image("sv_water_cliff_n", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_N.png");
    this.load.image("sv_water_cliff_s", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_S.png");
    this.load.image("sv_water_cliff_e", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_E.png");
    this.load.image("sv_water_cliff_w", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_W.png");
    this.load.image("sv_water_cliff_ne", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NE.png");
    this.load.image("sv_water_cliff_nw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NW.png");
    this.load.image("sv_water_cliff_se", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SE.png");
    this.load.image("sv_water_cliff_sw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SW.png");
    // Concave inner corners for lakes/rivers (fallback aliasing to available cliff corners).
    this.load.image("sv_water_cliff_inner_ne", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NE.png");
    this.load.image("sv_water_cliff_inner_nw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_NW.png");
    this.load.image("sv_water_cliff_inner_se", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SE.png");
    this.load.image("sv_water_cliff_inner_sw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_SW.png");
    // Convex outer corners use dedicated directional outer sprites.
    this.load.image("sv_water_outer_ne", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_outer_NE.png");
    this.load.image("sv_water_outer_nw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_outer_NW.png");
    this.load.image("sv_water_outer_sw", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_outer_SW.png");
    this.load.image("sv_water_outer_se", "background/submergedvillageAssets/Update/obstacles/water/water_cliff_outer_SE.png");
    this.load.image("sv_water_debris_1", "background/submergedvillageAssets/Update/obstacles/water/water_debris1.png");
    this.load.image("sv_water_debris_2", "background/submergedvillageAssets/Update/obstacles/water/water_debris2.png");
    this.load.image("sv_water_debris_3", "background/submergedvillageAssets/Update/obstacles/water/water_debris3.png");
    this.load.image("sv_water_debris_4", "background/submergedvillageAssets/Update/obstacles/water/water_debris4.png");

    // Act 3 overworld tile set - skyward citadel (cloud platforms)
    this.load.image("cloud_blank", "background/skywardcitadelAssets/cloud_blank.png");
    this.load.image("cloud_edge_n1", "background/skywardcitadelAssets/cloud_edge_N1.png");
    this.load.image("cloud_edge_n2", "background/skywardcitadelAssets/cloud_edge_N2.png");
    this.load.image("cloud_edge_s1", "background/skywardcitadelAssets/cloud_edge_S1.png");
    this.load.image("cloud_edge_s2", "background/skywardcitadelAssets/cloud_edge_S2.png");
    this.load.image("cloud_edge_e1", "background/skywardcitadelAssets/cloud_edge_E1.png");
    this.load.image("cloud_edge_e2", "background/skywardcitadelAssets/cloud_edge_E2.png");
    this.load.image("cloud_edge_w1", "background/skywardcitadelAssets/cloud_edge_W1.png");
    this.load.image("cloud_edge_w2", "background/skywardcitadelAssets/cloud_edge_W2.png");
    this.load.image("cloud_edge_ne", "background/skywardcitadelAssets/cloud_edge_NE.png");
    this.load.image("cloud_edge_nw", "background/skywardcitadelAssets/cloud_edge_NW.png");
    this.load.image("cloud_edge_se", "background/skywardcitadelAssets/cloud_edge_SE.png");
    this.load.image("cloud_edge_sw", "background/skywardcitadelAssets/cloud_edge_SW.png");
    this.load.image("cloud_path1", "background/skywardcitadelAssets/cloudPath/cloud_path1.png");
    this.load.image("cloud_path2", "background/skywardcitadelAssets/cloudPath/cloud_path2.png");
    this.load.image("cloud_path3", "background/skywardcitadelAssets/cloudPath/cloud_path3.png");
    this.load.image("cloud_path4", "background/skywardcitadelAssets/cloudPath/cloud_path4.png");
    this.load.image("cloud_wall1", "background/skywardcitadelAssets/cloudWall/cloud_wall1.png");
    this.load.image("cloud_wall2", "background/skywardcitadelAssets/cloudWall/cloud_wall2.png");
    this.load.image("cloud_wall3", "background/skywardcitadelAssets/cloudWall/cloud_wall3.png");

    // Fonts
    this.loadFont("dungeon-mode", "fonts/dungeon-mode/dungeon-mode.ttf");
    this.loadFont("dungeon-mode-inverted", "fonts/dungeon-mode/dungeon-mode-inverted.ttf");
    this.loadFont("HeinzHeinrich", "fonts/heinzheinrich/HeinzHeinrich-Regular.otf");
    this.loadFont("Pixeled English Font", "fonts/pixeled-english/Pixeled English Font.ttf");

    // Player sprite for Combat
    this.load.image("combat_player", "sprites/combat/player/mc_combat.png");

    // Slash attack animation - now loaded as spritesheets above (action_slash etc.)

    // Player sprite for Overworld - static image
    this.load.image("player_overworld", "sprites/overworld/player/mc_overworld.png");

    // Mysterious Merchant sprite frames for Shop - 7 individual frames
    this.load.image("merchant_f01", "sprites/merchant/merchant_f01.png");
    this.load.image("merchant_f02", "sprites/merchant/merchant_f02.png");
    this.load.image("merchant_f03", "sprites/merchant/merchant_f03.png");
    this.load.image("merchant_f04", "sprites/merchant/merchant_f04.png");
    this.load.image("merchant_f05", "sprites/merchant/merchant_f05.png");
    this.load.image("merchant_f06", "sprites/merchant/merchant_f06.png");
    this.load.image("merchant_f07", "sprites/merchant/merchant_f07.png");

    // Main merchant sprite (hooded figure with backpack)
    this.load.image("merchant_main", "sprites/merchant/merchant1.png");

    // Act 1 Relic Sprites (20 relics with sprite assets)
    this.load.image("relic_swift_wind_agimat", "relics/act1relics/Agimat of the Swift Wind.png");
    this.load.image("relic_amomongo_claw", "relics/act1relics/Amomongo Claw.png");
    this.load.image("relic_ancestral_blade", "relics/act1relics/Ancestral Blade.png");
    this.load.image("relic_balete_root", "relics/act1relics/Balete Root.png");
    this.load.image("relic_babaylans_talisman", "relics/act1relics/Baybalan's Talisman.png");
    this.load.image("relic_bungisngis_grin", "relics/act1relics/Bungisngis Grin.png");
    this.load.image("relic_diwatas_crown", "relics/act1relics/Diwata's Crown.png");
    this.load.image("relic_duwende_charm", "relics/act1relics/Duwende Charm.png");
    this.load.image("relic_earthwardens_plate", "relics/act1relics/Earthwarden's Plate.png");
    this.load.image("relic_ember_fetish", "relics/act1relics/Ember Fetish.png");
    this.load.image("relic_kapres_cigar", "relics/act1relics/Kapre Cigar.png");
    this.load.image("relic_lucky_charm", "relics/act1relics/Lucky Charm.png");
    this.load.image("relic_mangangaway_wand", "relics/act1relics/Mangangaway's Wand.png");
    this.load.image("relic_sarimanok_feather", "relics/act1relics/Sarimanok Feather.png");
    this.load.image("relic_sigbin_heart", "relics/act1relics/Sigbin Heart.png");
    this.load.image("relic_stone_golem_heart", "relics/act1relics/Stone Golem Heart.png");
    this.load.image("relic_tidal_amulet", "relics/act1relics/Tidal Amulet.png");
    this.load.image("relic_tikbalangs_hoof", "relics/act1relics/Tikbalang Hoof.png");
    this.load.image("relic_tiyanak_tear", "relics/act1relics/Tiyanak Tear.png");
    this.load.image("relic_umalagad_spirit", "relics/act1relics/Umalagad Spirit.png");

    // Act 2 Relic Sprites
    this.load.image("relic_sirenas_scale", "relics/act2relics/sirena's scale.png");
    this.load.image("relic_siyokoy_fin", "relics/act2relics/Siyokoy Fin.png");
    this.load.image("relic_santelmo_ember", "relics/act2relics/Santelmo Ember.png");
    this.load.image("relic_berberoka_tide", "relics/act2relics/berberoka tide.png");
    this.load.image("relic_magindara_song", "relics/act2relics/magindara song.png");
    this.load.image("relic_kataw_crown", "relics/act2relics/kataw crown.png");
    this.load.image("relic_berbalang_spirit", "relics/act2relics/berbalang spirit.png");
    this.load.image("relic_bangkilan_veil", "relics/act2relics/bangkilan veil.png");
    this.load.image("relic_bakunawa_fang", "relics/act2relics/bakunawa's fang.png");
    this.load.image("relic_elemental_core", "relics/act2relics/elemental core.png");

    // Act 3 Relic Sprites
    this.load.image("relic_tigmamanukan_feather", "relics/act3relics/tigamamanukan feather.png");
    this.load.image("relic_diwata_veil", "relics/act3relics/diwata veil.png");
    this.load.image("relic_sarimanok_plumage", "relics/act3relics/Sarimanok Plumage.png");
    this.load.image("relic_bulalakaw_spark", "relics/act3relics/bulalakaw spark.png");
    this.load.image("relic_minokawa_claw", "relics/act3relics/minokawa's claw.png");
    this.load.image("relic_alan_wing", "relics/act3relics/alan's wing.png");
    this.load.image("relic_ekek_fang", "relics/act3relics/ekek's fang.png");
    this.load.image("relic_linti_bolt", "relics/act3relics/linti's bolt.png");
    this.load.image("relic_apolaki_spear", "relics/act3relics/apolaki's spear.png");
    this.load.image("relic_coconut_diwa", "relics/act3relics/coconut's diwa.png");

    // Enemy sprites for Combat
    this.load.image("amomongo_combat", "sprites/combat/enemy/chapter1/amomongo_battle.png");
    this.load.image("balete_combat", "sprites/combat/enemy/chapter1/balete_battle.png");
    this.load.image("bungisngis_combat", "sprites/combat/enemy/chapter1/bungisngis_battle.png");
    this.load.image("duwende_combat", "sprites/combat/enemy/chapter1/duwende_battle.png");
    this.load.image("kapre_combat", "sprites/combat/enemy/chapter1/kapre_battle.png");
    this.load.image("mangangaway_combat", "sprites/combat/enemy/chapter1/mangangaway_battle.png");
    this.load.image("sigbin_combat", "sprites/combat/enemy/chapter1/sigbin_battle.png");
    this.load.image("tawonglipod_combat", "sprites/combat/enemy/chapter1/tawonglipod_battle.png");
    this.load.image("tikbalang_combat", "sprites/combat/enemy/chapter1/tikbalang_battle.png");
    this.load.image("tiyanak_combat", "sprites/combat/enemy/chapter1/tiyanak_battle.png");

    // Chapter 1 enemy almanac sprites
    this.load.image("amomongo_almanac", "sprites/discover/chapter1/amomongo_almanac.png");
    this.load.image("balete_almanac", "sprites/discover/chapter1/balete_almanac.png");
    this.load.image("bungisngis_almanac", "sprites/discover/chapter1/bungisngis_almanac.png");
    this.load.image("duwende_almanac", "sprites/discover/chapter1/duwindi_almanac.png");
    this.load.image("kapre_almanac", "sprites/discover/chapter1/kapre_almanac.png");
    this.load.image("mangangaway_almanac", "sprites/discover/chapter1/mangangaway_almanac.png");
    this.load.image("sigbin_almanac", "sprites/discover/chapter1/sigbin_almanac bg.png");
    this.load.image("tawonglipod_almanac", "sprites/discover/chapter1/tawonglipod_almanac.png");
    this.load.image("tikbalang_almanac", "sprites/discover/chapter1/tikbalang_almanac.png");
    this.load.image("tiyanak_almanac", "sprites/discover/chapter1/tiyanak_almanac.png");

    // Chapter 2-3 almanac portraits are loaded lazily in Discover.
    // They are large and not required for normal gameplay because combat/tooltips
    // already fall back to lighter portrait sources when these textures are absent.

    // Legacy enemy sprite keys for backward compatibility
    this.load.image("amomongo", "sprites/combat/enemy/chapter1/amomongo_battle.png");
    this.load.image("balete", "sprites/combat/enemy/chapter1/balete_battle.png");
    this.load.image("bungisngis", "sprites/combat/enemy/chapter1/bungisngis_battle.png");
    this.load.image("duwende", "sprites/combat/enemy/chapter1/duwende_battle.png");
    this.load.image("kapre", "sprites/combat/enemy/chapter1/kapre_battle.png");
    this.load.image("mangangaway", "sprites/combat/enemy/chapter1/mangangaway_battle.png");
    this.load.image("sigbin", "sprites/combat/enemy/chapter1/sigbin_battle.png");
    this.load.image("tawong_lipod", "sprites/combat/enemy/chapter1/tawonglipod_battle.png");
    this.load.image("tikbalang", "sprites/combat/enemy/chapter1/tikbalang_battle.png");
    this.load.image("tiyanak", "sprites/combat/enemy/chapter1/tiyanak_battle.png");

    // Overworld enemy sprites
    this.load.image("amomongo_overworld", "sprites/overworld/enemy/chapter1/amomongo_overworld.png");
    this.load.image("balete_overworld", "sprites/overworld/enemy/chapter1/balete_overworld.png");
    this.load.image("bungisngis_overworld", "sprites/overworld/enemy/chapter1/bungisngis_overworld.png");
    this.load.image("duwende_overworld", "sprites/overworld/enemy/chapter1/duwende_overworld.png");
    this.load.image("kapre_overworld", "sprites/overworld/enemy/chapter1/kapre_overworld.png");
    this.load.image("mangangaway_overworld", "sprites/overworld/enemy/chapter1/mangangaway_overworld.png");
    this.load.image("sigbin_overworld", "sprites/overworld/enemy/chapter1/sigbin_overworld.png");
    this.load.image("tawonglipod_overworld", "sprites/overworld/enemy/chapter1/tawonglipod_overworld.png");
    this.load.image("tikbalang_overworld", "sprites/overworld/enemy/chapter1/tikbalang_overworld.png");
    this.load.image("tiyanak_overworld", "sprites/overworld/enemy/chapter1/tiyanak_overworld.png");

    // Chapter 2 enemy sprites (combat + overworld)
    this.load.image("sirena_combat", "sprites/combat/enemy/chapter2/new/sirena.png");
    this.load.image("siyokoy_combat", "sprites/combat/enemy/chapter2/new/siyokoy.png");
    this.load.image("santelmo_combat", "sprites/combat/enemy/chapter2/new/santelmo.png");
    this.load.image("berberoka_combat", "sprites/combat/enemy/chapter2/new/berberoka.png");
    this.load.image("magindara_combat", "sprites/combat/enemy/chapter2/new/maginda swarm.png");
    this.load.image("kataw_combat", "sprites/combat/enemy/chapter2/new/kataw.png");
    this.load.image("berbalang_combat", "sprites/combat/enemy/chapter2/new/berbalang.png");
    this.load.image("sunkenbangkilan_combat", "sprites/combat/enemy/chapter2/new/sunken bangkilang.png");
    this.load.image("apoytubig_combat", "sprites/combat/enemy/chapter2/new/apoy_tubig.png");
    this.load.image("bakunawa_combat", "sprites/combat/enemy/chapter2/new/bakunawa.png");

    this.load.image("sirena_overworld", "sprites/overworld/enemy/chapter2/sirena_overworld.png");
    this.load.image("siyokoy_overworld", "sprites/overworld/enemy/chapter2/siyokoy_overworld.png");
    this.load.image("santelmo_overworld", "sprites/overworld/enemy/chapter2/santelmo_overworld.png");
    this.load.image("berberoka_overworld", "sprites/overworld/enemy/chapter2/berberoka_overworld.png");
    this.load.image("magindara_overworld", "sprites/overworld/enemy/chapter2/magindara_overworld.png");
    this.load.image("kataw_overworld", "sprites/overworld/enemy/chapter2/kataw_overworld.png");
    this.load.image("berbalang_overworld", "sprites/overworld/enemy/chapter2/berbalang_overworld.png");
    this.load.image("sunkenbangkilan_overworld", "sprites/overworld/enemy/chapter2/bangkilan_overworld.png");
    this.load.image("apoytubig_overworld", "sprites/overworld/enemy/chapter2/apoy_tubig_overworld.png");
    this.load.image("bakunawa_overworld", "sprites/combat/enemy/chapter2/bakunawa_battle.png");

    // Chapter 3 enemy sprites (combat + overworld)
    this.load.image("tigmamanukan_combat", "sprites/combat/enemy/chapter3/new/tigamamanukan_watcher.png");
    this.load.image("diwata_combat", "sprites/combat/enemy/chapter3/new/diwata_sentinel.png");
    this.load.image("sarimanok_combat", "sprites/combat/enemy/chapter3/new/sarimanok_keeper.png");
    this.load.image("bulalakaw_combat", "sprites/combat/enemy/chapter3/new/bulalakaw_flamekeeper.png");
    this.load.image("minokawa_combat", "sprites/combat/enemy/chapter3/new/minokawa_harbinger.png");
    this.load.image("alan_combat", "sprites/combat/enemy/chapter3/new/alan.png");
    this.load.image("ekek_combat", "sprites/combat/enemy/chapter3/new/ekek.png");
    this.load.image("ribunglinti_combat", "sprites/combat/enemy/chapter3/new/ribung_linti.png");
    this.load.image("apolaki_combat", "sprites/combat/enemy/chapter3/new/apolaki.png");
    this.load.image("falsebathala_combat", "sprites/combat/enemy/chapter3/new/false bathala.png");

    this.load.image("tigmamanukan_overworld", "sprites/overworld/enemy/chapter3/tigmanukan_overworld.png");
    this.load.image("diwata_overworld", "sprites/overworld/enemy/chapter3/diwata_overworld.png");
    this.load.image("sarimanok_overworld", "sprites/overworld/enemy/chapter3/sarimanok_overworld.png");
    this.load.image("bulalakaw_overworld", "sprites/overworld/enemy/chapter3/bulalakaw_overworld.png");
    this.load.image("minokawa_overworld", "sprites/overworld/enemy/chapter3/minokawa_overworld.png");
    this.load.image("alan_overworld", "sprites/overworld/enemy/chapter3/alan_overworld.png");
    this.load.image("ekek_overworld", "sprites/overworld/enemy/chapter3/ekek_overworld.png");
    this.load.image("ribunglinti_overworld", "sprites/overworld/enemy/chapter3/ribung_linti_overworld.png");
    this.load.image("apolaki_overworld", "sprites/overworld/enemy/chapter3/apolaki_overworld.png");
    this.load.image("falsebathala_overworld", "sprites/combat/enemy/chapter3/false_bathala_battle.png");

    // Overworld node sprites
    // Combat/elite node fallback sprites (legacy keys kept for compatibility)
    this.load.image("chort_f0", "sprites/overworld/enemy/chapter1/duwende_overworld.png");
    this.load.image("chort_f1", "sprites/overworld/enemy/chapter1/duwende_overworld.png");
    this.load.image("chort_f2", "sprites/overworld/enemy/chapter1/duwende_overworld.png");

    this.load.image("big_demon_f0", "sprites/overworld/enemy/chapter1/kapre_overworld.png");
    this.load.image("big_demon_f1", "sprites/overworld/enemy/chapter1/kapre_overworld.png");
    this.load.image("big_demon_f2", "sprites/overworld/enemy/chapter1/kapre_overworld.png");
    this.load.image("big_demon_f3", "sprites/overworld/enemy/chapter1/kapre_overworld.png");

    // Campfire node sprite (7-frame animation, 16x16 per frame)
    this.load.spritesheet("campfire_overworld", "sprites/overworld/campfire/campfire.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Shop node sprite (merchant)
    this.load.image("merchant_overworld", "sprites/overworld/shop/merchant_overworld.png");
    this.load.image("merchant_faceset", "sprites/overworld/shop/merchant_faceset.png");

    // Event node sprite (portal spritesheet: 3x2 frames, 32x32 each)
    this.load.spritesheet("event_overworld", "sprites/overworld/event/portal.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Act 1 Event splash art
    this.load.image("event_anito_shrine", "events/events(act1)/anito shrine.png");
    this.load.image("event_anito_shrine_educational", "events/events(act1)/Anito Shrine (Edu).png");
    this.load.image("event_balete_vision", "events/events(act1)/balete vision.png");
    this.load.image("event_diwata_whisper", "events/events(act1)/diwatas whisper.png");
    this.load.image("event_diwata_gift_educational", "events/events(act1)/Diwata's Gift.png");
    this.load.image("event_forgotten_altar", "events/events(act1)/forgotten altar.png");
    this.load.image("event_tikbalang_crossroads", "events/events(act1)/tikbalangs crossroad.png");
    this.load.image("event_tikbalang_test_educational", "events/events(act1)/Tikbalang's Test.png");
    this.load.image("event_ancestral_echo", "events/events(act1)/ancestral echo.png");
    this.load.image("event_kapre_smoke", "events/events(act1)/kapre_smoke.png");
    this.load.image("event_kapre_wisdom_educational", "events/events(act1)/kapres_wisdom.png");
    this.load.image("event_sacred_grove", "events/events(act1)/sacred groove.png");
    this.load.image("event_tiyanak_wail", "events/events(act1)/tiyanak_wail.png");
    this.load.image("event_wind_omen", "events/events(act1)/wind omen.png");
    this.load.image("event_balete_mystery_educational", "events/events(act1)/balete vision.png");

    // Act 2-3 event splash art is loaded lazily in EventScene to keep
    // chapter transitions and overworld entry responsive.

    // Treasure node sprites (chest)
    this.load.image("chest_f0", "sprites/overworld/treasure/chest_full_open_anim_f0.png");
    this.load.image("chest_f1", "sprites/overworld/treasure/chest_full_open_anim_f1.png");
    this.load.image("chest_f2", "sprites/overworld/treasure/chest_full_open_anim_f2.png");

    // Shop merchant sprites
    this.load.image("merchant_f01", "sprites/merchant/merchant_f01.png");
    this.load.image("merchant_f02", "sprites/merchant/merchant_f02.png");
    this.load.image("merchant_f03", "sprites/merchant/merchant_f03.png");
    this.load.image("merchant_f04", "sprites/merchant/merchant_f04.png");
    this.load.image("merchant_f05", "sprites/merchant/merchant_f05.png");
    this.load.image("merchant_f06", "sprites/merchant/merchant_f06.png");
    this.load.image("merchant_f07", "sprites/merchant/merchant_f07.png");

    // Load card sprites
    const suits = ["apoy", "tubig", "lupa", "hangin"];
    const ranks = [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
      "11", "12", "13"  // Mandirigma, Babaylan, Datu
    ];

    // Load all card sprites
    for (const suit of suits) {
      for (const rank of ranks) {
        const fileName = `${rank}${suit}.png`;
        const key = `card_${rank}_${suit}`;
        console.log(`Loading card sprite: ${key} from ${fileName}`);
        this.load.image(key, `sprites/cards/${fileName}`);
      }
    }

    // Load card back art for discard pile
    this.load.image("backart", "sprites/cards/backart.png");

    // Load UI icons for day/night tracker
    this.load.image("bathala_sun_icon", "ui/icons/bathala_sun_icon.png");
    this.load.image("bathala_moon_icon", "ui/icons/bathala_moon_icon.png");
    this.load.image("bathala_boss_icon", "ui/icons/bathala_boss_icon.png");

    // Load all audio assets via MusicManager
    // MusicManager handles all audio loading and naming
    MusicManager.getInstance().loadAudioAssets(this);
  }

  create() {
    bootstrapEnemies();

    // Set pixel-perfect rendering for sprite textures
    if (this.textures.exists("combat_player")) {
      this.textures.get("combat_player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("amomongo")) {
      this.textures.get("amomongo").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("balete")) {
      this.textures.get("balete").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("bungisngis")) {
      this.textures.get("bungisngis").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("duwende")) {
      this.textures.get("duwende").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("kapre")) {
      this.textures.get("kapre").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("mangangaway")) {
      this.textures.get("mangangaway").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("sigbin")) {
      this.textures.get("sigbin").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tawong_lipod")) {
      this.textures.get("tawong_lipod").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tikbalang")) {
      this.textures.get("tikbalang").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tiyanak")) {
      this.textures.get("tiyanak").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("player_overworld")) {
      this.textures.get("player_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Apply NEAREST filtering to action spritesheets for crisp pixel art at large scales
    for (const key of [
      "action_air", "action_slash", "action_slash_curved",
      "action_slash_double", "action_slash_double_curved",
      "action_defend", "action_earth",
      "action_fire", "action_water"
    ]) {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    // Apply NEAREST filtering to overworld node sprites for crisp pixel art
    if (this.textures.exists("merchant_overworld")) {
      this.textures.get("merchant_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("merchant_faceset")) {
      this.textures.get("merchant_faceset").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("event_overworld")) {
      this.textures.get("event_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("chest_f0")) {
      this.textures.get("chest_f0").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("chest_f1")) {
      this.textures.get("chest_f1").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("chest_f2")) {
      this.textures.get("chest_f2").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("amomongo_overworld")) {
      this.textures.get("amomongo_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("balete_overworld")) {
      this.textures.get("balete_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("bungisngis_overworld")) {
      this.textures.get("bungisngis_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("duwende_overworld")) {
      this.textures.get("duwende_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("kapre_overworld")) {
      this.textures.get("kapre_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("mangangaway_overworld")) {
      this.textures.get("mangangaway_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("sigbin_overworld")) {
      this.textures.get("sigbin_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tawonglipod_overworld")) {
      this.textures.get("tawonglipod_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tikbalang_overworld")) {
      this.textures.get("tikbalang_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tiyanak_overworld")) {
      this.textures.get("tiyanak_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("campfire_overworld")) {
      this.textures.get("campfire_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Ensure fonts are loaded before proceeding
    this.waitForFontsToLoad().then(() => {
      //  Create animations for the sprites
      try {
        this.createPlayerAnimations();
        this.createAvatarAnimations();
        this.createNodeAnimations(); // Add this line
      } catch (error) {
        console.warn("Could not create sprite animations:", error);
      }

      // Music will be handled by the Disclaimer scene itself
      // No need to start it here anymore

      //  Move to the Disclaimer scene
      this.scene.start("Disclaimer");
    });
  }

  /**
   * Create player animations
   */
  private createPlayerAnimations(): void {
    // Combat player is now a static image (mc_combat.png), no animations needed
    /* Animations removed - using static sprite
    this.anims.create({
      key: "player_idle",
      frames: [{ key: "combat_player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "player_idle_down",
      frames: [{ key: "combat_player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "player_walk",
      frames: this.anims.generateFrameNumbers("combat_player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    */
  }

  /**
   * Create avatar animations for Overworld
   * Note: Using static sprite, no animations needed
   */
  private createAvatarAnimations(): void {
    console.log("Using static overworld sprite - no animations");
  }



  /**
   * Create overworld node animations
   */
  private createNodeAnimations(): void {
    console.log("Creating node animations");

    const chortFrames = ["chort_f0", "chort_f1", "chort_f2"]
      .filter((key) => this.textures.exists(key))
      .map((key) => ({ key }));
    if (chortFrames.length > 0) {
      this.anims.create({
        key: "chort_idle",
        frames: chortFrames,
        frameRate: 4,
        repeat: -1,
      });
      console.log("Created chort_idle animation");
    } else {
      console.warn("Skipped chort_idle animation (no frames loaded)");
    }

    const bigDemonFrames = ["big_demon_f0", "big_demon_f1", "big_demon_f2", "big_demon_f3"]
      .filter((key) => this.textures.exists(key))
      .map((key) => ({ key }));
    if (bigDemonFrames.length > 0) {
      this.anims.create({
        key: "big_demon_idle",
        frames: bigDemonFrames,
        frameRate: 4,
        repeat: -1,
      });
      console.log("Created big_demon_idle animation");
    } else {
      console.warn("Skipped big_demon_idle animation (no frames loaded)");
    }

    // Campfire animation (7 frames from spritesheet)
    if (this.textures.exists("campfire_overworld")) {
      this.anims.create({
        key: "campfire_burn",
        frames: this.anims.generateFrameNumbers("campfire_overworld", { start: 0, end: 6 }),
        frameRate: 8,
        repeat: -1,
      });
      console.log("Created campfire_burn animation");
    } else {
      console.warn("Skipped campfire_burn animation (campfire_overworld texture missing)");
    }

    // Shop node - static merchant sprite (no animation needed)
    console.log("Shop merchant sprite loaded (static)");

    // Event node animation (portal loop: 6 frames from 3x2 spritesheet)
    this.anims.create({
      key: "event_portal_loop",
      frames: this.anims.generateFrameNumbers("event_overworld", { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });
    console.log("Created event_portal_loop animation");

    // Treasure node animation (chest)
    this.anims.create({
      key: "chest_open",
      frames: [
        { key: "chest_f0" },
        { key: "chest_f1" },
        { key: "chest_f2" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created chest_open animation");

    // Merchant animation (shop scene)
    this.anims.create({
      key: "merchant_idle",
      frames: [
        { key: "merchant_f01" },
        { key: "merchant_f02" },
        { key: "merchant_f03" },
        { key: "merchant_f04" },
        { key: "merchant_f05" },
        { key: "merchant_f06" },
        { key: "merchant_f07" }
      ],
      frameRate: 8,
      repeat: -1,
    });
    console.log("Created merchant_idle animation");
  }

  /**
   * Load a font file
   */
  private loadFont(name: string, path: string): void {
    // For the Pixeled English Font, also load it via CSS to ensure it's available
    if (name === "Pixeled English Font") {
      // Create a temporary element to trigger font loading
      const tempElement = document.createElement('div');
      tempElement.style.fontFamily = `"${name}", Arial, sans-serif`;
      tempElement.style.fontSize = '250px';
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.textContent = 'bathala';
      document.body.appendChild(tempElement);

      // Remove the element after a short time
      setTimeout(() => {
        if (tempElement.parentNode) {
          tempElement.parentNode.removeChild(tempElement);
        }
      }, 1000);
    }

    const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    const assetRelativePath = normalizedPath.startsWith('assets/') ? normalizedPath : `assets/${normalizedPath}`;
    const encodedPath = assetRelativePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    fetch(encodedPath)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('text/html')) {
          throw new Error(`Unexpected content-type '${contentType}' for ${encodedPath}`);
        }

        const fontData = await response.arrayBuffer();
        const font = new FontFace(name, fontData);
        const loadedFont = await font.load();
        (document as any).fonts.add(loadedFont);
        console.log(`Font ${name} loaded successfully`);
      })
      .catch((error) => {
        console.warn(`Failed to load font ${name}:`, error);
      });
  }
  /**
   * Wait for fonts to load from CSS/Google Fonts
   */
  private async waitForFontsToLoad(): Promise<void> {
    return new Promise((resolve) => {
      // Check if fonts are loaded using FontFaceSet API
      if ("fonts" in document) {
        document.fonts.ready.then(() => {
          console.log("Fonts loaded successfully");
          resolve();
        });
      } else {
        // Fallback for browsers without FontFaceSet API
        setTimeout(() => {
          console.log("Font loading fallback timeout");
          resolve();
        }, 1000);
      }
    });
  }

  update(_time: number, delta: number): void {
    // Animate the scanlines
    if (this.scanlines) {
      this.scanlineTimer += delta;
      this.scanlines.tilePositionY = this.scanlineTimer * 0.15; // Increased speed
    }
  }
}

