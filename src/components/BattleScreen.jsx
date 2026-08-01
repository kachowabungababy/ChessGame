import React, { useState, useEffect } from 'react';
import HealthBar from './HealthBar';
import { ROSTER } from '../game/pokemonRoster';
import { getBattleSprites } from '../game/pokeApi';
import { soundEffects } from '../game/audio';

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
        {/* Environment Background Elements */}
        <div className="battle-environment-bg">
          <div className="theme-bg-element volcano-mountain" />
          <div className="theme-bg-element ice-stalactites" />
          <div className="theme-bg-element forest-canopy" />
          <div className="theme-bg-element water-crater" />
          <div className="theme-bg-element sky-ruins" />
          <div className="theme-bg-element mauville-pipes" />
          <div className="theme-bg-element ghost-fog" />
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
          <div className="battle-podium defender-podium">
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
          <div className="battle-podium attacker-podium">
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
