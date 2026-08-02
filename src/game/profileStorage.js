// Profile Storage System for Unique Trainer Handles, Avatars & World Position Migration

const STORAGE_KEY = 'poke_chess_trainer_profile';
const BACKUP_KEY_V0 = 'poke_chess_trainer_profile_bak_v0';

export const CURRENT_SCHEMA_VERSION = 1;
export const DEFAULT_WORLD = { mapId: 'littleroot_town', x: 6, y: 14, facing: 'down' };

export const AVATAR_OPTIONS = [
  // Boys
  { id: 'ash', name: 'Ash', gender: 'Boy 👦', region: 'Kanto', url: 'https://play.pokemonshowdown.com/sprites/trainers/ash.png' },
  { id: 'red', name: 'Red', gender: 'Boy 👦', region: 'Kanto', url: 'https://play.pokemonshowdown.com/sprites/trainers/red.png' },
  { id: 'ethan', name: 'Ethan', gender: 'Boy 👦', region: 'Johto', url: 'https://play.pokemonshowdown.com/sprites/trainers/ethan.png' },
  { id: 'brendan', name: 'Brendan', gender: 'Boy 👦', region: 'Hoenn', url: 'https://play.pokemonshowdown.com/sprites/trainers/brendan-gen3.png' },
  { id: 'lucas', name: 'Lucas', gender: 'Boy 👦', region: 'Sinnoh', url: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png' },

  // Girls
  { id: 'may', name: 'May', gender: 'Girl 👧', region: 'Hoenn', url: 'https://play.pokemonshowdown.com/sprites/trainers/may-gen3.png' },
  { id: 'dawn', name: 'Dawn', gender: 'Girl 👧', region: 'Sinnoh', url: 'https://play.pokemonshowdown.com/sprites/trainers/dawn.png' },
  { id: 'leaf', name: 'Leaf', gender: 'Girl 👧', region: 'Kanto', url: 'https://play.pokemonshowdown.com/sprites/trainers/leaf-gen3.png' },
  { id: 'serena', name: 'Serena', gender: 'Girl 👧', region: 'Kalos', url: 'https://play.pokemonshowdown.com/sprites/trainers/serena.png' },
  { id: 'cynthia', name: 'Cynthia', gender: 'Champion 👑', region: 'Sinnoh', url: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png' },
];

export function getTrainerRankTitle(elo = 100) {
  if (elo <= 200) return '🐣 Baby Trainer';
  if (elo <= 400) return '🧢 Rookie Trainer';
  if (elo <= 600) return '🐛 Novice Trainer';
  if (elo <= 800) return '🥋 Ace Trainer';
  if (elo <= 1200) return '🗿 Gym Contender';
  if (elo <= 1600) return '🐉 Elite Contender';
  if (elo <= 2000) return '👑 Champion Candidate';
  return '⚡ Grandmaster League';
}

function migrateProfile(raw, rawStr) {
  if (!raw || typeof raw !== 'object') return null;
  const p = { ...raw };
  const oldVersion = typeof p.schemaVersion === 'number' ? p.schemaVersion : 0;

  if (oldVersion < 1) {
    // Backup raw pre-migration JSON string before making v1 schema changes
    if (rawStr && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(BACKUP_KEY_V0, rawStr);
      } catch (e) {
        console.error('Failed to write profile backup v0:', e);
      }
    }

    if (!p.world || typeof p.world !== 'object') {
      p.world = { ...DEFAULT_WORLD };
    }
    if (!Array.isArray(p.badges)) p.badges = [];
    if (!Array.isArray(p.pokedexCaught)) {
      p.pokedexCaught = ['pikachu', 'treecko', 'charmander', 'squirtle', 'eevee'];
    }
    if (!p.stats || typeof p.stats !== 'object') {
      p.stats = { wins: 0, losses: 0, draws: 0, puzzlesSolved: 0 };
    }
    if (typeof p.unlockedStage !== 'number') p.unlockedStage = 1;
    p.schemaVersion = 1;
  }

  return p;
}

export function getStoredProfile() {
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (rawStr) {
      const parsed = JSON.parse(rawStr);
      const migrated = migrateProfile(parsed, rawStr);

      if (migrated && migrated.rememberMe && migrated.handle !== 'Guest') {
        saveProfile(migrated);
      }

      return migrated;
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return null;
}

export function createProfile(handle, avatarId = 'ash', remember = true, password = '') {
  const cleanHandle = handle ? handle.trim() : 'Guest';

  const newProfile = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    handle: cleanHandle,
    password: password ? password.trim() : '',
    avatarId,
    rememberMe: remember,
    difficultyTier: 'rookie',
    trainerElo: 50,
    unlockedStage: 1,
    badges: [],
    pokedexCaught: ['pikachu', 'treecko', 'charmander', 'squirtle', 'eevee'],
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      puzzlesSolved: 0,
    },
    world: { ...DEFAULT_WORLD },
    createdAt: new Date().toISOString(),
  };

  if (remember && cleanHandle !== 'Guest') {
    saveProfile(newProfile);
  }

  return newProfile;
}

