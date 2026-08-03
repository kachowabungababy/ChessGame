import Phaser from 'phaser';
import { TILE, tileToPx, DIRS } from '../worldConstants';
import { getMapDef } from '../mapRegistry';
import { PlayerController } from '../PlayerController';
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

    // Wild-encounter pacing: a flat per-step chance felt relentless in a tall-grass zone
    // (constant back-to-back battles). `encounterStreak` decays the chance every time an
    // encounter just fired, and recovers the longer the player walks without one — plus a
    // hard cooldown guarantees a few safe steps right after any encounter.
    this.stepsSinceEncounter = Infinity;
    this.encounterStreak = 0;

    // Create Tilemap
    this.map = this.make.tilemap({ key: mapDef.id });
    const tilesets = mapDef.tilesets.map((ts) => this.map.addTilesetImage(ts.tiledName, ts.key));

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

    // Create Player Controller
    this.playerController = new PlayerController(
      this,
      this.playerSprite,
      safeSpawn.x,
      safeSpawn.y,
      safeSpawn.facing,
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
    this.keyRun = this.input.keyboard.addKey('X'); // GBA B button — hold to run
    this.input.keyboard.addKey('SPACE').on('down', () => this.pressA()); // GBA A button

    // Parse Object Layers (Warps, Triggers, Encounters, NPCs)
    this.parseObjectLayers();
    this.spawnNpcTrainers();

    // Listen to player move events for persistence & triggers
    worldEvents.on('player:moved', (pos) => {
      if (this.profile) {
        // Keep this scene's own profile reference current, and tell React so
        // profile.world stays live — otherwise an interruption that unmounts
        // the map (e.g. a wild encounter) would respawn from a stale position.
        this.profile = updateWorldPosition(this.profile, pos.mapId, pos.x, pos.y, pos.facing);
        worldEvents.emit('profile:worldUpdated', { profile: this.profile });
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

    // Process continuous movement input — physical keys take priority, falling back to
    // a held on-screen d-pad button so touch/click controls also support continuous walk
    const running = this.keyRun?.isDown || false;
    const dir = this.cursors.up.isDown || this.wasd.W.isDown ? 'up'
      : this.cursors.down.isDown || this.wasd.S.isDown ? 'down'
      : this.cursors.left.isDown || this.wasd.A.isDown ? 'left'
      : this.cursors.right.isDown || this.wasd.D.isDown ? 'right'
      : this.virtualDir;

    if (dir) this.playerController.tryMove(dir, running);
  }

  setVirtualInput(dir, isDown) {
    if (!this.playerController) return;
    if (isDown) {
      this.virtualDir = dir;
      this.playerController.tryMove(dir);
    } else if (this.virtualDir === dir) {
      this.virtualDir = null;
    }
  }

  pressA() {
    if (!this.playerController) return;

    const { facing, tileX, tileY } = this.playerController;
    const { dx, dy } = DIRS[facing] || DIRS.down;
    const frontX = tileX + dx;
    const frontY = tileY + dy;

    // Trainer NPCs take priority over generic interact triggers on the same tile
    const talkedToTrainer = this.checkNpcInteract(frontX, frontY);
    if (talkedToTrainer) return;

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
    this.npcTrainers = [];

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
        dialogue: getProp('dialogue') || null,
      });
    });

    const npcObjects = this.map.getObjectLayer('npcs')?.objects || [];
    npcObjects.forEach((obj) => {
      const tx = Math.floor(obj.x / TILE);
      const ty = Math.floor(obj.y / TILE);
      const getProp = (name) => obj.properties?.find((p) => p.name === name)?.value;

      this.npcTrainers.push({
        x: tx,
        y: ty,
        npcId: getProp('npcId') || obj.name,
        sheetKey: getProp('sheetKey') || 'npc_birch',
        facing: getProp('facing') || 'down',
        stageId: getProp('stageId'),
        requiresStage: getProp('requiresStage') || 1,
      });
    });
  }

  // Places a static sprite for each trainer NPC and marks its tile solid (so the player
  // can't walk through it), reusing the existing hidden collision layer for blocking rather
  // than teaching PlayerController a new "occupied by actor" concept.
  spawnNpcTrainers() {
    this.npcSprites = {};
    this.npcTrainers.forEach((npc) => {
      if (!this.textures.exists(npc.sheetKey)) return;
      const idleFacing = npc.facing === 'right' ? 'left' : npc.facing;
      const frame = idleFacing === 'down' ? 0 : idleFacing === 'up' ? 9 : 3;
      const sprite = this.add.sprite(tileToPx(npc.x), tileToPx(npc.y), npc.sheetKey, frame);
      sprite.setFlipX(npc.facing === 'right');
      sprite.setDepth(sprite.y);
      this.npcSprites[npc.npcId] = sprite;

      if (this.collisionLayer) {
        this.collisionLayer.putTileAt(1, npc.x, npc.y);
      }
    });
  }

  checkNpcInteract(x, y) {
    const npc = this.npcTrainers.find((n) => n.x === x && n.y === y);
    if (!npc) return false;

    const userStage = this.profile?.unlockedStage ?? 1;
    if (userStage < npc.requiresStage) {
      const lockedText = "This trainer isn't ready to battle you yet — come back later!";
      worldEvents.emit('dialogue:show', { text: lockedText, speaker: 'oak' });
      speakText(lockedText, 'oak');
      return true;
    }

    worldEvents.emit('trainer:battle', { npcId: npc.npcId, stageId: npc.stageId });
    return true;
  }

  checkInteractTriggers(x, y) {
    const hitTrigger = this.triggers.find((t) => t.x === x && t.y === y && t.mode === 'interact');
    if (hitTrigger) {
      worldEvents.emit('trigger:activate', { triggerId: hitTrigger.triggerId });
      if (hitTrigger.dialogue) {
        worldEvents.emit('dialogue:show', { text: hitTrigger.dialogue, speaker: 'oak' });
        speakText(hitTrigger.dialogue, 'oak');
      }
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

    // Classic "tall grass" wild encounter roll — see the pacing constants below for why
    // this isn't just a flat chance per step.
    const zone = this.encounters.find(
      (e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h
    );

    if (!zone) {
      this.encounterStreak = 0; // leaving the grass fully resets the heat
      return;
    }

    this.stepsSinceEncounter += 1;

    const MIN_STEPS_BETWEEN_ENCOUNTERS = 3; // guaranteed safe steps right after a battle
    const BASE_ENCOUNTER_RATE = 0.12;
    const ENCOUNTER_RATE_DECAY = 0.6; // each recent encounter multiplies the chance by this
    const MIN_ENCOUNTER_RATE = 0.03;
    const STEPS_TO_COOL_DOWN = 8; // steps walked with no encounter before the streak eases off

    if (this.stepsSinceEncounter < MIN_STEPS_BETWEEN_ENCOUNTERS) return;

    if (this.stepsSinceEncounter > STEPS_TO_COOL_DOWN) {
      const coolTicks = Math.floor((this.stepsSinceEncounter - MIN_STEPS_BETWEEN_ENCOUNTERS) / STEPS_TO_COOL_DOWN);
      this.encounterStreak = Math.max(0, this.encounterStreak - coolTicks);
    }

    const chance = Math.max(MIN_ENCOUNTER_RATE, BASE_ENCOUNTER_RATE * ENCOUNTER_RATE_DECAY ** this.encounterStreak);
    if (Math.random() < chance) {
      this.encounterStreak += 1;
      this.stepsSinceEncounter = 0;
      worldEvents.emit('encounter:wild', { region: zone.region });
    }
  }
}
