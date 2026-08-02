import React, { useMemo } from 'react';

export default function PikachuCoachBanner({ engine, activeBoard, turn }) {
  const hintText = useMemo(() => {
    if (!engine || !activeBoard) {
      return 'Control the center of the board and develop your pieces!';
    }

    try {
      // 1. In Check Warning
      if (engine.inCheck()) {
        return '⚡ Pikachu says: CHECK! Your King is under attack! Protect your King right away!';
      }

      // 2. Check for captures available
      const possibleMoves = engine.chess.moves({ verbose: true });
      const captures = possibleMoves.filter((m) => m.captured);

      if (captures.length > 0) {
        const bestCap = captures[0];
        const pieceNames = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' };
        const attackerPiece = pieceNames[bestCap.piece] || 'Piece';
        const defenderPiece = pieceNames[bestCap.captured] || 'Piece';
        return `⚡ Pikachu Tip: Your ${attackerPiece} at ${bestCap.from} can capture their ${defenderPiece} at ${bestCap.to}!`;
      }

      // 3. General Beginner Advice
      return '⚡ Pikachu Tip: Try moving your Knights and Bishops towards the center of the board!';
    } catch (e) {
      return '⚡ Pikachu Tip: Think ahead before making your move!';
    }
  }, [engine, activeBoard, turn]);

  return (
    <div className="pikachu-coach-banner font-poke animation-fade">
      <div className="pikachu-avatar-badge">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          alt="Pikachu Coach"
          className="pikachu-coach-img"
        />
      </div>
      <p className="pikachu-hint-text">{hintText}</p>
    </div>
  );
}
