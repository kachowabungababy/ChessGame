// MAP REGISTRY DATA MODEL
// Layer Contract:
// Tile layers (draw order): ground (depth 0) -> decor (depth 1) -> collision (hidden, any tile = solid) -> overhead (depth 20, renders above sprites)
// Object layer "warps": { warpId, targetMapId, targetWarpId, facingOnArrive, requiresStage?, lockedMessage? }
// Object layer "triggers": { triggerId, mode: 'interact'|'enter', dialogue, speaker, once, requiresStage? }
// Object layer "npcs": { npcId, sheetKey, facing, dialogue, speaker, movement, requiresStage }
// Object layer "spawns": named arrival points { spawnId, facing }

export const MAPS = {
  cotton_town: {
    id: 'cotton_town',
    displayName: 'COTTON TOWN',
    tilemapUrl: '/assets/maps/cotton_town.json',
    tilesets: [
      { tiledName: 'core_city_and_country', key: 'ts_core_city_and_country', url: '/assets/tilesets/tuxemon_core_city_and_country.png' },
      { tiledName: 'core_buildings', key: 'ts_core_buildings', url: '/assets/tilesets/tuxemon_core_buildings.png' },
      { tiledName: 'core_outdoor', key: 'ts_core_outdoor', url: '/assets/tilesets/tuxemon_core_outdoor.png' },
      { tiledName: 'core_set pieces', key: 'ts_core_set_pieces', url: '/assets/tilesets/tuxemon_core_set_pieces.png' },
      { tiledName: 'core_outdoor_nature', key: 'ts_core_outdoor_nature', url: '/assets/tilesets/tuxemon_core_outdoor_nature.png' },
    ],
    music: 'sunroot',
    defaultSpawn: { x: 22, y: 36, facing: 'up' },
    minStage: 1,
  },
};

export const DEFAULT_MAP_ID = 'cotton_town';

export function getMapDef(mapId) {
  return MAPS[mapId] ?? MAPS[DEFAULT_MAP_ID];
}

export function isMapUnlocked(mapId, profile) {
  const mapDef = getMapDef(mapId);
  const userStage = profile?.unlockedStage ?? 1;
  return userStage >= (mapDef.minStage ?? 1);
}
