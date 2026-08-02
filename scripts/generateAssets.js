const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const root = path.join(__dirname, '..', 'public', 'assets');
fs.mkdirSync(path.join(root, 'tilesets'), { recursive: true });
fs.mkdirSync(path.join(root, 'maps'), { recursive: true });
fs.mkdirSync(path.join(root, 'sprites', 'characters'), { recursive: true });
fs.mkdirSync(path.join(root, 'sprites', 'pokemon'), { recursive: true });

// Helper to draw a pixel grid PNG
function createPNG(w, h, drawFn) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  return canvas.toBuffer('image/png');
}

// 1. hoenn_general.png (64x64 tileset: 4x4 tiles of 16x16)
// Tile 1: Grass, Tile 2: Dirt Path, Tile 3: Water, Tile 4: Fence/Cliff
const generalBuf = createPNG(64, 64, (ctx) => {
  // Tile (0,0) Grass
  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(2, 2, 4, 4);
  ctx.fillRect(10, 8, 4, 4);

  // Tile (16,0) Dirt Path
  ctx.fillStyle = '#d97706';
  ctx.fillRect(16, 0, 16, 16);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(18, 4, 4, 4);

  // Tile (32,0) Water
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(32, 0, 16, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(34, 4, 8, 2);

  // Tile (48,0) Cliff/Wall
  ctx.fillStyle = '#334155';
  ctx.fillRect(48, 0, 16, 16);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(48, 12, 16, 4);

  // Tile (0,16) Tree Base
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 16, 16, 16);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(6, 24, 4, 8);
});
fs.writeFileSync(path.join(root, 'tilesets', 'hoenn_general.png'), generalBuf);

// 2. hoenn_littleroot.png (64x64 tileset)
const littlerootBuf = createPNG(64, 64, (ctx) => {
  // Tile (0,0) House Roof Red
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(2, 2, 12, 12);

  // Tile (16,0) Lab Blue Roof
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(16, 0, 16, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(18, 2, 12, 12);

  // Tile (32,0) Pokeball Table Gold
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(32, 0, 16, 16);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(40, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Tile (48,0) Flower Tile
  ctx.fillStyle = '#15803d';
  ctx.fillRect(48, 0, 16, 16);
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(50, 4, 4, 4);
  ctx.fillRect(58, 10, 4, 4);
});
fs.writeFileSync(path.join(root, 'tilesets', 'hoenn_littleroot.png'), littlerootBuf);

// Helper for 16x32 character walk spritesheet (98x32: 3 frames down, 3 frames up, 3 frames left)
function createCharSheet(color, capColor) {
  return createPNG(144, 32, (ctx) => {
    for (let f = 0; f < 9; f++) {
      const x = f * 16;
      // Head
      ctx.fillStyle = capColor;
      ctx.fillRect(x + 4, 2, 8, 6);
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x + 4, 8, 8, 12);
      // Legs with stride offset for animation
      ctx.fillStyle = '#1e293b';
      const legOffset = (f % 3) * 2;
      ctx.fillRect(x + 4, 20, 3, 10 - legOffset);
      ctx.fillRect(x + 9, 20, 3, 8 + legOffset);
    }
  });
}

fs.writeFileSync(path.join(root, 'sprites', 'characters', 'brendan_walk.png'), createCharSheet('#22c55e', '#ffffff'));
fs.writeFileSync(path.join(root, 'sprites', 'characters', 'may_walk.png'), createCharSheet('#ef4444', '#f472b6'));
fs.writeFileSync(path.join(root, 'sprites', 'characters', 'npc_birch.png'), createCharSheet('#3b82f6', '#94a3b8'));
fs.writeFileSync(path.join(root, 'sprites', 'characters', 'npc_generic_woman.png'), createCharSheet('#ec4899', '#fcd34d'));

// Helper for 32x32 overworld Pokemon sprite sheets (96x32: 3 frames per direction)
function createPkmnSheet(color) {
  return createPNG(288, 32, (ctx) => {
    for (let f = 0; f < 9; f++) {
      const x = f * 32;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      // Ears / details
      ctx.fillRect(x + 10, 2, 4, 6);
      ctx.fillRect(x + 18, 2, 4, 6);
    }
  });
}

fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_pikachu.png'), createPkmnSheet('#eab308'));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_treecko.png'), createPkmnSheet('#22c55e'));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_charmander.png'), createPkmnSheet('#f97316'));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_squirtle.png'), createPkmnSheet('#38bdf8'));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_bulbasaur.png'), createPkmnSheet('#10b981'));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_poochyena.png'), createPkmnSheet('#64748b'));

console.log('Generated PNG assets successfully!');
