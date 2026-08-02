import React, { useEffect, useState } from 'react';
import { speakText } from '../game/speechAudio';

export default function LadyEscortOverlay({ trainerName = 'Trainer', onArriveAtLab }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    speakText(`Follow me, ${trainerName}! The Pokémon Lab and Oak's Table are right this way!`, 'joy');

    const timer1 = setTimeout(() => setStep(1), 2000);
    const timer2 = setTimeout(() => {
      onArriveAtLab();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [trainerName, onArriveAtLab]);

  return (
    <div className="lady-escort-overlay animation-fade font-poke">
      <div className="lady-escort-card">
        {/* Walking Escort Animation Track */}
        <div className="escort-track-area">
          <div className={`lady-unit ${step === 1 ? 'walking-right' : ''}`}>
            <img
              src="https://play.pokemonshowdown.com/sprites/trainers/lady-gen3.png"
              alt="Lady Guide"
              className="lady-sprite hgss-walk-bounce"
            />
            <span className="escort-label font-poke">Lady Guide 🏃‍♀️</span>
          </div>

          <div className="escort-dots">► ► ► ► ►</div>

          <div className="destination-lab-box">
            <img
              src="https://play.pokemonshowdown.com/sprites/trainers/oak.png"
              alt="Lab"
              className="lab-oak-sprite"
            />
            <span className="escort-label font-poke">Oak's Table 🔴</span>
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="escort-dialogue-box font-poke">
          <strong className="speaker-name">Lady Guide:</strong>
          <p className="speaker-text">
            "{step === 0 ? `Follow me, ${trainerName}! I'll guide you to the Pokémon Table!` : `We're almost there, ${trainerName}! Here comes your special birthday surprise!`}"
          </p>
        </div>
      </div>
    </div>
  );
}
