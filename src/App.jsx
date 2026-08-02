import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessGameEngine, createEngine } from './game/chessEngine';
import { saveMatch } from './game/gameStorage';
import { soundEffects } from './game/audio';
import { ARENA_THEMES } from './game/themes';
import { getStoredProfile, createProfile, recordMatchResult, recordCaughtPokemon, saveProfile, AVATAR_OPTIONS } from './game/profileStorage';
import { getLineupForStage } from './game/pokemonLineups';
import { WILD_POKEMON_PUZZLES } from './game/wildPuzzles';
import { subscribeLobbyGame, pushLobbyMove } from './game/lobbyStore';
import HomePage from './components/HomePage';
import Board from './components/Board';
import MoveList from './components/MoveList';
import BattleScreen from './components/BattleScreen';
import GameHistory from './components/GameHistory';
import MatchHistoryModal from './components/MatchHistoryModal';
import OnlineLobbyScreen from './components/OnlineLobbyScreen';
import CapturedPiecesTray, { computeGameStats } from './components/CapturedPiecesBar';
import TrainerLoginModal from './components/TrainerLoginModal';
import StoryMap from './components/StoryMap';
import PikachuCoachBanner from './components/PikachuCoachBanner';
import WildPuzzleScreen from './components/WildPuzzleScreen';
import PokedexModal from './components/PokedexModal';
import EvolutionOverlay from './components/EvolutionOverlay';
import StarterSelectionModal from './components/StarterSelectionModal';
import PromotionModal from './components/PromotionModal';
import BirthdayCheckModal from './components/BirthdayCheckModal';
import BirthdaySurpriseModal from './components/BirthdaySurpriseModal';
import LadyEscortOverlay from './components/LadyEscortOverlay';
import GBATileMap from './components/GBATileMap';
import './App.css';

