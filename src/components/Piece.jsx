import React, { useState, useEffect } from 'react';
import { ROSTER } from '../game/pokemonRoster';
import { getSprite } from '../game/pokeApi';

const UNICODE_FALLBACK = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const PIECE_NAMES = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

export default function Piece({ type, color, showTooltip = true, pieceStyle = 'pokemon' }) {
  const [spriteUrl, setSpriteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isClassic = pieceStyle === 'classic';
  const pokemonName = !isClassic ? ROSTER[color]?.[type] : null;

  useEffect(() => {
    let isMounted = true;
    if (pokemonName) {
      setLoading(true);
      setError(false);
      getSprite(pokemonName).then((url) => {
        if (isMounted) {
          if (url) {
            setSpriteUrl(url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [pokemonName]);

  if (!type || !color) return null;

  const pieceName = PIECE_NAMES[type] || type;
  const colorName = color === 'w' ? 'White' : 'Black';
  const formattedPoke = pokemonName
    ? pokemonName
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

  const fullLabel = formattedPoke
    ? `${formattedPoke} • ${colorName} ${pieceName}`
    : `${colorName} ${pieceName}`;

  return (
    <div className={`chess-piece-container piece-${color} piece-${type}`}>
      {showTooltip && <span className="piece-hover-tooltip">{fullLabel}</span>}
      {!isClassic && spriteUrl && !error ? (
        <img
          src={spriteUrl}
          alt={fullLabel}
          className={`pokemon-sprite-img ${loading ? 'loading' : 'loaded'}`}
          draggable={false}
          onError={() => setError(true)}
        />
      ) : (
        <span className="chess-piece-glyph">
          {UNICODE_FALLBACK[color]?.[type] || '?'}
        </span>
      )}
    </div>
  );
}
