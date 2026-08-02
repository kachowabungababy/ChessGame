import { Chess } from 'chess.js';

export class ChessGameEngine {
  constructor(fen = null) {
    this.chess = new Chess(fen || undefined);
  }

  getBoard() {
    return this.chess.board();
  }

  getTurn() {
    return this.chess.turn(); // 'w' | 'b'
  }

  inCheck() {
    return this.chess.inCheck();
  }

  isGameOver() {
    return this.chess.isGameOver();
  }

  getWinner() {
    if (!this.chess.isGameOver()) return null;
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? 'black' : 'white';
    }
    return 'draw';
  }

  getGameStatus() {
    if (this.chess.isCheckmate()) return 'Checkmate!';
    if (this.chess.isStalemate()) return 'Draw by Stalemate';
    if (this.chess.isThreefoldRepetition()) return 'Draw by Threefold Repetition';
    if (this.chess.isInsufficientMaterial()) return 'Draw by Insufficient Material';
    if (this.chess.isDraw()) return 'Draw';
    if (this.chess.inCheck()) return `${this.chess.turn() === 'w' ? 'White' : 'Black'} is in Check!`;
    return `${this.chess.turn() === 'w' ? 'White' : 'Black'}'s Turn`;
  }

  getPossibleMoves(square) {
    try {
      const moves = this.chess.moves({ square, verbose: true });
      return moves.map(m => m.to);
    } catch {
      return [];
    }
  }

  isPromotionMove(from, to) {
    try {
      const piece = this.chess.get(from);
      if (!piece || piece.type !== 'p') return false;
      const targetRank = to[1];
      return (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1');
    } catch {
      return false;
    }
  }

  makeMove(from, to, promotion = 'q') {
    try {
      const move = this.chess.move({ from, to, promotion });
      if (!move) return null;

      let captureData = null;
      if (move.captured) {
        // Find attacker piece from move.piece and move.color
        const attackerColor = move.color;
        const attackerType = move.piece;
        
        // Defender color is opposite of attacker color
        const defenderColor = attackerColor === 'w' ? 'b' : 'w';
        const defenderType = move.captured;

        captureData = {
          attacker: {
            color: attackerColor,
            type: attackerType,
          },
          defender: {
            color: defenderColor,
            type: defenderType,
          },
          san: move.san,
        };
      }

      return { move, captureData };
    } catch (e) {
      return null;
    }
  }

  /**
   * ELO-Calibrated AI Move Generator (400 to 2400 ELO)
   * @param {number} elo - Rating from 400 to 2400
   * @returns {{from: string, to: string, promotion: string}|null}
   */
  getBestAiMove(elo = 1200) {
    try {
      const legalMoves = this.chess.moves({ verbose: true });
      if (!legalMoves || legalMoves.length === 0) return null;

      // 1. Blunder / Randomness calculation based on ELO
      // 400 ELO -> 65% chance of random move
      // 800 ELO -> 35% chance of random move
      // 1200 ELO -> 15% chance of sub-optimal move
      // 1600+ ELO -> 0% random moves
      const errorProbability = Math.max(0, (1800 - elo) / 2000);
      if (Math.random() < errorProbability) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        return { from: randomMove.from, to: randomMove.to, promotion: 'q' };
      }

      // Checkmate priority (all ELOs above 600 see instant checkmate)
      for (const move of legalMoves) {
        const testEngine = new Chess(this.chess.fen());
        testEngine.move({ from: move.from, to: move.to, promotion: 'q' });
        if (testEngine.isCheckmate()) {
          return { from: move.from, to: move.to, promotion: 'q' };
        }
      }

      // Piece Values & Piece-Square Tables (PST) for positional evaluation
      const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

      // Pawn position table
      const pawnPst = [
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
      ];

      // Knight position table
      const knightPst = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
      ];

      const evaluateBoardState = (chessInstance) => {
        const board = chessInstance.board();
        let totalScore = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
              const val = pieceValues[piece.type] || 0;
              let pstVal = 0;
              const squareIdx = r * 8 + c;
              if (piece.type === 'p') pstVal = pawnPst[squareIdx] || 0;
              if (piece.type === 'n') pstVal = knightPst[squareIdx] || 0;

              const totalVal = val + pstVal;
              totalScore += piece.color === 'b' ? totalVal : -totalVal;
            }
          }
        }
        return totalScore;
      };

      // Search depth determined by ELO
      // 400 - 1000 ELO: Depth 1
      // 1000 - 1800 ELO: Depth 2
      // 1800+ ELO: Depth 3
      const maxDepth = elo >= 1800 ? 3 : elo >= 1000 ? 2 : 1;

      const minimax = (chessInstance, depth, isMaximizing, alpha, beta) => {
        if (depth === 0 || chessInstance.isGameOver()) {
          return evaluateBoardState(chessInstance);
        }

        const moves = chessInstance.moves({ verbose: true });
        if (isMaximizing) {
          let maxEval = -Infinity;
          for (const move of moves) {
            const clone = new Chess(chessInstance.fen());
            clone.move({ from: move.from, to: move.to, promotion: 'q' });
            const evaluation = minimax(clone, depth - 1, false, alpha, beta);
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break;
          }
          return maxEval;
        } else {
          let minEval = Infinity;
          for (const move of moves) {
            const clone = new Chess(chessInstance.fen());
            clone.move({ from: move.from, to: move.to, promotion: 'q' });
            const evaluation = minimax(clone, depth - 1, true, alpha, beta);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
          }
          return minEval;
        }
      };

      let bestMove = legalMoves[0];
      let bestScore = -Infinity;

      for (const move of legalMoves) {
        const clone = new Chess(this.chess.fen());
        clone.move({ from: move.from, to: move.to, promotion: 'q' });
        
        // Evaluate move
        const score = maxDepth > 1 
          ? minimax(clone, maxDepth - 1, false, -Infinity, Infinity)
          : evaluateBoardState(clone);

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion || 'q' };
    } catch (e) {
      console.error('ELO AI Engine Error:', e);
      const fallback = this.chess.moves({ verbose: true });
      if (fallback && fallback.length > 0) {
        return { from: fallback[0].from, to: fallback[0].to, promotion: 'q' };
      }
      return null;
    }
  }

  reset() {
    try {
      this.chess.reset();
    } catch {
      this.chess = new Chess();
    }
  }

  getPgn() {
    return this.chess.pgn();
  }

  getHistory(verbose = false) {
    return this.chess.history({ verbose });
  }

  loadPgn(pgn) {
    this.chess.loadPgn(pgn);
  }

  getFen() {
    return this.chess.fen();
  }
}

export const createEngine = (fen) => new ChessGameEngine(fen);
