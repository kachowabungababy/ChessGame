// One-time content-fill generator for the wild-encounter puzzle pool (see
// src/game/wildPuzzles/). Every region only had 1-2 puzzles, so the same 1-2 Pokemon (and
// the same chess idea) repeated on almost every step through a "tall grass" encounter zone.
// This script builds >=30 validated puzzles per region from a small set of hand-checked
// chess "shapes" — opening moves, hanging-piece captures, forced mates, and genuine
// multi-move tactics (fork-then-capture, mate-in-2 with a forced reply in between) — reskins
// each shape with a regional Pokemon, re-verifies every ply against chess.js (legality +,
// for mate claims, actual checkmate), writes one file per puzzle, and regenerates index.js's
// static import list. Run with: node scripts/generate-wild-puzzles.mjs
// Always follow with: npm run audit:puzzles

import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../src/game/wildPuzzles');
const SPRITE = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

function sq(file, rank) {
  return `${'abcdefgh'[file]}${rank + 1}`;
}

function buildFen(pieces, turn) {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const { square, piece } of pieces) {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1], 10) - 1;
    board[rank][file] = piece;
  }
  const rows = [];
  for (let r = 7; r >= 0; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        row += p;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  return `${rows.join('/')} ${turn} - - 0 1`;
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Every shape below is normalized to the same shape: { type, difficulty, weight, fen,
// sequence: [{from,to}, ...], hints: [one per PLAYER move], promptText (shown up front),
// titleSuffix, isMate }. A `sequence` of length 1 is a plain single-move puzzle; length 3 is
// player-move, forced-opponent-reply, player-move.

// ---------------------------------------------------------------------------
// Shape family 1: opening moves (easy). All trivially legal from the standard start.
// ---------------------------------------------------------------------------
const OPENING_MOVES = [
  { from: 'e2', to: 'e4', label: 'King Pawn Push', prompt: 'Advance your Pawn to e4 to control the center!', hint: 'Move your Pawn from e2 to e4!' },
  { from: 'd2', to: 'd4', label: 'Queen Pawn Push', prompt: 'Push your Queen Pawn to d4 to claim the middle!', hint: 'Move your Pawn from d2 to d4!' },
  { from: 'g1', to: 'f3', label: 'Knight Development', prompt: 'Develop your Knight to f3!', hint: 'Move your Knight from g1 to f3!' },
  { from: 'b1', to: 'c3', label: 'Knight Development', prompt: 'Develop your Knight to c3!', hint: 'Move your Knight from b1 to c3!' },
  { from: 'c2', to: 'c4', label: 'Wing Pawn Push', prompt: 'Advance your Pawn to c4 for extra space!', hint: 'Move your Pawn from c2 to c4!' },
  { from: 'g2', to: 'g3', label: 'Fianchetto Setup', prompt: 'Push your Pawn to g3 to open a path for your Bishop!', hint: 'Move your Pawn from g2 to g3!' },
  { from: 'b2', to: 'b3', label: 'Fianchetto Setup', prompt: 'Push your Pawn to b3 to open a path for your other Bishop!', hint: 'Move your Pawn from b2 to b3!' },
  { from: 'e2', to: 'e3', label: 'Solid Pawn Push', prompt: 'Push your Pawn to e3 — a safe, solid start!', hint: 'Move your Pawn from e2 to e3!' },
];

const openingShapes = OPENING_MOVES.map((m) => ({
  type: 'Opening',
  difficulty: 'easy',
  weight: 60,
  fen: START_FEN,
  sequence: [{ from: m.from, to: m.to }],
  hints: [m.hint],
  promptText: m.prompt,
  titleSuffix: m.label,
  isMate: false,
}));

// ---------------------------------------------------------------------------
// Shape family 2: hanging-piece captures (easy/medium). Sparse boards, kings kept far
// enough from the target square (chebyshev distance >= 2) that no recapture is possible.
// ---------------------------------------------------------------------------
const CAPTURE_SHAPES_RAW = [
  { attacker: 'P', from: 'e4', to: 'd5', target: 'p', wk: 'a1', bk: 'h8', label: 'Free Pawn Capture', difficulty: 'easy', weight: 55 },
  { attacker: 'P', from: 'c4', to: 'd5', target: 'p', wk: 'a1', bk: 'h8', label: 'Free Pawn Capture', difficulty: 'easy', weight: 55 },
  { attacker: 'P', from: 'f4', to: 'e5', target: 'p', wk: 'a1', bk: 'h8', label: 'Free Pawn Capture', difficulty: 'easy', weight: 55 },
  { attacker: 'N', from: 'd4', to: 'b5', target: 'p', wk: 'g1', bk: 'h8', label: 'Knight Snack', difficulty: 'medium', weight: 35 },
  { attacker: 'N', from: 'e5', to: 'c6', target: 'p', wk: 'g1', bk: 'h8', label: 'Knight Snack', difficulty: 'medium', weight: 35 },
  { attacker: 'N', from: 'c3', to: 'd5', target: 'p', wk: 'g1', bk: 'h8', label: 'Knight Snack', difficulty: 'medium', weight: 35 },
  { attacker: 'N', from: 'f5', to: 'd6', target: 'b', wk: 'g1', bk: 'h8', label: 'Knight Snack', difficulty: 'medium', weight: 30 },
  { attacker: 'B', from: 'c4', to: 'f7', target: 'p', wk: 'g1', bk: 'a8', label: 'Bishop Dive', difficulty: 'medium', weight: 30 },
  { attacker: 'B', from: 'g2', to: 'b7', target: 'p', wk: 'a1', bk: 'h8', label: 'Long Diagonal Snipe', difficulty: 'medium', weight: 30 },
  { attacker: 'R', from: 'h1', to: 'h6', target: 'p', wk: 'a1', bk: 'a8', label: 'Rook Swoop', difficulty: 'medium', weight: 25 },
  { attacker: 'R', from: 'a1', to: 'a6', target: 'n', wk: 'h1', bk: 'h8', label: 'Rook Swoop', difficulty: 'medium', weight: 25 },
  { attacker: 'R', from: 'e1', to: 'e6', target: 'n', wk: 'a1', bk: 'h8', label: 'Rook Swoop', difficulty: 'medium', weight: 25 },
  { attacker: 'Q', from: 'd1', to: 'd5', target: 'b', wk: 'a1', bk: 'h8', label: 'Queen Strike', difficulty: 'hard', weight: 18 },
  { attacker: 'Q', from: 'a4', to: 'd7', target: 'r', wk: 'a1', bk: 'h8', label: 'Queen Strike', difficulty: 'hard', weight: 18 },
];

const PIECE_DISPLAY = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen' };
const TARGET_DISPLAY = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' };

const captureShapes = CAPTURE_SHAPES_RAW.map((c) => {
  const pieces = [
    { square: c.from, piece: c.attacker },
    { square: c.to, piece: c.target },
    { square: c.wk, piece: 'K' },
    { square: c.bk, piece: 'k' },
  ];
  return {
    type: c.label,
    difficulty: c.difficulty,
    weight: c.weight,
    fen: buildFen(pieces, 'w'),
    sequence: [{ from: c.from, to: c.to }],
    hints: [`Move your ${PIECE_DISPLAY[c.attacker]} from ${c.from} to ${c.to} to grab the ${TARGET_DISPLAY[c.target]}!`],
    promptText: `Capture the ${TARGET_DISPLAY[c.target]} on ${c.to} with your ${PIECE_DISPLAY[c.attacker]}!`,
    titleSuffix: c.label,
    isMate: false,
  };
});

// ---------------------------------------------------------------------------
// Shape family 3: forced checkmates in one move (medium/hard). Two validated patterns, each
// translated across the board for variety. Re-verified with chess.isCheckmate().
// ---------------------------------------------------------------------------
const mateShapesRaw = [];

// Pattern A: king trapped on the back rank behind its own pawns, rook swoops down an
// open file to deliver back-rank mate.
for (let x = 1; x <= 6; x++) {
  const kingSq = sq(x, 7);
  const pawnSquares = [sq(x - 1, 6), sq(x, 6), sq(x + 1, 6)];
  const candidateFiles = [0, 1, 2, 3, 4, 5, 6, 7].filter((f) => f !== x - 1 && f !== x && f !== x + 1);
  const rookFile = candidateFiles[x % candidateFiles.length];
  const wkFile = candidateFiles[(x + 2) % candidateFiles.length];
  mateShapesRaw.push({
    label: 'Back-Rank Checkmate',
    difficulty: 'medium',
    weight: 22,
    pieces: [
      { square: kingSq, piece: 'k' },
      ...pawnSquares.map((s) => ({ square: s, piece: 'p' })),
      { square: sq(rookFile, 0), piece: 'R' },
      { square: sq(wkFile, 0), piece: 'K' },
    ],
    from: sq(rookFile, 0),
    to: sq(rookFile, 7),
    promptText: `Slide your Rook all the way down to ${sq(rookFile, 7)} for Checkmate!`,
    hintText: `Move your Rook to ${sq(rookFile, 7)} — the King is trapped behind its own Pawns!`,
  });
}

// Pattern B: King + Queen corner mate. White King takes two of the corner's escape
// squares, Queen delivers check along the open rank/file covering the third.
const CORNERS = [
  { bk: 'a8', wk: 'b6', qFrom: 'd1', qTo: 'd8' },
  { bk: 'h8', wk: 'g6', qFrom: 'e1', qTo: 'e8' },
  { bk: 'a1', wk: 'b3', qFrom: 'd8', qTo: 'd1' },
  { bk: 'h1', wk: 'g3', qFrom: 'e8', qTo: 'e1' },
];
for (const c of CORNERS) {
  mateShapesRaw.push({
    label: 'Queen Corner Checkmate',
    difficulty: 'hard',
    weight: 15,
    pieces: [
      { square: c.bk, piece: 'k' },
      { square: c.wk, piece: 'K' },
      { square: c.qFrom, piece: 'Q' },
    ],
    from: c.qFrom,
    to: c.qTo,
    promptText: `Bring your Queen to ${c.qTo} for Checkmate — your King has already cut off the escape!`,
    hintText: `Move your Queen to ${c.qTo}. Your King blocks two escape squares, and your Queen covers the rest!`,
  });
}

const mateShapes = mateShapesRaw.map((m) => ({
  type: m.label,
  difficulty: m.difficulty,
  weight: m.weight,
  fen: buildFen(m.pieces, 'w'),
  sequence: [{ from: m.from, to: m.to }],
  hints: [m.hintText],
  promptText: m.promptText,
  titleSuffix: m.label,
  isMate: true,
}));

// ---------------------------------------------------------------------------
// Shape family 4: fork-then-capture (medium/hard, 3-ply: player check+fork, forced king
// move, player captures the forked piece). A real multi-move tactic, not just "land the
// fork and stop" — three board geometries, each reskinned with two different capture
// targets.
// ---------------------------------------------------------------------------
const FORK_CAPTURE_RAW = [
  { bk: 'g8', pawns: ['f7', 'g7', 'h7'], nFrom: 'c6', nTo: 'e7', wk: 'g1', kingReply: 'f8', target: 'r', targetSq: 'c8' },
  { bk: 'g8', pawns: ['f7', 'g7', 'h7'], nFrom: 'c6', nTo: 'e7', wk: 'g1', kingReply: 'f8', target: 'q', targetSq: 'c8' },
  { bk: 'e8', pawns: ['d7', 'e7', 'f7'], nFrom: 'a6', nTo: 'c7', wk: 'e1', kingReply: 'd8', target: 'r', targetSq: 'a8' },
  { bk: 'e8', pawns: ['d7', 'e7', 'f7'], nFrom: 'a6', nTo: 'c7', wk: 'e1', kingReply: 'd8', target: 'b', targetSq: 'a8' },
  { bk: 'f8', pawns: ['e7', 'f7', 'g7'], nFrom: 'b6', nTo: 'd7', wk: 'f1', kingReply: 'e8', target: 'r', targetSq: 'b8' },
  { bk: 'f8', pawns: ['e7', 'f7', 'g7'], nFrom: 'b6', nTo: 'd7', wk: 'f1', kingReply: 'e8', target: 'b', targetSq: 'b8' },
];

const forkCaptureShapes = FORK_CAPTURE_RAW.map((f) => {
  const pieces = [
    { square: f.bk, piece: 'k' },
    ...f.pawns.map((s) => ({ square: s, piece: 'p' })),
    { square: f.targetSq, piece: f.target },
    { square: f.nFrom, piece: 'N' },
    { square: f.wk, piece: 'K' },
  ];
  const targetName = TARGET_DISPLAY[f.target];
  return {
    type: 'Knight Fork',
    difficulty: f.target === 'q' ? 'hard' : 'medium',
    weight: f.target === 'q' ? 16 : 26,
    fen: buildFen(pieces, 'w'),
    sequence: [
      { from: f.nFrom, to: f.nTo },
      { from: f.bk, to: f.kingReply },
      { from: f.nTo, to: f.targetSq },
    ],
    hints: [
      `Jump your Knight to ${f.nTo} — check! It also attacks the ${targetName} on ${f.targetSq}!`,
      `The King had to run. Now capture the ${targetName} with your Knight on ${f.targetSq}!`,
    ],
    promptText: `Fork the King and the ${targetName} — jump your Knight to ${f.nTo}!`,
    titleSuffix: 'Knight Fork',
    isMate: false,
  };
});

// ---------------------------------------------------------------------------
// Shape family 5: mate-in-2 (hard, 3-ply: player checks with the only-one-escape square,
// forced king reply, player mates). One base geometry mirrored into all 4 corners.
// ---------------------------------------------------------------------------
const MATE_IN_2_BASE = { bk: [0, 7], wk: [1, 5], nFrom: [1, 4], nTo: [2, 6], rFrom: [7, 6], rTo: [7, 7], kingReply: [1, 7] };

function mirrorCoord([f, r], mf, mr) {
  return sq(mf ? 7 - f : f, mr ? 7 - r : r);
}

const mateInTwoShapes = [
  [false, false], [true, false], [false, true], [true, true],
].map(([mf, mr]) => {
  const bk = mirrorCoord(MATE_IN_2_BASE.bk, mf, mr);
  const wk = mirrorCoord(MATE_IN_2_BASE.wk, mf, mr);
  const nFrom = mirrorCoord(MATE_IN_2_BASE.nFrom, mf, mr);
  const nTo = mirrorCoord(MATE_IN_2_BASE.nTo, mf, mr);
  const rFrom = mirrorCoord(MATE_IN_2_BASE.rFrom, mf, mr);
  const rTo = mirrorCoord(MATE_IN_2_BASE.rTo, mf, mr);
  const kingReply = mirrorCoord(MATE_IN_2_BASE.kingReply, mf, mr);

  const pieces = [
    { square: bk, piece: 'k' },
    { square: wk, piece: 'K' },
    { square: nFrom, piece: 'N' },
    { square: rFrom, piece: 'R' },
  ];

  return {
    type: 'Mate in Two',
    difficulty: 'hard',
    weight: 12,
    fen: buildFen(pieces, 'w'),
    sequence: [
      { from: nFrom, to: nTo },
      { from: bk, to: kingReply },
      { from: rFrom, to: rTo },
    ],
    hints: [
      `Jump your Knight to ${nTo} — check! Your King already blocks two escape squares, so there's only one square left for the enemy King to run to.`,
      `Now bring your Rook all the way to ${rTo} for Checkmate!`,
    ],
    promptText: `Checkmate in 2! First, jump your Knight to ${nTo} for check.`,
    titleSuffix: 'Mate in Two',
    isMate: true,
  };
});

const ALL_SHAPES = [...openingShapes, ...captureShapes, ...mateShapes, ...forkCaptureShapes, ...mateInTwoShapes];

// ---------------------------------------------------------------------------
// Validate every shape ONCE (a shape's geometry is reused across all regions, only the
// Pokemon skin changes per region).
// ---------------------------------------------------------------------------
function validateShape(shape, idx) {
  let chess;
  try {
    chess = new Chess(shape.fen);
  } catch (e) {
    throw new Error(`shape #${idx} invalid FEN (${shape.fen}): ${e.message}`);
  }

  let lastResult = null;
  for (let i = 0; i < shape.sequence.length; i++) {
    const ply = shape.sequence[i];
    const legal = chess.moves({ square: ply.from, verbose: true });
    const match = legal.find((m) => m.to === ply.to);
    if (!match) {
      throw new Error(
        `shape #${idx} ply ${i + 1} (${ply.from}->${ply.to}) not legal ` +
          `(legal destinations from ${ply.from}: ${legal.map((m) => m.to).join(', ') || 'none'}) — fen so far: ${chess.fen()}`
      );
    }
    lastResult = chess.move({ from: ply.from, to: ply.to, promotion: 'q' });
    if (!lastResult) {
      throw new Error(`shape #${idx} ply ${i + 1} move rejected`);
    }
  }

  const finalPly = shape.sequence[shape.sequence.length - 1];
  if (lastResult.captured) {
    const recaptures = chess.moves({ verbose: true }).filter((m) => m.to === finalPly.to);
    if (recaptures.length > 0) {
      throw new Error(`shape #${idx} final capture on ${finalPly.to} is recapturable (${recaptures.map((m) => m.san).join(', ')})`);
    }
  }
  if (shape.isMate && !chess.isCheckmate()) {
    throw new Error(`shape #${idx} claims checkmate but final position isn't (${shape.fen})`);
  }
  if (!shape.isMate && chess.isCheckmate()) {
    throw new Error(`shape #${idx} is accidentally checkmate but wasn't meant to be — text won't match`);
  }
}

ALL_SHAPES.forEach(validateShape);
console.log(
  `Validated ${ALL_SHAPES.length} puzzle shapes ` +
    `(${openingShapes.length} opening, ${captureShapes.length} capture, ${mateShapes.length} mate, ` +
    `${forkCaptureShapes.length} fork-capture, ${mateInTwoShapes.length} mate-in-2).`
);

// ---------------------------------------------------------------------------
// Regions: species pool (Gen 1-3 dex numbers only, for sprite-URL confidence) + emoji/flavor.
// ---------------------------------------------------------------------------
const REGIONS = {
  petalburg: {
    displayName: 'Petalburg Woods',
    emoji: '🌿',
    species: [
      ['Caterpie', 10], ['Metapod', 11], ['Weedle', 13], ['Kakuna', 14], ['Beedrill', 15],
      ['Oddish', 43], ['Paras', 46], ['Venonat', 48], ['Bellsprout', 69], ['Scyther', 123],
      ['Pineco', 204], ['Sunkern', 191], ['Hoppip', 187], ['Yanma', 193], ['Wurmple', 265],
      ['Silcoon', 266], ['Cascoon', 268], ['Seedot', 273], ['Surskit', 283], ['Shroomish', 285],
      ['Nincada', 290], ['Volbeat', 313], ['Illumise', 314], ['Roselia', 315],
    ],
  },
  volcano: {
    displayName: 'Mt. Chimney Volcano',
    emoji: '🌋',
    species: [
      ['Vulpix', 37], ['Growlithe', 58], ['Ponyta', 77], ['Magmar', 126], ['Charmeleon', 5],
      ['Houndour', 228], ['Numel', 322], ['Torkoal', 324], ['Magby', 240], ['Torchic', 255],
      ['Combusken', 256], ['Camerupt', 323],
    ],
  },
  classic: {
    displayName: 'Indigo League',
    emoji: '⭐',
    species: [
      ['Rattata', 19], ['Pidgey', 16], ['Meowth', 52], ['Psyduck', 54], ['Machop', 66],
      ['Geodude', 74], ['Abra', 63], ['Magikarp', 129], ['Ekans', 23], ['Sandshrew', 27],
      ['Jigglypuff', 39], ['Clefairy', 35], ['Ditto', 132], ['Snorlax', 143], ['Bulbasaur', 1],
      ['Pidgeotto', 17], ['Spearow', 21], ['Nidoran', 32],
    ],
  },
  sootopolis: {
    displayName: 'Sootopolis Lake',
    emoji: '💧',
    species: [
      ['Poliwag', 60], ['Tentacool', 72], ['Horsea', 116], ['Goldeen', 118], ['Staryu', 120],
      ['Wooper', 194], ['Marill', 183], ['Corsola', 222], ['Chinchou', 170], ['Qwilfish', 211],
      ['Mudkip', 258], ['Wingull', 278], ['Carvanha', 318], ['Wailmer', 320], ['Barboach', 339],
      ['Clamperl', 366],
    ],
  },
  mauville: {
    displayName: 'Mauville Plant',
    emoji: '⚡',
    species: [
      ['Voltorb', 100], ['Electrike', 309], ['Plusle', 311], ['Minun', 312], ['Pichu', 172],
      ['Elekid', 239], ['Magneton', 82], ['Skarmory', 227], ['Aron', 304], ['Mareep', 179],
      ['Flaaffy', 180],
    ],
  },
  ice: {
    displayName: 'Shoal Ice Cave',
    emoji: '❄️',
    species: [
      ['Spheal', 363], ['Swinub', 220], ['Sneasel', 215], ['Delibird', 225], ['Smoochum', 238],
      ['Dewgong', 87], ['Seel', 86], ['Jynx', 124], ['Piloswine', 221], ['Glalie', 362],
      ['Lapras', 131], ['Cloyster', 91],
    ],
  },
};

// ---------------------------------------------------------------------------
// Emit one file per (region, shape) pairing.
// ---------------------------------------------------------------------------
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function jsEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let totalWritten = 0;
const generatedFiles = [];

for (const [regionKey, regionDef] of Object.entries(REGIONS)) {
  const speciesList = regionDef.species;
  const emoji = regionDef.emoji;
  ALL_SHAPES.forEach((shape, i) => {
    const [pokemonName, dexId] = speciesList[i % speciesList.length];
    const dupCount = Math.floor(i / speciesList.length);
    const idSuffix = dupCount > 0 ? `_${dupCount}` : '';
    const slug = `${toSlug(pokemonName)}${idSuffix}_${i}`;
    const id = `wild_${regionKey}_${slug}`;

    const title = `${pokemonName}'s ${shape.titleSuffix}! ${emoji}`;
    const prompt = `A Wild ${pokemonName} appeared in ${regionDef.displayName}! ${shape.promptText}`;
    const rewardText = `Gotcha! Wild ${pokemonName} was caught! Registered in ${regionDef.displayName} Pokedex! ${emoji}`;
    const stepHints = shape.hints.map((h) => `Pikachu says: ${h}`);
    const coachHint = stepHints[0];
    const isMultiPly = shape.sequence.length > 1;

    const solutionField = isMultiPly
      ? `solutionMoves: [${shape.sequence.map((m) => `{ from: '${m.from}', to: '${m.to}' }`).join(', ')}],\n  stepHints: [${stepHints.map((h) => `'${jsEscape(h)}'`).join(', ')}],`
      : `solutionMove: { from: '${shape.sequence[0].from}', to: '${shape.sequence[0].to}' },`;

    const content = `// Auto-generated by scripts/generate-wild-puzzles.mjs — ${regionDef.displayName} (${regionKey})
// Do not hand-edit shape/geometry fields (fen, solutionMove(s)) without re-running
// \`npm run audit:puzzles\`.
export default {
  id: '${id}',
  pokemonName: '${jsEscape(pokemonName)}',
  region: '${regionKey}',
  iconUrl: '${SPRITE(dexId)}',
  type: '${jsEscape(shape.type)}',
  difficulty: '${shape.difficulty}',
  weight: ${shape.weight},
  title: '${jsEscape(title)}',
  prompt: '${jsEscape(prompt)}',
  fen: '${shape.fen}',
  ${solutionField}
  rewardText: '${jsEscape(rewardText)}',
  coachHint: '${jsEscape(coachHint)}',
};
`;
    const fileName = `${id}.js`;
    fs.writeFileSync(path.join(OUT_DIR, fileName), content);
    generatedFiles.push({ id, fileName });
    totalWritten++;
  });
}

console.log(`Wrote ${totalWritten} generated puzzle files (${Object.keys(REGIONS).length} regions x ${ALL_SHAPES.length} shapes).`);

// ---------------------------------------------------------------------------
// Regenerate index.js: keep the existing hand-authored puzzle files' imports, add every
// generated file, and rebuild the array + pickWeightedWildPuzzle helper.
// ---------------------------------------------------------------------------
const HAND_AUTHORED = [
  'wild_pikachu', 'wild_treecko', 'wild_charmander', 'wild_slugma', 'wild_squirtle',
  'wild_lotad', 'wild_magnemite', 'wild_snorunt', 'wild_eevee',
];

const allIds = [...HAND_AUTHORED, ...generatedFiles.map((f) => f.id)];

function toVarName(id) {
  return id.replace(/(^|_)([a-z0-9])/g, (_m, _u, c) => c.toUpperCase());
}

const importLines = allIds.map((id) => `import ${toVarName(id)} from './${id}.js';`).join('\n');
const arrayLines = allIds.map((id) => `  ${toVarName(id)},`).join('\n');

const indexContent = `// Environment-Mapped Wild Pokemon Tactical Quiz Encounters
//
// Each puzzle lives in its own file (one per encounter) so a single puzzle can be reviewed,
// edited, or audited in isolation instead of scrolling a giant shared array. Run
// \`npm run audit:puzzles\` after adding or editing a puzzle here — it verifies the FEN is
// legal, the solutionMove(s) are actually playable, and that the prompt/coachHint text agrees
// with what the move(s) really do (see scripts/audit-wild-puzzles.mjs).
//
// A puzzle is either a single move (\`solutionMove\`) or a full alternating sequence
// (\`solutionMoves\`: player, forced opponent reply, player, ...; paired with \`stepHints\`,
// one hint per player move) for genuine multi-move tactics like fork-then-capture or
// mate-in-2. See WildPuzzleScreen.jsx for how the sequence is played out.
//
// The bulk of this file's entries were content-filled by scripts/generate-wild-puzzles.mjs
// (>=30 validated puzzles per region) so a "tall grass" zone doesn't repeat the same 1-2
// Pokemon on every step. Re-run that generator (not by hand) if a region needs more variety.
//
// \`weight\` = relative rarity within a region (higher = more common), used by
// pickWeightedWildPuzzle(). \`difficulty\` is a display label ('easy'|'medium'|'hard').

${importLines}

export const WILD_POKEMON_PUZZLES = [
${arrayLines}
];

/**
 * Weighted random pick of a wild puzzle within a region (rarer species have lower weight).
 * @param {string} region
 * @returns {object|null}
 */
export function pickWeightedWildPuzzle(region) {
  const candidates = WILD_POKEMON_PUZZLES.filter((p) => p.region === region);
  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, p) => sum + (p.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const p of candidates) {
    roll -= p.weight || 1;
    if (roll <= 0) return p;
  }
  return candidates[candidates.length - 1];
}
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.js'), indexContent);
console.log(`Regenerated index.js with ${allIds.length} total puzzles.`);
