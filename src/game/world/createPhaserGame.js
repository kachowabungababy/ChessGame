import { GBA_W, GBA_H } from './worldConstants';
import { BootScene } from './scenes/BootScene';
import { OverworldScene } from './scenes/OverworldScene';

export function createPhaserGame(Phaser, parentContainer, { profile }) {
  const config = {
    type: Phaser.AUTO,
    width: GBA_W,
    height: GBA_H,
    parent: parentContainer,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
      noAudio: true, // Prevents Phaser from creating a second competing AudioContext
    },
    physics: false,
    scene: [BootScene, OverworldScene],
  };

  const game = new Phaser.Game(config);
  game.scene.start('BootScene', { profile });

  return game;
}
