import React, { useEffect, useState } from 'react';
import { playHappyBirthdaySong } from '../game/birthdayAudio';
import { speakText } from '../game/speechAudio';

export default function BirthdaySurpriseModal({ trainerName = 'Trainer', onComplete }) {
  const [songStep, setSongStep] = useState(0);

  useEffect(() => {
    // Play real 8-bit GBA Happy Birthday Song melody synth!
    playHappyBirthdaySong();

    const birthdaySongText = `Happy Birthday to you! Happy Birthday to you! Happy Birthday dear ${trainerName}! Happy Birthday to you! Pika Pika! Pikachu, Charmander, Bulbasaur, and Squirtle wish you the happiest birthday ever!`;
    speakText(birthdaySongText, 'pikachu');

    const timer1 = setTimeout(() => setSongStep(1), 3500);
    const timer2 = setTimeout(() => setSongStep(2), 7000);
    const timer3 = setTimeout(() => setSongStep(3), 10500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [trainerName]);

  return (
    <div className="birthday-surprise-overlay font-poke animation-fade">
      {/* Floating Animated Balloons */}
      <div className="balloon-container">
        <div className="balloon b1">🎈</div>
        <div className="balloon b2">🔴</div>
        <div className="balloon b3">🟡</div>
        <div className="balloon b4">🔵</div>
        <div className="balloon b5">🟢</div>
        <div className="balloon b6">🎉</div>
      </div>

      <div className="birthday-party-card">
        {/* Banner Title */}
        <header className="birthday-party-header">
          <div className="party-hat-icon">🥳 🎂 🥳</div>
          <h1 className="birthday-party-title">🎉 HAPPY BIRTHDAY, {trainerName.toUpperCase()}! 🎉</h1>
          <p className="birthday-party-sub">The Pokémon assembled a special birthday song performance for you!</p>
        </header>

        {/* 4 Starter Pokémon with Birthday Party Hats */}
        <div className="party-pokemon-row">
          <div className="party-mon-unit">
            <span className="party-hat-crown">🥳</span>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
              alt="Pikachu"
              className="party-sprite hgss-walk-bounce"
            />
            <span className="mon-label">Pikachu ⚡</span>
          </div>

          <div className="party-mon-unit">
            <span className="party-hat-crown">🎩</span>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
              alt="Charmander"
              className="party-sprite hgss-walk-bounce"
            />
            <span className="mon-label">Charmander 🔥</span>
          </div>

          <div className="party-mon-unit">
            <span className="party-hat-crown">🥳</span>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
              alt="Bulbasaur"
              className="party-sprite hgss-walk-bounce"
            />
            <span className="mon-label">Bulbasaur 🌿</span>
          </div>

          <div className="party-mon-unit">
            <span className="party-hat-crown">🎩</span>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
              alt="Squirtle"
              className="party-sprite hgss-walk-bounce"
            />
            <span className="mon-label">Squirtle 💧</span>
          </div>
        </div>

        {/* Birthday Song Performance Text Box */}
        <div className="birthday-song-box font-poke">
          <div className="song-notes">🎶 🎵 🎶</div>
          <p className="song-lyric-line">
            {songStep === 0 && `"🎶 Happy Birthday to you! Happy Birthday to you! 🎶"`}
            {songStep === 1 && `"🎶 Happy Birthday dear ${trainerName}! Happy Birthday to you! 🎶"`}
            {songStep >= 2 && `"⚡ Pika Pika! Pikachu and your Pokémon team wish you the happiest Birthday ever! 🎂🎈"`}
          </p>
        </div>

        {/* Continue Button */}
        <div className="party-footer">
          <button
            className="btn-battle-start font-poke"
            onClick={onComplete}
          >
            THANK YOU POKÉMON! START ADVENTURE! ►
          </button>
        </div>
      </div>
    </div>
  );
}
