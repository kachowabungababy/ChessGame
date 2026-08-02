import React, { useState } from 'react';
import { getStagesForTier, DIFFICULTY_TIERS, MOTIVATING_NPCS } from '../game/storyCampaign';
import { AVATAR_OPTIONS, getTrainerRankTitle } from '../game/profileStorage';
import { speakText } from '../game/speechAudio';

export default function StoryMap({ profile, onSelectStage, onBackToHome, onChangeProfile }) {
  const [selectedStageId, setSelectedStageId] = useState(profile?.unlockedStage || 1);
  const activeTierId = profile?.difficultyTier || 'rookie';

  const activeStages = getStagesForTier(activeTierId);
  const avatarObj = AVATAR_OPTIONS.find((a) => a.id === profile?.avatarId) || AVATAR_OPTIONS[0];
  const rankTitle = getTrainerRankTitle(profile?.trainerElo || 100);

  const currentStageIndex = activeStages.findIndex((s) => s.id === selectedStageId);
  const currentStage = activeStages[currentStageIndex] || activeStages[0];

  const isUnlocked = currentStage.id <= (profile?.unlockedStage || 1);
  const currentTierObj = DIFFICULTY_TIERS[activeTierId] || DIFFICULTY_TIERS.rookie;
  const activeNpc = MOTIVATING_NPCS[(selectedStageId - 1) % MOTIVATING_NPCS.length];

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      const prevSt = activeStages[currentStageIndex - 1];
      setSelectedStageId(prevSt.id);
      speakText(`${prevSt.name}. ${prevSt.dialogue}`);
    }
  };

  const handleNext = () => {
    if (currentStageIndex < activeStages.length - 1) {
      const nextSt = activeStages[currentStageIndex + 1];
      setSelectedStageId(nextSt.id);
      speakText(`${nextSt.name}. ${nextSt.dialogue}`);
    }
  };

  return (
    <div className="story-map-container">
      {/* Switch Handheld Console Header */}
      <header className="switch-console-header">
        <div className="switch-left-group">
          <button className="btn-switch-nav font-poke" onClick={onBackToHome}>
            ◄ Menu
          </button>
          <div className="trainer-profile-chip" onClick={onChangeProfile} title="Change Profile">
            <img src={avatarObj.url} alt={profile?.handle} className="chip-avatar-img" />
            <div className="chip-info">
              <span className="chip-handle font-poke">{profile?.handle || 'Trainer'}</span>
              <span className="chip-elo-badge font-poke">
                {profile?.trainerElo || 100} ELO • {rankTitle}
              </span>
            </div>
          </div>
        </div>

        <h1 className="story-title font-poke">Pokémon Chess Campaign</h1>

        {/* Gym Badge Case Pill */}
        <div className="badge-case-pill font-poke">
          <span className="badge-case-title">Badges:</span>
          {profile?.badges && profile.badges.length > 0 ? (
            profile.badges.map((b) => (
              <span key={b.id} className="earned-badge-icon" title={b.name}>
                {b.icon}
              </span>
            ))
          ) : (
            <span className="no-badges">No Badges Yet</span>
          )}
        </div>
      </header>

      {/* Motivating NPC Mentor Banner */}
      <div className="npc-mentor-banner font-poke">
        <div className="npc-avatar-box">
          <img src={activeNpc.iconUrl} alt={activeNpc.name} className="npc-mentor-img" />
        </div>
        <div className="npc-dialogue-content">
          <div className="npc-header-row">
            <strong className="npc-name">{activeNpc.name}:</strong>
            <button
              type="button"
              className="btn-tts-speaker"
              onClick={() => speakText(`${activeNpc.name} says: ${activeNpc.quote}`)}
              title="Listen aloud"
            >
              🔊 Read Aloud
            </button>
          </div>
          <p className="npc-quote-text">"{activeNpc.quote}"</p>
        </div>
      </div>

      {/* Locked Tier Indicator Bar */}
      <div className="tier-selector-bar">
        <span className="tier-label font-poke">
          Campaign Tier: {currentTierObj.icon} {currentTierObj.name} (🔒 Locked for {profile?.handle})
        </span>
        <span className="tier-desc-text">{currentTierObj.desc}</span>
      </div>

      {/* Main Switch Console Screen */}
      <main className="switch-stage-stage">
        {/* Left Arrow Button */}
        <button
          className="switch-arrow-btn left-arrow font-poke"
          onClick={handlePrev}
          disabled={currentStageIndex === 0}
        >
          [L] ◄
        </button>

        {/* Center Stage Preview Card */}
        <div className={`stage-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
          <div className="stage-header font-poke">
            <span className="stage-num">Stage {currentStage.id} / 21</span>
            <span className="stage-elo font-poke">{currentStage.elo} ELO</span>
          </div>

          <div className="stage-body">
            <div className="opponent-avatar-box">
              <img
                src={currentStage.iconUrl}
                alt={currentStage.name}
                className="opponent-sprite-img"
              />
              {!isUnlocked && <div className="lock-overlay font-poke">🔒 LOCKED</div>}
            </div>

            <div className="opponent-details">
              <h2 className="opponent-name font-poke">{currentStage.name}</h2>
              <h4 className="opponent-title">{currentStage.trainerTitle}</h4>

              {/* Dialogue Box with Read Aloud Button */}
              <div className="opponent-dialogue-box font-poke">
                <div className="dialogue-header-row">
                  <p className="dialogue-text">"{currentStage.dialogue}"</p>
                  <button
                    type="button"
                    className="btn-tts-mini"
                    onClick={() => speakText(`${currentStage.name} says: ${currentStage.dialogue}`)}
                    title="Listen to dialogue out loud"
                  >
                    🔊 Listen
                  </button>
                </div>
              </div>

              {/* Reward & Features Badges */}
              <div className="stage-perks">
                {currentStage.badge && (
                  <span className="perk-badge reward-badge font-poke">
                    Reward: {currentStage.badge.icon} {currentStage.badge.name}
                  </span>
                )}
                {currentStage.hasCoach && (
                  <span className="perk-badge coach-badge font-poke">
                    ⚡ Pikachu Helper Hints ON
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="stage-footer">
            {isUnlocked ? (
              <button
                className="btn-battle-start font-poke"
                onClick={() => {
                  speakText(`Battle against ${currentStage.name}!`);
                  onSelectStage(currentStage);
                }}
              >
                [A] BATTLE OPPONENT! ►
              </button>
            ) : (
              <button className="btn-battle-locked font-poke" disabled>
                🔒 Clear Previous Stage First
              </button>
            )}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          className="switch-arrow-btn right-arrow font-poke"
          onClick={handleNext}
          disabled={currentStageIndex === activeStages.length - 1}
        >
          ► [R]
        </button>
      </main>

      {/* Stage Grid Quick Selector */}
      <footer className="stage-grid-strip">
        {activeStages.map((st) => {
          const unlocked = st.id <= (profile?.unlockedStage || 1);
          return (
            <button
              key={st.id}
              type="button"
              className={`grid-stage-dot ${st.id === selectedStageId ? 'active' : ''} ${
                unlocked ? 'unlocked' : 'locked'
              }`}
              onClick={() => {
                setSelectedStageId(st.id);
                speakText(`Stage ${st.id}: ${st.name}`);
              }}
            >
              {unlocked ? st.id : '🔒'}
            </button>
          );
        })}
      </footer>
    </div>
  );
}
