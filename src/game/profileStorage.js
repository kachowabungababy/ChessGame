// Profile Storage System for Unique Trainer Handles

const STORAGE_KEY = 'poke_chess_trainer_profile';

export const AVATAR_OPTIONS = [
  { id: 'ash', name: 'Ash', url: 'https://play.pokemonshowdown.com/sprites/trainers/ash.png' },
  { id: 'red', name: 'Red', url: 'https://play.pokemonshowdown.com/sprites/trainers/red.png' },
  { id: 'may', name: 'May', url: 'https://play.pokemonshowdown.com/sprites/trainers/may-gen3.png' },
  { id: 'dawn', name: 'Dawn', url: 'https://play.pokemonshowdown.com/sprites/trainers/dawn.png' },
  { id: 'ethan', name: 'Ethan', url: 'https://play.pokemonshowdown.com/sprites/trainers/ethan.png' },
  { id: 'steven', name: 'Steven', url: 'https://play.pokemonshowdown.com/sprites/trainers/steven.png' },
  { id: 'cynthia', name: 'Cynthia', url: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png' },
];

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

export function createProfile(handle, avatarId = 'ash', remember = true, difficultyTier = 'rookie') {
  const cleanHandle = handle ? handle.trim() : 'Guest';
  const newProfile = {
    handle: cleanHandle,
    avatarId,
    rememberMe: remember,
    difficultyTier,
    unlockedStage: 1,
    badges: [],
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
    },
    history: [],
    createdAt: new Date().toISOString(),
  };

  if (remember && cleanHandle !== 'Guest') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
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

export function recordMatchResult(profile, isWin, isDraw = false, stageInfo = null) {
  if (!profile) return profile;

  const updated = { ...profile };
  updated.stats = { ...updated.stats };

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
