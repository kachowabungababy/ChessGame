// MAP REGISTRY DATA MODEL
// Layer Contract:
// Tile layers (draw order): ground (depth 0) -> decor (depth 1) -> collision (hidden, any tile = solid) -> overhead (depth 20, renders above sprites)
// Object layer "warps": { warpId, targetMapId, targetWarpId, facingOnArrive, requiresStage?, lockedMessage? }
// Object layer "triggers": { triggerId, mode: 'interact'|'enter', dialogue, speaker, once, requiresStage? }
// Object layer "npcs": { npcId, sheetKey, facing, dialogue, speaker, movement, requiresStage }
// Object layer "spawns": named arrival points { spawnId, facing }

export const MAPS = {
  sunroot_town: {
    id: 'sunroot_town',
    displayName: 'SUNROOT TOWN',
    tilemapUrl: '/assets/maps/sunroot_town.json',
    tilesets: [
      { tiledName: 'town_outdoor', key: 'ts_town_outdoor', url: '/assets/tilesets/town_outdoor.png' },
    ],
    music: 'sunroot',
    defaultSpawn: { x: 12, y: 20, facing: 'up' },
    minStage: 1,
  },
};

export const DEFAULT_MAP_ID = 'sunroot_town';

export function getMapDef(mapId) {
  return MAPS[mapId] ?? MAPS[DEFAULT_MAP_ID];
}

export function isMapUnlocked(mapId, profile) {
  const mapDef = getMapDef(mapId);
  const userStage = profile?.unlockedStage ?? 1;
  return userStage >= (mapDef.minStage ?? 1);
}
