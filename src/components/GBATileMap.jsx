import React, { useState, useEffect, useRef } from 'react';
import { createPhaserGame } from '../game/world/createPhaserGame';
import { worldEvents } from '../game/world/worldEvents';
import { speakText } from '../game/speechAudio';

export default function GBATileMap({ profile, onInteractPokeball, onBackToMenu, onProfileUpdate }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const [dialogue, setDialogue] = useState('Welcome to Littleroot Town! Walk over to Professor Birch\'s Lab!');
  const [mapTitle, setMapTitle] = useState('LITTLEROOT TOWN — HOENN');

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
        setMapTitle(`${data.displayName} — HOENN`);
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
        }
      });

      return () => {
        unsubReady();
        unsubDialogue();
        unsubTrigger();
      };
    })();

    return () => {
      cancelled = true;
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
            className="btn-audio-theme-toggle"
            onClick={() => sceneRef.current?.replayMusic()}
          >
            🎵 Music
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
