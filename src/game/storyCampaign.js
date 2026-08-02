// Story Campaign Stages, Motivating NPCs, Villainous Teams, and Kid Dialogue

export const MOTIVATING_NPCS = [
  {
    name: 'Professor Oak',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/oak.png',
    quote: 'Welcome, Trainer {name}! Every Champion started right where you are. Take your time and have fun!',
  },
  {
    name: 'Nurse Joy',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/nurse.png',
    quote: 'Great job trying your best, {name}! Even if you make a mistake, you learn and grow stronger!',
  },
  {
    name: 'Officer Jenny',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/officerjenny.png',
    quote: 'Keep your King safe and guard your team, {name}! You have super sharp eyes!',
  },
];

export const AMBIENT_WORLD_NPCS = [
  {
    id: 'sweeper',
    name: 'Janitor Tim',
    action: '🧹 Sweeping the floor...',
    dialogue: 'Hello {name}! Sweeping the Pokémon Gym floor keeps the battle arena shiny for your matches!',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/janitor.png',
  },
  {
    id: 'chaser',
    name: 'Little Billy & Meowth',
    action: '😸 Chasing a wild Meowth!',
    dialogue: 'Hey {name}! Come help me catch Meowth! I want to play chess with him!',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/schoolkid.png',
  },
  {
    id: 'stargazer',
    name: 'Swimmer Marina',
    action: '🌊 Staring at Wingulls over the ocean...',
    dialogue: 'Hi {name}! The ocean breeze feels so peaceful today. Look at those Wingulls flying!',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/swimmerf.png',
  },
];

export const DIFFICULTY_TIERS = {
  rookie: {
    id: 'rookie',
    name: 'Rookie / Kid Mode',
    icon: '🐣',
    startElo: 50,
    maxElo: 800,
    desc: '50 ELO to 800 ELO max! Every child can clear all 21 stages, earn every Gym Badge, and become the Pokémon Chess Champion!',
  },
  trainer: {
    id: 'trainer',
    name: 'Trainer Mode',
    icon: '🧢',
    startElo: 300,
    maxElo: 1600,
    desc: '300 ELO to 1600 ELO. Standard move dots enabled with moderate tactical AI.',
  },
  champion: {
    id: 'champion',
    name: 'Master / Champion Mode',
    icon: '👑',
    startElo: 800,
    maxElo: 2400,
    desc: '800 ELO to 2400 ELO Red. Hints locked off, deep minimax calculation.',
  },
};

