import React from 'react';
import Piece from './Piece';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function computeGameStats(board, gameMode) {
  const initialCounts = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };

  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  if (board) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r]?.[c];
        if (p) {
          currentCounts[p.color][p.type] = (currentCounts[p.color][p.type] || 0) + 1;
        }
      }
    }
  }

  const capturedWhite = []; // White pieces captured by Black
  const capturedBlack = []; // Black pieces captured by White

  const order = ['q', 'r', 'b', 'n', 'p'];

  for (const type of order) {
    const missingWhite = Math.max(0, initialCounts.w[type] - (currentCounts.w[type] || 0));
    for (let i = 0; i < missingWhite; i++) {
      capturedWhite.push({ color: 'w', type, id: `w_${type}_${i}` });
    }

    const missingBlack = Math.max(0, initialCounts.b[type] - (currentCounts.b[type] || 0));
    for (let i = 0; i < missingBlack; i++) {
      capturedBlack.push({ color: 'b', type, id: `b_${type}_${i}` });
    }
  }

  let whiteMaterial = 0;
  let blackMaterial = 0;
  for (const type of ['p', 'n', 'b', 'r', 'q']) {
    whiteMaterial += (currentCounts.w[type] || 0) * PIECE_VALUES[type];
    blackMaterial += (currentCounts.b[type] || 0) * PIECE_VALUES[type];
  }

  const diff = whiteMaterial - blackMaterial;
  const total = whiteMaterial + blackMaterial;

  let advantageText = 'Equal Position (50.0% / 50.0%)';
  if (diff !== 0 && total > 0) {
    const leadSide = diff > 0 ? (gameMode === 'ai' ? 'Player' : 'White') : (gameMode === 'ai' ? 'Computer' : 'Black');
    // Percentage advantage formula (0% to 100%)
    const pct = ((Math.abs(diff) / 39) * 100).toFixed(1);
    advantageText = `${pct}% Advantage for ${leadSide}`;
  }

  return {
    capturedWhite,
    capturedBlack,
    advantageText,
    diff,
  };
}

export default function CapturedPiecesTray({ pieces = [], showTooltips = true }) {
  if (!pieces || pieces.length === 0) {
    return <div className="captured-tray-empty font-poke">No captures yet</div>;
  }

  return (
    <div className="captured-tray-list">
      {pieces.map((item) => (
        <div key={item.id} className="captured-piece-card">
          <Piece type={item.type} color={item.color} showTooltip={showTooltips} />
        </div>
      ))}
    </div>
  );
}
