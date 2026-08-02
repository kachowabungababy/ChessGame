import { createEngine } from './chessEngine';

const ENGINE_PATH = '/stockfish/stockfish-18-lite-single.js';
const DEFAULT_DEPTH = 13;
const MATE_SCORE = 100000;

let worker = null;
let readyPromise = null;

function getWorker() {
  if (!worker) worker = new Worker(ENGINE_PATH);
  return worker;
}

function initEngine() {
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve) => {
    const w = getWorker();
    const onMessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line === 'uciok') {
        w.postMessage('isready');
      } else if (line === 'readyok') {
        w.removeEventListener('message', onMessage);
        resolve(w);
      }
    };
    w.addEventListener('message', onMessage);
    w.postMessage('uci');
  });
  return readyPromise;
}

function parseInfoLine(line) {
  const cpMatch = line.match(/score cp (-?\d+)/);
  const mateMatch = line.match(/score mate (-?\d+)/);
  return {
    evalCp: cpMatch ? parseInt(cpMatch[1], 10) : null,
    evalMate: mateMatch ? parseInt(mateMatch[1], 10) : null,
  };
}

function searchFen(w, fen, depth) {
  return new Promise((resolve) => {
    let lastInfo = null;
    const onMessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : '';
      if (line.startsWith('info') && line.includes('score')) {
        lastInfo = parseInfoLine(line);
      } else if (line.startsWith('bestmove')) {
        w.removeEventListener('message', onMessage);
        resolve({ ...(lastInfo || {}), bestMoveUci: line.split(' ')[1] });
      }
    };
    w.addEventListener('message', onMessage);
    w.postMessage(`position fen ${fen}`);
    w.postMessage(`go depth ${depth}`);
  });
}

function cpFromInfo(info) {
  if (info.evalMate != null) return Math.sign(info.evalMate || 1) * MATE_SCORE;
  return info.evalCp ?? 0;
}

// cp-loss thresholds, from the mover's own perspective
function classify(cpLoss) {
  if (cpLoss >= 150) return 'blunder';
  if (cpLoss >= 50) return 'mistake';
  if (cpLoss >= 20) return 'inaccuracy';
  return 'good';
}

function accuracyFromAvgLoss(avgLoss) {
  return Math.round(Math.max(0, Math.min(100, 100 * Math.exp(-avgLoss / 100))));
}

function buildSummary(perMove) {
  const white = perMove.filter((m) => m.color === 'w');
  const black = perMove.filter((m) => m.color === 'b');
  const avg = (arr) => (arr.length ? arr.reduce((s, m) => s + m.cpLoss, 0) / arr.length : 0);
  const count = (arr, cls) => arr.filter((m) => m.classification === cls).length;
  return {
    whiteAccuracy: accuracyFromAvgLoss(avg(white)),
    blackAccuracy: accuracyFromAvgLoss(avg(black)),
    blunders: count(perMove, 'blunder'),
    mistakes: count(perMove, 'mistake'),
    inaccuracies: count(perMove, 'inaccuracy'),
  };
}

/**
 * Runs a lightweight Stockfish post-game analysis over a finished game's SAN move list.
 * Only ever call this on-demand (e.g. when a user opens a match's analysis view) —
 * it performs N+1 engine searches for an N-move game, which takes a few seconds.
 *
 * @param {string[]} moves - SAN move list, in order.
 * @param {{ depth?: number, onProgress?: (done: number, total: number) => void }} [options]
 * @returns {Promise<{ perMove: Array, summary: Object, finalEvalCp: number }>}
 */
export async function analyzeGame(moves, { depth = DEFAULT_DEPTH, onProgress } = {}) {
  const w = await initEngine();
  w.postMessage('ucinewgame');

  const tempEngine = createEngine();
  // evalsWhiteCp[k] = engine eval (white-centric, positive favors White) BEFORE ply k
  const evalsWhiteCp = [];
  const played = [];

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const fenBefore = tempEngine.getFen();
    const turnBefore = tempEngine.getTurn();

    // eslint-disable-next-line no-await-in-loop
    const info = await searchFen(w, fenBefore, depth);
    const cp = cpFromInfo(info);
    evalsWhiteCp.push(turnBefore === 'w' ? cp : -cp);

    const moveResult = tempEngine.chess.move(san);
    if (!moveResult) break;
    played.push({ san, color: moveResult.color, bestMoveUci: info.bestMoveUci });
    if (onProgress) onProgress(i + 1, moves.length);
  }

  // Final position eval, for the closing eval bar. A checkmated/stalemated position has
  // no legal moves, so the engine can't return a search score for it — compute it directly
  // instead of defaulting to 0 (which would wrongly tag the mating move as a blunder).
  const finalTurn = tempEngine.getTurn();
  let finalCpWhite;
  if (tempEngine.chess.isCheckmate()) {
    // The side to move is checkmated, so the other side delivered mate.
    finalCpWhite = finalTurn === 'w' ? -MATE_SCORE : MATE_SCORE;
  } else if (tempEngine.isGameOver()) {
    finalCpWhite = 0; // stalemate / other draw
  } else {
    // eslint-disable-next-line no-await-in-loop
    const finalInfo = await searchFen(w, tempEngine.getFen(), depth);
    const cp = cpFromInfo(finalInfo);
    finalCpWhite = finalTurn === 'w' ? cp : -cp;
  }
  evalsWhiteCp.push(finalCpWhite);

  const perMove = played.map((p, i) => {
    const before = evalsWhiteCp[i];
    const after = evalsWhiteCp[i + 1];
    const cpLoss = Math.max(0, p.color === 'w' ? before - after : after - before);
    return {
      moveNumber: i + 1,
      san: p.san,
      color: p.color,
      evalCpAfter: after,
      bestMoveUci: p.bestMoveUci,
      cpLoss,
      classification: classify(cpLoss),
    };
  });

  return {
    perMove,
    summary: buildSummary(perMove),
    finalEvalCp: evalsWhiteCp[evalsWhiteCp.length - 1],
  };
}
