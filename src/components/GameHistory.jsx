import React, { useState, useEffect } from 'react';
import { loadMatches, deleteMatch } from '../game/gameStorage';

export default function GameHistory({ onSelectReplay, currentReplayId = null }) {
  const [matches, setMatches] = useState([]);

  const refreshMatches = () => {
    setMatches(loadMatches());
  };

  useEffect(() => {
    refreshMatches();
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = deleteMatch(id);
    setMatches(updated);
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="game-history-container">
      <div className="history-header">
        <h3>Match History</h3>
        <button className="btn-refresh font-poke" onClick={refreshMatches} title="Refresh matches">
          ↻
        </button>
      </div>

      <div className="history-scroll">
        {matches.length === 0 ? (
          <p className="no-history">No saved matches yet. Complete a game to save!</p>
        ) : (
          <ul className="history-list">
            {matches.map((match) => {
              const isSelected = currentReplayId === match.id;
              let winnerBadgeClass = 'badge-draw';
              if (match.winner === 'white') winnerBadgeClass = 'badge-white';
              if (match.winner === 'black') winnerBadgeClass = 'badge-black';

              return (
                <li
                  key={match.id}
                  className={`history-card ${isSelected ? 'selected-replay' : ''}`}
                  onClick={() => onSelectReplay(match)}
                >
                  <div className="history-info">
                    <div className="history-meta">
                      <span className={`winner-badge ${winnerBadgeClass}`}>
                        {match.winner === 'draw'
                          ? 'Draw'
                          : `${match.winner.toUpperCase()} WON`}
                      </span>
                      <span className="match-date">{formatDate(match.date)}</span>
                    </div>
                    <div className="history-stats">
                      <span>{match.moves ? match.moves.length : 0} moves</span>
                      <span className="result-text">{match.result}</span>
                    </div>
                  </div>

                  <div className="history-actions">
                    <button className="btn-play-replay" title="Replay Match">
                      ► Replay
                    </button>
                    <button
                      className="btn-delete-match"
                      onClick={(e) => handleDelete(e, match.id)}
                      title="Delete saved match"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
