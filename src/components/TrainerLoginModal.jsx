import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../game/profileStorage';
import { speakText } from '../game/speechAudio';

export default function TrainerLoginModal({ onLogin, currentProfile = null }) {
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'signin', 'guest'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'boy', 'girl'
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [avatarId, setAvatarId] = useState(currentProfile?.avatarId || 'ash');
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
    if (authMode === 'guest') {
      onLogin('Guest', 'ash', false);
      return;
    }

    if (!handle.trim()) return;
    onLogin(handle.trim(), avatarId, rememberMe);
  };

  const handleQuickName = (nameStr) => {
    setHandle(nameStr);
    speakText(`Welcome, Trainer ${nameStr}!`, 'oak');
  };

  return (
    <div className="login-modal-overlay animation-fade">
      <div className="login-modal-card">
        {/* Top Mode Navigation Tabs */}
        <nav className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            📝 New Game
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => setAuthMode('signin')}
          >
            🔑 Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn guest ${authMode === 'guest' ? 'active' : ''}`}
            onClick={() => setAuthMode('guest')}
          >
            👤 Play as Guest
          </button>
        </nav>

        {/* Mode 1: New Game / Sign Up (Professor Oak Intro) */}
        {authMode === 'signup' && (
          <>
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
                  <h2 className="oak-title font-poke">PROFESSOR OAK:</h2>
                  <button
                    type="button"
                    className="btn-tts-speaker font-poke"
                    onClick={() =>
                      speakText(
                        'Hello there! Welcome to the world of Pokémon Chess! Are you a Boy or a Girl? And what is your name?',
                        'oak'
                      )
                    }
                  >
                    🔊 Read Aloud
                  </button>
                </div>
                <p className="oak-speech">
                  "Hello there! Welcome to the world of Pokémon Chess! Choose whether you are a Boy or a Girl, pick your Trainer avatar, and enter your name!"
                </p>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Step 1: Gender Filter & Avatar Selector */}
              <div className="form-group">
                <div className="gender-tab-row">
                  <label className="form-label font-poke">1. Are you a Boy or a Girl?</label>
                  <div className="gender-btn-group">
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

              {/* Step 2: Trainer Name Input */}
              <div className="form-group">
                <label className="form-label font-poke">2. What is your Trainer Name?</label>
                <input
                  type="text"
                  className="trainer-handle-input"
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

              {/* Remember Me Checkbox */}
              <div className="form-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="form-actions font-poke">
                <button type="submit" className="btn-battle-start font-poke">
                  [A] START POKÉMON ADVENTURE! ►
                </button>
              </div>
            </form>
          </>
        )}

        {/* Mode 2: Existing Trainer Sign In */}
        {authMode === 'signin' && (
          <form onSubmit={handleSubmit} className="login-form signin-box">
            <div className="signin-header">
              <h3 className="signin-title font-poke">🔑 TRAINER SIGN IN</h3>
              <p className="signin-desc">Enter your registered Trainer Handle to load your ELO, Badges, and Pokédex!</p>
            </div>

            <div className="form-group">
              <label className="form-label font-poke">Trainer Name / Handle:</label>
              <input
                type="text"
                className="trainer-handle-input"
                placeholder="Enter registered Trainer Name..."
                maxLength={16}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </div>

            <div className="form-actions font-poke">
              <button type="submit" className="btn-battle-start font-poke">
                LOAD TRAINER PROFILE ►
              </button>
            </div>
          </form>
        )}

        {/* Mode 3: Play as Guest */}
        {authMode === 'guest' && (
          <div className="login-form guest-box">
            <h3 className="guest-title font-poke">👤 PLAY AS GUEST</h3>

            <div className="guest-warning-box">
              <span className="warning-icon font-poke">⚠️ SAVE WARNING:</span>
              <p className="warning-text">
                Playing as a Guest allows quick matches, but your <strong>Story Campaign progress, Gym Badges, Pokédex, and ELO ratings will NOT be saved</strong> when closing the browser!
              </p>
            </div>

            <div className="form-actions font-poke">
              <button
                type="button"
                className="btn-guest-start font-poke"
                onClick={() => onLogin('Guest', 'ash', false)}
              >
                PLAY AS GUEST ANYWAY ►
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
