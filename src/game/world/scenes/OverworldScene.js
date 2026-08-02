import Phaser from 'phaser';
import { TILE, tileToPx, DIRS } from '../worldConstants';
import { getMapDef } from '../mapRegistry';
import { PlayerController } from '../PlayerController';
import { FollowerController } from '../FollowerController';
import { resolveFollowerSpecies, OW_POKEMON } from '../overworldSprites';
import { getWorldSpawn, updateWorldPosition } from '../../profileStorage';
import { worldEvents } from '../worldEvents';
import { speakText } from '../../speechAudio';
import { playLittlerootTownTheme } from '../../littlerootTheme';

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super('OverworldScene');
    this.profile = null;
  }

  init(data) {
    this.profile = data?.profile || null;
  }

  setProfile(updatedProfile) {
    this.profile = updatedProfile;
  }

  create() {
    const spawnData = getWorldSpawn(this.profile);
    const mapDef = getMapDef(spawnData.mapId);

    this.mapDef = mapDef;

    // Create Tilemap
    this.map = this.make.tilemap({ key: mapDef.id });
    const tsTownOutdoor = this.map.addTilesetImage('town_outdoor', 'ts_town_outdoor');
    const tilesets = [tsTownOutdoor];

    // 4 Tile Layers per Contract
    this.groundLayer = this.map.createLayer('ground', tilesets, 0, 0);
    this.decorLayer = this.map.createLayer('decor', tilesets, 0, 0);
    this.collisionLayer = this.map.createLayer('collision', tilesets, 0, 0);
    this.overheadLayer = this.map.createLayer('overhead', tilesets, 0, 0);

    if (this.groundLayer) this.groundLayer.setDepth(0);
    if (this.decorLayer) this.decorLayer.setDepth(1);
    if (this.collisionLayer) this.collisionLayer.setVisible(false);
    if (this.overheadLayer) this.overheadLayer.setDepth(20);

    // Spiral search safety net for player spawn position
    const safeSpawn = this.findNearestWalkableTile(spawnData.x, spawnData.y);

    // Create Player Sprite
    const avatarKey = (this.profile?.avatarId || '').includes('may') ? 'may_sheet' : 'brendan_sheet';
    this.playerSprite = this.add.sprite(tileToPx(safeSpawn.x), tileToPx(safeSpawn.y), avatarKey, 0);
    this.playerSprite.setDepth(this.playerSprite.y);

    // Resolve & Create Follower Sprite
    const speciesKey = resolveFollowerSpecies(this.profile);
    const followerSheetKey = OW_POKEMON[speciesKey]?.key || 'ow_pikachu';
    this.followerSprite = this.add.sprite(tileToPx(safeSpawn.x), tileToPx(safeSpawn.y), followerSheetKey, 0);

    this.followerController = new FollowerController(
      this,
      this.followerSprite,
      { x: safeSpawn.x, y: safeSpawn.y, facing: safeSpawn.facing },
      speciesKey
    );

    // Create Player Controller
    this.playerController = new PlayerController(
      this,
      this.playerSprite,
      safeSpawn.x,
      safeSpawn.y,
      safeSpawn.facing,
      this.followerController,
      {
        id: mapDef.id,
        mapWidth: this.map.width,
        mapHeight: this.map.height,
        collisionLayer: this.collisionLayer,
      }
    );

    // Setup Camera (roundPixels: true, hard bounds clamp)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.playerSprite, true);
    this.cameras.main.setRoundPixels(true);

    // Keyboard Inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Parse Object Layers (Warps, Triggers, NPCs)
    this.parseObjectLayers();

    // Listen to player move events for persistence & triggers
    worldEvents.on('player:moved', (pos) => {
      if (this.profile) {
        updateWorldPosition(this.profile, pos.mapId, pos.x, pos.y, pos.facing);
      }
      this.checkEnterTriggers(pos.x, pos.y);
    });

    // Notify React layer world is ready
    worldEvents.emit('world:ready', {
      mapId: mapDef.id,
      displayName: mapDef.displayName,
    });

    // Play Map Music
    playLittlerootTownTheme();
  }

  update() {
    if (!this.playerController) return;

    // Follower Depth Sorting
    if (this.followerController) {
      this.followerController.updateDepth(this.playerSprite.y);
    }

    // Process continuous movement input
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.playerController.tryMove('up');
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.playerController.tryMove('down');
    } else if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.playerController.tryMove('left');
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.playerController.tryMove('right');
    }
  }

  setVirtualInput(dir, isDown) {
    if (!this.playerController) return;
    if (isDown) {
      this.playerController.tryMove(dir);
    }
  }

  pressA() {
    if (!this.playerController) return;

    const { facing, tileX, tileY } = this.playerController;
    const { dx, dy } = DIRS[facing] || DIRS.down;
    const frontX = tileX + dx;
    const frontY = tileY + dy;

    // Check interact triggers on tile in front
    const triggered = this.checkInteractTriggers(frontX, frontY);
    if (!triggered) {
      const text = `Exploring ${this.mapDef?.displayName || 'the town'}! Position: (${tileX}, ${tileY})`;
      worldEvents.emit('dialogue:show', { text, speaker: 'oak' });
      speakText(text, 'oak');
    }
  }

  replayMusic() {
    playLittlerootTownTheme();
  }

  findNearestWalkableTile(startX, startY) {
    const w = this.map.width;
    const h = this.map.height;

    // Check initial tile
    if (this.isTileWalkable(startX, startY)) {
      return { x: startX, y: startY, facing: 'down' };
    }

    // Spiral search outward
    for (let r = 1; r < 10; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const nx = startX + dx;
          const ny = startY + dy;
          if (this.isTileWalkable(nx, ny)) {
            return { x: nx, y: ny, facing: 'down' };
          }
        }
      }
    }

    return { x: 6, y: 14, facing: 'down' };
  }

  isTileWalkable(x, y) {
    if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height) return false;
    if (this.collisionLayer) {
      const tile = this.collisionLayer.getTileAt(x, y);
      if (tile && tile.index > 0) return false;
    }
    return true;
  }

  parseObjectLayers() {
    this.warps = [];
    this.triggers = [];
    this.encounters = [];

    const encounterObjects = this.map.getObjectLayer('encounters')?.objects || [];
    encounterObjects.forEach((obj) => {
      const getProp = (name) => obj.properties?.find((p) => p.name === name)?.value;
      this.encounters.push({
        x: Math.floor(obj.x / TILE),
        y: Math.floor(obj.y / TILE),
        w: Math.floor(obj.width / TILE),
        h: Math.floor(obj.height / TILE),
        region: getProp('region') || 'petalburg',
      });
    });

    const warpObjects = this.map.getObjectLayer('warps')?.objects || [];
    warpObjects.forEach((obj) => {
      const tx = Math.floor(obj.x / TILE);
      const ty = Math.floor(obj.y / TILE);
      const getProp = (name) => obj.properties?.find((p) => p.name === name)?.value;

      this.warps.push({
        x: tx,
        y: ty,
        w: Math.max(1, Math.floor(obj.width / TILE)),
        h: Math.max(1, Math.floor(obj.height / TILE)),
        targetMapId: getProp('targetMapId') || 'route_101',
        requiresStage: getProp('requiresStage') || 1,
        lockedMessage: getProp('lockedMessage') || 'This route is currently locked!',
      });
    });

    const triggerObjects = this.map.getObjectLayer('triggers')?.objects || [];
    triggerObjects.forEach((obj) => {
      const tx = Math.floor(obj.x / TILE);
      const ty = Math.floor(obj.y / TILE);
      const getProp = (name) => obj.properties?.find((p) => p.name === name)?.value;

      this.triggers.push({
        x: tx,
        y: ty,
        mode: getProp('mode') || 'interact',
        triggerId: getProp('triggerId') || obj.name,
      });
    });
  }

  checkInteractTriggers(x, y) {
    const hitTrigger = this.triggers.find((t) => t.x === x && t.y === y && t.mode === 'interact');
    if (hitTrigger) {
      worldEvents.emit('trigger:activate', { triggerId: hitTrigger.triggerId });
      return true;
    }
    return false;
  }

  checkEnterTriggers(x, y) {
    // Check warp triggers on enter
    const hitWarp = this.warps.find(
      (w) => x >= w.x && x < w.x + w.w && y >= w.y && y < w.y + w.h
    );
    if (hitWarp) {
      const userStage = this.profile?.unlockedStage ?? 1;
      if (userStage < hitWarp.requiresStage) {
        worldEvents.emit('dialogue:show', {
          text: hitWarp.lockedMessage,
          speaker: 'oak',
        });
        speakText(hitWarp.lockedMessage, 'oak');
      }
      return;
    }

    // Classic "tall grass" wild encounter roll
    const zone = this.encounters.find(
      (e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h
    );
    if (zone && Math.random() < 0.25) {
      worldEvents.emit('encounter:wild', { region: zone.region });
    }
  }
}
