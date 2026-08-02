import { TILE, WALK_MS, FOLLOW_DISTANCE, tileToPx } from './worldConstants';

export class FollowerController {
  constructor(scene, sprite, spawnTile, speciesKey = 'pikachu') {
    this.scene = scene;
    this.sprite = sprite;
    this.speciesKey = speciesKey;
    this.trail = [];
    this.state = { tileX: spawnTile.x, tileY: spawnTile.y, facing: spawnTile.facing };

    this.sprite.setPosition(tileToPx(spawnTile.x), tileToPx(spawnTile.y));
    this.sprite.setFlipX(spawnTile.facing === 'right');
  }

  onPlayerStep(prevTile) {
    this.trail.unshift(prevTile);
    if (this.trail.length > FOLLOW_DISTANCE + 2) {
      this.trail.pop();
    }

    const target = this.trail[FOLLOW_DISTANCE - 1];
    if (!target) return;

    const dx = target.x - this.state.tileX;
    const dy = target.y - this.state.tileY;

    if (dx === 0 && dy === 0) return;

    // Facing derived from MOVEMENT DELTA (follower turns corners when IT reaches corner tile)
    const facing = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';

    this.state.tileX = target.x;
    this.state.tileY = target.y;
    this.state.facing = facing;

    const f = facing === 'right' ? 'left' : facing;
    this.sprite.setFlipX(facing === 'right');

    const animKey = `pkmn_${this.speciesKey}_walk_${f}`;
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }

    this.scene.tweens.add({
      targets: this.sprite,
      x: tileToPx(target.x),
      y: tileToPx(target.y),
      duration: WALK_MS,
      ease: 'Linear',
      onComplete: () => {
        this.sprite.anims.stop();
      },
    });
  }

  resetTo(tile) {
    this.trail = [];
    this.state = { tileX: tile.x, tileY: tile.y, facing: tile.facing };
    this.sprite.setPosition(tileToPx(tile.x), tileToPx(tile.y));
    this.sprite.setFlipX(tile.facing === 'right');
    this.sprite.anims.stop();
  }

  updateDepth(playerY) {
    // Follower depth sorting relative to player
    this.sprite.setDepth(this.sprite.y < playerY ? playerY - 1 : playerY + 1);
  }
}
