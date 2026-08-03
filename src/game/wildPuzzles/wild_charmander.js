// Mt. Chimney Volcano (Fire / Magma)
export default {
  id: 'wild_charmander',
  pokemonName: 'Charmander',
  region: 'volcano',
  iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
  type: 'Fire Strike',
  difficulty: 'hard',
  weight: 20,
  title: 'Charmander\'s Volcanic Strike! 🔥',
  prompt: 'A Wild Charmander emerged from the magma crater! Strike with your Bishop on f7 — it\'s a free pawn with check, backed up by your Knight on g5!',
  fen: '4k3/5p2/8/6N1/2B5/8/8/6K1 w - - 0 1',
  solutionMove: { from: 'c4', to: 'f7' },
  rewardText: 'Gotcha! Wild Charmander was caught! Registered in Volcano Pokédex! 🔥',
  coachHint: 'Pikachu says: Move your Bishop to f7 — your Knight on g5 guards it, so the King can\'t recapture!',
};
