// Profile Storage System for Unique Trainer Handles & Authentic Game Avatars

const STORAGE_KEY = 'poke_chess_trainer_profile';

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

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return null;
}

export function createProfile(handle, avatarId = 'ash', remember = true, password = '') {
  const cleanHandle = handle ? handle.trim() : 'Guest';

  const newProfile = {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  }
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
