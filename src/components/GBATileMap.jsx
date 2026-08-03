import React, { useState, useEffect, useRef } from 'react';
import { createPhaserGame } from '../game/world/createPhaserGame';
import { worldEvents } from '../game/world/worldEvents';
import { speakText } from '../game/speechAudio';
import { stopLittlerootTownTheme } from '../game/littlerootTheme';

// This component imperatively owns a live Phaser Game instance created in a `[]`-dep
// effect (so React Fast Refresh never re-runs it). Without this, editing anything this
// file imports (the overworld scenes, the player controller, the music module) gets
// hot-patched in place by default, leaving a stale Phaser game + input manager running
// alongside whatever the new module graph expects — duplicate keyboard listeners,
// duplicate music, dead controls. Force a full reload instead for this whole subtree.
if (import.meta.hot) {
  import.meta.hot.decline();
}

export default function GBATileMap({
  profile,
  onInteractPokeball,
  onWildEncounter,
  onBirthdayNpcTalk,
  onTrainerBattle,
  onBackToMenu,
  onProfileUpdate,
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const [dialogue, setDialogue] = useState('Welcome to Cotton Town! Walk over to the Pokéball Table to choose your team!');
  const [mapTitle, setMapTitle] = useState('COTTON TOWN');
  const [musicOn, setMusicOn] = useState(true);

  // Mount/destroy Phaser — StrictMode-safe lifecycle
  useEffect(() => {
    let game = null;
    let cancelled = false;

    (async () => {
      const Phaser = (await import('phaser')).default;
      if (cancelled || !containerRef.current) return;

      game = createPhaserGame(Phaser, containerRef.current, { profile });
      gameRef.current = game;

      // Capture scene reference when ready
      const unsubReady = worldEvents.on('world:ready', (data) => {
        if (cancelled) return;
        setMapTitle(data.displayName);
        if (gameRef.current) {
          sceneRef.current = gameRef.current.scene.getScene('OverworldScene');
        }
      });

      const unsubDialogue = worldEvents.on('dialogue:show', (data) => {
        if (cancelled) return;
        setDialogue(data.text);
        if (data.speaker) {
          speakText(data.text, data.speaker);
        }
      });

      const unsubTrigger = worldEvents.on('trigger:activate', (data) => {
        if (cancelled) return;
        if (data.triggerId === 'birch_pokeball_table') {
          setDialogue("Inspecting Professor Birch's Starter Pokéballs!");
          speakText("Inspecting Professor Birch's Starter Pokéballs!", 'oak');
          if (onInteractPokeball) {
            onInteractPokeball();
          }
        } else if (data.triggerId === 'mom_birthday_check') {
          if (onBirthdayNpcTalk) {
            onBirthdayNpcTalk();
          }
        }
      });

      const unsubEncounter = worldEvents.on('encounter:wild', (data) => {
        if (cancelled) return;
        if (onWildEncounter) {
          onWildEncounter(data.region);
        }
      });

      const unsubProfileSync = worldEvents.on('profile:worldUpdated', (data) => {
        if (cancelled) return;
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      });

      const unsubTrainerBattle = worldEvents.on('trainer:battle', (data) => {
        if (cancelled) return;
        if (onTrainerBattle) {
          onTrainerBattle(data.stageId);
        }
      });

      return () => {
        unsubReady();
        unsubDialogue();
        unsubTrigger();
        unsubEncounter();
        unsubProfileSync();
        unsubTrainerBattle();
      };
    })();

    return () => {
      cancelled = true;
      stopLittlerootTownTheme();
      if (gameRef.current) {
        gameRef.current.destroy(true); // true = also remove canvas element
        gameRef.current = null;
      }
      sceneRef.current = null;
    };
  }, []); // profile deliberately NOT a dependency to prevent tear down on ELO updates

  // Push profile updates to scene if profile object changes
  useEffect(() => {
    if (sceneRef.current && profile) {
      sceneRef.current.setProfile(profile);
    }
  }, [profile]);

  return (
    <div className="gba-map-wrapper font-poke animation-fade">
      <div className="gba-console-shell littleroot-theme">
        <header className="gba-screen-header">
          <button className="btn-switch-nav font-poke" onClick={onBackToMenu}>
            ◄ MENU
          </button>
          <span className="gba-game-title font-poke">🌿 {mapTitle}</span>
          <button
            className={`btn-audio-theme-toggle${musicOn ? '' : ' is-muted'}`}
            onClick={() => {
              if (musicOn) {
                stopLittlerootTownTheme();
              } else {
                sceneRef.current?.replayMusic();
              }
              setMusicOn(!musicOn);
            }}
          >
            {musicOn ? '🎵 Music' : '🔇 Muted'}
          </button>
          <span className="battery-led green" />
        </header>

        {/* Phaser 3 GBA Viewport Host */}
        <main className="gba-phaser-viewport" ref={containerRef} />

        {/* Dialogue Banner */}
        <div className="gba-dialogue-bar font-poke">
          <p className="gba-prompt-text">{dialogue}</p>
        </div>

        {/* On-Screen GBA D-Pad & Action Buttons */}
        <footer className="gba-controls-pad">
          <div className="dpad-cross">
            <button
              className="dpad-btn up"
              onPointerDown={() => sceneRef.current?.setVirtualInput('up', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('up', false)}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('up', false)}
            >
              ▲
            </button>
            <button
              className="dpad-btn left"
              onPointerDown={() => sceneRef.current?.setVirtualInput('left', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('left', false)}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('left', false)}
            >
              ◄
            </button>
            <button
              className="dpad-btn right"
              onPointerDown={() => sceneRef.current?.setVirtualInput('right', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('right', false)}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('right', false)}
            >
              ►
            </button>
            <button
              className="dpad-btn down"
              onPointerDown={() => sceneRef.current?.setVirtualInput('down', true)}
              onPointerUp={() => sceneRef.current?.setVirtualInput('down', false)}
              onPointerLeave={() => sceneRef.current?.setVirtualInput('down', false)}
            >
              ▼
            </button>
          </div>

          <div className="action-buttons-group">
            <button
              className="gba-action-btn btn-a font-poke"
              onClick={() => sceneRef.current?.pressA()}
            >
              [A] TALK / INTERACT
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
