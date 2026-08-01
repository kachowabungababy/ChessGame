# Pokémon Battle Chess — Implementation Plan

Self-contained build spec. Any coding agent can execute this without prior conversation context — every step lists exact files, commands, and acceptance criteria.

## Overview

Standard chess rules. Each piece is skinned as a Pokémon. When a piece is captured, a full-screen battle scene plays (Gen 5 Black/White-style animated sprites, HP bar drain, faint) before the piece is removed from the board. Matches are saved locally and can be replayed from a history list.

## Tech Stack

- **Scaffold**: Vite + React (`npm create vite@latest chess-pokemon -- --template react`)
- **Chess rules/state**: `chess.js` (npm package) — do not hand-roll move validation
- **Sprites**: PokeAPI (`https://pokeapi.co/api/v2/pokemon/{name}`), Gen 5 animated sprites at `sprites.versions['generation-v']['black-white'].animated.front_default` / `.back_default`
- **Persistence**: browser `localStorage`, no backend
- **Styling**: plain CSS (no UI framework needed at this scope)

## Repository Structure

```
ChessGame/
  src/
    App.jsx
    App.css
    components/
      Board.jsx
      Square.jsx
      Piece.jsx
      BattleScreen.jsx
      HealthBar.jsx
      GameHistory.jsx
      MoveList.jsx
    game/
      chessEngine.js
      pokemonRoster.js
      pokeApi.js
      gameStorage.js
    assets/
      sfx/
  index.html
  package.json
  PLAN.md
```

## Data Models

### `game/pokemonRoster.js`

Maps chess piece type + color to a PokeAPI species name. Export a single lookup object; do not add per-instance logic (all 8 pawns on a side use the same species).

```js
export const ROSTER = {
  w: {
    p: 'pikachu',
    n: 'rapidash-galar',
    b: 'gardevoir',
    r: 'registeel',
    q: 'reshiram',
    k: 'solgaleo',
  },
  b: {
    p: 'rattata-alola',
    n: 'mudsdale',
    b: 'mismagius',
    r: 'aggron',
    q: 'zekrom',
    k: 'lunala',
  },
};
```

Keys match `chess.js` piece type codes (`p,n,b,r,q,k`) and color codes (`w,b`).

### `game/gameStorage.js` — saved match schema

`localStorage` key: `chess-pokemon-matches`, value is a JSON array of:

```json
{
  "id": "uuid-or-timestamp",
  "date": "ISO-8601 string",
  "pgn": "standard PGN string from chess.js .pgn()",
  "moves": ["e4", "e5", "Nf3", "..."],
  "result": "1-0 | 0-1 | 1/2-1/2",
  "winner": "white | black | draw"
}
```

Functions to implement: `saveMatch(chessInstance, winner)`, `loadMatches()`, `deleteMatch(id)`.

## Milestones

Each milestone must be fully working and manually verifiable before starting the next.

### 1. Scaffold + legal chess board

- Run `npm create vite@latest . -- --template react` in repo root, `npm install`, `npm install chess.js`
- `game/chessEngine.js`: wrap a `chess.js` instance, export `getBoard()`, `makeMove(from, to)`, `isGameOver()`, `getWinner()`
- `components/Board.jsx` + `Square.jsx`: render 8x8 grid from `getBoard()`, click-to-select-then-move interaction (no drag-and-drop needed)
- `components/Piece.jsx`: render plain letter/unicode chess glyphs (♟♞♝♜♛♚) — no Pokémon yet
- **Acceptance**: two players can play a full legal game in the browser, illegal moves are rejected, checkmate/draw is detected and shown.

### 2. Pokémon skinning

- `game/pokeApi.js`: `getSprite(pokemonName)` — fetches from PokeAPI, caches result in memory (module-level `Map`) to avoid refetching
- `Piece.jsx`: look up species via `ROSTER[color][type]`, render the PokeAPI static front sprite instead of the glyph
- **Acceptance**: every piece on the board shows its correct Pokémon sprite per the roster table above; White pawns render Pikachu.

### 3. Capture → battle screen

- `chessEngine.js`: after `makeMove`, inspect the `chess.js` move object for a `captured` field; if present, emit `{ attacker: {color,type}, defender: {color,type} }`
- `components/BattleScreen.jsx`: full-screen overlay, shows attacker back-sprite (bottom-left) and defender front-sprite (top-right) using the Gen 5 **animated** sprite URLs, `HealthBar.jsx` for defender HP draining to 0, then a faint animation (fade + drop), then auto-dismiss
- `App.jsx`: on capture event, block board interaction, show `BattleScreen`, resume board after it completes
- **Acceptance**: capturing any piece triggers the battle overlay with correct sprites for both pieces involved, then returns to the board with the captured piece gone.

### 4. Match persistence

- `game/gameStorage.js`: implement `saveMatch`/`loadMatches`/`deleteMatch` per schema above
- `App.jsx`: on game-over (checkmate/draw), call `saveMatch`
- `components/GameHistory.jsx`: list saved matches (date, result), clicking one loads its `moves` array and replays them onto the board sequentially (reuse `chessEngine` by replaying moves into a fresh instance)
- `components/MoveList.jsx`: live sidebar list of moves during an in-progress game (algebraic notation from `chess.js` `.history()`)
- **Acceptance**: after a game ends, it appears in Match History; reloading the page preserves it (localStorage survives refresh); clicking a past match replays it move-by-move on the board.

### 5. Polish

- Per-piece-type attack animation variants in `BattleScreen.jsx` (e.g. Knight capture uses a charge/tackle motion, Queen capture uses a bigger effect)
- Checkmate ends with a final battle sequence using the losing King's Pokémon
- Optional sound effects on capture/faint from `assets/sfx/`
- **Acceptance**: subjective — playtest and confirm it feels good; no functional requirement blocks completion here.

## External API Reference

- PokeAPI base: `https://pokeapi.co/api/v2/pokemon/{name}` — no API key required, rate-limit-friendly for this scale of use
- Static sprite: `sprites.front_default`
- Animated Gen 5 sprite: `sprites.versions['generation-v']['black-white'].animated.front_default` and `.back_default` (falls back to `null` for some forms — code must handle fallback to static sprite)
- `chess.js` key methods used: `new Chess()`, `.move({from,to})` (returns move object with `.captured` when applicable), `.board()`, `.history()`, `.pgn()`, `.isGameOver()`, `.isCheckmate()`, `.isDraw()`, `.turn()`

## Setup Commands

```bash
npm create vite@latest . -- --template react
npm install
npm install chess.js
npm run dev
```
