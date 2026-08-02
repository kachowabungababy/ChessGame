import { supabase } from './supabaseClient';

const TABLE = 'lobby_games';
const WORDS = ['PIKA', 'CHAR', 'BULBA', 'SQUIRT', 'EEVEE', 'MEW', 'SNOR', 'GENGAR', 'RIOLU', 'TOGE'];

function generateInviteCode() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}${num}`;
}

/**
 * Creates a new waiting Online Lobby game for the signed-in trainer to share with
 * one other person (e.g. father/nephew). Retries the invite code a few times on collision.
 * @returns {Promise<{ code: string, hostColor: 'w'|'b' }|null>}
 */
export async function createLobbyGame(profile) {
  if (!supabase || !profile?.handle || profile.handle === 'Guest') return null;

  const hostColor = Math.random() < 0.5 ? 'w' : 'b';

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const { error } = await supabase.from(TABLE).insert({
      id: code,
      host_handle: profile.handle,
      host_color: hostColor,
      host_elo: profile.trainerElo ?? 50,
      status: 'waiting',
      moves: [],
      turn: 'w',
    });
    if (!error) {
      return { code, hostColor };
    }
    // 23505 = unique_violation; retry with a new code, otherwise bail
    if (error.code !== '23505') {
      console.error('Error creating lobby game:', error);
      return null;
    }
  }
  return null;
}

/**
 * Joins an existing waiting game by invite code.
 * @returns {Promise<{ row: Object, guestColor: 'w'|'b' }|{ error: 'not_found'|'already_full'|'unavailable' }>}
 */
export async function joinLobbyGame(code, profile) {
  if (!supabase) return { error: 'unavailable' };
  if (!profile?.handle || profile.handle === 'Guest') return { error: 'unavailable' };

  const cleanCode = code.trim().toUpperCase();
  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', cleanCode)
    .single();

  if (fetchError || !existing) return { error: 'not_found' };
  if (existing.status !== 'waiting' || existing.guest_handle) return { error: 'already_full' };

  const guestColor = existing.host_color === 'w' ? 'b' : 'w';

  const { data: updated, error: updateError } = await supabase
    .from(TABLE)
    .update({
      guest_handle: profile.handle,
      guest_elo: profile.trainerElo ?? 50,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', cleanCode)
    .eq('status', 'waiting') // avoid a race where two guests join at once
    .select()
    .single();

  if (updateError || !updated) return { error: 'already_full' };

  return { row: updated, guestColor };
}

/**
 * Subscribes to live updates for a lobby game row. Returns an unsubscribe function.
 */
export function subscribeLobbyGame(code, onChange) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`lobby_games:${code}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${code}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Pushes a move (or game-over result) onto the shared game row.
 */
export async function pushLobbyMove(code, { moves, turn, status, winner }) {
  if (!supabase) return;
  try {
    await supabase
      .from(TABLE)
      .update({
        moves,
        turn,
        status,
        winner: winner ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', code);
  } catch (e) {
    console.warn('Supabase lobby move push skipped or offline:', e?.message || e);
  }
}

/**
 * One-off read of a lobby game row (used for reconnect/refresh).
 */
export async function fetchLobbyGame(code) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', code.trim().toUpperCase()).single();
    if (error || !data) return null;
    return data;
  } catch (e) {
    console.warn('Supabase lobby fetch skipped or offline:', e?.message || e);
    return null;
  }
}
