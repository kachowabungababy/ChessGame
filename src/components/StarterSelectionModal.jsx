import React, { useState } from 'react';
import { ALL_PIECE_ROLE_OPTIONS, STARTER_PAWN_LINEUPS } from '../game/pokemonLineups';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

const POKEBALL_SPRITES = {
  pawn: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  knight: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  bishop: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  rook: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safari-ball.png',
  queen: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  king: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png',
};

export default function StarterSelectionModal({ trainerName = 'Trainer', onSelectStarter }) {
  const [selectedRoleTab, setSelectedRoleTab] = useState('pawn'); // 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'
  const [teamSelections, setTeamSelections] = useState({
    pawn: STARTER_PAWN_LINEUPS[0],
    knight: ALL_PIECE_ROLE_OPTIONS.knight[0],
    bishop: ALL_PIECE_ROLE_OPTIONS.bishop[0],
    rook: ALL_PIECE_ROLE_OPTIONS.rook[0],
    queen: ALL_PIECE_ROLE_OPTIONS.queen[0],
    king: ALL_PIECE_ROLE_OPTIONS.king[0],
  });
  const [hoveredStarter, setHoveredStarter] = useState(STARTER_PAWN_LINEUPS[0]);

  const handleChoosePokeball = (starter) => {
    setTeamSelections((prev) => ({
      ...prev,
      [selectedRoleTab]: starter,
    }));
    setHoveredStarter(starter);
    soundEffects.playVictorySound();
    speakText(`Selected ${starter.stage1 ? starter.stage1.name : starter.name} for your ${selectedRoleTab.toUpperCase()} role, ${trainerName}!`, 'oak');
  };

  const handleConfirm = () => {
    const chosenPawn = teamSelections.pawn || STARTER_PAWN_LINEUPS[0];
    speakText(`Awesome choices, ${trainerName}! Your custom 6-piece Pokémon team is ready for battle!`, 'oak');
    onSelectStarter(chosenPawn.id, teamSelections);
  };

  const currentRoleOptions = ALL_PIECE_ROLE_OPTIONS[selectedRoleTab] || STARTER_PAWN_LINEUPS;
  const activeSelectedForRole = teamSelections[selectedRoleTab];

  return (
    <div className="starter-modal-overlay animation-fade">
      <div className="starter-lab-card">
        {/* Header */}
        <header className="starter-lab-header font-poke">
          <div className="oak-mini-avatar">
            <img src="https://play.pokemonshowdown.com/sprites/trainers/oak.png" alt="Oak" className="oak-mini-img" />
          </div>
          <div>
            <h2 className="starter-lab-title">PROFESSOR BIRCH & OAK'S LAB</h2>
            <p className="starter-lab-sub">Select your Pokémon for all 6 Chess Piece Roles on the Lab Table!</p>
          </div>
        </header>

        {/* 6 Chess Piece Role Tabs */}
        <div className="role-selection-tabs font-poke">
          {[
            { role: 'pawn', label: '♟️ Pawn', ball: POKEBALL_SPRITES.pawn },
            { role: 'knight', label: '♞ Knight', ball: POKEBALL_SPRITES.knight },
            { role: 'bishop', label: '♝ Bishop', ball: POKEBALL_SPRITES.bishop },
            { role: 'rook', label: '♜ Rook', ball: POKEBALL_SPRITES.rook },
            { role: 'queen', label: '♛ Queen', ball: POKEBALL_SPRITES.queen },
            { role: 'king', label: '♚ King', ball: POKEBALL_SPRITES.king },
          ].map((tab) => (
            <button
              key={tab.role}
              type="button"
              className={`role-tab-btn ${selectedRoleTab === tab.role ? 'active' : ''}`}
              onClick={() => {
                setSelectedRoleTab(tab.role);
                setHoveredStarter(teamSelections[tab.role] || ALL_PIECE_ROLE_OPTIONS[tab.role][0]);
              }}
            >
              <img src={tab.ball} alt={tab.label} className="pokeball-tab-img" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Lab Table with Authentic Pokéballs */}
        <div className="oak-lab-table font-poke">
          <span className="table-label">POKÉBALL TABLE ({selectedRoleTab.toUpperCase()} ROLE CHOICES)</span>
          <div className="pokeball-row">
            {currentRoleOptions.map((stl) => {
              const isSelected = activeSelectedForRole?.id === stl.id;

              return (
                <div
                  key={stl.id}
                  className={`pokeball-item ${isSelected ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredStarter(stl)}
                  onClick={() => handleChoosePokeball(stl)}
                >
                  <img
                    src={POKEBALL_SPRITES[selectedRoleTab] || POKEBALL_SPRITES.pawn}
                    alt="Pokéball"
                    className="pokeball-png-sprite pokeball-icon-bounce"
                  />
                  <span className="pokeball-mon-name font-poke">
                    {stl.stage1 ? stl.stage1.name : stl.name}
                  </span>
                  {isSelected && <span className="selected-check-badge">✓ CHOSEN</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Starter Preview Display */}
        {hoveredStarter && (
          <div className="starter-preview-display font-poke">
            <div className="starter-sprite-frame">
              <img
                src={hoveredStarter.stage1 ? hoveredStarter.stage1.iconUrl : hoveredStarter.iconUrl}
                alt={hoveredStarter.stage1 ? hoveredStarter.stage1.name : hoveredStarter.name}
                className="starter-sprite-large hgss-walk-bounce"
              />
            </div>
            <div className="starter-preview-info">
              <div className="starter-preview-header">
                <h3 className="starter-preview-title">
                  {hoveredStarter.stage1 ? hoveredStarter.stage1.name : hoveredStarter.name}
                </h3>
                <span className="starter-type-badge">{selectedRoleTab.toUpperCase()} PIECE</span>
              </div>
              <p className="starter-role-desc">
                Stage 1: {hoveredStarter.stage1?.name || hoveredStarter.name} ➔ Stage 2: {hoveredStarter.stage2?.name || 'Form 2'} ➔ Stage 3: {hoveredStarter.stage3?.name || 'Final Form'}
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Action */}
        <div className="starter-actions font-poke">
          <button
            className="btn-battle-start font-poke"
            onClick={handleConfirm}
          >
            [A] CONFIRM 6-PIECE TEAM & START ADVENTURE ►
          </button>
        </div>
      </div>
    </div>
  );
}
