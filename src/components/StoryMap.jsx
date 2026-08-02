import React, { useState } from 'react';
import { getStagesForTier, DIFFICULTY_TIERS, MOTIVATING_NPCS, AMBIENT_WORLD_NPCS } from '../game/storyCampaign';
import { WILD_POKEMON_PUZZLES } from '../game/wildPuzzles';
import { AVATAR_OPTIONS, getTrainerRankTitle } from '../game/profileStorage';
import { getLineupForStage } from '../game/pokemonLineups';
import { speakText } from '../game/speechAudio';
import FollowerPokemonChip from './FollowerPokemonChip';

export default function StoryMap({ profile, onSelectStage, onSelectWildPuzzle, onBackToHome, onChangeProfile }) {
  const [selectedStageId, setSelectedStageId] = useState(profile?.unlockedStage || 1);
  const activeTierId = profile?.difficultyTier || 'rookie';

  const activeStages = getStagesForTier(activeTierId);
  const avatarObj = AVATAR_OPTIONS.find((a) => a.id === profile?.avatarId) || AVATAR_OPTIONS[0];
  const rankTitle = getTrainerRankTitle(profile?.trainerElo || 100);
  const trainerName = profile?.handle || 'Trainer';
  const currentLineup = getLineupForStage(profile?.unlockedStage || 1);

  const formatText = (txt) => {
    if (!txt) return '';
    return txt.replace(/\{name\}/g, trainerName);
  };

  const currentStageIndex = activeStages.findIndex((s) => s.id === selectedStageId);
  const currentStage = activeStages[currentStageIndex] || activeStages[0];

  const isUnlocked = currentStage.id <= (profile?.unlockedStage || 1);
  const currentTierObj = DIFFICULTY_TIERS[activeTierId] || DIFFICULTY_TIERS.rookie;
  const activeNpc = MOTIVATING_NPCS[(selectedStageId - 1) % MOTIVATING_NPCS.length];

  const activeNpcQuoteFormatted = formatText(activeNpc.quote);
  const currentStageDialogueFormatted = formatText(currentStage.dialogue);

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      const prevSt = activeStages[currentStageIndex - 1];
      setSelectedStageId(prevSt.id);
      speakText(`${prevSt.name}. ${formatText(prevSt.dialogue)}`);
    }
  };

  const handleNext = () => {
    if (currentStageIndex < activeStages.length - 1) {
      const nextSt = activeStages[currentStageIndex + 1];
      setSelectedStageId(nextSt.id);
      speakText(`${nextSt.name}. ${formatText(nextSt.dialogue)}`);
    }
  };

  return (
    <div className="story-map-container">
      {/* Guest Mode Progress Save Warning Banner */}
      {(profile?.handle === 'Guest' || !profile?.rememberMe) && (
        <div className="guest-save-warning-banner">
          <div className="warning-banner-left">
            <span className="warning-badge-icon font-poke">⚠️ GUEST MODE:</span>
            <span className="warning-banner-text">
              Story Campaign progress and Gym Badges will be lost when closing the browser!
            </span>
          </div>
          <button
            type="button"
            className="btn-create-profile-link font-poke"
            onClick={onChangeProfile}
          >
            📝 Sign Up to Save
          </button>
        </div>
      )}

      {/* Switch Handheld Console Header */}
      <header className="switch-console-header">
        <div className="switch-left-group">
          <button className="btn-switch-nav font-poke" onClick={onBackToHome}>
            ◄ Menu
          </button>
          <div className="trainer-profile-chip" onClick={onChangeProfile} title="Change Profile">
            <img src={avatarObj.url} alt={trainerName} className="chip-avatar-img" />
            <div className="chip-info">
              <span className="chip-handle font-poke">{trainerName}</span>
              <span className="chip-elo-badge font-poke">
                {profile?.trainerElo || 100} ELO • {rankTitle}
              </span>
            </div>
          </div>
        </div>

        <h1 className="story-title font-poke">Pokémon Chess Campaign</h1>

        {/* Gym Badge Case Pill & Pokédex Launcher */}
        <div className="badge-case-pill font-poke">
          <button
            type="button"
            className="btn-pokedex-launcher font-poke"
            onClick={onOpenPokedex}
          >
            🔴 POKÉDEX
          </button>
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
              onClick={() => speakText(`${activeNpc.name} says: ${activeNpcQuoteFormatted}`, activeNpc.name)}
              title="Listen aloud"
            >
              🔊 Read Aloud
            </button>
          </div>
          <p className="npc-quote-text">"{activeNpcQuoteFormatted}"</p>
        </div>
      </div>

      {/* Wild Pokémon Grass Encounters Bar */}
      <div className="wild-grass-encounters-bar font-poke">
        <span className="wild-grass-title font-poke">🌿 Wild Pokémon Tactical Quizzes:</span>
        <div className="wild-puzzles-list">
          {WILD_POKEMON_PUZZLES.map((pz) => (
            <button
              key={pz.id}
              type="button"
              className="btn-wild-puzzle-chip"
              onClick={() => {
                speakText(`Hey ${trainerName}! A Wild ${pz.pokemonName} appeared! ${pz.type} challenge!`);
                onSelectWildPuzzle(pz);
              }}
            >
              <img src={pz.iconUrl} alt={pz.pokemonName} className="wild-chip-img" />
              <div className="wild-chip-info">
                <strong className="wild-chip-name">{pz.pokemonName}</strong>
                <span className="wild-chip-type">{pz.type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ambient World NPCs Strip */}
      <div className="ambient-world-npcs-bar font-poke">
        <span className="ambient-title">World NPCs Around Town:</span>
        <div className="ambient-npc-list">
          {AMBIENT_WORLD_NPCS.map((npc) => {
            const ambientDiagFormatted = formatText(npc.dialogue);
            return (
              <div
                key={npc.id}
                className="ambient-npc-card"
                onClick={() => speakText(`${npc.name} says: ${ambientDiagFormatted}`)}
                title="Tap to talk"
              >
                <img src={npc.iconUrl} alt={npc.name} className="ambient-npc-img" />
                <div className="ambient-npc-info">
                  <strong className="ambient-npc-name">{npc.name}</strong>
                  <span className="ambient-npc-action">{npc.action}</span>
                </div>
                <span className="ambient-audio-icon">🔊</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Tier Indicator Bar */}
      <div className="tier-selector-bar">
        <span className="tier-label font-poke">
          Campaign Tier: {currentTierObj.icon} {currentTierObj.name} (🔒 Locked for {trainerName})
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
                  <p className="dialogue-text">"{currentStageDialogueFormatted}"</p>
                  <button
                    type="button"
                    className="btn-tts-mini"
                    onClick={() => speakText(`${currentStage.name} says: ${currentStageDialogueFormatted}`, currentStage.name)}
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
