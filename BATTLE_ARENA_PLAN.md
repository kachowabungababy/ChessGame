# Battle Arena Environment Redesign — Implementation Plan

Self-contained implementation spec. Any coding agent (Gemini in Antigravity, or otherwise) can execute this without prior conversation context — every step lists exact file paths, current code, and exact replacement code.

## Context

`src/components/BattleScreen.jsx` renders a full-screen Pokémon-battle-style overlay when a chess piece is captured. It uses a `BattleEnvironment({ theme })` sub-component to draw an SVG backdrop (`viewBox="0 0 800 400"`, `preserveAspectRatio="none"`, stretched to fill the `.battle-scene` box, max `780×500`) behind two "podium" divs where the attacker/defender Pokémon sprites stand.

There are 8 arena themes defined in `src/game/themes.js` (`ARENA_THEMES`): `classic`, `volcano`, `ice`, `petalburg`, `sootopolis`, `skypillar`, `mauville`, `pyre`. Before this plan, only `volcano`, `ice`, `petalburg`, and `sootopolis` had any real scenery — `classic`, `skypillar`, `mauville`, and `pyre` fell through to a placeholder (`default` case) that is just a flat navy rect and two blurred circles. A user screenshot confirmed this looks empty/unfinished. Additionally there was no distinct "battle field" ground disc under each Pokémon (only a thin glowing podium ring), which made every theme feel flat.

This plan replaces the entire environment system: full custom scenery for all 8 themes, a shared CSS-based grounding disc under each Pokémon, and subtle ambient motion (drifting mist/clouds, twinkling stars/embers, pulsing light sources).

### Geometry contract (do not violate)

The SVG is stretched non-uniformly to fill the scene box, which maps the two sprite footprints to these **forbidden rectangles** — never place a high-contrast shape or stroke inside them, or it will visibly cut across a Pokémon:

- **Attacker** (bottom-left podium): `x 100–279, y 186–326`
- **Defender** (top-right podium): `x 508–671, y 0–128`

