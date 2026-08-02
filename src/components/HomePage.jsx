import React, { useState, useEffect } from 'react';
import { ARENA_THEMES } from '../game/themes';

const ELO_PRESETS = [
  {
    elo: 400,
    rank: 'Youngster',
    desc: 'Rookie • Makes frequent random mistakes',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster.png',
  },
  {
    elo: 800,
    rank: 'Bug Catcher',
    desc: 'Novice • Takes obvious open pieces',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
  },
  {
    elo: 1200,
    rank: 'Gym Leader',
    desc: 'Intermediate • Balanced tactical moves',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
  },
  {
    elo: 1600,
    rank: 'Elite Four',
    desc: 'Advanced • Move hints locked OFF',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
  },
  {
    elo: 2000,
    rank: 'Champion',
    desc: 'Master • High-depth Minimax calculation',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
  },
  {
    elo: 2400,
    rank: 'Red / Legend',
    desc: 'Grandmaster • Flawless strategic play',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
  },
];

export default function HomePage({
  onStartGame,
  initialElo = 1200,
  initialMode = 'ai',
  initialPlayerColor = 'w',
  initialShowMoves = true,
  initialShowTooltips = true,
  initialTheme = 'classic',
  pieceStyle = 'pokemon',
  onTogglePieceStyle,
}) {
  const [mode, setMode] = useState(initialMode);
  const [playerColor, setPlayerColor] = useState(initialPlayerColor);
  const [elo, setElo] = useState(initialElo);
  const [showMoveHighlights, setShowMoveHighlights] = useState(initialShowMoves);
  const [showTooltips, setShowTooltips] = useState(initialShowTooltips);
  const [theme, setTheme] = useState(initialTheme);

  // ELO rule: 1600+ ELO locks move highlights OFF (unallowed in high tier matches)
  const isMoveHighlightsLocked = mode === 'ai' && elo >= 1600;

  useEffect(() => {
    if (isMoveHighlightsLocked) {
      setShowMoveHighlights(false);
    }
  }, [isMoveHighlightsLocked]);

  // Apply body theme background preview
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getRankInfo = (rating) => {
    let closest = ELO_PRESETS[0];
    for (const preset of ELO_PRESETS) {
      if (Math.abs(preset.elo - rating) < Math.abs(closest.elo - rating)) {
        closest = preset;
      }
    }
    return closest;
  };

  const activeRank = getRankInfo(elo);

  const handleStart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onStartGame === 'function') {
      onStartGame({
        mode,
        elo,
        playerColor,
        showMoveHighlights: isMoveHighlightsLocked ? false : showMoveHighlights,
        showTooltips,
        theme,
      });
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        {/* Header Title */}
        <header className="home-header">
          <div className="pokeball-badge">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Pokeball"
              className="pokeball-img"
            />
          </div>
          <h1 className="home-title font-poke">Pokémon Battle Chess</h1>
          <p className="home-subtitle">
            Configure your match settings prior to starting the game!
          </p>
        </header>

        {/* Mode Selector */}
        <div className="home-section">
          <h3 className="section-label">Select Game Mode</h3>
          <div className="mode-cards-grid">
            <div
              className={`mode-card ${mode === '2p' ? 'active' : ''}`}
              onClick={() => setMode('2p')}
            >
              <div className="mode-icon">👥</div>
              <div className="mode-details">
                <h4>2 Player Local</h4>
                <p>Pass & Play on the same screen</p>
              </div>
              <div className="radio-indicator">{mode === '2p' ? '●' : '○'}</div>
            </div>

            <div
              className={`mode-card ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => setMode('ai')}
            >
              <div className="mode-icon">🤖</div>
              <div className="mode-details">
                <h4>Play vs AI</h4>
                <p>Battle an ELO-calibrated Pokémon AI</p>
              </div>
              <div className="radio-indicator">{mode === 'ai' ? '●' : '○'}</div>
            </div>
          </div>
        </div>

        {/* Side Selector (When mode is AI) */}
        {mode === 'ai' && (
          <div className="home-section animation-fade">
            <h3 className="section-label">Choose Your Side</h3>
            <div className="mode-cards-grid">
              <div
                className={`mode-card ${playerColor === 'w' ? 'active' : ''}`}
                onClick={() => setPlayerColor('w')}
              >
                <div className="mode-icon">⚪</div>
                <div className="mode-details">
                  <h4>Play as White</h4>
                  <p>Move 1st • Pikachu & White Team</p>
                </div>
                <div className="radio-indicator">{playerColor === 'w' ? '●' : '○'}</div>
              </div>

              <div
                className={`mode-card ${playerColor === 'b' ? 'active' : ''}`}
                onClick={() => setPlayerColor('b')}
              >
                <div className="mode-icon">🌑</div>
                <div className="mode-details">
                  <h4>Play as Black</h4>
                  <p>Move 2nd • Poochyena & Black Team</p>
                </div>
                <div className="radio-indicator">{playerColor === 'b' ? '●' : '○'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Arena Theme Selector */}
        <div className="home-section">
          <h3 className="section-label">Select Battle Arena Theme</h3>
          <div className="theme-cards-grid">
            {ARENA_THEMES.map((t) => (
              <div
                key={t.id}
                className={`theme-card ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <span className="theme-card-icon">{t.icon}</span>
                <div className="theme-card-info">
                  <h4>{t.name}</h4>
                  <p>{t.desc}</p>
                </div>
                <div className="radio-indicator">{theme === t.id ? '●' : '○'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ELO Difficulty Selector (vs AI mode) */}
        {mode === 'ai' && (
          <div className="home-section elo-section animation-fade">
            <div className="elo-header">
              <h3 className="section-label">AI Difficulty Rating</h3>
              <div className="elo-badge">
                <img
                  src={activeRank.iconUrl}
                  alt={activeRank.rank}
                  className="trainer-icon-img"
                />
                <strong>{elo} ELO</strong> — {activeRank.rank}
              </div>
            </div>

            {/* Slider */}
            <div className="elo-slider-container">
              <input
                type="range"
                min="400"
                max="2400"
                step="50"
                value={elo}
                onChange={(e) => setElo(parseInt(e.target.value, 10))}
                className="elo-slider"
              />
              <div className="slider-ticks">
                <span>400</span>
                <span>800</span>
                <span>1200</span>
                <span>1600</span>
                <span>2000</span>
                <span>2400</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="presets-grid">
              {ELO_PRESETS.map((p) => (
                <button
                  key={p.elo}
                  className={`preset-btn ${elo === p.elo ? 'active' : ''}`}
                  onClick={() => setElo(p.elo)}
                  type="button"
                >
                  <img
                    src={p.iconUrl}
                    alt={p.rank}
                    className="trainer-icon-img"
                  />
                  <span className="preset-elo">{p.elo}</span>
                  <span className="preset-rank">{p.rank}</span>
                </button>
              ))}
            </div>

            <p className="elo-description">{activeRank.desc}</p>
          </div>
        )}

        {/* Pre-Match Game Settings Section */}
        <div className="home-section settings-pre-match-section">
          <h3 className="section-label">Match Settings</h3>
          <div className="settings-options-grid">
            {/* Show Legal Moves Toggle */}
            <div
              className={`setting-option-card ${
                isMoveHighlightsLocked ? 'locked-disabled' : ''
              }`}
            >
              <div className="setting-info">
                <h4>Legal Move Dots</h4>
                <p>Highlight valid destination squares when clicking a piece</p>
                {isMoveHighlightsLocked && (
                  <span className="locked-badge">🔒 Locked OFF at 1600+ ELO</span>
                )}
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${
                  (isMoveHighlightsLocked ? false : showMoveHighlights) ? 'on' : 'off'
                }`}
                disabled={isMoveHighlightsLocked}
                onClick={() => setShowMoveHighlights((prev) => !prev)}
              >
                {(isMoveHighlightsLocked ? false : showMoveHighlights) ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Show Pokémon Hover Names Toggle */}
            <div className="setting-option-card">
              <div className="setting-info">
                <h4>Pokémon Hover Badges</h4>
                <p>Show name tooltip when hovering pieces on board</p>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${showTooltips ? 'on' : 'off'}`}
                onClick={() => setShowTooltips((prev) => !prev)}
              >
                {showTooltips ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Classic Chess Pieces Toggle */}
            <div className="setting-option-card">
              <div className="setting-info">
                <h4>Classic Chess Pieces</h4>
                <p>Show normal chess piece symbols instead of Pokémon sprites</p>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${pieceStyle === 'classic' ? 'on' : 'off'}`}
                onClick={onTogglePieceStyle}
                disabled={!onTogglePieceStyle}
              >
                {pieceStyle === 'classic' ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="home-actions">
          <button
            type="button"
            className="btn-start-game font-poke"
            onClick={handleStart}
          >
            START GAME [►]
          </button>
        </div>
      </div>
    </div>
  );
}
