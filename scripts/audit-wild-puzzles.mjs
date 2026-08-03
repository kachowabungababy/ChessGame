import { Chess } from 'chess.js';
import { WILD_POKEMON_PUZZLES } from '../src/game/wildPuzzles/index.js';

// Audits every wild-encounter puzzle against the actual chess engine instead of trusting the
// hand-written flavor text. It would have caught the wild_treecko bug: its prompt claimed
// "Jump your Knight to c7 to fork Black's King and Rook!" while the scripted solutionMove
// (f3->e5) neither jumps to c7 nor forks a king or rook.
//
// Checks, per puzzle:
//   1. FEN parses.                                          (hard failure)
//   2. solutionMove is actually legal from that FEN.         (hard failure)
//   3. Any square mentioned in prompt/coachHint agrees with the move's destination square.
//   4. "Checkmate" claims in title/type/prompt/coachHint actually deliver checkmate.
//   5. "Fork" claims in title/type actually attack 2+ non-pawn enemy pieces, and any piece
//      names (King/Queen/Rook/Bishop/Knight) named as fork targets in the text are among the
//      pieces the move actually attacks.
//   6. Material sanity: if the move captures a piece and the opponent has an immediate legal
//      recapture on that same square, the trade must not lose material for the mover — and if
//      the text claims the capture is "undefended", "free", or "wins material", that claim must
//      hold up. This is a simplified one-ply Static Exchange Evaluation, not a full engine
//      search, but it's enough to catch a scripted "solution" that is actually a blunder (e.g.
//      trading a Knight for a pawn that's defended by another Knight).

const SQUARE_RE = /\b([a-h])([1-8])\b/g;
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: Infinity };
const MATERIAL_CLAIM_RE = /\b(undefended|unprotected|free (pawn|piece|knight|bishop|rook|queen)|wins? material|winning material|hanging|hangs|loose)\b/i;
const PIECE_NAMES = ['King', 'Queen', 'Rook', 'Bishop', 'Knight'];
const PIECE_NAME_TO_CODE = { King: 'k', Queen: 'q', Rook: 'r', Bishop: 'b', Knight: 'n', Pawn: 'p' };

