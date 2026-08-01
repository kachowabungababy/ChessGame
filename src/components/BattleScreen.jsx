import React, { useState, useEffect } from 'react';
import HealthBar from './HealthBar';
import { ROSTER } from '../game/pokemonRoster';
import { getBattleSprites } from '../game/pokeApi';
import { soundEffects } from '../game/audio';

function BattleEnvironment({ theme }) {
  switch (theme) {
    case 'volcano':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="volcanoSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a0404" />
              <stop offset="60%" stopColor="#5c1010" />
              <stop offset="100%" stopColor="#140202" />
            </linearGradient>
            <linearGradient id="lavaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#volcanoSky)" />
          {/* Distant Volcanic Ridge Background */}
          <path d="M0 280 L150 180 L300 240 L500 150 L680 220 L800 170 V400 H0 Z" fill="#180303" opacity="0.9" />
          {/* Volcano Crater Distant Peak */}
          <path d="M350 240 L450 150 L550 240 Z" fill="#3b0808" />
          <ellipse cx="450" cy="150" rx="35" ry="8" fill="#f97316" />
          {/* Subtle Lava Rivers on Horizon */}
          <path d="M450 150 Q430 200 400 280" stroke="url(#lavaGlow)" strokeWidth="6" fill="none" opacity="0.8" />
        </svg>
      );
    case 'ice':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="iceSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#032b43" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#031726" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#iceSky)" />
          {/* Distant Glacial Peaks */}
          <polygon points="0,320 180,180 350,320" fill="#0369a1" />
          <polygon points="180,180 220,220 140,220" fill="#e0f2fe" />
          <polygon points="400,320 580,160 760,320" fill="#075985" />
          <polygon points="580,160 620,200 540,200" fill="#e0f2fe" />
          {/* Hanging Ice Stalactites from ceiling */}
          <polygon points="60,0 80,90 100,0" fill="#bae6fd" opacity="0.8" />
          <polygon points="220,0 240,110 260,0" fill="#e0f2fe" opacity="0.85" />
          <polygon points="620,0 640,100 660,0" fill="#bae6fd" opacity="0.8" />
        </svg>
      );
    case 'petalburg':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="60%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#011910" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#forestSky)" />
          {/* Forest Trees Background Silhouette */}
          <rect x="40" y="160" width="30" height="180" fill="#3b1704" />
          <circle cx="55" cy="140" r="65" fill="#166534" />

          <rect x="710" y="160" width="30" height="180" fill="#3b1704" />
          <circle cx="725" cy="140" r="70" fill="#15803d" />

          {/* Top Leaf Canopy */}
          <ellipse cx="400" cy="0" rx="450" ry="70" fill="#14532d" />
        </svg>
      );
    default:
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <rect width="800" height="400" fill="#0f172a" />
          <circle cx="150" cy="40" r="50" fill="rgba(34, 197, 94, 0.2)" />
          <circle cx="650" cy="40" r="50" fill="rgba(34, 197, 94, 0.2)" />
        </svg>
      );
  }
}

