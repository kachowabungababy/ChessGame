// Mt. Chimney Volcano (Fire / Magma)
export default {
  id: 'wild_slugma',
  pokemonName: 'Slugma',
  region: 'volcano',
  iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/218.png',
  type: 'Center Defense',
  difficulty: 'easy',
  weight: 55,
  title: 'Slugma\'s Magma Barrier! 🌋',
  prompt: 'A Wild Slugma is blocking the trail! Advance your Queen Pawn to d4 to solidify center control!',
  fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
  solutionMove: { from: 'd2', to: 'd4' },
  rewardText: 'Gotcha! Wild Slugma was caught! Registered in Volcano Pokédex! 🌋',
  coachHint: 'Pikachu says: Advance your d-pawn to d4 to control the middle!',
};
