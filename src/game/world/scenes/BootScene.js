import Phaser from 'phaser';
import { OW_POKEMON } from '../overworldSprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load tileset
    this.load.image('ts_town_outdoor', '/assets/tilesets/town_outdoor.png');

    // Load map json
    this.load.tilemapTiledJSON('sunroot_town', '/assets/maps/sunroot_town.json');

    // Load character spritesheets (144x32: 16x32 frames)
    this.load.spritesheet('brendan_sheet', '/assets/sprites/characters/brendan_walk.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('may_sheet', '/assets/sprites/characters/may_walk.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('npc_birch', '/assets/sprites/characters/npc_birch.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('npc_generic_woman', '/assets/sprites/characters/npc_generic_woman.png', { frameWidth: 16, frameHeight: 32 });

    // Load follower Pokemon spritesheets (288x32: 32x32 frames)
    Object.values(OW_POKEMON).forEach((pkmn) => {
      this.load.spritesheet(pkmn.key, pkmn.url, { frameWidth: 32, frameHeight: 32 });
    });
  }

  create() {
    // Build character walk animations
    const charSheets = ['brendan_sheet', 'may_sheet', 'player_sheet', 'npc_birch', 'npc_generic_woman'];
    charSheets.forEach((key) => {
      if (this.textures.exists(key)) {
        this.anims.create({ key: `${key}_walk_down`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: `${key}_walk_up`, frames: this.anims.generateFrameNumbers(key, { start: 3, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: `${key}_walk_left`, frames: this.anims.generateFrameNumbers(key, { start: 6, end: 8 }), frameRate: 8, repeat: -1 });
      }
    });

    // Build player walk animations alias
    ['down', 'up', 'left'].forEach((dir) => {
      const start = dir === 'down' ? 0 : dir === 'up' ? 3 : 6;
      this.anims.create({
        key: `player_walk_${dir}`,
        frames: this.anims.generateFrameNumbers('brendan_sheet', { start, end: start + 2 }),
        frameRate: 8,
        repeat: -1,
      });
    });

    // Build Pokemon follower walk animations
    Object.keys(OW_POKEMON).forEach((pkmnKey) => {
      const sheetKey = OW_POKEMON[pkmnKey].key;
      ['down', 'up', 'left'].forEach((dir) => {
        const start = dir === 'down' ? 0 : dir === 'up' ? 3 : 6;
        this.anims.create({
          key: `pkmn_${pkmnKey}_walk_${dir}`,
          frames: this.anims.generateFrameNumbers(sheetKey, { start, end: start + 2 }),
          frameRate: 6,
          repeat: -1,
        });
      });
    });

    this.scene.start('OverworldScene');
  }
}
