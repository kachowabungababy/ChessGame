import React from 'react';
import Piece from './Piece';

export default function Square({
  squareName,
  isDark,
  isSelected,
  isPossibleMove,
  isLastMove,
  inCheck,
  piece,
  showMoveHighlight = true,
  showTooltip = true,
  onClick,
}) {
  return (
    <div
      className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${
        showMoveHighlight && isPossibleMove ? 'possible-move' : ''
      } ${isLastMove ? 'last-move' : ''} ${inCheck ? 'in-check' : ''}`}
      onClick={() => onClick(squareName)}
      data-square={squareName}
    >
      {showMoveHighlight && isPossibleMove && (
        <div className={`move-dot ${piece ? 'capture-ring' : ''}`} />
      )}
      {piece && <Piece type={piece.type} color={piece.color} showTooltip={showTooltip} />}
      <span className="square-label">{squareName}</span>
    </div>
  );
}
