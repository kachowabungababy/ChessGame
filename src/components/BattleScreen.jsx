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
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="60%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#180202" />
            </linearGradient>
            <linearGradient id="lavaStream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#volcanoSky)" />
          {/* Volcano Mountain Silhouette */}
          <polygon points="120,400 400,100 680,400" fill="#1c0505" stroke="#ef4444" strokeWidth="3" />
          {/* Crater magma glow */}
          <ellipse cx="400" cy="100" rx="45" ry="12" fill="#f97316" />
          {/* Lava streams */}
          <path d="M400 100 Q370 200 320 400 M400 100 Q430 220 470 400" stroke="url(#lavaStream)" strokeWidth="10" fill="none" />
          {/* Smoke clouds */}
          <circle cx="370" cy="65" r="30" fill="rgba(239, 68, 68, 0.3)" />
          <circle cx="430" cy="45" r="40" fill="rgba(249, 115, 22, 0.25)" />
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
          {/* Snowy Mountains Background */}
          <polygon points="0,400 200,130 400,400" fill="#0369a1" />
          <polygon points="200,130 250,190 150,190" fill="#e0f2fe" />
          <polygon points="350,400 550,100 750,400" fill="#075985" />
          <polygon points="550,100 600,160 500,160" fill="#e0f2fe" />
          {/* Hanging Ice Stalactites */}
          <polygon points="50,0 75,120 100,0" fill="#bae6fd" opacity="0.85" />
          <polygon points="180,0 205,150 230,0" fill="#e0f2fe" opacity="0.9" />
          <polygon points="570,0 595,130 620,0" fill="#bae6fd" opacity="0.85" />
          <polygon points="680,0 705,100 730,0" fill="#e0f2fe" opacity="0.75" />
        </svg>
      );
    case 'petalburg':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="60%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#011910" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#forestSky)" />
          {/* Tree Trunks & Foliage Canopy */}
          <rect x="60" y="140" width="35" height="260" fill="#451a03" />
          <circle cx="77" cy="130" r="75" fill="#166534" />
          <circle cx="77" cy="95" r="55" fill="#22c55e" />

          <rect x="690" y="140" width="40" height="260" fill="#451a03" />
          <circle cx="710" cy="120" r="85" fill="#15803d" />
          <circle cx="710" cy="80" r="65" fill="#4ade80" />

          <rect x="375" y="160" width="50" height="240" fill="#451a03" opacity="0.6" />
          <circle cx="400" cy="140" r="95" fill="#14532d" opacity="0.7" />

          {/* Top Canopy Overhang */}
          <ellipse cx="400" cy="0" rx="450" ry="90" fill="#166534" />
        </svg>
      );
    case 'sootopolis':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waterSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="60%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0b1329" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#waterSky)" />
          {/* Crater Walls */}
          <path d="M0 0 L160 230 L0 400 Z" fill="#1e293b" />
          <path d="M800 0 L640 230 L800 400 Z" fill="#1e293b" />
          {/* Water Surface Wave Lines */}
          <path d="M0 250 Q200 230 400 250 T800 250 V400 H0 Z" fill="#1d4ed8" opacity="0.6" />
          <path d="M0 300 Q200 280 400 300 T800 300 V400 H0 Z" fill="#2563eb" opacity="0.8" />
        </svg>
      );
    case 'skypillar':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyPillarSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="60%" stopColor="#047857" />
              <stop offset="100%" stopColor="#021f18" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#skyPillarSky)" />
          {/* Ancient Stone Ruins Pillars */}
          <rect x="80" y="60" width="55" height="340" fill="#0f766e" stroke="#34d399" strokeWidth="3" />
          <rect x="665" y="40" width="55" height="360" fill="#0f766e" stroke="#34d399" strokeWidth="3" />
          {/* Floating Clouds */}
          <ellipse cx="200" cy="90" rx="100" ry="35" fill="rgba(236, 253, 245, 0.25)" />
          <ellipse cx="600" cy="130" rx="120" ry="40" fill="rgba(236, 253, 245, 0.2)" />
        </svg>
      );
    case 'mauville':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <rect width="800" height="400" fill="#1c1917" />
          {/* Steel Girders & Power Pipes */}
          <rect x="0" y="35" width="800" height="20" fill="#44403c" />
          <rect x="110" y="0" width="25" height="400" fill="#57534e" />
          <rect x="660" y="0" width="25" height="400" fill="#57534e" />
          {/* Electric Voltage Bolts */}
          <path d="M122 90 L140 125 L128 125 L145 160" stroke="#facc15" strokeWidth="4" fill="none" />
          <path d="M672 130 L690 165 L678 165 L695 200" stroke="#facc15" strokeWidth="4" fill="none" />
        </svg>
      );
    case 'pyre':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <rect width="800" height="400" fill="#17072b" />
          {/* Tombstones & Ghost Mist */}
          <rect x="90" y="220" width="45" height="80" rx="22" fill="#4c1d95" stroke="#a855f7" strokeWidth="2.5" />
          <rect x="660" y="200" width="50" height="90" rx="25" fill="#4c1d95" stroke="#a855f7" strokeWidth="2.5" />
          <ellipse cx="400" cy="300" rx="400" ry="85" fill="rgba(192, 132, 252, 0.2)" />
        </svg>
      );
    default: // Classic
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <rect width="800" height="400" fill="#0f172a" />
          {/* Stadium Floodlights */}
          <circle cx="150" cy="40" r="50" fill="rgba(34, 197, 94, 0.25)" />
          <circle cx="650" cy="40" r="50" fill="rgba(34, 197, 94, 0.25)" />
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
        {/* Environment Graphic Elements */}
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
        <div className="defender-hp-container">
          <HealthBar
            name={defenderName}
            isAttacker={false}
            hpPercent={defenderHp}
            level={50}
          />
        </div>

        {/* 2. Defender Platform & Sprite (Top-Right Midground) */}
        <div className="defender-stage">
          <div className="battle-podium defender-podium" />
          <div className="battle-sprite-wrapper defender-sprite-wrapper">
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

        {/* 3. Attacker Platform & Sprite (Bottom-Left Foreground) */}
        <div className="attacker-stage">
          <div className="battle-podium attacker-podium" />
          <div className="battle-sprite-wrapper attacker-sprite-wrapper">
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
        <div className="attacker-hp-container">
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
