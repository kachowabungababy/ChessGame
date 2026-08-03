# Chess Curriculum for a 5-Year-Old — Story Mode Teaching Order

Why Rookie/Kid Mode should ramp material progressively (not open on a full 32-piece
board, and not open on bare king-and-rook endgames either), and how that maps onto
the 21 stages in `src/game/storyCampaign.js`.

## The goal, stated precisely

Three things have to be true at once, or the whole thing fails:

1. **Enjoyable** — frequent captures, frequent battle animations, visible progress.
   This game's core loop *is* the Pokémon capture/battle, so a teaching approach
   that starves captures kills engagement before any lesson lands.
2. **No bad habits** — a 5-year-old develops bad habits (hanging pieces, moving on
   impulse, never checking threats) when the position has more going on than he
   can hold in his head. Overload, not "having pieces on the board," is the cause.
3. **Real thinking** — the position has to be simple enough that pausing to check
   "is this safe?" is a habit he can actually practice and succeed at, not just be
   told to do.

## Two paths considered, and why neither alone works

- **Pure endgame drills (K+R vs K, K+Q vs K)** teach king activity and calculation
  well, but there's almost nothing to capture — a lone king can't be captured, and
  the stronger side has one piece. Kills goal (1). A 5-year-old disengages before
  the habit forms.
- **Full 32-piece board from stage 1** satisfies (1) — plenty of captures — but
  blows the lid off (2) and (3): 32 pieces is too much to track, so "check before
  you move" is unteachable and unenforceable at that age. This is the traditional
  "teach openings first" trap.

## The resolution: symmetric material ramp ("Pawn Wars" scaffolding)

Both sides always have the **same, small army**, and every stage adds a bit more
material back until the full 16-per-side game appears around the midpoint of the
tier. This keeps captures frequent at every stage (there's always something for
both sides to trade), while keeping the position small enough to actually
supervise and think about. Complexity grows exactly as fast as the habit does —
classic scaffolding.

## Stage-by-stage ramp (Rookie / Kid Mode, `src/game/storyCampaign.js`)

Existing stage names, themes, and badges are unchanged — only the material each
side starts with, and the coach dialogue, change.

| # | Stage (existing name) | Material (both sides, symmetric) | Concept taught | Dialogue direction |
|---|---|---|---|---|
| 1 | Baby Pichu | K + 4 Pawns | Pawns capture diagonally; walk a pawn home | "Chase your pawn all the way across — it evolves when it gets there!" |
| 2 | Rookie Timmy | K + 8 Pawns | Full pawn race — breakthroughs, blocking | "Whoever gets a pawn home first wins the race!" |
| 3 | Youngster Tristan | K + R + 8P | Rook power — cutting off the enemy King | "Your Rook can slide the whole way across the board!" |
| 4 | Team Rocket Grunt | K + 2R + 8P | Two Rooks teaming up | "Prepare for trouble — two Rooks make double trouble for you too!" |
| 5 | Bug Catcher Joey | K + R + N + 8P | Knight forks (first minor piece) | "My Knight jumps in a funny L-shape and can attack two things at once!" |
| 6 | Fisherman Ned | K + R + 2N + 8P | More forks; patience/calculation | "Take a deep breath before you jump — where else can your Knight go?" |
| 7 | Lass Carrie | K + R + 2N + B + 8P | Bishops (diagonal power, pins) | "My Bishop slides diagonally the whole way — watch the long lines!" |
| 8 | Camper Liam | K + R + 2N + 2B + 8P | Guarding pieces (now there's a full team to protect) | "Keep your whole team close so nobody gets left alone!" |
| 9 | Team Magma Grunt | K + 2R + 2N + 2B + 8P | Coordinating a full team (no Queen yet) | "Our whole squad attacks together — can your team work together too?" |
| 10 | Picnicker Diane | K + 2R + 2N + 2B + Q + 8P (**full army reached**) | Queen power; "you have your whole team now!" | "Look at your full team, {name}! You're ready for anything!" *(existing Forest Ribbon badge marks this milestone)* |
| 11 | Hiker Anthony | Full army | Full games begin — patience, no rush | *(keep existing line — already fits)* |
| 12 | Black Belt Kiyo | Full army | Center control | *(keep existing line — already fits)* |
| 13 | Team Aqua Grunt | Full army | Simple combinations / two-move tactics | villain-team flavored tactic puzzle framing |
| 14 | Psychic Edward | Full army | Whole-board awareness | *(keep existing line — already fits)* |
| 15+ | Gym Leaders → Elite Four → Champion → Legend Red | Full army, rising ELO to 800 | Opening principles, lightly (develop pieces, don't move one piece twice, castle early) | this is where "openings" finally belong |

## Why this order specifically answers the adversarial question

- Stages 1–2 are pure pawn endgames: tiny, constant captures, forces king activity
  and promotion-race thinking — genuinely fun and genuinely simple enough to think
  clearly about.
- Stages 3–9 add one piece type at a time, each with its own dialogue teaching
  *that piece's* first tactical idea (rook cutoff, knight fork, bishop pin,
  guarding, coordination) right when it's the only new thing on the board — so the
  concept isn't competing for attention with 25 other pieces.
- Full army doesn't appear until stage 10 (badge milestone), by which point the
  child has already practiced "check before you move" at every smaller scale.
- Opening principles are pushed to stage 15+, deliberately last — by then he's
  played nine-plus full games and has enough board sense that "develop your
  pieces" is reinforcing something he already does instinctively, not a rule he's
  reciting blind.

## Implementation notes

- Requires a `material` (or `startingFen`) field per stage in `STORY_STAGES`,
  applied only for `rookie` tier — `trainer`/`champion` tiers keep the standard
  starting position throughout, since those tiers aren't aimed at a first-time
  5-year-old.
- `getStagesForTier()` already branches on `tierId`; the FEN/material override
  should branch there too rather than touching `trainer`/`champion` logic.
- Badge stages (`id: 4, 9, 10, 12, 15...`) are natural milestone markers and
  already line up reasonably well with the material milestones above — no need to
  move badges, just the dialogue and starting material.

## Non-goals

- Not a separate "endgame trainer" minigame mode — same 21-stage structure, same
  Pokémon-battle capture loop throughout, just a resequenced starting material and
  matching dialogue.
- Not changing `trainer`/`champion` tier stages — this ramp is aimed at `rookie`
  (kid mode) specifically, since that's the tier a 5-year-old plays.