function fileRankToSquare(file, rank) {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${String.fromCharCode(97 + file)}${rank + 1}`;
}

function squareToFileRank(square) {
  return { file: square.charCodeAt(0) - 97, rank: parseInt(square[1], 10) - 1 };
}

const KNIGHT_OFFSETS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const KING_OFFSETS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const BISHOP_DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const ROOK_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function steppingAttacks(chess, square, offsets) {
  const { file, rank } = squareToFileRank(square);
  return offsets
    .map(([df, dr]) => fileRankToSquare(file + df, rank + dr))
    .filter((sq) => sq && chess.get(sq));
}

function slidingAttacks(chess, square, dirs) {
  const { file, rank } = squareToFileRank(square);
  const attacked = [];
  for (const [df, dr] of dirs) {
    let f = file + df;
    let r = rank + dr;
    while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
      const sq = fileRankToSquare(f, r);
      if (chess.get(sq)) {
        attacked.push(sq);
        break;
      }
      f += df;
      r += dr;
    }
  }
  return attacked;
}

// Raw board attacks from `square`, ignoring whose turn it is (unlike chess.moves()).
function attackedSquaresFrom(chess, square) {
  const piece = chess.get(square);
  if (!piece) return [];
  switch (piece.type) {
    case 'n':
      return steppingAttacks(chess, square, KNIGHT_OFFSETS);
    case 'k':
      return steppingAttacks(chess, square, KING_OFFSETS);
    case 'b':
      return slidingAttacks(chess, square, BISHOP_DIRS);
    case 'r':
      return slidingAttacks(chess, square, ROOK_DIRS);
    case 'q':
      return slidingAttacks(chess, square, [...BISHOP_DIRS, ...ROOK_DIRS]);
    case 'p': {
      const dir = piece.color === 'w' ? 1 : -1;
      const { file, rank } = squareToFileRank(square);
      return [fileRankToSquare(file - 1, rank + dir), fileRankToSquare(file + 1, rank + dir)]
        .filter((sq) => sq && chess.get(sq));
    }
    default:
      return [];
  }
}

function auditPuzzle(puzzle) {
  const errors = [];
  const warnings = [];
  const text = `${puzzle.title || ''} ${puzzle.prompt || ''} ${puzzle.coachHint || ''} ${(puzzle.stepHints || []).join(' ')}`;
  const textLower = text.toLowerCase();

  // Puzzles are either a single move (`solutionMove`) or a full alternating sequence
  // (`solutionMoves`: player, forced opponent reply, player, ...). Normalize to a sequence.
  const sequence = puzzle.solutionMoves || (puzzle.solutionMove ? [puzzle.solutionMove] : []);
  if (sequence.length === 0) {
    errors.push('puzzle has neither solutionMove nor solutionMoves');
    return { errors, warnings };
  }

  let chess;
  try {
    chess = new Chess(puzzle.fen);
  } catch (e) {
    errors.push(`invalid FEN: ${e.message}`);
    return { errors, warnings };
  }

  let firstMovedPiece = null;
  let firstMoveChessAfter = null;
  let lastMovedPiece = null;
  let lastResult = null;

  for (let i = 0; i < sequence.length; i++) {
    const ply = sequence[i];
    const legalMoves = chess.moves({ square: ply.from, verbose: true });
    const matchingMove = legalMoves.find((m) => m.to === ply.to);
    if (!matchingMove) {
      errors.push(
        `ply ${i + 1} (${ply.from}->${ply.to}) is not legal ` +
          `(legal destinations from ${ply.from}: ${legalMoves.map((m) => m.to).join(', ') || 'none'})`
      );
      return { errors, warnings };
    }

    lastMovedPiece = chess.get(ply.from);
    if (i === 0) firstMovedPiece = lastMovedPiece;

    lastResult = chess.move({ from: ply.from, to: ply.to, promotion: 'q' });
    if (!lastResult) {
      errors.push(`chess.move() rejected ply ${i + 1} (${ply.from}->${ply.to})`);
      return { errors, warnings };
    }

    if (i === 0) firstMoveChessAfter = new Chess(chess.fen());
  }

  // 3. Square-mention consistency: if the flavor text names any square, at least one must be
  // an origin/destination somewhere in the sequence — otherwise the text describes a different move.
  const mentionedSquares = [...text.matchAll(SQUARE_RE)].map((m) => `${m[1]}${m[2]}`);
  if (mentionedSquares.length > 0) {
    const sequenceSquares = new Set(sequence.flatMap((p) => [p.from, p.to]));
    const matches = mentionedSquares.some((sq) => sequenceSquares.has(sq));
    if (!matches) {
      warnings.push(
        `text mentions square(s) [${mentionedSquares.join(', ')}] but the move sequence is ` +
          `${sequence.map((p) => `${p.from}->${p.to}`).join(', ')} — text may describe a different move`
      );
    }
  }

  // 4. Checkmate claims must actually be checkmate (checked against the FINAL position).
  if (/\b(checkmate|mate)\b/.test(textLower)) {
    if (!chess.isCheckmate()) {
      errors.push('text claims checkmate but the resulting position is not checkmate');
    }
  }

  // 5. Fork claims must attack 2+ non-pawn enemy pieces, and any named target pieces must be
  // among what's actually attacked. Checked against the FIRST move, since that's what creates
  // the fork in a multi-ply sequence.
  if (textLower.includes('fork')) {
    const attacked = attackedSquaresFrom(firstMoveChessAfter, sequence[0].to);
    const attackedEnemyPieces = attacked
      .map((sq) => firstMoveChessAfter.get(sq))
      .filter((p) => p && p.color !== firstMovedPiece.color);
    const nonPawnCount = attackedEnemyPieces.filter((p) => p.type !== 'p').length;

    if (nonPawnCount < 2) {
      warnings.push(
        `title/type claims a fork but the first move only attacks ${nonPawnCount} non-pawn enemy piece(s) ` +
          `(attacks: ${attackedEnemyPieces.map((p) => p.type).join(', ') || 'none'})`
      );
    }

    const mentionedTargets = PIECE_NAMES.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(text));
    const attackedTypeCodes = new Set(attackedEnemyPieces.map((p) => p.type));
    const missingTargets = mentionedTargets.filter((name) => {
      const code = PIECE_NAME_TO_CODE[name];
      // Ignore a mention that's just naming the piece being moved (e.g. "your Knight").
      if (code === firstMovedPiece.type) return false;
      return !attackedTypeCodes.has(code);
    });
    if (missingTargets.length > 0) {
      warnings.push(
        `text names fork target(s) [${missingTargets.join(', ')}] that the first move does not actually attack ` +
          `(actual targets attacked: ${[...attackedTypeCodes].join(', ') || 'none'})`
      );
    }
  }

  // 6. Material sanity on the FINAL move's capture (the prize the puzzle claims to win).
  const finalPly = sequence[sequence.length - 1];
  if (lastResult.captured) {
    const recaptures = chess.moves({ verbose: true }).filter((m) => m.to === finalPly.to);
    if (recaptures.length > 0) {
      const capturedValue = PIECE_VALUES[lastResult.captured];
      const moverValue = PIECE_VALUES[lastMovedPiece.type];
      const netForMover = capturedValue - moverValue;
      const claimsGain = MATERIAL_CLAIM_RE.test(text);
      if (netForMover < 0) {
        const msg =
          `capturing ${lastResult.captured} (value ~${capturedValue}) with a ${lastMovedPiece.type} ` +
          `(value ~${moverValue}) on ${finalPly.to} is met by an immediate recapture ` +
          `(${recaptures.map((m) => m.san).join(', ')}) — net material for the mover after the trade ` +
          `is ${netForMover}, i.e. this loses material rather than winning it`;
        if (claimsGain) {
          errors.push(`MISINFORMATION: text claims a material win/undefended capture, but ${msg}`);
        } else {
          warnings.push(msg);
        }
      } else if (claimsGain && netForMover <= 0) {
        errors.push(
          `MISINFORMATION: text claims the capture is undefended/wins material, but ${lastResult.captured} ` +
            `on ${finalPly.to} is defended (recapture: ${recaptures.map((m) => m.san).join(', ')}) ` +
            `and the trade is only even, not a material gain`
        );
      }
    }
  }

  return { errors, warnings };
}

let hasFailure = false;

for (const puzzle of WILD_POKEMON_PUZZLES) {
  const { errors, warnings } = auditPuzzle(puzzle);
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`PASS  ${puzzle.id}`);
    continue;
  }
  hasFailure = hasFailure || errors.length > 0 || warnings.length > 0;
  console.log(`${errors.length > 0 ? 'FAIL' : 'WARN'}  ${puzzle.id}`);
  for (const e of errors) console.log(`  error:   ${e}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
}

if (hasFailure) {
  console.log('\nSome wild puzzles failed the audit — see above.');
  process.exit(1);
} else {
  console.log('\nAll wild puzzles passed the audit.');
}
