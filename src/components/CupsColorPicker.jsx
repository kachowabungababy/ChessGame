import React, { useState } from 'react';

const POKEBALL_ICON = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

function shuffledOutcomes() {
  const outcomes = ['white', 'black', 'toss'];
  for (let i = outcomes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
  }
  return outcomes;
}

export default function CupsColorPicker({ stage, onColorChosen, onCancel }) {
  const [cupOutcomes] = useState(shuffledOutcomes);
  const [revealedIndex, setRevealedIndex] = useState(null);
  const [resultColor, setResultColor] = useState(null);
  const [wasToss, setWasToss] = useState(false);

  const handlePickCup = (index) => {
    if (revealedIndex !== null) return;
    const outcome = cupOutcomes[index];
    let color;
    if (outcome === 'toss') {
      color = Math.random() < 0.5 ? 'w' : 'b';
      setWasToss(true);
    } else {
      color = outcome === 'white' ? 'w' : 'b';
      setWasToss(false);
    }
    setResultColor(color);
    setRevealedIndex(index);
  };

  return (
    <div className="cups-picker-overlay animation-fade">
      <div className="cups-picker-card">
        <h2 className="cups-title font-poke">
          {stage ? `Stage ${stage.id}: ${stage.name}` : 'Trainer Battle'}
        </h2>
        <p className="cups-subtitle">Pick a cup to reveal which side you'll play!</p>

        <div className="cups-row">
          {cupOutcomes.map((outcome, index) => {
            const isRevealed = revealedIndex === index;
            const isHidden = revealedIndex !== null && revealedIndex !== index;
            return (
              <button
                key={index}
                type="button"
                className={`cup-slot ${isRevealed ? 'revealed' : ''} ${isHidden ? 'dimmed' : ''}`}
                onClick={() => handlePickCup(index)}
                disabled={revealedIndex !== null}
              >
                {isRevealed ? (
                  <span className="cup-result-icon">
                    {resultColor === 'w' ? '⚪' : '⚫'}
                  </span>
                ) : (
                  <img src={POKEBALL_ICON} alt="Mystery Cup" className="cup-icon-img" />
                )}
                <span className="cup-label font-poke">Cup {index + 1}</span>
              </button>
            );
          })}
        </div>

        {revealedIndex !== null && (
          <div className="cup-result-banner font-poke animation-fade">
            {wasToss && <p className="cup-toss-text">🪙 Coin Toss...</p>}
            <p className="cup-result-text">
              You'll play as {resultColor === 'w' ? 'White ⚪' : 'Black ⚫'}!
            </p>
            <button className="btn btn-primary font-poke" onClick={() => onColorChosen(resultColor)}>
              Continue ►
            </button>
          </div>
        )}

        {revealedIndex === null && (
          <button className="btn btn-secondary font-poke cups-back-btn" onClick={onCancel}>
            ◄ Back
          </button>
        )}
      </div>
    </div>
  );
}
