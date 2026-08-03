import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChessGameEngine } from '../game/chessEngine';
import Board from './Board';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

const AUTO_REPLY_DELAY_MS = 700;

export default function WildPuzzleScreen({ puzzle, onComplete, onExit }) {
  const puzzleEngine = useMemo(() => new ChessGameEngine(puzzle.fen), [puzzle.fen]);

  // Puzzles are either a single move (`solutionMove`) or a full alternating sequence
  // (`solutionMoves`: player, forced opponent reply, player, ...). Normalize to a sequence
  // so the rest of this component only has one code path.
  const sequence = useMemo(
    () => puzzle.solutionMoves || (puzzle.solutionMove ? [puzzle.solutionMove] : []),
    [puzzle]
  );
  const stepHints = puzzle.stepHints || [puzzle.coachHint];

  const [board, setBoard] = useState(() => puzzleEngine.getBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [isCaught, setIsCaught] = useState(false);
  const [plyIndex, setPlyIndex] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState(puzzle.prompt);
  const [isOpponentTurn, setIsOpponentTurn] = useState(false);
  const autoReplyTimer = useRef(null);

  useEffect(() => () => clearTimeout(autoReplyTimer.current), []);

  const playOpponentReply = (replyMove, nextPlyIndex) => {
    setIsOpponentTurn(true);
    autoReplyTimer.current = setTimeout(() => {
      puzzleEngine.makeMove(replyMove.from, replyMove.to);
      setBoard(puzzleEngine.getBoard());
      setLastMove({ from: replyMove.from, to: replyMove.to });
      setIsOpponentTurn(false);
      setPlyIndex(nextPlyIndex);
      const hint = stepHints[Math.min(nextPlyIndex, stepHints.length - 1)];
      if (hint) {
        setFeedbackMsg(hint);
        speakText(hint);
      }
    }, AUTO_REPLY_DELAY_MS);
  };

  const handleSquareClick = (squareName) => {
    if (isCaught || isOpponentTurn) return;

    const col = squareName.charCodeAt(0) - 97;
    const row = 8 - parseInt(squareName[1], 10);
    const clickedPiece = board[row]?.[col];
    const expectedMove = sequence[plyIndex];

    if (selectedSquare) {
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (possibleMoves.includes(squareName)) {
        if (expectedMove && selectedSquare === expectedMove.from && squareName === expectedMove.to) {
          // Correct move!
          puzzleEngine.makeMove(selectedSquare, squareName);
          setBoard(puzzleEngine.getBoard());
          setLastMove({ from: selectedSquare, to: squareName });
          setSelectedSquare(null);
          setPossibleMoves([]);

          const nextPlyIndex = plyIndex + 1;
          if (nextPlyIndex >= sequence.length) {
            setIsCaught(true);
            setFeedbackMsg(puzzle.rewardText);
            soundEffects.playVictorySound();
            speakText(puzzle.rewardText);
            return;
          }

          const replyMove = sequence[nextPlyIndex];
          soundEffects.playMoveSound();
          playOpponentReply(replyMove, nextPlyIndex + 1);
        } else {
          // Incorrect move - give Pikachu hint
          soundEffects.playErrorSound();
          const hint = stepHints[Math.min(plyIndex, stepHints.length - 1)];
          setFeedbackMsg(`⚡ Try again! ${hint}`);
          speakText(hint);
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
        return;
      }

      if (clickedPiece && clickedPiece.color === (puzzle.assignedColor || 'w')) {
        setSelectedSquare(squareName);
        setPossibleMoves(puzzleEngine.getPossibleMoves(squareName));
        return;
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      if (clickedPiece && clickedPiece.color === (puzzle.assignedColor || 'w')) {
        setSelectedSquare(squareName);
        setPossibleMoves(puzzleEngine.getPossibleMoves(squareName));
      }
    }
  };

  return (
    <div className="wild-puzzle-overlay animation-fade">
      <div className="wild-puzzle-card">
        {/* Header */}
        <header className="wild-puzzle-header font-poke">
          <button className="btn-switch-nav" onClick={onExit}>
            ◄ Exit
          </button>
          <h2 className="wild-title">{puzzle.title}</h2>
          <span className="puzzle-type-pill">{puzzle.type} Challenge</span>
          {puzzle.difficulty && (
            <span className={`puzzle-difficulty-pill difficulty-${puzzle.difficulty}`}>
              {puzzle.difficulty}
            </span>
          )}
          {sequence.length > 1 && (
            <span className="puzzle-steps-pill">
              Step {Math.min(plyIndex + 1, sequence.length)} / {sequence.length}
            </span>
          )}
        </header>

        {/* Wild Pokemon Banner */}
        <div className="wild-encounter-banner">
          <div className="wild-sprite-box">
            <img
              src={puzzle.iconUrl}
              alt={puzzle.pokemonName}
              className={`wild-pokemon-sprite ${isCaught ? 'caught-bounce' : 'wild-hover'}`}
            />
          </div>

          <div className="wild-prompt-content font-poke">
            <div className="prompt-header-row">
              <strong className="wild-name">Wild {puzzle.pokemonName}:</strong>
              <button
                type="button"
                className="btn-tts-speaker"
                onClick={() => speakText(feedbackMsg)}
              >
                🔊 Read Aloud
              </button>
            </div>
            <p className="prompt-text">
              {feedbackMsg}
              {isOpponentTurn && ' ...'}
            </p>
          </div>
        </div>

        {/* Puzzle Board */}
        <div className="wild-board-container">
          <Board
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={lastMove}
            showMoveHighlights={true}
            showTooltips={true}
            onSquareClick={handleSquareClick}
            flipped={puzzle.assignedColor === 'b'}
          />
        </div>

        {/* Catch Actions */}
        {isCaught && (
          <div className="wild-caught-actions font-poke animation-fade">
            <h3 className="caught-title">🎉 Wild {puzzle.pokemonName} Was Caught!</h3>
            <button
              className="btn-battle-start font-poke"
              onClick={() => onComplete(puzzle)}
            >
              Add to Pokédex & Continue ►
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
