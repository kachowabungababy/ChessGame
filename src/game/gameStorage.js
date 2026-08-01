const STORAGE_KEY = 'chess-pokemon-matches';

/**
 * Loads all saved matches from localStorage.
 * @returns {Array} List of saved match objects
 */
export function loadMatches() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading matches from localStorage:', err);
    return [];
  }
}

/**
 * Saves a completed chess match to localStorage.
 * @param {Object} engineInstance - ChessGameEngine instance
 * @param {string} winner - 'white' | 'black' | 'draw'
 * @returns {Object} Saved match object
 */
export function saveMatch(engineInstance, winner) {
  try {
    const matches = loadMatches();
    const history = engineInstance.getHistory();
    const pgn = engineInstance.getPgn();

    let result = '1/2-1/2';
    if (winner === 'white') result = '1-0';
    if (winner === 'black') result = '0-1';

    const newMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toISOString(),
      pgn: pgn || '',
      moves: history || [],
      result,
      winner: winner || 'draw',
    };

    // Avoid duplicate save if match with exact PGN already saved recently
    const isDuplicate = matches.some(
      (m) => m.pgn === newMatch.pgn && m.moves.length === newMatch.moves.length
    );
    if (!isDuplicate) {
      matches.unshift(newMatch); // newest first
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    }

    return newMatch;
  } catch (err) {
    console.error('Error saving match to localStorage:', err);
    return null;
  }
}

/**
 * Deletes a match by ID from localStorage.
 * @param {string} id 
 * @returns {Array} Remaining matches
 */
export function deleteMatch(id) {
  try {
    const matches = loadMatches();
    const filtered = matches.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting match from localStorage:', err);
    return [];
  }
}
