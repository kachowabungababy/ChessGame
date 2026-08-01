import React from 'react';

export default function HealthBar({ name, isAttacker = false, hpPercent = 100, level = 50 }) {
  // Determine HP bar color based on percentage
  let barColorClass = 'hp-green';
  if (hpPercent <= 20) {
    barColorClass = 'hp-red';
  } else if (hpPercent <= 50) {
    barColorClass = 'hp-yellow';
  }

  // Capitalize name cleanly (e.g. "pikachu" -> "Pikachu", "rapidash-galar" -> "Rapidash-Galar")
  const displayName = name
    ? name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Pokémon';

  return (
    <div className={`health-box font-poke ${isAttacker ? 'attacker-box' : 'defender-box'}`}>
      <div className="health-header">
        <span className="poke-name">{displayName}</span>
        <span className="poke-level">Lv{level}</span>
      </div>

      <div className="hp-bar-outer">
        <span className="hp-label">HP</span>
        <div className="hp-track">
          <div
            className={`hp-fill ${barColorClass}`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>
      <div className="hp-values">
        <span>{Math.round((hpPercent / 100) * 100)}/100</span>
      </div>
    </div>
  );
}
