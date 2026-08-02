import React, { useState, useEffect, useMemo } from 'react';
import { loadMatches, loadMatchesMerged, deleteMatch, saveAnalysisToMatch } from '../game/gameStorage';
import { analyzeGame } from '../game/stockfishEngine';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'vs AI' },
  { id: '2p', label: 'Local' },
  { id: 'lobby', label: 'Lobby' },
  { id: 'story', label: 'Story' },
];

function formatDate(isoString) {
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
}

function modeLabel(match) {
  switch (match.mode) {
    case 'story':
      return match.storyStageId
        ? `Story: Stage ${match.storyStageId}${match.storyStageName ? ` — ${match.storyStageName}` : ''}`
        : 'Story Campaign';
    case 'ai':
      return `vs AI${match.opponentElo ? ` (${match.opponentElo} ELO)` : ''}`;
    case '2p':
      return 'Local 2P';
    case 'lobby':
      return match.opponentHandle ? `Online vs ${match.opponentHandle}` : 'Online Lobby';
    default:
      return 'Legacy Match';
  }
}

function classificationTag(cls) {
  if (cls === 'blunder') return '??';
  if (cls === 'mistake') return '?';
  if (cls === 'inaccuracy') return '?!';
  return null;
}

export default function MatchHistoryModal({ profile, onClose, onSelectReplay }) {
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState(() => loadMatches());
  const [detailMatch, setDetailMatch] = useState(null);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ done: 0, total: 0 });
  const [analysisErrorMsg, setAnalysisErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadMatchesMerged(profile?.handle).then((merged) => {
      if (!cancelled) setMatches(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.handle]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return matches;
    return matches.filter((m) => m.mode === activeTab);
  }, [matches, activeTab]);

  const handleDelete = (e, match) => {
    e.stopPropagation();
    const updated = deleteMatch(match.id, match.handle || profile?.handle);
    setMatches(updated);
    if (detailMatch?.id === match.id) setDetailMatch(null);
  };

  const handleRunAnalysis = async () => {
    if (!detailMatch || !detailMatch.moves?.length) return;
    setAnalysisErrorMsg(null);
    setAnalysisRunning(true);
    setAnalysisProgress({ done: 0, total: detailMatch.moves.length });
    try {
      const result = await analyzeGame(detailMatch.moves, {
        onProgress: (done, total) => setAnalysisProgress({ done, total }),
      });
      await saveAnalysisToMatch(detailMatch.id, result, detailMatch.handle || profile?.handle);
      setDetailMatch((m) => (m ? { ...m, analysis: result } : m));
      setMatches((all) => all.map((m) => (m.id === detailMatch.id ? { ...m, analysis: result } : m)));
    } catch (e) {
      console.error('Analysis failed:', e);
      setAnalysisErrorMsg('Analysis engine failed to load or run. Try again.');
    } finally {
      setAnalysisRunning(false);
    }
  };

  return (
    <div className="match-history-modal-overlay" onClick={onClose}>
      <div className="match-history-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="mh-header">
          <h2 className="font-poke">📜 Match History</h2>
          <button className="mh-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {detailMatch ? (
          <div className="mh-detail-view">
            <button className="btn btn-secondary font-poke mh-back-btn" onClick={() => setDetailMatch(null)}>
              ◄ Back to List
            </button>

            <div className="mh-detail-meta">
              <h3>{modeLabel(detailMatch)}</h3>
              <span className="match-date">{formatDate(detailMatch.date)}</span>
              {detailMatch.trainerEloBefore != null && detailMatch.trainerEloAfter != null && (
                <EloDeltaBadge before={detailMatch.trainerEloBefore} after={detailMatch.trainerEloAfter} />
              )}
            </div>

            <div className="mh-detail-actions">
              <button
                className="btn btn-primary font-poke"
                onClick={() => onSelectReplay(detailMatch)}
              >
                ► Replay This Match
              </button>
            </div>

            <div className="mh-move-list-wrapper">
              <table className="move-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>White</th>
                    <th>Black</th>
                  </tr>
                </thead>
                <tbody>
                  {chunkMoves(detailMatch.moves, detailMatch.analysis).map((row) => (
                    <tr key={row.number}>
                      <td className="move-num">{row.number}.</td>
                      <td className="move-white">
                        {row.white}
                        {row.whiteTag && <span className="move-tag">{row.whiteTag}</span>}
                      </td>
                      <td className="move-black">
                        {row.black}
                        {row.blackTag && <span className="move-tag">{row.blackTag}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mh-analysis-section">
              {detailMatch.analysis ? (
                <AnalysisSummary analysis={detailMatch.analysis} />
              ) : (
                <>
                  {analysisErrorMsg && <p className="lobby-error">{analysisErrorMsg}</p>}
                  <button
                    className="btn btn-secondary font-poke"
                    onClick={handleRunAnalysis}
                    disabled={analysisRunning}
                  >
                    {analysisRunning
                      ? `Analyzing move ${analysisProgress.done}/${analysisProgress.total}…`
                      : '🔍 Run AI Analysis'}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mh-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`mh-tab ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mh-list-scroll">
              {filtered.length === 0 ? (
                <p className="no-history">
                  {activeTab === 'lobby'
                    ? 'No online matches yet — Online Lobby coming soon!'
                    : 'No saved matches in this category yet.'}
                </p>
              ) : (
                <ul className="history-list">
                  {filtered.map((match) => {
                    let winnerBadgeClass = 'badge-draw';
                    if (match.winner === 'white') winnerBadgeClass = 'badge-white';
                    if (match.winner === 'black') winnerBadgeClass = 'badge-black';

                    return (
                      <li
                        key={match.id}
                        className="history-card"
                        onClick={() => setDetailMatch(match)}
                      >
                        <div className="history-info">
                          <div className="history-meta">
                            <span className={`winner-badge ${winnerBadgeClass}`}>
                              {match.winner === 'draw' ? 'Draw' : `${match.winner.toUpperCase()} WON`}
                            </span>
                            <span className="mh-mode-label">{modeLabel(match)}</span>
                            <span className="match-date">{formatDate(match.date)}</span>
                          </div>
                          <div className="history-stats">
                            <span>{match.moves ? match.moves.length : 0} moves</span>
                            <span className="result-text">{match.result}</span>
                            {match.trainerEloBefore != null && match.trainerEloAfter != null && (
                              <EloDeltaBadge before={match.trainerEloBefore} after={match.trainerEloAfter} />
                            )}
                          </div>
                        </div>
                        <div className="history-actions">
                          <button
                            className="btn-delete-match"
                            onClick={(e) => handleDelete(e, match)}
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
          </>
        )}
      </div>
    </div>
  );
}

function EloDeltaBadge({ before, after }) {
  const delta = after - before;
  return (
    <span className={`elo-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
      {before} → {after} ({delta >= 0 ? '+' : ''}
      {delta})
    </span>
  );
}

function AnalysisSummary({ analysis }) {
  const { summary, finalEvalCp } = analysis;
  const clampedEval = Math.max(-1000, Math.min(1000, finalEvalCp || 0));
  const whitePct = 50 + clampedEval / 20; // -1000..1000 cp -> 0..100%

  return (
    <div className="mh-analysis-summary">
      <div className="eval-bar">
        <div className="eval-bar-fill" style={{ width: `${whitePct}%` }} />
      </div>
      <p className="mh-analysis-line">
        White accuracy {summary.whiteAccuracy}% • Black accuracy {summary.blackAccuracy}% •{' '}
        {summary.blunders} Blunders · {summary.mistakes} Mistakes · {summary.inaccuracies} Inaccuracies
      </p>
    </div>
  );
}

function chunkMoves(moves = [], analysis) {
  const tagFor = (index) => {
    if (!analysis) return null;
    const entry = analysis.perMove?.[index];
    if (!entry) return null;
    return classificationTag(entry.classification);
  };

  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteTag: tagFor(i),
      black: moves[i + 1] || '',
      blackTag: moves[i + 1] ? tagFor(i + 1) : null,
    });
  }
  return rows;
}
