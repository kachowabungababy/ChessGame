import React, { useState, useMemo } from 'react';
import { ChessGameEngine } from '../game/chessEngine';
import Board from './Board';
import { speakText } from '../game/speechAudio';
import { soundEffects } from '../game/audio';

export default function WildPuzzleScreen({ puzzle, onComplete, onExit }) {
  const puzzleEngine = useMemo(() => new ChessGameEngine(puzzle.fen), [puzzle.fen]);

  const [board, setBoard] = useState(() => puzzleEngine.getBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [isCaught, setIsCaught] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(puzzle.prompt);

  const handleSquareClick = (squareName) => {
    if (isCaught) return;

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
        // Check if move matches solution
        if (
          selectedSquare === puzzle.solutionMove.from &&
          squareName === puzzle.solutionMove.to
        ) {
          // Correct move!
          const result = puzzleEngine.makeMove(selectedSquare, squareName);
          setBoard(puzzleEngine.getBoard());
          setLastMove({ from: selectedSquare, to: squareName });
          setIsCaught(true);
          setFeedbackMsg(puzzle.rewardText);
          soundEffects.playVictorySound();
          speakText(puzzle.rewardText);
        } else {
          // Incorrect move - give Pikachu hint
          soundEffects.playErrorSound();
          setFeedbackMsg(`⚡ Try again! ${puzzle.coachHint}`);
          speakText(puzzle.coachHint);
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
        return;
      }

      if (clickedPiece && clickedPiece.color === 'w') {
        setSelectedSquare(squareName);
        setPossibleMoves(puzzleEngine.getPossibleMoves(squareName));
        return;
      }

      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      if (clickedPiece && clickedPiece.color === 'w') {
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
            <p className="prompt-text">{feedbackMsg}</p>
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
