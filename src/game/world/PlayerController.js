import { TILE, WALK_MS, TURN_MS, DIRS, tileToPx } from './worldConstants';
import { soundEffects } from '../audio';
import { worldEvents } from './worldEvents';
import { DEFAULT_MAP_ID } from './mapRegistry';

export class PlayerController {
  constructor(scene, sprite, tileX, tileY, facing = 'down', followerController = null, mapData = null) {
    this.scene = scene;
    this.sprite = sprite;
    this.tileX = tileX;
    this.tileY = tileY;
    this.facing = facing;
    this.followerController = followerController;
    this.mapData = mapData;

    this.isMoving = false;
    this.isTurning = false;
    this.queuedDir = null;

    // Position sprite at initial pixel coordinates
    this.sprite.setPosition(tileToPx(tileX), tileToPx(tileY));
    this.sprite.setFlipX(facing === 'right');
    this.playIdleAnim();
  }

  setFollower(follower) {
    this.followerController = follower;
  }

  setMapData(mapData) {
    this.mapData = mapData;
  }

  playIdleAnim() {
    const f = this.facing === 'right' ? 'left' : this.facing;
    this.sprite.setFlipX(this.facing === 'right');
    this.sprite.anims.stop();
    this.sprite.setTexture('player_sheet', f === 'down' ? 0 : f === 'up' ? 3 : 6);
  }

  playWalkAnim() {
    const f = this.facing === 'right' ? 'left' : this.facing;
    this.sprite.setFlipX(this.facing === 'right');
    this.sprite.play(`player_walk_${f}`, true);
  }

  tryMove(dir) {
    if (!DIRS[dir]) return 'invalid';

    // If mid-move, queue next direction for smooth continuous walking
    if (this.isMoving) {
      this.queuedDir = dir;
      return 'queued';
    }

    // Turn in place if not facing direction
    if (this.facing !== dir) {
      this.facing = dir;
      this.isTurning = true;
      this.playIdleAnim();

      this.scene.time.delayedCall(TURN_MS, () => {
        this.isTurning = false;
        if (this.queuedDir) {
          const next = this.queuedDir;
          this.queuedDir = null;
          this.tryMove(next);
        }
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

    // Capture previous position for follower breadcrumb trail BEFORE updating tile state
    const prevTile = { x: this.tileX, y: this.tileY, facing: this.facing };

    // Update logical position immediately (authoritative state)
    this.tileX = targetX;
    this.tileY = targetY;
    this.isMoving = true;

    // Notify follower controller of player move step
    if (this.followerController) {
      this.followerController.onPlayerStep(prevTile);
    }

    this.playWalkAnim();

    // Smooth Linear GBA Tween to target pixel position
    this.scene.tweens.add({
      targets: this.sprite,
      x: tileToPx(targetX),
      y: tileToPx(targetY),
      duration: WALK_MS,
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

        // Process continuous queued holding input
        if (this.queuedDir) {
          const next = this.queuedDir;
          this.queuedDir = null;
          this.tryMove(next);
        }
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
