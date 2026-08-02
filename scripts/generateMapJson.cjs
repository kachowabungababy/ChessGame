const fs = require('fs');
const path = require('path');

const mapWidth = 24;
const mapHeight = 24;
const totalTiles = mapWidth * mapHeight;

// Ground layer (all Grass GID 1, path GID 2 down middle)
const groundData = new Array(totalTiles).fill(1);
for (let r = 0; r < mapHeight; r++) {
  // Path down columns 11 and 12
  groundData[r * mapWidth + 11] = 2;
  groundData[r * mapWidth + 12] = 2;
}

// Decor layer (Trees GID 5 on border, Lab at r=5 c=14, House at r=5 c=4)
const decorData = new Array(totalTiles).fill(0);
// House at r=5 c=4
decorData[5 * mapWidth + 4] = 9;
decorData[5 * mapWidth + 5] = 9;
// Lab at r=5 c=15
decorData[5 * mapWidth + 15] = 10;
decorData[5 * mapWidth + 16] = 10;
// Table at r=6 c=15
decorData[6 * mapWidth + 15] = 11;

// Collision layer (Tree border GID 4, Houses GID 4)
const collisionData = new Array(totalTiles).fill(0);
for (let r = 0; r < mapHeight; r++) {
  for (let c = 0; c < mapWidth; c++) {
    if (r === 0 || r === mapHeight - 1 || c === 0 || c === mapWidth - 1) {
      collisionData[r * mapWidth + c] = 4; // Border trees solid
    }
  }
}
// Block north exit except for path
for (let c = 0; c < mapWidth; c++) {
  if (c !== 11 && c !== 12) {
    collisionData[0 * mapWidth + c] = 4;
  }
}
// Solid house & lab tiles
collisionData[5 * mapWidth + 4] = 4;
collisionData[5 * mapWidth + 5] = 4;
collisionData[5 * mapWidth + 15] = 4;
collisionData[5 * mapWidth + 16] = 4;

// Overhead layer (Tree canopy GID 5)
const overheadData = new Array(totalTiles).fill(0);

const mapJson = {
  compressionlevel: -1,
  height: mapHeight,
  width: mapWidth,
  tilewidth: 16,
  tileheight: 16,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  type: 'map',
  version: '1.10',
  tilesets: [
    {
      firstgid: 1,
      name: 'hoenn_general',
      image: '../tilesets/hoenn_general.png',
      imagewidth: 64,
      imageheight: 64,
      tilewidth: 16,
      tileheight: 16,
      tilecount: 16,
      columns: 4,
    },
    {
      firstgid: 9,
      name: 'hoenn_littleroot',
      image: '../tilesets/hoenn_littleroot.png',
      imagewidth: 64,
      imageheight: 64,
      tilewidth: 16,
      tileheight: 16,
      tilecount: 16,
      columns: 4,
    },
  ],
  layers: [
    {
      name: 'ground',
      type: 'tilelayer',
      visible: true,
      x: 0, y: 0, width: mapWidth, height: mapHeight,
      opacity: 1,
      data: groundData,
    },
    {
      name: 'decor',
      type: 'tilelayer',
      visible: true,
      x: 0, y: 0, width: mapWidth, height: mapHeight,
      opacity: 1,
      data: decorData,
    },
    {
      name: 'collision',
      type: 'tilelayer',
      visible: false,
      x: 0, y: 0, width: mapWidth, height: mapHeight,
      opacity: 1,
      data: collisionData,
    },
    {
      name: 'overhead',
      type: 'tilelayer',
      visible: true,
      x: 0, y: 0, width: mapWidth, height: mapHeight,
      opacity: 1,
      data: overheadData,
    },
    {
      name: 'spawns',
      type: 'objectgroup',
      visible: true,
      objects: [
        { id: 1, name: 'default', x: 6 * 16, y: 14 * 16, width: 16, height: 16, properties: [{ name: 'facing', type: 'string', value: 'down' }] },
        { id: 2, name: 'house_exit', x: 5 * 16, y: 7 * 16, width: 16, height: 16, properties: [{ name: 'facing', type: 'string', value: 'down' }] },
      ],
    },
    {
      name: 'warps',
      type: 'objectgroup',
      visible: true,
      objects: [
        {
          id: 10,
          name: 'route_101_north',
          x: 11 * 16, y: 0, width: 32, height: 16,
          properties: [
            { name: 'targetMapId', type: 'string', value: 'route_101' },
            { name: 'requiresStage', type: 'int', value: 2 },
            { name: 'lockedMessage', type: 'string', value: 'Route 101 is locked until you win Stage 1!' },
          ],
        },
      ],
    },
    {
      name: 'triggers',
      type: 'objectgroup',
      visible: true,
      objects: [
        {
          id: 20,
          name: 'birch_pokeball_table',
          x: 15 * 16, y: 6 * 16, width: 16, height: 16,
          properties: [
            { name: 'mode', type: 'string', value: 'interact' },
            { name: 'triggerId', type: 'string', value: 'birch_pokeball_table' },
          ],
        },
      ],
    },
    {
      name: 'npcs',
      type: 'objectgroup',
      visible: true,
      objects: [
        {
          id: 30,
          name: 'prof_birch',
          x: 14 * 16, y: 6 * 16, width: 16, height: 16,
          properties: [
            { name: 'sheetKey', type: 'string', value: 'npc_birch' },
            { name: 'facing', type: 'string', value: 'down' },
            { name: 'dialogue', type: 'string', value: "Welcome to Littleroot Town! Inspect the Pokéball Table to choose your Pokémon Chess team!" },
            { name: 'speaker', type: 'string', value: 'oak' },
          ],
        },
      ],
    },
  ],
};

const mapPath = path.join(__dirname, '..', 'public', 'assets', 'maps', 'littleroot_town.json');
fs.writeFileSync(mapPath, JSON.stringify(mapJson, null, 2));
console.log('Tiled Map JSON created successfully at:', mapPath);
