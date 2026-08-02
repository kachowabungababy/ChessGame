import React, { useMemo, useEffect } from 'react';
import { speakText } from '../game/speechAudio';

export default function PikachuCoachBanner({ engine, activeBoard, turn, trainerName = 'Trainer' }) {
  const hintText = useMemo(() => {
    if (!engine || !activeBoard) {
      return `Pika Pika! Control the center of the board, ${trainerName}!`;
    }

    try {
      // 1. In Check Warning
      if (engine.inCheck()) {
        return `Pika Pika! CHECK, ${trainerName}! Your King is under attack! Protect your King right away!`;
      }

      // 2. Check for captures available
      const possibleMoves = engine.chess.moves({ verbose: true });
      const captures = possibleMoves.filter((m) => m.captured);

      if (captures.length > 0) {
        const bestCap = captures[0];
        const pieceNames = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' };
        const attackerPiece = pieceNames[bestCap.piece] || 'Piece';
        const defenderPiece = pieceNames[bestCap.captured] || 'Piece';
        return `Pika Pika! ${trainerName}, your ${attackerPiece} at ${bestCap.from} can capture their ${defenderPiece} at ${bestCap.to}!`;
      }

      // 3. General Beginner Advice
      return `Pika Pika! ${trainerName}, try moving your Knights and Bishops towards the center of the board!`;
    } catch (e) {
      return `Pika Pika! ${trainerName}, think ahead before making your move!`;
    }
  }, [engine, activeBoard, turn, trainerName]);

  // Read aloud automatically when in check
  useEffect(() => {
    if (engine && typeof engine.inCheck === 'function' && engine.inCheck()) {
      speakText(`Pika Pika! CHECK, ${trainerName}! Protect your King!`, 'pikachu');
    }
  }, [engine, turn, trainerName]);

  return (
    <div className="pikachu-coach-banner font-poke animation-fade">
      <div
        className="pikachu-avatar-badge"
        onClick={() => speakText(hintText, 'pikachu')}
        title="Tap Pikachu to listen"
        style={{ cursor: 'pointer' }}
      >
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          alt="Pikachu Coach"
          className="pikachu-coach-img"
        />
      </div>
      <p className="pikachu-hint-text">⚡ {hintText}</p>
      <button
        type="button"
        className="btn-tts-mini"
        onClick={() => speakText(hintText, 'pikachu')}
        title="Listen to Pikachu Coach out loud"
      >
        🔊 Pika Voice
      </button>
    </div>
  );
}
