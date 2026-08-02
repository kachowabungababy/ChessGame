import React, { useState } from 'react';
import { speakText } from '../game/speechAudio';

export default function FollowerPokemonChip({ followerPawn, trainerName = 'Trainer' }) {
  const [reactionText, setReactionText] = useState(null);

  const handleInteract = () => {
    const reactions = [
      `${followerPawn.name} looks super happy and is following ${trainerName} closely! ❤️`,
      `${followerPawn.name} is full of energy and ready for the next chess battle! ⚡`,
      `${followerPawn.name} nudges your hand affectionally! ♪`,
    ];
    const chosen = reactions[Math.floor(Math.random() * reactions.length)];
    setReactionText(chosen);
    speakText(chosen, followerPawn.name);

    setTimeout(() => {
      setReactionText(null);
    }, 4000);
  };

  return (
    <div className="follower-pokemon-container font-poke">
      <div className="follower-chip-card" onClick={handleInteract} title="Tap your partner Pokémon to interact!">
        <img
          src={followerPawn.iconUrl}
          alt={followerPawn.name}
          className="follower-sprite-img hgss-walk-bounce"
        />
        <span className="follower-name font-poke">{followerPawn.name}</span>
        <span className="follower-heart-icon">❤️</span>
      </div>

      {reactionText && (
        <div className="follower-dialogue-popup animation-fade font-poke">
          <p>{reactionText}</p>
        </div>
      )}
    </div>
  );
}