export function saveProfile(profile) {
  if (!profile) return;
  if (profile.rememberMe && profile.handle !== 'Guest') {
    try {
      const payload = {
        ...profile,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  }
}

export function updateWorldPosition(profile, mapId, x, y, facing) {
  if (!profile) return profile;
  if (
    profile.world?.mapId === mapId &&
    profile.world?.x === x &&
    profile.world?.y === y &&
    profile.world?.facing === facing
  ) {
    return profile; // skip duplicate no-op writes
  }

  const updated = {
    ...profile,
    world: { mapId, x, y, facing },
  };
  saveProfile(updated);
  return updated;
}

export function getWorldSpawn(profile) {
  const w = profile?.world;
  if (w && typeof w.x === 'number' && typeof w.y === 'number' && w.mapId) {
    return w;
  }
  return { ...DEFAULT_WORLD };
}

export function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing profile:', e);
  }
}

export function recordCaughtPokemon(profile, pokemonId) {
  if (!profile || !pokemonId) return profile;
  const updated = { ...profile };
  const currentCaught = updated.pokedexCaught || ['pikachu', 'treecko', 'charmander', 'squirtle', 'eevee'];
  if (!currentCaught.includes(pokemonId)) {
    updated.pokedexCaught = [...currentCaught, pokemonId];
    saveProfile(updated);
  }
  return updated;
}

export function recordMatchResult(profile, isWin, isDraw = false, stageInfo = null, oppElo = 1200) {
  if (!profile) return profile;

  const updated = { ...profile };
  updated.stats = { ...updated.stats };

  // Calculate ELO Change
  const currentElo = updated.trainerElo || (updated.difficultyTier === 'rookie' ? 50 : 300);
  const opponentElo = stageInfo ? stageInfo.elo : oppElo;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const actual = isDraw ? 0.5 : isWin ? 1.0 : 0.0;
  const kFactor = 32;
  const deltaElo = Math.round(kFactor * (actual - expected));

  updated.trainerElo = Math.max(50, currentElo + deltaElo);

  if (isDraw) {
    updated.stats.draws += 1;
  } else if (isWin) {
    updated.stats.wins += 1;
    if (stageInfo) {
      // Unlock next stage if this was current highest unlocked
      if (stageInfo.id >= updated.unlockedStage) {
        updated.unlockedStage = Math.min(21, stageInfo.id + 1);
      }
      // Award badge if stage has one and not already earned
      if (stageInfo.badge && !updated.badges.some((b) => b.id === stageInfo.badge.id)) {
        updated.badges = [...updated.badges, stageInfo.badge];
      }
    }
  } else {
    updated.stats.losses += 1;
  }

  saveProfile(updated);
  return updated;
}
