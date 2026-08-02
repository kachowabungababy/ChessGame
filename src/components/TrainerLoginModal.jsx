import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../game/profileStorage';
import { DIFFICULTY_TIERS } from '../game/storyCampaign';

export default function TrainerLoginModal({ onLogin, currentProfile = null }) {
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [avatarId, setAvatarId] = useState(currentProfile?.avatarId || 'ash');
  const [difficultyTier, setDifficultyTier] = useState(currentProfile?.difficultyTier || 'rookie');
  const [rememberMe, setRememberMe] = useState(
    currentProfile?.rememberMe !== undefined ? currentProfile.rememberMe : true
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handle.trim()) return;
    onLogin(handle.trim(), avatarId, rememberMe, difficultyTier);
  };

  const handleGuest = () => {
    onLogin('Guest', 'ash', false, 'rookie');
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card animation-fade">
        <header className="login-modal-header">
          <div className="trainer-badge-icon font-poke">🎮</div>
          <h2 className="login-title font-poke">Trainer Registration</h2>
          <p className="login-subtitle">
            Enter your unique Trainer Handle to track your profile ELO & badges!
          </p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Handle Input */}
          <div className="form-group">
            <label className="form-label font-poke">Unique Trainer Handle:</label>
            <input
              type="text"
              className="trainer-handle-input font-poke"
              placeholder="e.g. Ash, Red, Leo..."
              maxLength={16}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
          </div>

          {/* Campaign Difficulty Tier Selection */}
          <div className="form-group">
            <label className="form-label font-poke">Campaign Difficulty Tier (Locked for Profile):</label>
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

          {/* Avatar Selector */}
          <div className="form-group">
            <label className="form-label font-poke">Select Trainer Avatar:</label>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-choice-btn ${avatarId === av.id ? 'active' : ''}`}
                  onClick={() => setAvatarId(av.id)}
                >
                  <img src={av.url} alt={av.name} className="avatar-img" />
                  <span className="avatar-name">{av.name}</span>
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

          {/* Actions */}
          <div className="login-actions">
            <button type="submit" className="btn-start-game font-poke">
              Start Journey [►]
            </button>
            <button
              type="button"
              className="btn-guest font-poke"
              onClick={handleGuest}
            >
              Play as Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
