// Petalburg Woods (Grass / Bug / Electric)
export default {
  id: 'wild_pikachu',
  pokemonName: 'Pikachu',
  region: 'petalburg',
  iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  type: 'Opening',
  difficulty: 'easy',
  weight: 60,
  title: 'Pikachu\'s King Pawn Opening! ⚡',
  prompt: 'A Wild Pikachu appeared in Petalburg Woods! Advance your King Pawn 2 squares (e2 to e4) to control the center!',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  solutionMove: { from: 'e2', to: 'e4' },
  rewardText: 'Gotcha! Wild Pikachu was caught! Registered in Petalburg Pokédex! ⚡',
  coachHint: 'Pikachu says: Move your pawn from e2 to e4 to claim the center of the board!',
};
