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
  pieceStyle = 'pokemon',
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
      {piece && (
        <Piece type={piece.type} color={piece.color} showTooltip={showTooltip} pieceStyle={pieceStyle} />
      )}
      <span className="square-label">{squareName}</span>
    </div>
  );
}
