import React from 'react';
import Square from './Square';

export default function Board({
  board,
  selectedSquare,
  possibleMoves = [],
  lastMove = null,
  inCheckSquare = null,
  showMoveHighlights = true,
  showTooltips = true,
  onSquareClick,
  disabled = false,
}) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className={`chess-board-wrapper ${disabled ? 'disabled' : ''}`}>
      <div className="chess-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => {
              const squareName = `${files[colIndex]}${8 - rowIndex}`;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isPossibleMove = possibleMoves.includes(squareName);
              const isLastMove =
                lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isInCheck = inCheckSquare === squareName;

              return (
                <Square
                  key={squareName}
                  squareName={squareName}
                  isDark={isDark}
                  isSelected={isSelected}
                  isPossibleMove={isPossibleMove}
                  isLastMove={isLastMove}
                  inCheck={isInCheck}
                  piece={cell}
                  showMoveHighlight={showMoveHighlights}
                  showTooltip={showTooltips}
                  onClick={(sq) => !disabled && onSquareClick(sq)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