export const STORY_STAGES = [
  {
    id: 1,
    name: 'Baby Pichu',
    trainerTitle: 'Pichu Nest',
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png',
    dialogue: 'Pichu says: Let\'s play a super fun game, {name}! You can do it!',
    theme: 'petalburg',
    badge: { id: 'rookie_ribbon', name: 'Rookie Ribbon', icon: '🏅' },
  },
  {
    id: 2,
    name: 'Rookie Timmy',
    trainerTitle: 'Novice Friend',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster-gen4.png',
    dialogue: 'Hi {name}! Your moves look so cool! Let\'s play together!',
    theme: 'petalburg',
    badge: null,
  },
  {
    id: 3,
    name: 'Youngster Tristan',
    trainerTitle: 'Route 101 Friend',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster.png',
    dialogue: 'You are getting so good at chess, {name}! Show me your best move!',
    theme: 'petalburg',
    badge: null,
  },
  {
    id: 4,
    name: 'Team Rocket Grunt',
    trainerTitle: 'Team Rocket Ambush 🚀',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/teamrocket.png',
    dialogue: 'Prepare for trouble, {name}! Hand over your chess Pawns or prepare to battle!',
    theme: 'mauville',
    badge: { id: 'rocket_coin', name: 'R-Coin', icon: '🪙' },
  },
  {
    id: 5,
    name: 'Bug Catcher Joey',
    trainerTitle: 'Viridian Forest',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
    dialogue: 'My Caterpie is ready, {name}! Let\'s see if you can catch my piece!',
    theme: 'petalburg',
    badge: { id: 'bug_badge', name: 'Insect Ribbon', icon: '🐛' },
  },
  {
    id: 6,
    name: 'Fisherman Ned',
    trainerTitle: 'Route 102 Fisherman',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/fisherman.png',
    dialogue: 'Take a deep breath and take your time, {name}! You are super smart!',
    theme: 'sootopolis',
    badge: null,
  },
  {
    id: 7,
    name: 'Lass Carrie',
    trainerTitle: 'Petalburg Woods',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lass.png',
    dialogue: 'Move your Knights out early, {name}! They can jump over other pieces!',
    theme: 'petalburg',
    badge: null,
  },
  {
    id: 8,
    name: 'Camper Liam',
    trainerTitle: 'Route 104 Camper',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/camper.png',
    dialogue: 'Guarding your pieces keeps your team safe and happy, {name}!',
    theme: 'petalburg',
    badge: null,
  },
  {
    id: 9,
    name: 'Team Magma Grunt',
    trainerTitle: 'Volcano Ambush 🌋',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/magmagrunt.png',
    dialogue: 'We will heat up the chess board with fiery volcanic moves, {name}!',
    theme: 'volcano',
    badge: { id: 'magma_emblem', name: 'Magma Emblem', icon: '🌋' },
  },
  {
    id: 10,
    name: 'Picnicker Diane',
    trainerTitle: 'Petalburg Outskirts',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/picnicker.png',
    dialogue: 'You are doing great, {name}! Keep building your team defense!',
    theme: 'petalburg',
    badge: { id: 'forest_badge', name: 'Forest Ribbon', icon: '🌲' },
  },
  {
    id: 11,
    name: 'Hiker Anthony',
    trainerTitle: 'Mt. Chimney Foothills',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hiker.png',
    dialogue: 'Your heart is strong like a Geodude, {name}! Keep going!',
    theme: 'volcano',
    badge: null,
  },
  {
    id: 12,
    name: 'Black Belt Kiyo',
    trainerTitle: 'Dewford Dojo',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blackbelt.png',
    dialogue: 'Control the center squares, {name}! You have great focus!',
    theme: 'skypillar',
    badge: { id: 'fight_badge', name: 'Knuckle Badge', icon: '🥊' },
  },
  {
    id: 13,
    name: 'Team Aqua Grunt',
    trainerTitle: 'Ocean Hideout 🌊',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/aquagrunt.png',
    dialogue: 'The ocean belongs to Team Aqua, {name}! Wash away enemy Pawns!',
    theme: 'sootopolis',
    badge: { id: 'aqua_crest', name: 'Aqua Crest', icon: '🌊' },
  },
  {
    id: 14,
    name: 'Psychic Edward',
    trainerTitle: 'Mauville Psychic',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/psychic.png',
    dialogue: 'Look across the whole board, {name}! Your brain is super powerful!',
    theme: 'mauville',
    badge: null,
  },
  {
    id: 15,
    name: 'Leader Brock',
    trainerTitle: 'Pewter City Gym',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
    dialogue: '{name}, you played with amazing heart! You deserve the Boulder Badge!',
    theme: 'classic',
    badge: { id: 'boulder_badge', name: 'Boulder Badge', icon: '🪨' },
  },
  {
    id: 16,
    name: 'Leader Misty',
    trainerTitle: 'Cerulean City Gym',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
    dialogue: '{name}, your water flow strategy is so smart! Here is the Cascade Badge!',
    theme: 'sootopolis',
    badge: { id: 'cascade_badge', name: 'Cascade Badge', icon: '💧' },
  },
  {
    id: 17,
    name: 'Gym Leader Wattson',
    trainerTitle: 'Mauville Gym Leader',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wattson.png',
    dialogue: 'Bwahaha! Fantastic move, {name}! You earned the Dynamo Badge!',
    theme: 'mauville',
    badge: { id: 'dynamo_badge', name: 'Dynamo Badge', icon: '⚡' },
  },
  {
    id: 18,
    name: 'Gym Leader Wallace',
    trainerTitle: 'Sootopolis Gym Leader',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/wallace.png',
    dialogue: 'Truly beautiful chess playing, {name}! Here is the Rain Badge!',
    theme: 'sootopolis',
    badge: { id: 'rain_badge', name: 'Rain Badge', icon: '🌧️' },
  },
  {
    id: 19,
    name: 'Elite Four Lance',
    trainerTitle: 'Indigo League Champion',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
    dialogue: 'Your team spirit is incredible, {name}! Take the Dragon Trophy!',
    theme: 'classic',
    badge: { id: 'dragon_badge', name: 'Dragon Trophy', icon: '🐉' },
  },
  {
    id: 20,
    name: 'Champion Cynthia',
    trainerTitle: 'Sinnoh League Champion',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
    dialogue: 'You did it, {name}! You are a true Champion! Here is your Champion Trophy!',
    theme: 'skypillar',
    badge: { id: 'champion_trophy', name: 'Champion Trophy', icon: '🏆' },
  },
  {
    id: 21,
    name: 'Legend Red',
    trainerTitle: 'Mt. Silver Peak',
    iconUrl: 'https://play.pokemonshowdown.com/sprites/trainers/red.png',
    dialogue: '...',
    theme: 'ice',
    badge: { id: 'legend_star', name: 'Legend Star', icon: '⭐' },
  },
];

export function getStagesForTier(tierId = 'rookie') {
  const minElo = tierId === 'rookie' ? 50 : tierId === 'trainer' ? 300 : 800;
  const maxElo = tierId === 'rookie' ? 800 : tierId === 'trainer' ? 1600 : 2400;

  return STORY_STAGES.map((st, idx) => {
    const elo = Math.round(minElo + (idx / 20) * (maxElo - minElo));
    const hasCoach = tierId === 'rookie' || idx < 10;
    return {
      ...st,
      elo,
      hasCoach,
    };
  });
}
