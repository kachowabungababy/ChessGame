import React, { useEffect } from 'react';
import { speakText } from '../game/speechAudio';

export default function BirthdayCheckModal({ trainerName = 'Trainer', onAnswerBirthday }) {
  useEffect(() => {
    speakText(`Hey ${trainerName}! Wait up! Tell me... is today your SPECIAL BIRTHDAY?`, 'joy');
  }, [trainerName]);

  return (
    <div className="birthday-check-overlay animation-fade font-poke">
      <div className="birthday-check-card">
        <div className="npc-runup-header">
          <div className="exclamation-bubble font-poke">!</div>
          <img
            src="https://play.pokemonshowdown.com/sprites/trainers/mom-gen3.png"
            alt="Mom"
            className="npc-mom-sprite hgss-walk-bounce"
          />
        </div>

        <div className="npc-dialogue-box font-poke">
          <strong className="npc-speaker-name">Mom:</strong>
          <p className="npc-speaker-text">
            "Hey {trainerName}! Wait up! Tell me... is today your <strong>SPECIAL BIRTHDAY</strong>?!" 🎂🎈
          </p>
          <button
            type="button"
            className="btn-tts-mini"
            onClick={() => speakText(`Hey ${trainerName}! Wait up! Tell me... is today your SPECIAL BIRTHDAY?`, 'joy')}
          >
            🔊 Read Aloud
          </button>
        </div>

        <div className="birthday-answers-row font-poke">
          <button
            className="btn-birthday-yes font-poke"
            onClick={() => {
              speakText(`YAY! Happy Birthday ${trainerName}! Follow me for a special surprise!`, 'joy');
              onAnswerBirthday(true);
            }}
          >
            🎂 YES! TODAY IS MY BIRTHDAY! 🎉
          </button>

          <button
            className="btn-birthday-no font-poke"
            onClick={() => {
              speakText(`Alright ${trainerName}! Have a fantastic chess adventure today!`, 'joy');
              onAnswerBirthday(false);
            }}
          >
            🌟 No, just regular adventure today!
          </button>
        </div>
      </div>
    </div>
  );
}