export default function App() {
  // Trainer Profile State
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [showLoginModal, setShowLoginModal] = useState(() => !getStoredProfile());

  // Pre-Match Configuration State
  const [view, setView] = useState('home'); // 'home' | 'story' | 'lobby' | 'game'
  const [gameMode, setGameMode] = useState('ai'); // '2p' | 'ai' | 'lobby'
  const [playerColor, setPlayerColor] = useState('w'); // 'w' | 'b'
  const [aiElo, setAiElo] = useState(1200); // 50 to 2400
  const [showMoveHighlights, setShowMoveHighlights] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [theme, setTheme] = useState('classic');
  const [activeStoryStage, setActiveStoryStage] = useState(null);

  // Online Lobby State (live 2-player games via Supabase Realtime)
  const [lobbyGameId, setLobbyGameId] = useState(null);
  const [lobbyOpponentHandle, setLobbyOpponentHandle] = useState(null);
  const [lobbyOpponentEloSnapshot, setLobbyOpponentEloSnapshot] = useState(null);

  // Match History Modal
  const [showMatchHistoryModal, setShowMatchHistoryModal] = useState(false);

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
      const mode = activeStoryStage ? 'story' : gameMode; // 'ai' | '2p' | 'story' | 'lobby'
      const showsElo = mode !== '2p';
      const trainerEloBefore = profile?.trainerElo ?? null;
      const opponentEloForRecord = activeStoryStage
        ? activeStoryStage.elo
        : mode === 'lobby'
        ? lobbyOpponentEloSnapshot ?? 1200
        : aiElo;
      let trainerEloAfter = trainerEloBefore;

      // Record profile progress & unlock badges
      if (profile) {
        const isWin =
          (winner === 'white' && playerColor === 'w') ||
          (winner === 'black' && playerColor === 'b');
        const isDraw = winner === 'draw';
        const oldUnlocked = profile.unlockedStage || 1;
        const updated = recordMatchResult(profile, isWin, isDraw, activeStoryStage, opponentEloForRecord);
        trainerEloAfter = updated.trainerElo;
        setProfile(updated);

        // Evolution animation check for Starter Partner Pawn
        if (isWin && activeStoryStage) {
          if (oldUnlocked <= 7 && updated.unlockedStage >= 8) {
            setEvolutionEvent({
              oldPawn: getLineupForStage(7).pawn,
              newPawn: getLineupForStage(8).pawn,
            });
          } else if (oldUnlocked <= 14 && updated.unlockedStage >= 15) {
            setEvolutionEvent({
              oldPawn: getLineupForStage(14).pawn,
              newPawn: getLineupForStage(15).pawn,
            });
          }
        }
      }

      saveMatch(engine, winner, {
        mode,
        handle: profile?.handle,
        playerColor,
        trainerEloBefore: showsElo ? trainerEloBefore : null,
        trainerEloAfter: showsElo ? trainerEloAfter : null,
        opponentElo: showsElo ? opponentEloForRecord : null,
        opponentHandle: mode === 'lobby' ? lobbyOpponentHandle : null,
        storyStageId: activeStoryStage?.id ?? null,
        storyStageName: activeStoryStage?.name ?? null,
      });

      setHasSavedCurrentMatch(true);
    }
  }, [
    engine,
    hasSavedCurrentMatch,
    profile,
    playerColor,
    activeStoryStage,
    aiElo,
    gameMode,
    lobbyOpponentEloSnapshot,
    lobbyOpponentHandle,
  ]);

  // Pushes a locally-made move to the shared Supabase row for live Online Lobby games.
  // Only call this alongside a LOCAL player's move (never for moves applied from a
  // remote realtime update, to avoid redundant echo writes).
  const applyLocalMove = useCallback(
    (move) => {
      applyGameStateUpdate(move);
      if (gameMode === 'lobby' && lobbyGameId) {
        const isOver = engine.isGameOver();
        pushLobbyMove(lobbyGameId, {
          moves: engine.getHistory(),
          turn: engine.getTurn(),
          status: isOver ? 'finished' : 'active',
          winner: isOver ? engine.getWinner() : null,
        });
      }
    },
    [applyGameStateUpdate, gameMode, lobbyGameId, engine]
  );

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

  const [pendingPromotionMove, setPendingPromotionMove] = useState(null);

  const handleSelectPromotion = (choice) => {
    if (pendingPromotionMove) {
      const result = engine.makeMove(pendingPromotionMove.from, pendingPromotionMove.to, choice);
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
          applyLocalMove(result.move);
        }
      }
      setPendingPromotionMove(null);
    }
  };

  const handleSquareClick = (squareName) => {
    if (replayMatch) return;
    if (activeCapture) return;

    const currentTurn = engine.getTurn();
    if (gameMode === 'ai' && currentTurn !== playerColor) return;
    if (gameMode === 'lobby' && currentTurn !== playerColor) return;

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
        if (engine.isPromotionMove(selectedSquare, squareName)) {
          setSelectedSquare(null);
          setPossibleMoves([]);
          setPendingPromotionMove({ from: selectedSquare, to: squareName });
          return;
        }

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
            applyLocalMove(result.move);
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
      applyLocalMove(pendingMove);
      setPendingMove(null);
    }
    setActiveCapture(null);
  }, [pendingMove, applyLocalMove]);

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

  const handleLeaveGameToHome = () => {
    if (gameMode === 'lobby') setGameMode('ai');
    setLobbyGameId(null);
    setLobbyOpponentHandle(null);
    setLobbyOpponentEloSnapshot(null);
    setView('home');
  };

  const handleGameReadyFromLobby = ({ code, color, opponentHandle, opponentElo }) => {
    setActiveStoryStage(null);
    setGameMode('lobby');
    setPlayerColor(color);
    setLobbyGameId(code);
    setLobbyOpponentHandle(opponentHandle || null);
    setLobbyOpponentEloSnapshot(typeof opponentElo === 'number' ? opponentElo : 1200);
    handleResetGame();
    setView('game');
  };

  // Live sync for Online Lobby games: apply moves the opponent makes on their client.
  useEffect(() => {
    if (view !== 'game' || gameMode !== 'lobby' || !lobbyGameId) return undefined;

    const unsubscribe = subscribeLobbyGame(lobbyGameId, (row) => {
      if (!row || !Array.isArray(row.moves)) return;
      const localLen = engine.getHistory().length;
      if (row.moves.length <= localLen) return; // own echo or stale event

      let lastMove = null;
      for (let i = localLen; i < row.moves.length; i++) {
        const san = row.moves[i];
        try {
          const m = engine.chess.move(san);
          if (m) lastMove = { from: m.from, to: m.to };
        } catch (e) {
          console.error('Failed to apply remote lobby move:', san, e);
          break;
        }
      }
      if (lastMove) {
        soundEffects.playMoveSound();
        applyGameStateUpdate(lastMove);
      }
    });

    return unsubscribe;
  }, [view, gameMode, lobbyGameId, engine, applyGameStateUpdate]);

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

  const [activeWildPuzzle, setActiveWildPuzzle] = useState(null);
  const [showPokedexModal, setShowPokedexModal] = useState(false);

  const handleSelectStoryStage = (stage) => {
    setActiveStoryStage(stage);
    setGameMode('ai');
    setAiElo(stage.elo);
    setPlayerColor('w');
    if (stage.theme) setTheme(stage.theme);
    handleResetGame();
    setView('game');
  };

  const [showStarterModal, setShowStarterModal] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [showBirthdayCheck, setShowBirthdayCheck] = useState(false);
  const [showLadyEscort, setShowLadyEscort] = useState(false);
  const [showBirthdaySurprise, setShowBirthdaySurprise] = useState(false);
  const [hasCheckedBirthdayInStory, setHasCheckedBirthdayInStory] = useState(false);
  const [useGBAMapView, setUseGBAMapView] = useState(true);

  const handleLoginProfile = (handle, avatarId, rememberMe, password = '', cloudProfile = null) => {
    const p = cloudProfile || createProfile(handle, avatarId, rememberMe, password);
    setProfile(p);
    setShowLoginModal(false);
    setView('home');
    soundEffects.playVictorySound();
  };

  const handleAnswerBirthday = (hasBirthday) => {
    setIsBirthday(hasBirthday);
    setShowBirthdayCheck(false);
    setHasCheckedBirthdayInStory(true);
    setShowLadyEscort(true); // Step outside house -> Lady Guide escorts you!
  };

  const handleArriveAtLab = () => {
    setShowLadyEscort(false);
    if (isBirthday) {
      setShowBirthdaySurprise(true); // Launch Birthday Celebration Video/Song!
    } else if (!profile?.starterLineId) {
      setShowStarterModal(true);
    }
  };

  const handleBirthdayNpcTalk = () => {
    if (!hasCheckedBirthdayInStory) {
      setShowBirthdayCheck(true);
    } else if (isBirthday) {
      setShowBirthdaySurprise(true);
    }
  };

  const handleWildEncounter = (region) => {
    const candidates = WILD_POKEMON_PUZZLES.filter((p) => p.region === region);
    if (candidates.length === 0) return;
    const puzzle = candidates[Math.floor(Math.random() * candidates.length)];
    setActiveWildPuzzle(puzzle);
  };

  const handleSelectStarter = (starterId) => {
    if (profile) {
      const updated = { ...profile, starterLineId: starterId };
      setProfile(updated);
      saveProfile(updated);
    }
    setShowStarterModal(false);
  };

  const handleTogglePieceStyle = () => {
    if (!profile) return;
    const updated = {
      ...profile,
      pieceStyle: profile.pieceStyle === 'classic' ? 'pokemon' : 'classic',
    };
    setProfile(updated);
    saveProfile(updated);
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
    : gameMode === 'lobby'
    ? `${statusMessage} (Online vs ${lobbyOpponentHandle || '...'})`
    : statusMessage;

  const [evolutionEvent, setEvolutionEvent] = useState(null);

  // View Renders
  const mainContent = (() => {
  if (showLoginModal) {
    return <TrainerLoginModal onLogin={handleLoginProfile} currentProfile={profile} />;
  }

  if (showStarterModal) {
    return (
      <StarterSelectionModal
        trainerName={profile?.handle || 'Trainer'}
        onSelectStarter={handleSelectStarter}
      />
    );
  }

  if (showBirthdayCheck) {
    return (
      <BirthdayCheckModal
        trainerName={profile?.handle || 'Trainer'}
        onAnswerBirthday={handleAnswerBirthday}
      />
    );
  }

  if (showLadyEscort) {
    return (
      <LadyEscortOverlay
        trainerName={profile?.handle || 'Trainer'}
        onArriveAtLab={handleArriveAtLab}
      />
    );
  }

  if (showBirthdaySurprise) {
    return (
      <BirthdaySurpriseModal
        trainerName={profile?.handle || 'Trainer'}
        onComplete={() => setShowBirthdaySurprise(false)}
      />
    );
  }

  if (evolutionEvent) {
    return (
      <EvolutionOverlay
        oldPawn={evolutionEvent.oldPawn}
        newPawn={evolutionEvent.newPawn}
        trainerName={profile?.handle || 'Trainer'}
        onComplete={() => setEvolutionEvent(null)}
      />
    );
  }

  if (activeWildPuzzle) {
    return (
      <WildPuzzleScreen
        puzzle={activeWildPuzzle}
        onComplete={(puzzle) => {
          if (profile) {
            const updated = recordCaughtPokemon(profile, puzzle.id.replace('wild_', ''));
            setProfile(updated);
          }
          setActiveWildPuzzle(null);
        }}
        onExit={() => setActiveWildPuzzle(null)}
      />
    );
  }

  if (view === 'lobby') {
    return (
      <OnlineLobbyScreen
        profile={profile}
        onGameReady={handleGameReadyFromLobby}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'story') {
    if (useGBAMapView) {
      return (
        <GBATileMap
          profile={profile}
          onInteractPokeball={() => setShowStarterModal(true)}
          onWildEncounter={handleWildEncounter}
          onBirthdayNpcTalk={handleBirthdayNpcTalk}
          onProfileUpdate={setProfile}
          onBackToMenu={() => setView('home')}
        />
      );
    }

    return (
      <>
        {showPokedexModal && (
          <PokedexModal profile={profile} onClose={() => setShowPokedexModal(false)} />
        )}
        <StoryMap
          profile={profile}
          onSelectStage={handleSelectStoryStage}
          onSelectWildPuzzle={(puzzle) => setActiveWildPuzzle(puzzle)}
          onOpenPokedex={() => setShowPokedexModal(true)}
          onBackToHome={() => setView('home')}
          onChangeProfile={() => setShowLoginModal(true)}
        />
      </>
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
            className="btn-match-history font-poke"
            onClick={() => setShowMatchHistoryModal(true)}
          >
            📜 Match History
          </button>

          <button
            className="btn-story-mode-launch font-poke"
            onClick={() => setView('lobby')}
          >
            🌐 ONLINE LOBBY ►
          </button>

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
          pieceStyle={profile?.pieceStyle || 'pokemon'}
          onTogglePieceStyle={handleTogglePieceStyle}
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
          <button className="btn-home-nav font-poke" onClick={handleLeaveGameToHome}>
            ◄ Main Menu
          </button>

          {activeStoryStage && (
            <button className="btn-home-nav font-poke" onClick={() => setView('story')}>
              🎮 Campaign Map
            </button>
          )}

          <button
            className="btn-match-history-mini"
            onClick={() => setShowMatchHistoryModal(true)}
            title="Match History"
          >
            📜
          </button>

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
            : gameMode === 'lobby'
            ? `Online vs ${lobbyOpponentHandle || '...'} • Playing as ${playerColor === 'w' ? 'White' : 'Black'}`
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
              trainerName={profile?.handle || 'Trainer'}
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
            pieceStyle={profile?.pieceStyle || 'pokemon'}
            onSquareClick={handleSquareClick}
            disabled={!!replayMatch}
            flipped={(gameMode === 'ai' || gameMode === 'lobby') && playerColor === 'b'}
          />

          {pendingPromotionMove && (
            <PromotionModal
              playerColor={engine.getTurn()}
              onSelectPromotion={handleSelectPromotion}
            />
          )}

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
          ) : gameMode === 'lobby' ? (
            <div className="controls-bar">
              <p className="lobby-live-note">🌐 Live Online Match — use Main Menu to leave</p>
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
  })();

  return (
    <>
      {mainContent}
      {showMatchHistoryModal && (
        <MatchHistoryModal
          profile={profile}
          onClose={() => setShowMatchHistoryModal(false)}
          onSelectReplay={(match) => {
            setReplayMatch(match);
            setReplayMoveIndex(0);
            setShowMatchHistoryModal(false);
            if (view !== 'game') setView('game');
          }}
        />
      )}
    </>
  );
}
