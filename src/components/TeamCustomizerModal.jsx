import React, { useState } from 'react';
import {
  PAWN_OPTIONS,
  KNIGHT_OPTIONS,
  BISHOP_OPTIONS,
  ROOK_OPTIONS,
  QUEEN_OPTIONS,
  KING_OPTIONS,
} from '../game/pokemonLineups';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

export default function TeamCustomizerModal({ currentTeam, onSaveTeam, onClose }) {
  const [selectedPawn, setSelectedPawn] = useState(currentTeam?.pawnId || PAWN_OPTIONS[0].id);
  const [selectedKnight, setSelectedKnight] = useState(currentTeam?.knightId || KNIGHT_OPTIONS[0].id);
  const [selectedBishop, setSelectedBishop] = useState(currentTeam?.bishopId || BISHOP_OPTIONS[0].id);
  const [selectedRook, setSelectedRook] = useState(currentTeam?.rookId || ROOK_OPTIONS[0].id);
  const [selectedQueen, setSelectedQueen] = useState(currentTeam?.queenId || QUEEN_OPTIONS[0].id);
  const [selectedKing, setSelectedKing] = useState(currentTeam?.kingId || KING_OPTIONS[0].id);

  const handleSave = () => {
    soundEffects.playVictorySound();
    speakText('Pokémon Chess Team saved successfully!', 'pikachu');
    onSaveTeam({
      pawnId: selectedPawn,
      knightId: selectedKnight,
      bishopId: selectedBishop,
      rookId: selectedRook,
      queenId: selectedQueen,
      kingId: selectedKing,
    });
  };

  return (
    <div className="team-modal-overlay animation-fade font-poke">
      <div className="team-modal-card">
        <header className="team-modal-header">
          <h2 className="team-modal-title font-poke">⚙️ POKÉMON TEAM LINEUP CUSTOMIZER</h2>
          <p className="team-modal-sub">Assign a Pokémon evolutionary line to each chess piece role!</p>
        </header>

        <div className="team-role-sections">
          {/* Pawn Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♟️ Pawn Lineup (Starter Marchers):</h4>
            <div className="role-options-row">
              {PAWN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedPawn === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedPawn(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Knight Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♞ Knight Lineup (Jumping Equines):</h4>
            <div className="role-options-row">
              {KNIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedKnight === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedKnight(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bishop Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♝ Bishop Lineup (Diagonal Slashers):</h4>
            <div className="role-options-row">
              {BISHOP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedBishop === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedBishop(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rook Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♜ Rook Lineup (Heavy Defenders):</h4>
            <div className="role-options-row">
              {ROOK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedRook === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedRook(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Queen Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♛ Queen Lineup (Powerful Sweepers):</h4>
            <div className="role-options-row">
              {QUEEN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedQueen === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedQueen(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* King Selection */}
          <div className="role-selector-box">
            <h4 className="role-label">♚ King Lineup (Majestic Rulers):</h4>
            <div className="role-options-row">
              {KING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`btn-role-choice ${selectedKing === opt.id ? 'active' : ''}`}
                  onClick={() => setSelectedKing(opt.id)}
                >
                  <img src={opt.stage1.iconUrl} alt={opt.name} className="role-icon-img" />
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="team-modal-footer">
          <button className="btn-battle-start font-poke" onClick={handleSave}>
            SAVE POKÉMON TEAM LINEUP ►
          </button>
          <button className="btn-switch-nav font-poke" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
