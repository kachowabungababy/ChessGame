import React, { useEffect } from 'react';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

export default function EvolutionOverlay({ oldPawn, newPawn, trainerName = 'Trainer', onComplete }) {
  useEffect(() => {
    soundEffects.playVictorySound();
    speakText(`What? Your partner ${oldPawn.name} is evolving! Congratulations, ${trainerName}! ${oldPawn.name} evolved into ${newPawn.name}!`, 'pikachu');
  }, [oldPawn, newPawn, trainerName]);

  return (
    <div className="evolution-overlay font-poke animation-fade">
      <div className="evolution-card">
        <div className="glowing-aura-ring" />

        <h2 className="evolution-title font-poke">WHAT? YOUR PARTNER IS EVOLVING!</h2>

        {/* Evolution Sprite Comparison Box */}
        <div className="evolution-sprites-row">
          <div className="evolution-sprite-unit">
            <img src={oldPawn.iconUrl} alt={oldPawn.name} className="evo-sprite old-form" />
            <span className="evo-name old font-poke">{oldPawn.name}</span>
          </div>

          <div className="evo-arrow-spark font-poke">⚡ ► 🌟</div>

          <div className="evolution-sprite-unit">
            <img src={newPawn.iconUrl} alt={newPawn.name} className="evo-sprite new-form evo-glow-pulse" />
            <span className="evo-name new font-poke">{newPawn.name}</span>
          </div>
        </div>

        {/* Evolution Dialogue */}
        <div className="evolution-dialogue-box font-poke">
          <p>
            "Congratulations, <strong>{trainerName}</strong>! Your partner <strong>{oldPawn.name}</strong> evolved into <strong>{newPawn.name}</strong>!"
          </p>
        </div>

        {/* Continue Button */}
        <button className="btn-battle-start font-poke" onClick={onComplete}>
          CONTINUE CAMPAIGN [A] ►
        </button>
      </div>
    </div>
  );
}