Safe zones used throughout every theme's art:
- **Z1** left margin — `x 0–96, y 0–400`
- **Z2** upper-left sky — `x 0–500, y 0–180`
- **Z3** centre corridor — `x 290–500, y 0–400` (each theme's large centrepiece silhouette goes here)
- **Z4** lower-right — `x 500–800, y 136–400`
- **Z5** right margin — `x 680–800, y 0–400`
- **Z6** floor band — `x 0–800, y 328–400` (shared horizon, see `FLOOR_BACK`/`FLOOR_FRONT` below)

## Changes

### Change A — `src/components/BattleScreen.jsx`: full `BattleEnvironment` replacement

Replace the entire `BattleEnvironment` function (all switch cases, from `function BattleEnvironment({ theme }) {` through its closing `}`) with the code below. This includes two new module-level constants (`FLOOR_BACK`, `FLOOR_FRONT` — the shared horizon path every theme draws so all 8 arenas share one eye level) and a shared `EnvVignette` sub-component (edge-darkening overlay drawn last in every theme, shared gradient id `envVignette`).

```jsx
/* ------------------------------------------------------------------ */
/* BATTLE ENVIRONMENT                                                  */
/*                                                                     */
/* SVG is viewBox="0 0 800 400" with preserveAspectRatio="none", so it */
/* is stretched to the .battle-scene box (max 780x500). That maps the  */
/* two sprite footprints to these FORBIDDEN rectangles — never place a */
/* high-contrast shape or stroke inside them:                          */
/*   ATTACKER  x 100–279  y 186–326                                    */
/*   DEFENDER  x 508–671  y   0–128                                    */
/*                                                                     */
/* Safe zones (use these):                                             */
/*   Z1 left margin     x   0–96    y   0–400                          */
/*   Z2 upper-left sky  x   0–500   y   0–180                          */
/*   Z3 centre corridor x 290–500   y   0–400   (large centrepiece)    */
/*   Z4 lower-right     x 500–800   y 136–400                          */
/*   Z5 right margin    x 680–800   y   0–400                          */
/*   Z6 floor band      x   0–800   y 328–400   (FLOOR_BACK/FRONT)     */
/*                                                                     */
/* FLOOR_BACK / FLOOR_FRONT are the shared horizon contract: every     */
/* theme draws them last (before <EnvVignette />) with its own fills,  */
/* so all 8 arenas share one eye level and the CSS grounding disc      */
/* (.battle-field-platform) always lands on solid ground.              */
/* ------------------------------------------------------------------ */

const FLOOR_BACK =
  'M0 334 C 130 322, 250 342, 372 331 C 500 320, 630 340, 800 328 L 800 400 L 0 400 Z';
const FLOOR_FRONT =
  'M0 368 C 150 356, 290 374, 430 363 C 570 352, 690 370, 800 359 L 800 400 L 0 400 Z';

/* Shared edge darkening used by every theme (drawn last, on top). */
function EnvVignette() {
  return (
    <>
      <defs>
        <radialGradient id="envVignette" cx="50%" cy="52%" r="74%">
          <stop offset="52%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#envVignette)" />
    </>
  );
}

function BattleEnvironment({ theme }) {
  switch (theme) {
    /* ============================== VOLCANO ============================== */
    case 'volcano':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="volcanoSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a0404" />
              <stop offset="55%" stopColor="#5c1010" />
              <stop offset="100%" stopColor="#140202" />
            </linearGradient>
            <linearGradient id="volcanoLava" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="45%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <radialGradient id="volcanoCrater" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ae" />
              <stop offset="55%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="400" fill="url(#volcanoSky)" />

          <ellipse className="env-drift" cx="250" cy="96" rx="230" ry="42" fill="#7f1d1d" opacity="0.3" />
          <ellipse className="env-drift" cx="640" cy="198" rx="200" ry="36" fill="#7f1d1d" opacity="0.26" />

          <ellipse cx="400" cy="176" rx="150" ry="80" fill="url(#volcanoCrater)" opacity="0.55" />
          <path d="M296 344 L400 152 L512 344 Z" fill="#2a0606" />
          <path d="M348 344 L400 152 L400 344 Z" fill="#1c0303" opacity="0.7" />
          <ellipse cx="400" cy="154" rx="30" ry="8" fill="url(#volcanoLava)" />
          <ellipse className="env-pulse" cx="400" cy="150" rx="18" ry="6" fill="#fde047" opacity="0.8" />
          <path d="M392 158 Q378 232 356 306" stroke="url(#volcanoLava)" strokeWidth="5" fill="none" opacity="0.85" />
          <path d="M412 158 Q430 226 444 300" stroke="url(#volcanoLava)" strokeWidth="4" fill="none" opacity="0.7" />

          <path d="M0 400 L14 214 L52 292 L88 246 L96 400 Z" fill="#1a0303" />
          <path d="M704 400 L722 232 L756 296 L790 210 L800 400 Z" fill="#1a0303" />
          <path className="env-detail" d="M22 258 L36 262 L30 288" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />
          <path className="env-detail" d="M762 262 L776 268 L770 296" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />

          <g fill="#fbbf24">
            <circle className="env-twinkle" cx="86" cy="132" r="3" />
            <circle className="env-drift" cx="196" cy="70" r="2.4" />
            <circle className="env-twinkle" cx="330" cy="118" r="2.6" />
            <circle className="env-drift" cx="452" cy="58" r="2.2" />
            <circle className="env-twinkle" cx="560" cy="212" r="3" />
            <circle className="env-drift" cx="694" cy="164" r="2.6" />
            <circle className="env-twinkle" cx="756" cy="264" r="2.4" />
          </g>

          <path d={FLOOR_BACK} fill="#1d0404" />
          <path d={FLOOR_FRONT} fill="#2a0606" />
          <path className="env-detail" d="M60 384 Q170 372 268 386 T470 378 T720 388" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.55" />
          <path className="env-detail" d="M120 352 Q220 346 300 356" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.5" />

          <EnvVignette />
        </svg>
      );

    /* ================================ ICE ================================ */
    case 'ice':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="iceSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#03203a" />
              <stop offset="55%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#031726" />
            </linearGradient>
            <linearGradient id="iceCrystal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="45%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="iceAurora" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="45%" stopColor="#a5f3fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#iceSky)" />

          <path className="env-drift" d="M-40 92 C 90 44, 210 130, 320 78 C 400 42, 460 96, 500 74" stroke="url(#iceAurora)" strokeWidth="26" fill="none" opacity="0.45" />
          <path className="env-drift" d="M-20 138 C 120 104, 250 168, 380 124 C 440 104, 480 138, 500 128" stroke="url(#iceAurora)" strokeWidth="14" fill="none" opacity="0.3" />
          <path className="env-drift" d="M508 190 C 600 156, 690 208, 840 168" stroke="url(#iceAurora)" strokeWidth="20" fill="none" opacity="0.35" />

          <polygon points="400,108 452,238 400,346 348,238" fill="url(#iceCrystal)" opacity="0.92" />
          <polygon points="400,108 400,346 348,238" fill="#e0f2fe" opacity="0.35" />
          <polygon points="342,262 306,344 372,344" fill="url(#iceCrystal)" opacity="0.8" />
          <polygon points="462,250 494,344 434,344" fill="url(#iceCrystal)" opacity="0.75" />
          <circle className="env-pulse" cx="400" cy="212" r="16" fill="#f0f9ff" opacity="0.55" />

          <polygon points="0,400 40,196 96,400" fill="#075985" />
          <polygon points="40,196 62,244 18,244" fill="#e0f2fe" />
          <polygon points="700,400 752,182 800,400" fill="#0369a1" />
          <polygon points="752,182 776,234 728,234" fill="#e0f2fe" />

          <polygon points="24,0 40,44 56,0" fill="#bae6fd" opacity="0.85" />
          <polygon points="70,0 80,26 90,0" fill="#bae6fd" opacity="0.6" />
          <polygon points="726,0 742,48 758,0" fill="#bae6fd" opacity="0.85" />
          <polygon points="770,0 780,28 790,0" fill="#bae6fd" opacity="0.6" />

          <g fill="#f0f9ff">
            <circle className="env-twinkle" cx="120" cy="66" r="2.6" />
            <circle className="env-drift" cx="238" cy="122" r="2.2" />
            <circle className="env-twinkle" cx="330" cy="52" r="2.4" />
            <circle className="env-drift" cx="470" cy="150" r="2" />
            <circle className="env-twinkle" cx="596" cy="236" r="2.6" />
            <circle className="env-drift" cx="704" cy="176" r="2.2" />
            <circle className="env-twinkle" cx="770" cy="300" r="2.4" />
          </g>

          <path d={FLOOR_BACK} fill="#0b4a72" />
          <path d={FLOOR_FRONT} fill="#0e5f8e" />
          <path className="env-detail" d="M40 380 Q180 370 300 382 T560 374 T780 384" stroke="#e0f2fe" strokeWidth="2" fill="none" opacity="0.5" />
          <path className="env-detail" d="M150 356 L240 348 M470 358 L560 350" stroke="#bae6fd" strokeWidth="2" opacity="0.4" />

          <EnvVignette />
        </svg>
      );

    /* ============================= PETALBURG ============================= */
    case 'petalburg':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="petalburgSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="55%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#011910" />
            </linearGradient>
            <linearGradient id="petalburgBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="petalburgTrunk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b1704" />
              <stop offset="50%" stopColor="#7c3f1d" />
              <stop offset="100%" stopColor="#2a1003" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#petalburgSky)" />

          <polygon className="env-detail" points="300,0 356,0 268,344 200,344" fill="url(#petalburgBeam)" />
          <polygon className="env-detail" points="420,0 468,0 470,344 414,344" fill="url(#petalburgBeam)" />
          <polygon className="env-detail" points="700,140 740,140 764,344 706,344" fill="url(#petalburgBeam)" />

          <ellipse cx="200" cy="-46" rx="330" ry="66" fill="#14532d" opacity="0.92" />
          <ellipse cx="770" cy="-40" rx="180" ry="58" fill="#14532d" opacity="0.9" />
          <circle cx="60" cy="18" r="46" fill="#166534" opacity="0.9" />
          <circle cx="150" cy="4" r="38" fill="#14532d" opacity="0.85" />
          <circle cx="410" cy="-6" r="42" fill="#166534" opacity="0.75" />
          <circle cx="716" cy="10" r="44" fill="#166534" opacity="0.9" />

          <path d="M368 344 L376 214 L424 214 L432 344 Z" fill="url(#petalburgTrunk)" />
          <path d="M376 236 L332 196 M424 236 L470 190" stroke="#3b1704" strokeWidth="9" fill="none" />
          <circle cx="400" cy="182" r="62" fill="#166534" />
          <circle cx="344" cy="200" r="38" fill="#15803d" />
          <circle cx="458" cy="196" r="42" fill="#14532d" />
          <circle className="env-pulse" cx="400" cy="168" r="14" fill="#4ade80" opacity="0.4" />

          <rect x="18" y="200" width="30" height="150" fill="url(#petalburgTrunk)" />
          <circle cx="33" cy="188" r="52" fill="#166534" />
          <circle cx="74" cy="216" r="34" fill="#15803d" />
          <rect x="742" y="188" width="34" height="162" fill="url(#petalburgTrunk)" />
          <circle cx="759" cy="176" r="56" fill="#15803d" />
          <circle cx="708" cy="208" r="36" fill="#166534" />

          <g fill="#fde68a">
            <circle className="env-twinkle" cx="128" cy="150" r="3" />
            <circle className="env-drift" cx="304" cy="104" r="2.4" />
            <circle className="env-twinkle" cx="486" cy="168" r="2.8" />
            <circle className="env-drift" cx="596" cy="242" r="3" />
            <circle className="env-twinkle" cx="690" cy="300" r="2.6" />
          </g>

          <path d={FLOOR_BACK} fill="#14532d" />
          <path d={FLOOR_FRONT} fill="#166534" />
          <g className="env-detail">
            <ellipse cx="120" cy="386" rx="30" ry="7" fill="#22c55e" opacity="0.45" />
            <ellipse cx="400" cy="378" rx="36" ry="8" fill="#22c55e" opacity="0.4" />
            <ellipse cx="660" cy="388" rx="32" ry="7" fill="#22c55e" opacity="0.45" />
            <circle cx="230" cy="374" r="4" fill="#fda4af" />
            <circle cx="536" cy="384" r="4" fill="#fde68a" />
          </g>

          <EnvVignette />
        </svg>
      );

    /* ============================= SOOTOPOLIS ============================ */
    case 'sootopolis':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sootopolisSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="55%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="sootopolisWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0b1a4a" />
            </linearGradient>
            <radialGradient id="sootopolisMoon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="400" fill="url(#sootopolisSky)" />

          <circle cx="400" cy="86" r="54" fill="url(#sootopolisMoon)" opacity="0.5" />
          <circle className="env-pulse" cx="400" cy="86" r="30" fill="#e0f2fe" opacity="0.9" />

          <g fill="#e0f2fe">
            <circle className="env-twinkle" cx="64" cy="58" r="2.4" />
            <circle className="env-twinkle" cx="168" cy="112" r="2" />
            <circle className="env-twinkle" cx="272" cy="44" r="2.6" />
            <circle className="env-twinkle" cx="486" cy="140" r="2.2" />
            <circle className="env-twinkle" cx="700" cy="172" r="2.6" />
            <circle className="env-twinkle" cx="764" cy="220" r="2" />
          </g>

          <path d="M0 400 L0 246 L70 190 L140 260 L200 400 Z" fill="#111f4a" />
          <path d="M800 400 L800 230 L724 176 L654 252 L610 400 Z" fill="#111f4a" />
          <path d="M296 344 L340 220 L400 176 L460 220 L504 344 Z" fill="#16255c" />
          <g className="env-detail" fill="#dbeafe" opacity="0.85">
            <rect x="352" y="248" width="18" height="26" rx="3" />
            <rect x="386" y="228" width="20" height="30" rx="3" />
            <rect x="422" y="252" width="18" height="24" rx="3" />
            <rect x="368" y="288" width="16" height="22" rx="3" />
            <rect x="410" y="292" width="16" height="20" rx="3" />
            <rect x="42" y="256" width="16" height="22" rx="3" />
            <rect x="742" y="238" width="16" height="22" rx="3" />
          </g>

          <path d="M0 372 Q200 330 400 364 T800 352 V400 H0 Z" fill="url(#sootopolisWater)" opacity="0.9" />

          <path d={FLOOR_BACK} fill="#132a63" />
          <path d={FLOOR_FRONT} fill="#1b3a86" />
          <g className="env-detail" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.5">
            <path className="env-drift" d="M40 378 Q120 372 200 378 T360 374" />
            <path className="env-drift" d="M440 388 Q540 382 620 388 T780 382" />
            <path className="env-drift" d="M120 356 Q220 350 320 356" opacity="0.35" />
          </g>

          <EnvVignette />
        </svg>
      );

    /* ============================= SKY PILLAR ============================ */
    case 'skypillar':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skypillarSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1040" />
              <stop offset="45%" stopColor="#3f3480" />
              <stop offset="100%" stopColor="#0b1a2e" />
            </linearGradient>
            <linearGradient id="skyStone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="35%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <linearGradient id="skypillarCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#skypillarSky)" />

          <ellipse className="env-drift" cx="180" cy="88" rx="180" ry="34" fill="url(#skypillarCloud)" />
          <ellipse className="env-drift" cx="392" cy="52" rx="120" ry="26" fill="url(#skypillarCloud)" opacity="0.8" />
          <ellipse className="env-drift" cx="648" cy="200" rx="190" ry="34" fill="url(#skypillarCloud)" opacity="0.75" />
          <ellipse className="env-drift" cx="120" cy="230" rx="150" ry="28" fill="url(#skypillarCloud)" opacity="0.5" />

          <path d="M352 344 L352 96 L400 60 L448 96 L448 344 Z" fill="url(#skyStone)" opacity="0.95" />
          <rect x="336" y="120" width="128" height="16" rx="3" fill="#e2e8f0" opacity="0.9" />
          <rect x="340" y="200" width="120" height="14" rx="3" fill="#cbd5e1" opacity="0.85" />
          <rect x="332" y="284" width="136" height="16" rx="3" fill="#e2e8f0" opacity="0.9" />
          <rect x="380" y="150" width="40" height="42" rx="4" fill="#1f2937" opacity="0.85" />
          <circle className="env-pulse" cx="400" cy="76" r="12" fill="#34d399" opacity="0.85" />
          <path className="env-detail" d="M366 246 L434 246 M366 320 L434 320" stroke="#64748b" strokeWidth="2" opacity="0.6" />

          <path d="M12 400 L12 176 L74 158 L74 400 Z" fill="url(#skyStone)" opacity="0.9" />
          <rect x="2" y="146" width="86" height="16" rx="3" fill="#e2e8f0" opacity="0.85" />
          <path d="M714 400 L714 138 L778 120 L778 400 Z" fill="url(#skyStone)" opacity="0.9" />
          <rect x="704" y="108" width="86" height="16" rx="3" fill="#e2e8f0" opacity="0.85" />

          <g fill="#94a3b8">
            <polygon className="env-pulse" points="120,150 142,142 150,166 126,172" opacity="0.85" />
            <polygon className="env-drift" points="256,196 274,188 282,208 260,214" opacity="0.7" />
            <polygon className="env-pulse" points="560,258 582,250 590,272 566,278" opacity="0.8" />
            <polygon className="env-drift" points="666,300 682,294 688,312 668,316" opacity="0.65" />
          </g>

          <path d={FLOOR_BACK} fill="#4c3f8f" />
          <path d={FLOOR_FRONT} fill="#6d5bb5" />
          <g className="env-detail" fill="#ddd6fe" opacity="0.45">
            <ellipse className="env-drift" cx="150" cy="374" rx="110" ry="16" />
            <ellipse className="env-drift" cx="470" cy="386" rx="130" ry="16" />
            <ellipse className="env-drift" cx="720" cy="368" rx="100" ry="14" />
          </g>

          <EnvVignette />
        </svg>
      );

    /* ============================== MAUVILLE ============================= */
    case 'mauville':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mauvilleSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="50%" stopColor="#3f3a24" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
            <radialGradient id="mauvilleCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fefce8" />
              <stop offset="45%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#a16207" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mauvilleSteel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="45%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#mauvilleSky)" />

          <rect x="0" y="0" width="500" height="14" fill="#292524" />
          <rect x="680" y="0" width="120" height="14" fill="#292524" />
          <rect x="0" y="20" width="440" height="8" rx="4" fill="#57534e" />
          <rect x="686" y="20" width="114" height="8" rx="4" fill="#57534e" />
          <g className="env-detail" fill="#44403c">
            <rect x="60" y="14" width="12" height="26" />
            <rect x="230" y="14" width="12" height="26" />
            <rect x="400" y="14" width="12" height="26" />
            <rect x="736" y="14" width="12" height="26" />
          </g>

          <ellipse cx="400" cy="206" rx="140" ry="120" fill="url(#mauvilleCore)" opacity="0.35" />
          <rect x="344" y="64" width="112" height="280" rx="8" fill="url(#mauvilleSteel)" />
          <rect x="330" y="64" width="140" height="18" rx="5" fill="#57534e" />
          <rect x="330" y="322" width="140" height="22" rx="5" fill="#44403c" />
          <circle cx="400" cy="206" r="42" fill="#1c1917" />
          <circle className="env-pulse" cx="400" cy="206" r="30" fill="#facc15" opacity="0.9" />
          <circle cx="400" cy="206" r="14" fill="#fefce8" />
          <g className="env-detail" stroke="#eab308" strokeWidth="3" fill="none" opacity="0.75">
            <path d="M356 130 L400 160 L444 130" />
            <path d="M356 282 L400 252 L444 282" />
          </g>

          <rect x="6" y="180" width="86" height="170" rx="6" fill="url(#mauvilleSteel)" />
          <rect x="706" y="150" width="88" height="200" rx="6" fill="url(#mauvilleSteel)" />
          <g fill="#fde047">
            <rect className="env-twinkle" x="20" y="198" width="14" height="10" rx="2" />
            <rect className="env-twinkle" x="44" y="198" width="14" height="10" rx="2" />
            <rect className="env-twinkle" x="68" y="198" width="14" height="10" rx="2" />
            <rect className="env-twinkle" x="722" y="170" width="14" height="10" rx="2" />
            <rect className="env-twinkle" x="748" y="170" width="14" height="10" rx="2" />
            <rect className="env-twinkle" x="772" y="170" width="14" height="10" rx="2" />
          </g>
          <g className="env-detail" stroke="#57534e" strokeWidth="3" fill="none">
            <path d="M92 240 Q160 268 92 300" />
            <path d="M706 220 Q640 250 706 282" />
          </g>

          <path className="env-detail" d="M508 176 Q600 214 700 178" stroke="#292524" strokeWidth="7" fill="none" />
          <path className="env-detail" d="M508 196 Q604 238 700 200" stroke="#292524" strokeWidth="5" fill="none" />
          <g fill="#fef08a">
            <circle className="env-twinkle" cx="560" cy="198" r="3" />
            <circle className="env-twinkle" cx="642" cy="216" r="2.6" />
          </g>

          <path d={FLOOR_BACK} fill="#1c1917" />
          <path d={FLOOR_FRONT} fill="#292524" />
          <g className="env-detail" stroke="#57534e" strokeWidth="2" opacity="0.8">
            <path d="M0 356 H800 M0 372 H800 M0 388 H800" />
            <path d="M120 350 V400 M300 350 V400 M500 350 V400 M680 350 V400" />
          </g>
          <rect className="env-detail" x="0" y="342" width="800" height="6" fill="#eab308" opacity="0.35" />

          <EnvVignette />
        </svg>
      );

    /* ================================ PYRE =============================== */
    case 'pyre':
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pyreSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1033" />
              <stop offset="50%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#0b0616" />
            </linearGradient>
            <linearGradient id="pyreMist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pyreStone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#312e46" />
              <stop offset="45%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#1f1b2e" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#pyreSky)" />

          <circle cx="400" cy="80" r="52" fill="#f3e8ff" opacity="0.18" />
          <circle className="env-pulse" cx="400" cy="80" r="30" fill="#ede9fe" opacity="0.75" />

          <ellipse className="env-drift" cx="200" cy="152" rx="240" ry="30" fill="url(#pyreMist)" />
          <ellipse className="env-drift" cx="640" cy="176" rx="220" ry="28" fill="url(#pyreMist)" opacity="0.8" />

          <path d="M296 344 L400 150 L520 344 Z" fill="#241a3d" />
          <path d="M400 150 L400 344 L520 344 Z" fill="#1a1230" opacity="0.8" />
          <rect x="376" y="196" width="48" height="120" rx="6" fill="url(#pyreStone)" opacity="0.95" />
          <rect x="364" y="186" width="72" height="16" rx="4" fill="#c4b5fd" opacity="0.8" />
          <circle className="env-pulse" cx="400" cy="234" r="12" fill="#c084fc" opacity="0.8" />

          <path d="M40 400 L40 236 L14 196 M40 262 L74 214" stroke="#1f1b2e" strokeWidth="10" fill="none" />
          <path d="M756 400 L756 210 L790 170 M756 246 L718 206" stroke="#1f1b2e" strokeWidth="10" fill="none" />
          <rect x="6" y="286" width="52" height="80" rx="24" fill="url(#pyreStone)" opacity="0.85" />
          <rect x="714" y="272" width="56" height="92" rx="26" fill="url(#pyreStone)" opacity="0.85" />

          <path d={FLOOR_BACK} fill="#1b1330" />
          <g fill="url(#pyreStone)" opacity="0.9">
            <rect x="96" y="336" width="34" height="52" rx="16" />
            <rect x="186" y="344" width="28" height="46" rx="14" />
            <rect x="296" y="338" width="32" height="50" rx="15" />
            <rect x="470" y="346" width="30" height="46" rx="14" />
            <rect x="566" y="336" width="34" height="54" rx="16" />
            <rect x="648" y="348" width="26" height="44" rx="13" />
          </g>
          <g className="env-detail" stroke="#0b0616" strokeWidth="2" opacity="0.6">
            <path d="M105 352 H121 M113 346 V370" />
            <path d="M575 352 H591 M583 346 V372" />
          </g>
          <path d={FLOOR_FRONT} fill="#241a3d" opacity="0.92" />

          <ellipse className="env-drift" cx="420" cy="352" rx="260" ry="22" fill="#c4b5fd" opacity="0.22" />
          <ellipse className="env-drift" cx="700" cy="376" rx="180" ry="18" fill="#c4b5fd" opacity="0.18" />
          <g fill="#e9d5ff">
            <circle className="env-twinkle" cx="150" cy="120" r="3" />
            <circle className="env-drift" cx="330" cy="96" r="2.4" />
            <circle className="env-twinkle" cx="536" cy="212" r="3.2" />
            <circle className="env-drift" cx="690" cy="256" r="2.6" />
            <circle className="env-twinkle" cx="760" cy="330" r="2.8" />
          </g>

          <EnvVignette />
        </svg>
      );

    /* ===================== CLASSIC / INDIGO PLATEAU ====================== */
    /* Also the default arena for any unknown theme value.                  */
    case 'classic':
    default:
      return (
        <svg className="env-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="classicSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141433" />
              <stop offset="55%" stopColor="#33376f" />
              <stop offset="100%" stopColor="#0b0b1c" />
            </linearGradient>
            <linearGradient id="classicPillar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3a4060" />
              <stop offset="32%" stopColor="#e4e8f7" />
              <stop offset="68%" stopColor="#9aa2c4" />
              <stop offset="100%" stopColor="#2b3050" />
            </linearGradient>
            <linearGradient id="classicHall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f3468" />
              <stop offset="100%" stopColor="#12142c" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#classicSky)" />

          <g fill="#e8ecff">
            <circle className="env-twinkle" cx="46" cy="52" r="2.6" />
            <circle className="env-twinkle" cx="132" cy="104" r="2" />
            <circle className="env-twinkle" cx="228" cy="40" r="2.4" />
            <circle className="env-twinkle" cx="314" cy="118" r="1.8" />
            <circle className="env-twinkle" cx="466" cy="62" r="2.2" />
            <circle className="env-twinkle" cx="540" cy="164" r="2.4" />
            <circle className="env-twinkle" cx="638" cy="198" r="2" />
            <circle className="env-twinkle" cx="702" cy="70" r="2.6" />
            <circle className="env-twinkle" cx="772" cy="132" r="2.2" />
          </g>
          <ellipse className="env-drift" cx="240" cy="132" rx="220" ry="26" fill="#4c5199" opacity="0.28" />
          <ellipse className="env-drift" cx="650" cy="218" rx="180" ry="24" fill="#4c5199" opacity="0.24" />

          <polygon points="298,244 400,158 502,244" fill="#2b2f5c" />
          <polygon points="298,244 400,158 400,244" fill="#373c72" />
          <rect x="322" y="242" width="156" height="102" fill="url(#classicHall)" />
          <rect x="386" y="290" width="30" height="54" rx="3" fill="#ffd76a" opacity="0.55" />
          <g className="env-detail" fill="#ffd76a" opacity="0.7">
            <rect x="338" y="260" width="14" height="18" rx="2" />
            <rect x="366" y="260" width="14" height="18" rx="2" />
            <rect x="422" y="260" width="14" height="18" rx="2" />
            <rect x="450" y="260" width="14" height="18" rx="2" />
          </g>
          <path d="M400 158 L400 120" stroke="#c9ceea" strokeWidth="5" fill="none" />
          <circle className="env-pulse" cx="400" cy="112" r="11" fill="#ffd76a" />

          <rect x="16" y="36" width="62" height="300" fill="url(#classicPillar)" />
          <rect x="4" y="18" width="86" height="20" rx="4" fill="#eef1fc" />
          <rect x="2" y="330" width="90" height="22" rx="4" fill="#c2c8e4" />
          <rect x="714" y="36" width="62" height="300" fill="url(#classicPillar)" />
          <rect x="702" y="18" width="86" height="20" rx="4" fill="#eef1fc" />
          <rect x="700" y="330" width="90" height="22" rx="4" fill="#c2c8e4" />
          <g className="env-detail" stroke="#8b93bb" strokeWidth="2" opacity="0.6">
            <path d="M32 44 V326 M47 44 V326 M62 44 V326" />
            <path d="M730 44 V326 M745 44 V326 M760 44 V326" />
          </g>

          <g className="env-detail" opacity="0.9">
            <path d="M110 0 L152 0 L131 40 Z" fill="#b91c1c" />
            <path d="M188 0 L230 0 L209 34 Z" fill="#1d4ed8" />
            <path d="M266 0 L308 0 L287 40 Z" fill="#b91c1c" />
            <path d="M344 0 L386 0 L365 34 Z" fill="#1d4ed8" />
            <path d="M424 0 L466 0 L445 40 Z" fill="#b91c1c" />
            <path d="M688 0 L730 0 L709 36 Z" fill="#1d4ed8" />
          </g>

          <path d={FLOOR_BACK} fill="#191c3d" />
          <path d={FLOOR_FRONT} fill="#252a55" />
          <path d="M338 344 Q400 340 462 344 L558 400 L242 400 Z" fill="#7f1d1d" opacity="0.75" />
          <path className="env-detail" d="M352 356 Q400 352 448 356 M320 380 Q400 374 480 380" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.5" />

          <EnvVignette />
        </svg>
      );
  }
}
```

Everything else in `BattleScreen.jsx` (the exported `BattleScreen` component below `BattleEnvironment`) is untouched by Change A.

### Change B — `src/components/BattleScreen.jsx`: add field-platform divs

Add a grounding div as the **first child** of each podium container, before `.battle-podium-oval`.

**B1 — defender container**, current:
```jsx
        {/* 2. Defender Podium & Sprite (Top-Right Midground) */}
        <div className="defender-podium-container">
          <div className="battle-podium-oval">
```
New:
```jsx
        {/* 2. Defender Podium & Sprite (Top-Right Midground) */}
        <div className="defender-podium-container">
          <div className="battle-field-platform" aria-hidden="true" />
          <div className="battle-podium-oval">
```

**B2 — attacker container**, current:
```jsx
        {/* 3. Attacker Podium & Sprite (Bottom-Left Foreground) */}
        <div className="attacker-podium-container">
          <div className="battle-podium-oval">
```
New:
```jsx
        {/* 3. Attacker Podium & Sprite (Bottom-Left Foreground) */}
        <div className="attacker-podium-container">
          <div className="battle-field-platform" aria-hidden="true" />
          <div className="battle-podium-oval">
```

### Change C — `src/App.css`: `.battle-podium-oval` z-index

Add `z-index: 1;` so the ring paints above the new field-platform disc:

```css
/* 3D Battle Oval Base */
.battle-podium-oval {
  position: relative;
  z-index: 1;
  width: 230px;
  height: 65px;
  border-radius: 50%;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
```

### Change D — `src/App.css`: recolor `.theme-battle-classic .battle-podium-oval`

Replace (grass-green clashed with the new slate/gold championship hall):

```css
.theme-battle-classic .battle-podium-oval {
  background: radial-gradient(ellipse at center, #e2e8f0 0%, #475569 60%, #0b1120 100%);
  border: 4px solid #f59e0b;
  box-shadow: 0 12px 25px rgba(245, 158, 11, 0.7), inset 0 0 15px #fbbf24;
}
```

### Change E — `src/App.css`: insert new block

Insert immediately after the `.theme-battle-classic .battle-podium-oval` rule (Change D), before the `/* Attack & Hit Animations */` comment:

```css
/* ========================================= */
/* BATTLE FIELD PLATFORM (grounding disc)    */
/* ========================================= */
/* A soft, theme-coloured ground disc that sits BEHIND the glowing
   podium ring and gives each combatant visual weight.
   Implemented in CSS (not in the env SVG) because the podiums are
   positioned in px from the scene edges while the SVG stretches
   non-uniformly (preserveAspectRatio="none") - an SVG ellipse would
   drift out of alignment as the scene resizes. */

.battle-field-platform {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.92;
  background:
    var(--field-texture, none),
    radial-gradient(
      ellipse at 50% 42%,
      var(--field-core, #4ade80) 0%,
      var(--field-mid, #15803d) 44%,
      var(--field-edge, #052e16) 100%
    );
  -webkit-mask-image: radial-gradient(
    ellipse at 50% 50%,
    #000 46%,
    rgba(0, 0, 0, 0.55) 72%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: radial-gradient(
    ellipse at 50% 50%,
    #000 46%,
    rgba(0, 0, 0, 0.55) 72%,
    rgba(0, 0, 0, 0) 100%
  );
}

.defender-podium-container .battle-field-platform {
  width: 300px;
  height: 92px;
}

.attacker-podium-container .battle-field-platform {
  width: 360px;
  height: 118px;
}

.theme-battle-classic {
  --field-core: #64748b;
  --field-mid: #334155;
  --field-edge: #0b1120;
  --field-texture: repeating-linear-gradient(
    90deg,
    rgba(245, 158, 11, 0.16) 0 2px,
    rgba(0, 0, 0, 0) 2px 26px
  );
}

.theme-battle-volcano {
  --field-core: #f97316;
  --field-mid: #7f1d1d;
  --field-edge: #140202;
  --field-texture:
    radial-gradient(circle at 30% 62%, rgba(249, 115, 22, 0.35) 0 6px, rgba(0, 0, 0, 0) 7px),
    radial-gradient(circle at 68% 38%, rgba(220, 38, 38, 0.35) 0 5px, rgba(0, 0, 0, 0) 6px),
    radial-gradient(circle at 52% 74%, rgba(251, 191, 36, 0.3) 0 4px, rgba(0, 0, 0, 0) 5px);
}

.theme-battle-ice {
  --field-core: #e0f2fe;
  --field-mid: #0284c7;
  --field-edge: #032b43;
  --field-texture: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.18) 0 3px,
    rgba(0, 0, 0, 0) 3px 18px
  );
}

.theme-battle-petalburg {
  --field-core: #4ade80;
  --field-mid: #15803d;
  --field-edge: #022c22;
  --field-texture: repeating-linear-gradient(
    0deg,
    rgba(220, 252, 231, 0.12) 0 2px,
    rgba(0, 0, 0, 0) 2px 10px
  );
}

.theme-battle-sootopolis {
  --field-core: #93c5fd;
  --field-mid: #1d4ed8;
  --field-edge: #0b1329;
  --field-texture: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.14) 0 2px,
    rgba(0, 0, 0, 0) 2px 14px
  );
}

.theme-battle-skypillar {
  --field-core: #6ee7b7;
  --field-mid: #047857;
  --field-edge: #02120f;
  --field-texture: repeating-linear-gradient(
    90deg,
    rgba(236, 253, 245, 0.12) 0 3px,
    rgba(0, 0, 0, 0) 3px 22px
  );
}

.theme-battle-mauville {
  --field-core: #facc15;
  --field-mid: #854d0e;
  --field-edge: #0a0807;
  --field-texture: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.35) 0 3px,
    rgba(0, 0, 0, 0) 3px 12px
  );
}

.theme-battle-pyre {
  --field-core: #c084fc;
  --field-mid: #581c87;
  --field-edge: #17072b;
  --field-texture: radial-gradient(
    circle at 50% 50%,
    rgba(243, 232, 255, 0.18) 0 30%,
    rgba(0, 0, 0, 0) 62%
  );
}

/* ========================================= */
/* ENVIRONMENT AMBIENT MOTION                */
/* ========================================= */

@keyframes envDrift {
  from { transform: translateX(-10px); }
  to   { transform: translateX(10px); }
}

@keyframes envTwinkle {
  0%, 100% { opacity: 0.35; }
  50%      { opacity: 1; }
}

@keyframes envPulse {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.06); }
}

.env-drift {
  animation: envDrift 9s ease-in-out infinite alternate;
}

.env-twinkle {
  animation: envTwinkle 3.2s ease-in-out infinite;
}

.env-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: envPulse 2.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .env-drift,
  .env-twinkle,
  .env-pulse {
    animation: none;
  }
}

/* On very narrow scenes the two sprite boxes overlap the flanks,
   so the small flank details are dropped. */
@media (max-width: 560px) {
  .env-detail {
    display: none;
  }
}
```

### Change F — `src/App.css`: mobile field-platform sizes

Inside the existing `@media (max-width: 840px)` block, add directly after the `.attacker-podium-container .battle-sprite { … }` rule:

```css
  .defender-podium-container .battle-field-platform {
    width: 216px;
    height: 70px;
  }

  .attacker-podium-container .battle-field-platform {
    width: 250px;
    height: 86px;
  }
```

## Apply order

1. Change A (replace `BattleEnvironment`) — largest, self-contained.
2. Change B (two JSX divs).
3. Changes C + D (edit two existing CSS rules).
4. Change E (insert the new CSS block after the `theme-battle-classic` podium rule).
5. Change F (two rules inside the existing 840px media query).

No step depends on a later step; A/B and C–F can be applied in either order.

## Verification

1. `npm run build` — must succeed with no errors.
2. `npm run dev`, open the app, pick each of the 8 arena themes on the home screen, then trigger a capture to open the battle overlay. For every theme confirm:
   - The backdrop is not a flat navy rect — each theme has distinct scenery matching its Pokémon-lore identity (classic = league hall with pillars/banners, skypillar = ancient ruins/clouds, mauville = industrial generator plant, pyre = misty graveyard, plus the existing volcano/ice/forest/ocean).
   - A soft themed disc is visible under each Pokémon, behind the glowing podium ring.
   - No bright/high-contrast line visibly cuts across either Pokémon sprite.
   - The ground horizon is visible above the dialog box, not swallowed by it.
3. Resize the window from ~1400px down to ~380px wide — the field discs must stay centered on their podiums at every width.
4. Toggle OS-level "reduce motion" and confirm the drift/twinkle/pulse animations stop (`prefers-reduced-motion` media query).
5. `grep -rn "rotateX" src/` — must return no results (unrelated prior fix, must not regress).
