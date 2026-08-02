// Pokémon Team Lineup Customizer & Story Campaign Evolution Mapping

export const STARTER_PAWN_LINEUPS = [
  {
    id: 'pichu_line',
    name: 'Electric Pichu Line ⚡',
    stage1: { name: 'Pichu', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png' },
    stage2: { name: 'Pikachu', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
    stage3: { name: 'Raichu', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png' },
  },
  {
    id: 'charmander_line',
    name: 'Fiery Charmander Line 🔥',
    stage1: { name: 'Charmander', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
    stage2: { name: 'Charmeleon', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png' },
    stage3: { name: 'Charizard', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
  },
  {
    id: 'bulbasaur_line',
    name: 'Forest Bulbasaur Line 🌿',
    stage1: { name: 'Bulbasaur', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
    stage2: { name: 'Ivysaur', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
    stage3: { name: 'Venusaur', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' },
  },
  {
    id: 'squirtle_line',
    name: 'Water Squirtle Line 💧',
    stage1: { name: 'Squirtle', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    stage2: { name: 'Wartortle', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png' },
    stage3: { name: 'Blastoise', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png' },
  },
];

export const DEFAULT_PIECE_LINEUPS = {
  pawn: STARTER_PAWN_LINEUPS[0],
  knight: {
    name: 'Ponyta Line 🐴',
    stage1: { name: 'Ponyta', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png' },
    stage2: { name: 'Rapidash', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png' },
    stage3: { name: 'Rapidash', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png' },
  },
  bishop: {
    name: 'Treecko Line 🌿',
    stage1: { name: 'Treecko', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png' },
    stage2: { name: 'Grovyle', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/253.png' },
    stage3: { name: 'Sceptile', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/254.png' },
  },
  rook: {
    name: 'Geodude Line 🪨',
    stage1: { name: 'Geodude', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png' },
    stage2: { name: 'Graveler', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png' },
    stage3: { name: 'Golem', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png' },
  },
  queen: {
    name: 'Squirtle Queen Line 💧',
    stage1: { name: 'Squirtle', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    stage2: { name: 'Wartortle', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png' },
    stage3: { name: 'Blastoise', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png' },
  },
  king: {
    name: 'Togepi King Line 👑',
    stage1: { name: 'Togepi', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png' },
    stage2: { name: 'Togetic', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/176.png' },
    stage3: { name: 'Togekiss', iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png' },
  },
};

export function getEvolutionTierForStage(stageId = 1) {
  if (stageId <= 7) return 1; // Stages 1-7: Stage 1 Basic
  if (stageId <= 14) return 2; // Stages 8-14: Stage 2 Mid-Form
  return 3; // Stages 15-21: Stage 3 Final Form
}

export function getLineupForStage(stageId = 1, customPawnLineId = 'pichu_line') {
  const tier = getEvolutionTierForStage(stageId);
  const selectedPawnLine = STARTER_PAWN_LINEUPS.find((l) => l.id === customPawnLineId) || STARTER_PAWN_LINEUPS[0];

  const stageKey = `stage${tier}`;

  return {
    pawn: selectedPawnLine[stageKey],
    knight: DEFAULT_PIECE_LINEUPS.knight[stageKey],
    bishop: DEFAULT_PIECE_LINEUPS.bishop[stageKey],
    rook: DEFAULT_PIECE_LINEUPS.rook[stageKey],
    queen: DEFAULT_PIECE_LINEUPS.queen[stageKey],
    king: DEFAULT_PIECE_LINEUPS.king[stageKey],
    tier,
  };
}
