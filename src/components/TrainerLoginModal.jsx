import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../game/profileStorage';
import { STARTER_PAWN_LINEUPS } from '../game/pokemonLineups';
import { DIFFICULTY_TIERS } from '../game/storyCampaign';
import { speakText } from '../game/speechAudio';

export default function TrainerLoginModal({ onLogin, currentProfile = null }) {
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'boy', 'girl'
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [avatarId, setAvatarId] = useState(currentProfile?.avatarId || 'ash');
  const [starterLineId, setStarterLineId] = useState(currentProfile?.starterLineId || 'pichu_line');
  const [difficultyTier, setDifficultyTier] = useState(currentProfile?.difficultyTier || 'rookie');
  const [rememberMe, setRememberMe] = useState(
    currentProfile?.rememberMe !== undefined ? currentProfile.rememberMe : true
  );

  const filteredAvatars = AVATAR_OPTIONS.filter((av) => {
    if (genderFilter === 'boy') return av.gender.includes('Boy');
    if (genderFilter === 'girl') return av.gender.includes('Girl');
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handle.trim()) return;
    onLogin(handle.trim(), avatarId, rememberMe, difficultyTier, starterLineId);
  };

  const handleQuickName = (nameStr) => {
    setHandle(nameStr);
    speakText(`Welcome, Trainer ${nameStr}!`, 'oak');
  };

  return (
    <div className="login-modal-overlay animation-fade">
      <div className="login-modal-card">
        {/* Professor Oak Intro Header */}
        <header className="login-oak-intro-header font-poke">
          <div className="oak-sprite-box">
            <img
              src="https://play.pokemonshowdown.com/sprites/trainers/oak.png"
              alt="Professor Oak"
              className="oak-head-img"
            />
          </div>
          <div className="oak-intro-text">
            <div className="oak-title-row">
              <h2 className="oak-title">PROFESSOR OAK:</h2>
              <button
                type="button"
                className="btn-tts-speaker"
                onClick={() => speakText("Hello there! Welcome to the world of Pokémon Chess! Are you a Boy or a Girl? And what is your name?", 'oak')}
              >
                🔊 Read Aloud
              </button>
            </div>
            <p className="oak-speech">
              "Hello there! Welcome to the world of Pokémon Chess! First, select whether you are a Boy or a Girl, choose your Trainer avatar, and enter your name!"
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="login-form font-poke">
          {/* Step 1: Gender Filter & Avatar Selector */}
          <div className="form-group">
            <div className="gender-tab-row">
              <label className="form-label font-poke">1. Are you a Boy or a Girl?</label>
              <div className="gender-btn-group font-poke">
                <button
                  type="button"
                  className={`btn-gender-filter ${genderFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setGenderFilter('all')}
                >
                  All Trainers
                </button>
                <button
                  type="button"
                  className={`btn-gender-filter boy ${genderFilter === 'boy' ? 'active' : ''}`}
                  onClick={() => setGenderFilter('boy')}
                >
                  👦 Boy
                </button>
                <button
                  type="button"
                  className={`btn-gender-filter girl ${genderFilter === 'girl' ? 'active' : ''}`}
                  onClick={() => setGenderFilter('girl')}
                >
                  👧 Girl
                </button>
              </div>
            </div>

            <div className="avatar-grid font-poke">
              {filteredAvatars.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-choice-btn ${avatarId === av.id ? 'active' : ''}`}
                  onClick={() => {
                    setAvatarId(av.id);
                    speakText(`Selected Trainer ${av.name}`, 'oak');
                  }}
                >
                  <img src={av.url} alt={av.name} className="avatar-img" />
                  <span className="avatar-name">{av.name}</span>
                  <span className="avatar-gender-sub">{av.region}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Trainer Name Input & Quick Select Chips */}
          <div className="form-group">
            <label className="form-label font-poke">2. What is your Trainer Name?</label>
            <input
              type="text"
              className="trainer-handle-input font-poke"
              placeholder="Enter your name... (e.g. Leo, Ash, Red)"
              maxLength={16}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
            <div className="quick-name-chips font-poke">
              <span className="quick-label">Quick Names:</span>
              {['Leo', 'Ash', 'Red', 'May', 'Dawn', 'Gold', 'Ruby'].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleQuickName(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Starter Partner Pokémon */}
          <div className="form-group">
            <label className="form-label font-poke">3. Choose Starter Partner Pokémon (Pawns):</label>
            <div className="starter-picker-grid">
              {STARTER_PAWN_LINEUPS.map((stl) => (
                <button
                  key={stl.id}
                  type="button"
                  className={`starter-choice-card ${starterLineId === stl.id ? 'active' : ''}`}
                  onClick={() => {
                    setStarterLineId(stl.id);
                    speakText(`Partner selected: ${stl.stage1.name}!`, 'pikachu');
                  }}
                >
                  <img src={stl.stage1.iconUrl} alt={stl.stage1.name} className="starter-card-img" />
                  <div className="starter-card-info">
                    <strong className="starter-name">{stl.name}</strong>
                    <span className="starter-evo-chain">
                      {stl.stage1.name} ► {stl.stage2.name} ► {stl.stage3.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Difficulty Tier */}
          <div className="form-group">
            <label className="form-label font-poke">4. Select Campaign Mode:</label>
            <div className="tier-modal-grid">
              {Object.values(DIFFICULTY_TIERS).map((t) => (
                <div
                  key={t.id}
                  className={`tier-modal-card ${difficultyTier === t.id ? 'active' : ''}`}
                  onClick={() => setDifficultyTier(t.id)}
                >
                  <div className="tier-modal-header">
                    <span className="tier-modal-icon">{t.icon}</span>
                    <strong className="tier-modal-name font-poke">{t.name}</strong>
                  </div>
                  <p className="tier-modal-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="form-actions font-poke">
            <button type="submit" className="btn-battle-start font-poke">
              [A] START POKÉMON CHESS ADVENTURE! ►
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
