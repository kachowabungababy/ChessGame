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
  flipped = false,
}) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const rowIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={`chess-board-wrapper ${disabled ? 'disabled' : ''}`}>
      <div className="chess-board">
        {rowIndices.map((rowIndex) => (
          <div key={rowIndex} className="board-row">
            {colIndices.map((colIndex) => {
              const squareName = `${files[colIndex]}${8 - rowIndex}`;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isPossibleMove = possibleMoves.includes(squareName);
              const isLastMove =
                lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isInCheck = inCheckSquare === squareName;
              const cell = board[rowIndex]?.[colIndex];

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
