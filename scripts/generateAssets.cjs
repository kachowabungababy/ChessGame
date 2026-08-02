const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..', 'public', 'assets');
fs.mkdirSync(path.join(root, 'tilesets'), { recursive: true });
fs.mkdirSync(path.join(root, 'maps'), { recursive: true });
fs.mkdirSync(path.join(root, 'sprites', 'characters'), { recursive: true });
fs.mkdirSync(path.join(root, 'sprites', 'pokemon'), { recursive: true });

// Pure Node.js PNG Creator without canvas dependency
function createPurePNG(width, height, getPixelRGBA) {
  // CRC32 Table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const checksum = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    checksum.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, checksum]);
  }

  // Header (8 bytes)
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR (13 bytes)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth 8
  ihdr[9] = 6; // color type 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw Image Data (Filter byte + RGBA pixels per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// 1. hoenn_general.png (64x64 tileset: 4x4 tiles of 16x16)
// Tile 1: Grass, Tile 2: Dirt Path, Tile 3: Water, Tile 4: Wall/Fence
const generalPng = createPurePNG(64, 64, (x, y) => {
  const tileX = Math.floor(x / 16);
  const tileY = Math.floor(y / 16);

  if (tileX === 0 && tileY === 0) return [21, 128, 61, 255]; // Grass #15803d
  if (tileX === 1 && tileY === 0) return [217, 119, 6, 255]; // Path #d97706
  if (tileX === 2 && tileY === 0) return [2, 132, 199, 255]; // Water #0284c7
  if (tileX === 3 && tileY === 0) return [51, 65, 85, 255]; // Cliff #334155

  if (tileX === 0 && tileY === 1) return [20, 83, 45, 255]; // Tree #14532d
  if (tileX === 1 && tileY === 1) return [180, 83, 9, 255]; // Fence #b45309
  if (tileX === 2 && tileY === 1) return [56, 189, 248, 255]; // Shimmer Water #38bdf8

  return [34, 197, 94, 255]; // Default vibrant green
});
fs.writeFileSync(path.join(root, 'tilesets', 'hoenn_general.png'), generalPng);

// 2. hoenn_littleroot.png (64x64 tileset)
const littlerootPng = createPurePNG(64, 64, (x, y) => {
  const tileX = Math.floor(x / 16);
  const tileY = Math.floor(y / 16);

  if (tileX === 0 && tileY === 0) return [154, 52, 18, 255]; // House Roof #9a3412
  if (tileX === 1 && tileY === 0) return [3, 105, 161, 255]; // Lab Roof #0369a1
  if (tileX === 2 && tileY === 0) return [245, 158, 11, 255]; // Table Gold #f59e0b
  if (tileX === 3 && tileY === 0) return [244, 114, 182, 255]; // Flower Pink #f472b6

  return [15, 23, 42, 255];
});
fs.writeFileSync(path.join(root, 'tilesets', 'hoenn_littleroot.png'), littlerootPng);

// Helper for 144x32 character sprite sheet (9 frames of 16x32: 3 down, 3 up, 3 left)
function createCharPng(shirtRGB, capRGB) {
  return createPurePNG(144, 32, (x, y) => {
    const frame = Math.floor(x / 16);
    const fx = x % 16;
    const fy = y;

    // Head/Cap
    if (fy >= 2 && fy < 8 && fx >= 4 && fx < 12) return capRGB;
    // Body
    if (fy >= 8 && fy < 20 && fx >= 4 && fx < 12) return shirtRGB;
    // Legs with stride offset
    if (fy >= 20 && fy < 30) {
      const legStride = (frame % 3) * 2;
      if (fx >= 4 && fx < 7 && fy < 30 - legStride) return [30, 41, 59, 255];
      if (fx >= 9 && fx < 12 && fy < 28 + legStride) return [30, 41, 59, 255];
    }
    return [0, 0, 0, 0]; // Transparent background
  });
}

fs.writeFileSync(
  path.join(root, 'sprites', 'characters', 'brendan_walk.png'),
  createCharPng([34, 197, 94, 255], [255, 255, 255, 255])
);
fs.writeFileSync(
  path.join(root, 'sprites', 'characters', 'may_walk.png'),
  createCharPng([239, 68, 68, 255], [244, 114, 182, 255])
);
fs.writeFileSync(
  path.join(root, 'sprites', 'characters', 'npc_birch.png'),
  createCharPng([59, 130, 246, 255], [148, 163, 184, 255])
);
fs.writeFileSync(
  path.join(root, 'sprites', 'characters', 'npc_generic_woman.png'),
  createCharPng([236, 72, 153, 255], [252, 211, 77, 255])
);

// Helper for 288x32 Pokemon sprite sheet (9 frames of 32x32)
function createPkmnPng(bodyRGB) {
  return createPurePNG(288, 32, (x, y) => {
    const fx = x % 32;
    const fy = y;
    const dx = fx - 16;
    const dy = fy - 16;
    const distSq = dx * dx + dy * dy;

    if (distSq <= 100) return bodyRGB; // Spherical body
    if (fy >= 4 && fy < 12 && ((fx >= 6 && fx < 10) || (fx >= 22 && fx < 26))) {
      return bodyRGB; // Ears
    }
    return [0, 0, 0, 0]; // Transparent background
  });
}

fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_pikachu.png'), createPkmnPng([234, 179, 8, 255]));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_treecko.png'), createPkmnPng([34, 197, 94, 255]));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_charmander.png'), createPkmnPng([249, 115, 22, 255]));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_squirtle.png'), createPkmnPng([56, 189, 248, 255]));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_bulbasaur.png'), createPkmnPng([16, 185, 129, 255]));
fs.writeFileSync(path.join(root, 'sprites', 'pokemon', 'ow_poochyena.png'), createPkmnPng([100, 116, 139, 255]));

console.log('PNG Assets generated successfully with zero external dependencies!');
