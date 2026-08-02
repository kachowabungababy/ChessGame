import React from 'react';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

export default function PromotionModal({ playerColor = 'w', onSelectPromotion }) {
  const options = [
    {
      piece: 'q',
      name: 'Queen',
      icon: '♛',
      pokemon: 'Blastoise / Charizard',
      iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png',
      desc: 'Powerful All-Rounder Sweeper!',
    },
    {
      piece: 'n',
      name: 'Knight',
      icon: '♞',
      pokemon: 'Rapidash',
      iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png',
      desc: 'Agile Jumper that leaps over defender walls!',
    },
    {
      piece: 'b',
      name: 'Bishop',
      icon: '♝',
      pokemon: 'Sceptile',
      iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/254.png',
      desc: 'Diagonal Slasher for long range attacks!',
    },
    {
      piece: 'r',
      name: 'Rook',
      icon: '♜',
      pokemon: 'Golem',
      iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png',
      desc: 'Heavy Defensive Fortress!',
    },
  ];

  const handleSelect = (choice) => {
    soundEffects.playVictorySound();
    speakText(`Pawn promoted to ${choice.name}!`, 'pikachu');
    onSelectPromotion(choice.piece);
  };

  return (
    <div className="promotion-modal-overlay animation-fade">
      <div className="promotion-modal-card font-poke">
        <header className="promotion-header">
          <div className="promo-sparkle">✨ 🌟 ✨</div>
          <h2 className="promo-title">PAWN PROMOTION EVOLUTION!</h2>
          <p className="promo-sub">Choose which evolved Pokémon form your Pawn becomes:</p>
        </header>

        <div className="promotion-options-grid">
          {options.map((opt) => (
            <button
              key={opt.piece}
              type="button"
              className="promotion-option-card"
              onClick={() => handleSelect(opt)}
            >
              <div className="promo-sprite-box">
                <img src={opt.iconUrl} alt={opt.name} className="promo-sprite-img wild-hover" />
              </div>
              <div className="promo-info font-poke">
                <span className="promo-piece-badge">
                  {opt.icon} {opt.name}
                </span>
                <strong className="promo-mon-name">{opt.pokemon}</strong>
                <p className="promo-desc">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
