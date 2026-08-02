import React, { useState } from 'react';
import { POKEDEX_REGIONS, POKEDEX_ENTRIES } from '../game/pokedexData';
import { speakText } from '../game/speechAudio';

export default function PokedexModal({ profile, onClose }) {
  const [activeRegion, setActiveRegion] = useState('petalburg');
  const [selectedPokemonId, setSelectedPokemonId] = useState('pikachu');

  const caughtIds = profile?.pokedexCaught || ['pikachu', 'treecko', 'charmander', 'squirtle', 'eevee'];

  const filteredEntries = POKEDEX_ENTRIES.filter((e) => e.region === activeRegion);
  const selectedEntry = POKEDEX_ENTRIES.find((e) => e.id === selectedPokemonId) || filteredEntries[0] || POKEDEX_ENTRIES[0];

  const isSelectedCaught = caughtIds.includes(selectedEntry.id);
  const totalCaughtCount = POKEDEX_ENTRIES.filter((e) => caughtIds.includes(e.id)).length;

  return (
    <div className="pokedex-modal-overlay animation-fade">
      {/* Red Handheld Pokédex Device Shell */}
      <div className="pokedex-device-shell">
        {/* Device Top Glass Lens */}
        <header className="pokedex-device-header font-poke">
          <div className="pokedex-lens-group">
            <div className="blue-scanner-orb" />
            <div className="mini-indicator red" />
            <div className="mini-indicator yellow" />
            <div className="mini-indicator green" />
          </div>
          <h2 className="pokedex-title font-poke">POKÉDEX</h2>
          <button className="btn-close-dex font-poke" onClick={onClose}>
            ✖ CLOSE
          </button>
        </header>

        {/* Region Segmentation Tabs */}
        <div className="pokedex-region-tabs font-poke">
          {POKEDEX_REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`pokedex-tab-btn ${activeRegion === r.id ? 'active' : ''}`}
              onClick={() => {
                setActiveRegion(r.id);
                const firstInRegion = POKEDEX_ENTRIES.find((e) => e.region === r.id);
                if (firstInRegion) setSelectedPokemonId(firstInRegion.id);
              }}
            >
              {r.icon} {r.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Main Pokédex Screen & Scanner */}
        <main className="pokedex-screen-layout">
          {/* Left Screen: Entry View Scanner */}
          <div className="pokedex-entry-screen">
            <div className="entry-sprite-container">
              {isSelectedCaught ? (
                <img
                  src={selectedEntry.spriteUrl}
                  alt={selectedEntry.name}
                  className="pokedex-pokemon-sprite"
                />
              ) : (
                <div className="unseen-silhouette font-poke">❓ UNSEEN</div>
              )}
            </div>

            <div className="entry-details-box font-poke">
              <div className="entry-num-name font-poke">
                <span className="dex-no">#{selectedEntry.dexNo}</span>
                <h3 className="dex-name">{isSelectedCaught ? selectedEntry.name : '???'}</h3>
              </div>

              {isSelectedCaught ? (
                <>
                  <div className="dex-pills-row">
                    <span className="dex-pill type">{selectedEntry.type}</span>
                    <span className="dex-pill role">{selectedEntry.chessRole}</span>
                  </div>

                  <p className="dex-desc-text">"{selectedEntry.desc}"</p>

                  <button
                    type="button"
                    className="btn-tts-speaker"
                    onClick={() => speakText(`No ${selectedEntry.dexNo}. ${selectedEntry.name}. ${selectedEntry.desc}`, 'pikachu')}
                  >
                    🔊 Read Pokédex Out Loud
                  </button>
                </>
              ) : (
                <p className="dex-desc-text locked font-poke">
                  Catch this wild Pokémon in {POKEDEX_REGIONS.find((r) => r.id === selectedEntry.region)?.name} quizzes to register it in your Pokédex!
                </p>
              )}
            </div>
          </div>

          {/* Right Screen: Regional List Selector */}
          <aside className="pokedex-list-screen">
            <div className="regional-counter font-poke">
              <span>Caught in Region: {filteredEntries.filter((e) => caughtIds.includes(e.id)).length} / {filteredEntries.length}</span>
              <span>Total Dex: {totalCaughtCount} / {POKEDEX_ENTRIES.length}</span>
            </div>

            <div className="pokedex-entries-grid font-poke">
              {filteredEntries.map((e) => {
                const caught = caughtIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={`pokedex-list-item ${selectedPokemonId === e.id ? 'active' : ''} ${
                      caught ? 'caught' : 'unseen'
                    }`}
                    onClick={() => {
                      setSelectedPokemonId(e.id);
                      if (caught) speakText(e.name, 'pikachu');
                    }}
                  >
                    <span className="list-dex-no">#{e.dexNo}</span>
                    <span className="list-dex-name">{caught ? e.name : '???'}</span>
                    <span className="list-dex-status">{caught ? '🎒' : '🔒'}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
