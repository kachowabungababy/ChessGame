import React, { useState } from 'react';
import { STARTER_PAWN_LINEUPS } from '../game/pokemonLineups';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

export default function StarterSelectionModal({ trainerName = 'Trainer', onSelectStarter }) {
  const [hoveredStarter, setHoveredStarter] = useState(STARTER_PAWN_LINEUPS[0]);
  const [confirmStarter, setConfirmStarter] = useState(null);

  const handleChoosePokeball = (starter) => {
    setConfirmStarter(starter);
    soundEffects.playVictorySound();
    speakText(`So! You want to choose the ${starter.stage1.name} as your Starter Partner, ${trainerName}?`, 'oak');
  };

  const handleConfirm = () => {
    if (confirmStarter) {
      speakText(`Great choice, ${trainerName}! ${confirmStarter.stage1.name} is now your walking partner!`, 'oak');
      onSelectStarter(confirmStarter.id);
    }
  };

  return (
    <div className="starter-modal-overlay animation-fade">
      <div className="starter-lab-card">
        {/* Header */}
        <header className="starter-lab-header font-poke">
          <div className="oak-mini-avatar">
            <img src="https://play.pokemonshowdown.com/sprites/trainers/oak.png" alt="Oak" className="oak-mini-img" />
          </div>
          <div>
            <h2 className="starter-lab-title">PROFESSOR OAK'S LAB</h2>
            <p className="starter-lab-sub">Choose your Starter Partner Pokémon to begin your adventure!</p>
          </div>
        </header>

        {/* Lab Table with Pokeballs */}
        <div className="oak-lab-table font-poke">
          <span className="table-label">POKÉBALL SELECTION TABLE</span>
          <div className="pokeball-row">
            {STARTER_PAWN_LINEUPS.map((stl) => (
              <div
                key={stl.id}
                className={`pokeball-item ${hoveredStarter?.id === stl.id ? 'active' : ''}`}
                onMouseEnter={() => setHoveredStarter(stl)}
                onClick={() => handleChoosePokeball(stl)}
              >
                <div className="pokeball-icon-bounce">🔴</div>
                <span className="pokeball-mon-name font-poke">{stl.stage1.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Starter Preview Display */}
        <div className="starter-preview-display font-poke">
          <div className="starter-sprite-frame">
            <img
              src={hoveredStarter.stage1.iconUrl}
              alt={hoveredStarter.stage1.name}
              className="starter-sprite-large wild-hover"
            />
          </div>

          <div className="starter-details">
            <h3 className="starter-display-name">{hoveredStarter.name}</h3>
            <span className="starter-chain-pill">
              Evolution Line: {hoveredStarter.stage1.name} ► {hoveredStarter.stage2.name} ► {hoveredStarter.stage3.name}
            </span>
            <p className="starter-quote">
              "This Pokémon will march as your Pawns and follow you on your Campaign Map!"
            </p>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmStarter && (
          <div className="starter-confirm-box animation-fade font-poke">
            <h3>Take {confirmStarter.stage1.name} with you, {trainerName}?</h3>
            <div className="confirm-btn-row">
              <button className="btn-battle-start font-poke" onClick={handleConfirm}>
                YES! TAKE {confirmStarter.stage1.name.toUpperCase()}! ►
              </button>
              <button className="btn-switch-nav font-poke" onClick={() => setConfirmStarter(null)}>
                NO, LOOK AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
