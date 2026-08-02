import React, { useState, useEffect, useCallback } from 'react';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

// 12x10 GBA Tile Map Grid for Pallet Town / Oak's Lab Area
// T: Tree/Fence (solid), G: Grass (walkable), P: Path (walkable), H: House, L: Oak's Lab, B: Pokéball Table
const MAP_GRID = [
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'H', 'H', 'T', 'T', 'L', 'L', 'L', 'T', 'T', 'T', 'T'],
  ['T', 'H', 'H', 'G', 'G', 'L', 'B', 'L', 'G', 'G', 'G', 'T'],
  ['T', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'G', 'T'],
  ['T', 'G', 'G', 'P', 'G', 'G', 'G', 'P', 'G', 'G', 'G', 'T'],
  ['T', 'G', 'G', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'G', 'T'],
  ['T', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
];

export default function GBATileMap({ profile, onInteractPokeball, onTriggerBirthday, onBackToMenu }) {
  // Player grid position: starting in front of House (row 3, col 1)
  const [playerPos, setPlayerPos] = useState({ r: 3, c: 1 });
  const [facing, setFacing] = useState('down'); // 'up', 'down', 'left', 'right'
  const [partnerPos, setPartnerPos] = useState({ r: 3, c: 0 });
  const [npcPrompt, setNpcPrompt] = useState('Use D-Pad or Arrow Keys to walk around Pallet Town!');

  const trainerAvatar = profile?.avatarUrl || 'https://play.pokemonshowdown.com/sprites/trainers/red.png';
  const partnerSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';

  const movePlayer = useCallback((dr, dc, dir) => {
    setFacing(dir);
    setPlayerPos((prev) => {
      const nr = prev.r + dr;
      const nc = prev.c + dc;

      // Check map bounds
      if (nr < 0 || nr >= MAP_GRID.length || nc < 0 || nc >= MAP_GRID[0].length) return prev;

      const tile = MAP_GRID[nr][nc];
      // Solid tiles check
      if (tile === 'T' || tile === 'H') {
        soundEffects.playErrorSound();
        return prev;
      }

      // Partner follows previous player position!
      setPartnerPos(prev);
      soundEffects.playMoveSound();

      // Check special interactive tiles
      if (tile === 'B' || (nr === 2 && nc === 6)) {
        setNpcPrompt("Press [A] to inspect Professor Oak's Starter Pokéballs!");
        speakText("Press A to inspect Professor Oak's Starter Pokéballs!", 'oak');
      } else if (tile === 'L') {
        setNpcPrompt("Inside Professor Oak's Pokémon Research Lab!");
      } else {
        setNpcPrompt("Walking around Pallet Town...");
      }

      return { r: nr, c: nc };
    });
  }, []);

  // Keyboard Arrow / WASD Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') movePlayer(-1, 0, 'up');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') movePlayer(1, 0, 'down');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') movePlayer(0, -1, 'left');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') movePlayer(0, 1, 'right');
      if (e.key === 'Enter' || e.key === ' ') {
        // Interact with tile in front
        if (playerPos.r === 2 && playerPos.c === 6) {
          onInteractPokeball();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, playerPos, onInteractPokeball]);

  return (
    <div className="gba-map-wrapper font-poke animation-fade">
      {/* Handheld Game Boy Console Outer Frame */}
      <div className="gba-console-shell">
        <header className="gba-screen-header">
          <button className="btn-switch-nav font-poke" onClick={onBackToMenu}>
            ◄ MENU
          </button>
          <span className="gba-game-title font-poke">PALLET TOWN — GBA TILE MAP</span>
          <span className="battery-led green" />
        </header>

        {/* GBA 2D Tile Grid Canvas */}
        <main className="gba-tile-grid">
          {MAP_GRID.map((row, rIdx) => (
            <div key={rIdx} className="grid-row">
              {row.map((tile, cIdx) => {
                const isPlayerHere = playerPos.r === rIdx && playerPos.c === cIdx;
                const isPartnerHere = partnerPos.r === rIdx && partnerPos.c === cIdx;
                const isPokeballTable = rIdx === 2 && cIdx === 6;

                return (
                  <div
                    key={cIdx}
                    className={`grid-tile tile-${tile} ${isPokeballTable ? 'pokeball-table-tile' : ''}`}
                  >
                    {/* Render Pokéball Table */}
                    {isPokeballTable && (
                      <div className="table-pokeballs-sprite" onClick={onInteractPokeball} title="Tap Pokéballs">
                        🔴🔴🔴
                      </div>
                    )}

                    {/* Render Player Trainer Sprite */}
                    {isPlayerHere && (
                      <img
                        src={trainerAvatar}
                        alt="Trainer"
                        className={`player-grid-sprite dir-${facing}`}
                      />
                    )}

                    {/* Render HeartGold Partner Sprite */}
                    {isPartnerHere && !isPlayerHere && (
                      <img
                        src={partnerSprite}
                        alt="Partner"
                        className="partner-grid-sprite hgss-walk-bounce"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </main>

        {/* Dialogue Banner */}
        <div className="gba-dialogue-bar font-poke">
          <p className="gba-prompt-text">{npcPrompt}</p>
        </div>

        {/* On-Screen GBA D-Pad & Action Buttons */}
        <footer className="gba-controls-pad">
          <div className="dpad-cross">
            <button className="dpad-btn up" onClick={() => movePlayer(-1, 0, 'up')}>▲</button>
            <button className="dpad-btn left" onClick={() => movePlayer(0, -1, 'left')}>◄</button>
            <button className="dpad-btn right" onClick={() => movePlayer(0, 1, 'right')}>►</button>
            <button className="dpad-btn down" onClick={() => movePlayer(1, 0, 'down')}>▼</button>
          </div>

          <div className="action-buttons-group">
            <button
              className="gba-action-btn btn-a font-poke"
              onClick={() => {
                if (playerPos.r === 2 && playerPos.c === 6) {
                  onInteractPokeball();
                } else {
                  speakText("Stepping around Pallet Town! Move closer to Oak's Table!", 'oak');
                }
              }}
            >
              [A] TALK / INTERACT
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
