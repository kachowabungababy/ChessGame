import { supabase } from './supabaseClient';

const STORAGE_KEY = 'chess-pokemon-matches';

/**
 * Backfills missing fields on matches saved before mode/ELO/analysis tagging existed,
 * so older localStorage rows never crash newer UI code.
 */
function normalizeMatch(m) {
  return {
    mode: 'legacy',
    handle: null,
    playerColor: null,
    trainerEloBefore: null,
    trainerEloAfter: null,
    opponentElo: null,
    opponentHandle: null,
    storyStageId: null,
    storyStageName: null,
    analysis: null,
    ...m,
  };
}

/**
 * Loads all saved matches from localStorage.
 * @returns {Array} List of saved match objects
 */
export function loadMatches() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return parsed.map(normalizeMatch);
  } catch (err) {
    console.error('Error loading matches from localStorage:', err);
    return [];
  }
}

function persistMatches(matches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch (err) {
    console.error('Error persisting matches to localStorage:', err);
  }
}

/**
 * Saves a completed chess match to localStorage and (if signed in) syncs to Supabase.
 * @param {Object} engineInstance - ChessGameEngine instance
 * @param {string} winner - 'white' | 'black' | 'draw'
 * @param {Object} meta - { mode, handle, playerColor, trainerEloBefore, trainerEloAfter,
 *                          opponentElo, opponentHandle, storyStageId, storyStageName }
 * @returns {Object} Saved match object
 */
export function saveMatch(engineInstance, winner, meta = {}) {
  try {
    const matches = loadMatches();
    const history = engineInstance.getHistory();
    const pgn = engineInstance.getPgn();

    let result = '1/2-1/2';
    if (winner === 'white') result = '1-0';
    if (winner === 'black') result = '0-1';

    const newMatch = normalizeMatch({
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toISOString(),
      pgn: pgn || '',
      moves: history || [],
      result,
      winner: winner || 'draw',
      mode: meta.mode || 'legacy',
      handle: meta.handle || null,
      playerColor: meta.playerColor || null,
      trainerEloBefore: meta.trainerEloBefore ?? null,
      trainerEloAfter: meta.trainerEloAfter ?? null,
      opponentElo: meta.opponentElo ?? null,
      opponentHandle: meta.opponentHandle ?? null,
      storyStageId: meta.storyStageId ?? null,
      storyStageName: meta.storyStageName ?? null,
    });

    // Avoid duplicate save if match with exact PGN already saved recently
    const isDuplicate = matches.some(
      (m) => m.pgn === newMatch.pgn && m.moves.length === newMatch.moves.length
    );
    if (!isDuplicate) {
      matches.unshift(newMatch); // newest first
      persistMatches(matches);
      syncMatchToSupabase(newMatch);
    }

    return newMatch;
  } catch (err) {
    console.error('Error saving match to localStorage:', err);
    return null;
  }
}

/**
 * Deletes a match by ID from localStorage (and Supabase, if it belongs to a signed-in handle).
 * @param {string} id
 * @param {string|null} handle
 * @returns {Array} Remaining matches
 */
export function deleteMatch(id, handle = null) {
  try {
    const matches = loadMatches();
    const filtered = matches.filter((m) => m.id !== id);
    persistMatches(filtered);
    if (supabase && handle && handle !== 'Guest') {
      supabase.from('matches').delete().eq('id', id).then(
        () => {},
        (e) => console.warn('Supabase match delete skipped or offline:', e?.message || e)
      );
    }
    return filtered;
  } catch (err) {
    console.error('Error deleting match from localStorage:', err);
    return [];
  }
}

/**
 * Fire-and-forget upsert of a match row to Supabase. Skips Guests / offline Supabase,
 * mirroring syncProfileToSupabase in profileStorage.js.
 */
export async function syncMatchToSupabase(match) {
  if (!supabase || !match.handle || match.handle === 'Guest') return;
  try {
    const row = {
      id: match.id,
      handle: match.handle,
      mode: match.mode === 'legacy' ? 'ai' : match.mode,
      player_color: match.playerColor,
      date: match.date,
      pgn: match.pgn,
      moves: match.moves,
      result: match.result,
      winner: match.winner,
      opponent_elo: match.opponentElo,
      opponent_handle: match.opponentHandle,
      trainer_elo_before: match.trainerEloBefore,
      trainer_elo_after: match.trainerEloAfter,
      story_stage_id: match.storyStageId,
      story_stage_name: match.storyStageName,
      analysis: match.analysis,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('matches').upsert(row, { onConflict: 'id' });
  } catch (e) {
    console.warn('Supabase match sync skipped or offline:', e?.message || e);
  }
}

function rowToMatch(row) {
  return normalizeMatch({
    id: row.id,
    date: row.date,
    pgn: row.pgn,
    moves: row.moves,
    result: row.result,
    winner: row.winner,
    mode: row.mode,
    handle: row.handle,
    playerColor: row.player_color,
    trainerEloBefore: row.trainer_elo_before,
    trainerEloAfter: row.trainer_elo_after,
    opponentElo: row.opponent_elo,
    opponentHandle: row.opponent_handle,
    storyStageId: row.story_stage_id,
    storyStageName: row.story_stage_name,
    analysis: row.analysis,
  });
}

export async function fetchMatchesFromSupabase(handle) {
  if (!supabase || !handle || handle === 'Guest') return [];
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('handle', handle)
      .order('date', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToMatch);
  } catch (e) {
    console.warn('Supabase match fetch skipped or offline:', e?.message || e);
    return [];
  }
}

/**
 * Merges local + cloud matches by id (cloud fills in cross-device matches, local wins
 * on any field conflict except analysis where whichever side has it wins), newest first.
 */
function mergeMatches(local, cloud) {
  const map = new Map(local.map((m) => [m.id, m]));
  cloud.forEach((cm) => {
    const lm = map.get(cm.id);
    map.set(cm.id, lm ? { ...cm, ...lm, analysis: lm.analysis || cm.analysis } : cm);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Local-first load: call this after loadMatches() has already painted the UI once,
 * to backfill cloud-only / cross-device matches.
 */
export async function loadMatchesMerged(handle) {
  const local = loadMatches();
  if (!supabase || !handle || handle === 'Guest') return local;
  const cloud = await fetchMatchesFromSupabase(handle);
  if (cloud.length === 0) return local;
  const merged = mergeMatches(local, cloud);
  persistMatches(merged);
  return merged;
}

/**
 * Caches a computed analysis result onto a match, locally and (if applicable) in Supabase.
 */
export async function saveAnalysisToMatch(matchId, analysis, handle = null) {
  try {
    const matches = loadMatches();
    const idx = matches.findIndex((m) => m.id === matchId);
    if (idx >= 0) {
      matches[idx] = { ...matches[idx], analysis };
      persistMatches(matches);
    }
  } catch (e) {
    console.error('Error caching analysis locally:', e);
  }
  if (supabase && handle && handle !== 'Guest') {
    try {
      await supabase
        .from('matches')
        .update({ analysis, updated_at: new Date().toISOString() })
        .eq('id', matchId);
    } catch (e) {
      console.warn('Supabase analysis sync skipped or offline:', e?.message || e);
    }
  }
}