export default function BattleScreen({
  captureInfo,
  onComplete,
  isCheckmate = false,
  theme = 'classic',
}) {
  const [attackerSprites, setAttackerSprites] = useState({ front: '', back: '' });
  const [defenderSprites, setDefenderSprites] = useState({ front: '', back: '' });

  const [defenderHp, setDefenderHp] = useState(100);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'attack' | 'hit' | 'faint' | 'done'
  const [dialogText, setDialogText] = useState('');

  const attackerPiece = captureInfo?.attacker;
  const defenderPiece = captureInfo?.defender;

  const attackerName = attackerPiece ? ROSTER[attackerPiece.color]?.[attackerPiece.type] : '';
  const defenderName = defenderPiece ? ROSTER[defenderPiece.color]?.[defenderPiece.type] : '';

  const formatName = (name) =>
    name
      ? name
          .split('-')
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ')
      : 'Pokémon';

  const formattedAttacker = formatName(attackerName);
  const formattedDefender = formatName(defenderName);

  // Determine piece-specific attack text & class
  let moveName = 'Attack';
  let attackAnimClass = 'lunge-attack-pawn';
  if (attackerPiece) {
    switch (attackerPiece.type) {
      case 'n':
        moveName = 'Wild Charge';
        attackAnimClass = 'lunge-attack-knight';
        break;
      case 'b':
        moveName = 'Psystrike';
        attackAnimClass = 'lunge-attack-bishop';
        break;
      case 'r':
        moveName = 'Heavy Slam';
        attackAnimClass = 'lunge-attack-rook';
        break;
      case 'q':
        moveName = 'Hyper Beam';
        attackAnimClass = 'lunge-attack-queen';
        break;
      case 'k':
        moveName = 'Sunsteel Strike';
        attackAnimClass = 'lunge-attack-king';
        break;
      default:
        moveName = 'Tackle';
        attackAnimClass = 'lunge-attack-pawn';
    }
  }

  // Fetch sprites on mount
  useEffect(() => {
    let isMounted = true;
    if (attackerName && defenderName) {
      Promise.all([
        getBattleSprites(attackerName),
        getBattleSprites(defenderName),
      ]).then(([attRes, defRes]) => {
        if (isMounted) {
          setAttackerSprites(attRes);
          setDefenderSprites(defRes);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [attackerName, defenderName]);

  // Battle Animation & Sound Timeline
  useEffect(() => {
    const introText = isCheckmate
      ? `CHECKMATE! ${formattedAttacker} unleashes ${moveName} on King ${formattedDefender}!`
      : `${formattedAttacker} used ${moveName}!`;
    setDialogText(introText);

    // 1. Attack phase (800ms)
    const timer1 = setTimeout(() => {
      setPhase('attack');
      soundEffects.playAttackSound(attackerPiece?.type || 'p');
    }, 800);

    // 2. Hit phase & HP Drain (1600ms)
    const timer2 = setTimeout(() => {
      setPhase('hit');
      soundEffects.playHitSound();
      setDefenderHp(0);
    }, 1600);

    // 3. Faint phase (2600ms)
    const timer3 = setTimeout(() => {
      setPhase('faint');
      soundEffects.playFaintSound();
      setDialogText(
        isCheckmate
          ? `King ${formattedDefender} fainted! GAME OVER!`
          : `The opposing ${formattedDefender} fainted!`
      );
    }, 2600);

    // 4. Complete battle (4000ms)
    const timer4 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [formattedAttacker, formattedDefender, moveName, attackerPiece, isCheckmate, onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  if (!captureInfo) return null;

  return (
    <div className="battle-overlay" data-theme={theme}>
      <div
        className={`battle-scene ${
          isCheckmate ? 'checkmate-battle' : ''
        } theme-battle-${theme}`}
      >
        {/* Environment Background Graphics */}
        <div className="battle-environment-bg">
          <BattleEnvironment theme={theme} />
        </div>

        {isCheckmate && (
          <div className="checkmate-header-badge font-poke">
            FINAL BATTLE - CHECKMATE!
          </div>
        )}

        <button className="btn-skip font-poke" onClick={handleSkip}>
          Skip [►]
        </button>

        {/* 1. Defender HP Box (Top-Left) */}
        <div className="defender-hp-box">
          <HealthBar
            name={defenderName}
            isAttacker={false}
            hpPercent={defenderHp}
            level={50}
          />
        </div>

        {/* 2. Defender Podium & Sprite (Top-Right Midground) */}
        <div className="defender-podium-container">
          <div className="battle-podium-oval">
            {defenderSprites.front && (
              <img
                src={defenderSprites.front}
                alt={defenderName}
                className={`battle-sprite defender-sprite ${
                  phase === 'hit' ? 'hit-shake' : ''
                } ${phase === 'faint' || phase === 'done' ? 'faint-drop' : ''}`}
              />
            )}
          </div>
        </div>

        {/* 3. Attacker Podium & Sprite (Bottom-Left Foreground) */}
        <div className="attacker-podium-container">
          <div className="battle-podium-oval">
            {attackerSprites.back && (
              <img
                src={attackerSprites.back}
                alt={attackerName}
                className={`battle-sprite attacker-sprite ${
                  phase === 'attack' ? attackAnimClass : ''
                }`}
              />
            )}
          </div>
        </div>

        {/* 4. Attacker HP Box (Bottom-Right) */}
        <div className="attacker-hp-box">
          <HealthBar
            name={attackerName}
            isAttacker={true}
            hpPercent={100}
            level={50}
          />
        </div>

        {/* 5. Retro Dialog Text Box (Bottom) */}
        <div className="battle-dialog-box font-poke">
          <p>{dialogText}</p>
          <span className="dialog-arrow">▼</span>
        </div>
      </div>
    </div>
  );
}
