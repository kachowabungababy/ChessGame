// Indigo League (Normal / Evolution)
export default {
  id: 'wild_eevee',
  pokemonName: 'Eevee',
  region: 'classic',
  iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
  type: 'Pawn Evolution',
  difficulty: 'hard',
  weight: 15,
  title: 'Eevee\'s Queen Evolution! ⭐',
  prompt: 'A Wild Eevee is watching the League matches! Push your Pawn from e7 to e8 to evolve into a Queen!',
  fen: '7k/4P3/8/8/8/8/8/4K3 w - - 0 1',
  solutionMove: { from: 'e7', to: 'e8' },
  rewardText: 'Gotcha! Wild Eevee was caught! Registered in Pokédex! ⭐',
  coachHint: 'Pikachu says: Move your Pawn all the way to e8 to evolve into a Queen!',
};
