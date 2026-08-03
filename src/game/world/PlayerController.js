import { TILE, WALK_MS, TURN_MS, DIRS, tileToPx } from './worldConstants';
import { soundEffects } from '../audio';
import { worldEvents } from './worldEvents';
import { DEFAULT_MAP_ID } from './mapRegistry';

export class PlayerController {
  constructor(scene, sprite, tileX, tileY, facing = 'down', mapData = null) {
    this.scene = scene;
    this.sprite = sprite;
    this.tileX = tileX;
    this.tileY = tileY;
    this.facing = facing;
    this.mapData = mapData;

    this.isMoving = false;
    this.isTurning = false;

    // Position sprite at initial pixel coordinates
    this.sprite.setPosition(tileToPx(tileX), tileToPx(tileY));
    this.sprite.setFlipX(facing === 'right');
    this.playIdleAnim();
  }

  setMapData(mapData) {
    this.mapData = mapData;
  }

  playIdleAnim() {
    const f = this.facing === 'right' ? 'left' : this.facing;
    this.sprite.setFlipX(this.facing === 'right');
    this.sprite.anims.stop();
    this.sprite.setTexture(this.sprite.texture.key, f === 'down' ? 0 : f === 'up' ? 9 : 3);
  }

  playWalkAnim() {
    const f = this.facing === 'right' ? 'left' : this.facing;
    this.sprite.setFlipX(this.facing === 'right');
    this.sprite.play(`${this.sprite.texture.key}_walk_${f}`, true);
  }

  tryMove(dir, running = false) {
    if (!DIRS[dir]) return 'invalid';

    // Mid-move or mid-turn: ignore. The caller polls every frame, so the
    // next tile/turn starts on its own as soon as this one finishes — no
    // need to remember a stale direction from an earlier frame (that was
    // causing an extra tile of movement after the key had already been
    // released).
    if (this.isMoving || this.isTurning) {
      return 'busy';
    }

    // Turn in place if not facing direction
    if (this.facing !== dir) {
      this.facing = dir;
      this.isTurning = true;
      this.playIdleAnim();

      this.scene.time.delayedCall(TURN_MS, () => {
        this.isTurning = false;
      });
      return 'turned';
    }

    const { dx, dy } = DIRS[dir];
    const targetX = this.tileX + dx;
    const targetY = this.tileY + dy;

    // Check collision / bounds
    if (this.isBlocked(targetX, targetY)) {
      soundEffects.playErrorSound();
      return 'blocked';
    }

    // Update logical position immediately (authoritative state)
    this.tileX = targetX;
    this.tileY = targetY;
    this.isMoving = true;

    this.playWalkAnim();

    // Smooth Linear GBA Tween to target pixel position
    this.scene.tweens.add({
      targets: this.sprite,
      x: tileToPx(targetX),
      y: tileToPx(targetY),
      duration: running ? WALK_MS / 2 : WALK_MS,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.playIdleAnim();

        // Emit move event for persistence
        worldEvents.emit('player:moved', {
          mapId: this.mapData?.id || DEFAULT_MAP_ID,
          x: this.tileX,
          y: this.tileY,
          facing: this.facing,
        });
      },
    });

    return 'started';
  }

  isBlocked(x, y) {
    if (!this.mapData) return false;
    const { mapWidth, mapHeight, collisionLayer } = this.mapData;

    // Bounds check
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return true;

    // Collision layer check (GID > 0 is solid)
    if (collisionLayer) {
      const tile = collisionLayer.getTileAt(x, y);
      if (tile && tile.index > 0) return true;
    }

    return false;
  }
}
