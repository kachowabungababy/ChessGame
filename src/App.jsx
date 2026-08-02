import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessGameEngine, createEngine } from './game/chessEngine';
import { saveMatch } from './game/gameStorage';
import { soundEffects } from './game/audio';
import { ARENA_THEMES } from './game/themes';
import { getStoredProfile, createProfile, recordMatchResult, AVATAR_OPTIONS } from './game/profileStorage';
import HomePage from './components/HomePage';
import Board from './components/Board';
import MoveList from './components/MoveList';
import BattleScreen from './components/BattleScreen';
import GameHistory from './components/GameHistory';
import CapturedPiecesTray, { computeGameStats } from './components/CapturedPiecesBar';
import TrainerLoginModal from './components/TrainerLoginModal';
import StoryMap from './components/StoryMap';
import PikachuCoachBanner from './components/PikachuCoachBanner';
import './App.css';

export default function App() {
  // Trainer Profile State
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [showLoginModal, setShowLoginModal] = useState(() => !getStoredProfile());

  // Pre-Match Configuration State
  const [view, setView] = useState('home'); // 'home' | 'story' | 'game'
  const [gameMode, setGameMode] = useState('ai'); // '2p' | 'ai'
  const [playerColor, setPlayerColor] = useState('w'); // 'w' | 'b'
  const [aiElo, setAiElo] = useState(1200); // 50 to 2400
  const [showMoveHighlights, setShowMoveHighlights] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [theme, setTheme] = useState('classic');
  const [activeStoryStage, setActiveStoryStage] = useState(null);

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

  // Synchronize document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Compute Material Advantage & Captured Pieces
  const activeBoard = useMemo(() => {
    if (replayMatch) {
      const tempEngine = createEngine();
      for (let i = 0; i < replayMoveIndex; i++) {
        const san = replayMatch.moves[i];
        if (san) {
          try {
            tempEngine.chess.move(san);
          } catch (e) {
            // ignore
          }
        }
      }
      return tempEngine.getBoard();
    }
    return board;
  }, [replayMatch, replayMoveIndex, board]);

  const gameStats = useMemo(() => {
    return computeGameStats(activeBoard, gameMode);
  }, [activeBoard, gameMode]);

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

      // Record profile progress & unlock badges
      if (profile) {
        const isWin =
          (winner === 'white' && playerColor === 'w') ||
          (winner === 'black' && playerColor === 'b');
        const isDraw = winner === 'draw';
        const updated = recordMatchResult(profile, isWin, isDraw, activeStoryStage);
        setProfile(updated);
      }
      setHasSavedCurrentMatch(true);
    }
  }, [engine, hasSavedCurrentMatch, profile, playerColor, activeStoryStage]);

  // AI Turn Logic Effect
  useEffect(() => {
    let timer = null;
    const currentTurn = engine.getTurn();
    const isAiTurn = gameMode === 'ai' && currentTurn !== playerColor;

    if (
      view === 'game' &&
      isAiTurn &&
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
  }, [view, gameMode, playerColor, aiElo, board, activeCapture, replayMatch, engine, applyGameStateUpdate]);

  const handleSquareClick = (squareName) => {
    if (replayMatch || engine.isGameOver() || activeCapture) return;

    // In AI mode, player can only move their chosen color
    const currentTurn = engine.getTurn();
    if (gameMode === 'ai' && currentTurn !== playerColor) return;

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

  const handleStartGame = ({
    mode,
    elo,
    playerColor: chosenColor,
    showMoveHighlights: movesFlag,
    showTooltips: tooltipsFlag,
    theme: themeFlag,
  }) => {
    setActiveStoryStage(null);
    setGameMode(mode);
    setAiElo(elo);
    if (chosenColor) setPlayerColor(chosenColor);
    setShowMoveHighlights(movesFlag);
    setShowTooltips(tooltipsFlag);
    if (themeFlag) setTheme(themeFlag);
    handleResetGame();
    setView('game');
  };

  const handleSelectStoryStage = (stage) => {
    setActiveStoryStage(stage);
    setGameMode('ai');
    setAiElo(stage.elo);
    setPlayerColor('w');
    if (stage.theme) setTheme(stage.theme);
    handleResetGame();
    setView('game');
  };

  const handleLoginProfile = (handle, avatarId, rememberMe) => {
    const p = createProfile(handle, avatarId, rememberMe);
    setProfile(p);
    setShowLoginModal(false);
  };

  const activeAvatar = AVATAR_OPTIONS.find((a) => a.id === profile?.avatarId) || AVATAR_OPTIONS[0];

  const activeLastMove = replayMatch ? replayData?.lastMove : lastMove;
  const activeMoves = replayMatch ? replayData?.moves || [] : moves;
  const activeStatus = replayMatch
    ? replayData?.status || 'Replay'
    : activeStoryStage
    ? `${statusMessage} — ${activeStoryStage.name} (${activeStoryStage.elo} ELO)`
    : gameMode === 'ai'
    ? `${statusMessage} (vs AI ${aiElo} ELO)`
    : statusMessage;

  // View Renders
  if (showLoginModal) {
    return <TrainerLoginModal onLogin={handleLoginProfile} currentProfile={profile} />;
  }

  if (view === 'story') {
    return (
      <StoryMap
        profile={profile}
        onSelectStage={handleSelectStoryStage}
        onBackToHome={() => setView('home')}
        onChangeProfile={() => setShowLoginModal(true)}
      />
    );
  }

  if (view === 'home') {
    return (
      <div className="home-wrapper-container">
        {/* Top Header Trainer Chip */}
        <div className="top-profile-bar">
          <div className="trainer-chip-badge" onClick={() => setShowLoginModal(true)}>
            <img src={activeAvatar.url} alt={profile?.handle} className="trainer-chip-img" />
            <span className="trainer-chip-name font-poke">{profile?.handle || 'Trainer'}</span>
            <span className="trainer-chip-stats">
              ({profile?.stats?.wins || 0}W - {profile?.stats?.losses || 0}L)
            </span>
          </div>

          <button
            className="btn-story-mode-launch font-poke"
            onClick={() => setView('story')}
          >
            🎮 STORY CAMPAIGN ►
          </button>
        </div>

        <HomePage
          onStartGame={handleStartGame}
          initialElo={aiElo}
          initialMode={gameMode}
          initialPlayerColor={playerColor}
          initialShowMoves={showMoveHighlights}
          initialShowTooltips={showTooltips}
          initialTheme={theme}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Full-screen Pokémon Battle Overlay */}
      {activeCapture && (
        <BattleScreen
          captureInfo={activeCapture}
          isCheckmate={activeCapture.isCheckmate}
          theme={theme}
          onComplete={handleBattleComplete}
        />
      )}

      <header className="app-header">
        <div className="nav-bar-top">
          <button className="btn-home-nav font-poke" onClick={() => setView('home')}>
            ◄ Main Menu
          </button>

          {activeStoryStage && (
            <button className="btn-home-nav font-poke" onClick={() => setView('story')}>
              🎮 Campaign Map
            </button>
          )}

          <div className="trainer-chip-badge mini" onClick={() => setShowLoginModal(true)}>
            <img src={activeAvatar.url} alt={profile?.handle} className="trainer-chip-img" />
            <span className="trainer-chip-name font-poke">{profile?.handle || 'Trainer'}</span>
          </div>
        </div>
        <h1 className="title font-poke">
          {activeStoryStage ? `Stage ${activeStoryStage.id}: ${activeStoryStage.name}` : 'Pokémon Battle Chess'}
        </h1>
        <p className="subtitle">
          {activeStoryStage
            ? `${activeStoryStage.trainerTitle} (${activeStoryStage.elo} ELO)`
            : gameMode === 'ai'
            ? `vs AI (${aiElo} ELO) • Playing as ${playerColor === 'w' ? 'White' : 'Black'}`
            : '2 Player Pass & Play'}
        </p>

        {/* Dynamic In-Game Display & Theme Settings */}
        <div className="settings-toolbar">
          <div className="theme-pills-list">
            {ARENA_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-pill ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
                title={`Switch arena to ${t.name}`}
              >
                {t.icon} {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`tooltip-toggle-btn ${showTooltips ? 'enabled' : ''}`}
            onClick={() => setShowTooltips((prev) => !prev)}
          >
            🏷️ Badges {showTooltips ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="game-layout">
        {/* Left Side: Advantage Banner, Captured Pieces & Chess Board */}
        <section className="board-section">
          {/* Pikachu Coach Banner for early story stages */}
          {activeStoryStage?.hasCoach && (
            <PikachuCoachBanner
              engine={engine}
              activeBoard={activeBoard}
              turn={engine.getTurn()}
            />
          )}

          {/* Material Advantage Header Banner */}
          <div className="advantage-banner font-poke">
            <h2 className="advantage-title">{gameStats.advantageText}</h2>
          </div>

          {/* Captured Pieces Trays */}
          <CapturedPiecesTray
            capturedWhite={gameStats.capturedWhite}
            capturedBlack={gameStats.capturedBlack}
            showTooltips={showTooltips}
          />

          {/* Game Status Banner */}
          <div className="status-banner font-poke">
            <p
              className={`status-text ${
                activeStatus.includes('Check') ? 'check-text' : ''
              }`}
            >
              {activeStatus}
            </p>
          </div>

          {/* Interactive Chess Board */}
          <Board
            board={activeBoard}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={activeLastMove}
            inCheckSquare={inCheckSquare}
            showMoveHighlights={showMoveHighlights}
            showTooltips={showTooltips}
            onSquareClick={handleSquareClick}
            disabled={!!replayMatch}
            flipped={gameMode === 'ai' && playerColor === 'b'}
          />

          {/* Replay Controls / Game Controls */}
          {replayMatch ? (
            <div className="controls-bar">
              <div className="replay-controls">
                <button
                  className="btn btn-secondary font-poke"
                  onClick={() => setReplayMoveIndex(0)}
                  disabled={replayMoveIndex === 0}
                >
                  |◄
                </button>
                <button
                  className="btn btn-secondary font-poke"
                  onClick={() => setReplayMoveIndex((prev) => Math.max(0, prev - 1))}
                  disabled={replayMoveIndex === 0}
                >
                  ◄ Prev
                </button>
                <button
                  className="btn btn-primary font-poke"
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                >
                  {isAutoPlaying ? 'Pause ❚❚' : 'Play ►'}
                </button>
                <button
                  className="btn btn-secondary font-poke"
                  onClick={() =>
                    setReplayMoveIndex((prev) =>
                      Math.min(replayMatch.moves.length, prev + 1)
                    )
                  }
                  disabled={replayMoveIndex >= replayMatch.moves.length}
                >
                  Next ►
                </button>
                <button
                  className="btn btn-secondary font-poke"
                  onClick={() => setReplayMoveIndex(replayMatch.moves.length)}
                  disabled={replayMoveIndex >= replayMatch.moves.length}
                >
                  ►|
                </button>
              </div>
              <button
                className="btn btn-restart font-poke"
                onClick={() => setReplayMatch(null)}
              >
                Exit Replay ✖
              </button>
            </div>
          ) : (
            <div className="controls-bar">
              <button className="btn btn-restart font-poke" onClick={handleResetGame}>
                Reset Match ↺
              </button>
            </div>
          )}
        </section>

        {/* Right Side: Moves Log & Saved Game History */}
        <aside className="sidebar-section">
          <MoveList moves={activeMoves} />
          <GameHistory
            onSelectReplay={(match) => {
              setReplayMatch(match);
              setReplayMoveIndex(0);
            }}
            activeReplayId={replayMatch?.id}
          />
        </aside>
      </main>
    </div>
  );
}
