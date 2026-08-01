const cache = new Map();

/**
 * Fetches Pokémon data from PokeAPI with in-memory caching.
 * @param {string} name - Pokémon species name or form identifier
 * @returns {Promise<Object>}
 */
export async function fetchPokemonData(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${name}: ${res.statusText}`);
    }
    const data = await res.json();
    cache.set(name, data);
    return data;
  } catch (err) {
    console.error(`PokeAPI Fetch Error for [${name}]:`, err);
    return null;
  }
}

/**
 * Gets static front sprite URL for board pieces.
 * Handles fallback if network fails or form is missing.
 * @param {string} name 
 * @returns {Promise<string>}
 */
export async function getSprite(name) {
  const data = await fetchPokemonData(name);
  if (!data) return '';
  
  // Prefer front_default static sprite
  return data.sprites?.front_default || '';
}

/**
 * Gets battle sprites (animated Gen 5 with static fallbacks).
 * @param {string} name 
 * @returns {Promise<{front: string, back: string}>}
 */
export async function getBattleSprites(name) {
  const data = await fetchPokemonData(name);
  if (!data || !data.sprites) {
    return { front: '', back: '' };
  }

  const gen5 = data.sprites.versions?.['generation-v']?.['black-white']?.animated;
  
  const frontAnimated = gen5?.front_default;
  const backAnimated = gen5?.back_default;

  const frontStatic = data.sprites.front_default;
  const backStatic = data.sprites.back_default || data.sprites.front_default;

  return {
    front: frontAnimated || frontStatic || '',
    back: backAnimated || backStatic || frontStatic || '',
  };
}
