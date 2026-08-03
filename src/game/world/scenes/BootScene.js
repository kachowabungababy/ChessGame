import Phaser from 'phaser';
import { MAPS } from '../mapRegistry';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
    this.profileData = null;
  }

  init(data) {
    this.profileData = data?.profile || null;
  }

  preload() {
    // Load real Tuxemon tilesets (CC BY-SA, from the Tuxemon/Tuxemon project) for every registered map
    Object.values(MAPS).forEach((mapDef) => {
      mapDef.tilesets.forEach((ts) => {
        this.load.image(ts.key, ts.url);
      });
      this.load.tilemapTiledJSON(mapDef.id, mapDef.tilemapUrl);
    });

    // Load character spritesheets (144x32: 16x32 frames)
    this.load.spritesheet('brendan_sheet', '/assets/sprites/characters/brendan_walk.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('may_sheet', '/assets/sprites/characters/may_walk.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('npc_birch', '/assets/sprites/characters/npc_birch.png', { frameWidth: 16, frameHeight: 32 });
    this.load.spritesheet('npc_generic_woman', '/assets/sprites/characters/npc_generic_woman.png', { frameWidth: 16, frameHeight: 32 });
  }

  create() {
    // Build character walk animations
    // Tuxemon character sheets are laid out RPG-Maker-style: 3 cols x 4 rows
    // (row0=down, row1=left, row2=right [unused, we flipX the left row], row3=up)
    const charSheets = ['brendan_sheet', 'may_sheet', 'npc_birch', 'npc_generic_woman'];
    charSheets.forEach((key) => {
      if (this.textures.exists(key)) {
        this.anims.create({ key: `${key}_walk_down`, frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: `${key}_walk_left`, frames: this.anims.generateFrameNumbers(key, { start: 3, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: `${key}_walk_up`, frames: this.anims.generateFrameNumbers(key, { start: 9, end: 11 }), frameRate: 8, repeat: -1 });
      }
    });

    this.scene.start('OverworldScene', { profile: this.profileData });
  }
}
