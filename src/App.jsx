import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessGameEngine, createEngine } from './game/chessEngine';
import { saveMatch } from './game/gameStorage';
import { soundEffects } from './game/audio';
import HomePage from './components/HomePage';
import Board from './components/Board';
import MoveList from './components/MoveList';
import BattleScreen from './components/BattleScreen';
import GameHistory from './components/GameHistory';
import './App.css';

export default function App() {
  // Pre-Match Configuration State
  const [view, setView] = useState('home'); // 'home' | 'game'
  const [gameMode, setGameMode] = useState('ai'); // '2p' | 'ai'
  const [aiElo, setAiElo] = useState(1200); // 400 to 2400
  const [showMoveHighlights, setShowMoveHighlights] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  // Live Game State
  const engine = useMemo(() => new ChessGameEngine(), []);
  const [board, setBoard] = useState(() => engine.getBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [moves, setMoves] = useState([]);
  const [statusMessage, setStatusMessage] = useState(() => engine.getGameStatus());
  const [hasSavedCurrentMatch, setHasSavedCurrentMatch] = useState(false);

  // Battle overlay state
  const [activeCapture, setActiveCapture] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);

  // Replay Mode State
  const [replayMatch, setReplayMatch] = useState(null);
  const [replayMoveIndex, setReplayMoveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Derive King in check square
  const inCheckSquare = useMemo(() => {
    const activeEngine = replayMatch ? null : engine;
    if (!activeEngine || !activeEngine.inCheck()) return null;
    const currentTurn = activeEngine.getTurn();
    const currentBoard = activeEngine.getBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          return `${files[c]}${8 - r}`;
        }
      }
    }
    return null;
  }, [engine, board, replayMatch]);

  // Replay Engine Calculation
  const replayData = useMemo(() => {
    if (!replayMatch || !replayMatch.moves) return null;
    const tempEngine = createEngine();
    let currentLastMove = null;
    for (let i = 0; i < replayMoveIndex; i++) {
      const san = replayMatch.moves[i];
      if (san) {
        try {
          const m = tempEngine.chess.move(san);
          if (m) currentLastMove = { from: m.from, to: m.to };
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      board: tempEngine.getBoard(),
      lastMove: currentLastMove,
      moves: replayMatch.moves.slice(0, replayMoveIndex),
      status: `Replaying Move ${replayMoveIndex} of ${replayMatch.moves.length}`,
    };
  }, [replayMatch, replayMoveIndex]);

  // Auto-play replay timer
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying && replayMatch) {
      if (replayMoveIndex < replayMatch.moves.length) {
        timer = setTimeout(() => {
          setReplayMoveIndex((prev) => prev + 1);
        }, 800);
      } else {
        setIsAutoPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoPlaying, replayMoveIndex, replayMatch]);

  const applyGameStateUpdate = useCallback((move) => {
    setBoard(engine.getBoard());
    setMoves(engine.getHistory());
    const status = engine.getGameStatus();
    setStatusMessage(status);
    if (move) {
      setLastMove({ from: move.from, to: move.to });
    }

    // Auto-save on Game Over
    if (engine.isGameOver() && !hasSavedCurrentMatch) {
      const winner = engine.getWinner();
      saveMatch(engine, winner);
      setHasSavedCurrentMatch(true);
    }
  }, [engine, hasSavedCurrentMatch]);

  // AI Turn Logic Effect with pre-set ELO rating
  useEffect(() => {
    let timer = null;
    const currentTurn = engine.getTurn();

    if (
      view === 'game' &&
      gameMode === 'ai' &&
      currentTurn === 'b' &&
      !engine.isGameOver() &&
      !activeCapture &&
      !replayMatch
    ) {
      timer = setTimeout(() => {
        const aiMove = engine.getBestAiMove(aiElo);
        if (aiMove) {
          const result = engine.makeMove(aiMove.from, aiMove.to, aiMove.promotion);
          if (result && result.move) {
            soundEffects.playMoveSound();
            if (result.captureData) {
              setPendingMove(result.move);
              setActiveCapture({
                ...result.captureData,
                isCheckmate: engine.chess.isCheckmate(),
              });
            } else {
              applyGameStateUpdate(result.move);
            }
          }
        }
      }, 600);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [view, gameMode, aiElo, board, activeCapture, replayMatch, engine, applyGameStateUpdate]);

  const handleSquareClick = (squareName) => {
    if (replayMatch || engine.isGameOver() || activeCapture) return;

    // In AI mode, player can only move White ('w')
    const currentTurn = engine.getTurn();
    if (gameMode === 'ai' && currentTurn === 'b') return;

    const col = squareName.charCodeAt(0) - 97;
    const row = 8 - parseInt(squareName[1], 10);
    const clickedPiece = board[row]?.[col];

    if (selectedSquare) {
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (possibleMoves.includes(squareName)) {
        const result = engine.makeMove(selectedSquare, squareName);
        if (result && result.move) {
          setSelectedSquare(null);
          setPossibleMoves([]);

          soundEffects.playMoveSound();

          if (result.captureData) {
            setPendingMove(result.move);
            setActiveCapture({
              ...result.captureData,
              isCheckmate: engine.chess.isCheckmate(),
            });
          } else {
            applyGameStateUpdate(result.move);
          }
          return;
        }
      }

      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(squareName);
        setPossibleMoves(engine.getPossibleMoves(squareName));
        return;
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(squareName);
        setPossibleMoves(engine.getPossibleMoves(squareName));
      }
    }
  };

  const handleBattleComplete = useCallback(() => {
    if (pendingMove) {
      applyGameStateUpdate(pendingMove);
      setPendingMove(null);
    }
    setActiveCapture(null);
  }, [pendingMove, applyGameStateUpdate]);

  const handleResetGame = () => {
    try {
      if (engine && typeof engine.reset === 'function') {
        engine.reset();
      }
    } catch (e) {
      console.error('Engine reset error:', e);
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setMoves([]);
    setActiveCapture(null);
    setPendingMove(null);
    setReplayMatch(null);
    setIsAutoPlaying(false);
    setHasSavedCurrentMatch(false);
    if (engine) {
      try {
        setBoard(engine.getBoard());
        setStatusMessage(engine.getGameStatus());
      } catch (e) {
        console.error('Board state error:', e);
      }
    }
  };

  const handleStartGame = ({ mode, elo, showMoveHighlights: movesFlag, showTooltips: tooltipsFlag }) => {
    setGameMode(mode);
    setAiElo(elo);
    setShowMoveHighlights(movesFlag);
    setShowTooltips(tooltipsFlag);
    handleResetGame();
    setView('game');
  };

  const handleSelectReplayMatch = (match) => {
    setReplayMatch(match);
    setReplayMoveIndex(0);
    setIsAutoPlaying(false);
  };

  const handleExitReplay = () => {
    setReplayMatch(null);
    setIsAutoPlaying(false);
  };

  // Active board and state derivation
  const activeBoard = replayMatch ? replayData?.board || [] : board;
  const activeLastMove = replayMatch ? replayData?.lastMove : lastMove;
  const activeMoves = replayMatch ? replayData?.moves || [] : moves;
  const activeStatus = replayMatch
    ? replayData?.status || 'Replay'
    : gameMode === 'ai'
    ? `${statusMessage} (AI ${aiElo} ELO)`
    : statusMessage;

  if (view === 'home') {
    return (
      <HomePage
        onStartGame={handleStartGame}
        initialElo={aiElo}
        initialMode={gameMode}
        initialShowMoves={showMoveHighlights}
        initialShowTooltips={showTooltips}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Full-screen Pokémon Battle Overlay */}
      {activeCapture && (
        <BattleScreen
          captureInfo={activeCapture}
          isCheckmate={activeCapture.isCheckmate}
          onComplete={handleBattleComplete}
        />
      )}

      <header className="app-header">
        <div className="nav-bar-top">
          <button className="btn-home-nav font-poke" onClick={() => setView('home')}>
            ◄ Main Menu
          </button>
        </div>
        <h1 className="title font-poke">Pokémon Battle Chess</h1>
        <p className="subtitle">
          {gameMode === 'ai' ? `vs AI (${aiElo} ELO)` : '2 Player Pass & Play'}
        </p>

        {/* Dynamic In-Game Display Setting */}
        <div className="settings-toolbar">
          <button
            className={`tooltip-toggle-btn ${showTooltips ? 'enabled' : 'disabled'}`}
            onClick={() => setShowTooltips((prev) => !prev)}
            title="Toggle Pokémon name hover badge on/off during game"
          >
            {showTooltips ? '🏷️ Hover Badges: ON' : '🏷️ Hover Badges: OFF'}
          </button>
        </div>
      </header>

      <main className="game-layout">
        <div className="board-section">
          <div className="status-banner">
            <span className={`status-text ${!replayMatch && engine.inCheck() ? 'check-text' : ''}`}>
              {activeStatus}
            </span>
          </div>

          <Board
            board={activeBoard}
            selectedSquare={replayMatch ? null : selectedSquare}
            possibleMoves={replayMatch ? [] : possibleMoves}
            lastMove={activeLastMove}
            inCheckSquare={inCheckSquare}
            showMoveHighlights={showMoveHighlights}
            showTooltips={showTooltips}
            onSquareClick={handleSquareClick}
            disabled={!!activeCapture || !!replayMatch}
          />

          <div className="controls-bar">
            {replayMatch ? (
              <div className="replay-controls">
                <button
                  className="btn btn-secondary"
                  onClick={() => setReplayMoveIndex(0)}
                  disabled={replayMoveIndex === 0}
                >
                  |◄ Start
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setReplayMoveIndex((prev) => Math.max(0, prev - 1))}
                  disabled={replayMoveIndex === 0}
                >
                  ◄ Step Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                >
                  {isAutoPlaying ? 'Pause ❚❚' : 'Auto Play ⏯'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setReplayMoveIndex((prev) =>
                      Math.min(replayMatch.moves.length, prev + 1)
                    )
                  }
                  disabled={replayMoveIndex >= replayMatch.moves.length}
                >
                  Step Forward ►
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setReplayMoveIndex(replayMatch.moves.length)}
                  disabled={replayMoveIndex >= replayMatch.moves.length}
                >
                  End ►|
                </button>
                <button className="btn btn-restart" onClick={handleExitReplay}>
                  Exit Replay
                </button>
              </div>
            ) : (
              <button className="btn btn-restart" onClick={handleResetGame}>
                New Game
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <MoveList moves={activeMoves} />
          <GameHistory
            onSelectReplay={handleSelectReplayMatch}
            currentReplayId={replayMatch?.id}
          />
        </div>
      </main>
    </div>
  );
}
