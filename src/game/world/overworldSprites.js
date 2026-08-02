import { PAWN_OPTIONS, getEvolutionTierForStage } from '../pokemonLineups';

export const OW_POKEMON = {
  pikachu: { key: 'ow_pikachu', url: '/assets/sprites/pokemon/ow_pikachu.png', frameWidth: 32, frameHeight: 32 },
  treecko: { key: 'ow_treecko', url: '/assets/sprites/pokemon/ow_treecko.png', frameWidth: 32, frameHeight: 32 },
  charmander: { key: 'ow_charmander', url: '/assets/sprites/pokemon/ow_charmander.png', frameWidth: 32, frameHeight: 32 },
  squirtle: { key: 'ow_squirtle', url: '/assets/sprites/pokemon/ow_squirtle.png', frameWidth: 32, frameHeight: 32 },
  bulbasaur: { key: 'ow_bulbasaur', url: '/assets/sprites/pokemon/ow_bulbasaur.png', frameWidth: 32, frameHeight: 32 },
  poochyena: { key: 'ow_poochyena', url: '/assets/sprites/pokemon/ow_poochyena.png', frameWidth: 32, frameHeight: 32 },
};

export const FALLBACK_OW = 'pikachu';

export function resolveFollowerSpecies(profile) {
  const line = PAWN_OPTIONS.find((l) => l.id === profile?.starterLineId) ?? PAWN_OPTIONS[0];
  const tier = getEvolutionTierForStage(profile?.unlockedStage ?? 1);
  const stageObj = line[`stage${tier}`] || line.stage1;
  const name = (stageObj?.name || 'pikachu').toLowerCase();
  return OW_POKEMON[name] ? name : FALLBACK_OW;
}
