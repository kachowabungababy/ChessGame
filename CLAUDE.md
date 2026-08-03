# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

A Pokémon-themed chess game (`chess.js` for rules, React/Vite front end). Piece
captures trigger a Pokémon battle animation. Story Mode (`src/game/storyCampaign.js`)
has 21 stages across three difficulty tiers (`rookie`, `trainer`, `champion`) —
see `DIFFICULTY_TIERS` and `STORY_STAGES` in that file.

## Rookie / Kid Mode pedagogy — read before touching `storyCampaign.js`

`rookie` tier is built for a first-time 5-year-old player. Its design follows a
specific child-development rationale, written up in full in
[CHESS_CURRICULUM.md](CHESS_CURRICULUM.md). The short version, as hard constraints:

- **Never open a rookie stage on the full 32-piece board.** Too much to track at
  that age breaks the "pause and check before moving" habit before it forms.
- **Never open a rookie stage on a near-empty board either** (e.g. bare K+R vs K).
  Almost nothing to capture kills the game's core enjoyment loop (Pokémon
  captures/battles) before any lesson lands.
- Rookie tier instead **ramps material symmetrically, stage by stage** — both
  sides always have the same small army, growing one piece type at a time until
  the full army appears around the tier's midpoint (see the stage table in
  `CHESS_CURRICULUM.md`).
- Teaching order across the tier is **endgame fundamentals → simple tactics per
  new piece type → opening principles last**, not the traditional opening-first
  order. Opening-principle dialogue (develop pieces, castle, don't move one piece
  twice) belongs on the later gym-leader-tier stages (15+), not the early ones.
- `trainer` and `champion` tiers are unaffected by any of this — they keep the
  standard starting position throughout. This ramp is `rookie`-only.

If asked to add/edit rookie stage dialogue, hints, or starting positions, follow
the stage table in `CHESS_CURRICULUM.md` rather than inventing a new ordering.
