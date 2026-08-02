// MAP REGISTRY DATA MODEL
// Layer Contract:
// Tile layers (draw order): ground (depth 0) -> decor (depth 1) -> collision (hidden, any tile = solid) -> overhead (depth 20, renders above sprites)
// Object layer "warps": { warpId, targetMapId, targetWarpId, facingOnArrive, requiresStage?, lockedMessage? }
// Object layer "triggers": { triggerId, mode: 'interact'|'enter', dialogue, speaker, once, requiresStage? }
// Object layer "npcs": { npcId, sheetKey, facing, dialogue, speaker, movement, requiresStage }
// Object layer "spawns": named arrival points { spawnId, facing }

export const MAPS = {
  littleroot_town: {
    id: 'littleroot_town',
    displayName: 'LITTLEROOT TOWN',
    tilemapUrl: '/assets/maps/littleroot_town.json',
    tilesets: [
      { tiledName: 'hoenn_general', key: 'ts_general', url: '/assets/tilesets/hoenn_general.png' },
      { tiledName: 'hoenn_littleroot', key: 'ts_littleroot', url: '/assets/tilesets/hoenn_littleroot.png' },
    ],
    music: 'littleroot',
    defaultSpawn: { x: 6, y: 14, facing: 'down' },
    minStage: 1,
  },
};

export const DEFAULT_MAP_ID = 'littleroot_town';

export function getMapDef(mapId) {
  return MAPS[mapId] ?? MAPS[DEFAULT_MAP_ID];
}

export function isMapUnlocked(mapId, profile) {
  const mapDef = getMapDef(mapId);
  const userStage = profile?.unlockedStage ?? 1;
  return userStage >= (mapDef.minStage ?? 1);
}
