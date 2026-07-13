// Cliente de API para realizar peticiones HTTP a la PokéAPI

const BASE_URL = "https://pokeapi.co/api/v2";

// Obtener datos detallados de un Pokémon por nombre o ID
export async function obtenerDatosPokemon(query) {
  const respuesta = await fetch(`${BASE_URL}/pokemon/${query.trim().toLowerCase()}`);
  if (!respuesta.ok) {
    if (respuesta.status === 404) {
      throw new Error("No se encontró ningún Pokémon con ese nombre o número.");
    } else {
      throw new Error("Ocurrió un error al conectar con la PokéAPI.");
    }
  }
  return await respuesta.json();
}

// Obtener el listado de Pokémon paginado
export async function obtenerListadoPokemon(offset, limit) {
  const respuesta = await fetch(`${BASE_URL}/pokemon/?offset=${offset}&limit=${limit}`);
  if (!respuesta.ok) {
    throw new Error("Error al obtener la lista de Pokémon.");
  }
  return await respuesta.json();
}

// Obtener datos de la especie de un Pokémon (contiene enlace a la cadena evolutiva)
export async function obtenerEspecie(urlSpecies) {
  const respuesta = await fetch(urlSpecies);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la especie del Pokémon.");
  }
  return await respuesta.json();
}

// Obtener la cadena evolutiva a partir de su URL
export async function obtenerCadenaEvolutiva(urlChain) {
  const respuesta = await fetch(urlChain);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la cadena evolutiva.");
  }
  return await respuesta.json();
}

// Obtiene los detalles de un Pokémon individual a partir de su URL directa
export async function obtenerDetallesPorUrl(urlDetail) {
  const respuesta = await fetch(urlDetail);
  if (!respuesta.ok) {
    throw new Error("Error al obtener los detalles individuales.");
  }
  return await respuesta.json();
}

// Obtener el listado de todas las Pokédex regionales
export async function obtenerRegionesPokedex() {
  const respuesta = await fetch(`${BASE_URL}/pokedex/?limit=30`);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la lista de Pokédex.");
  }
  return await respuesta.json();
}

// Obtener los detalles de una Pokédex específica (incluyendo sus pokemon_entries)
export async function obtenerDetallePokedex(urlOrId) {
  const url = urlOrId.toString().startsWith("http") ? urlOrId : `${BASE_URL}/pokedex/${urlOrId}/`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener los detalles de la Pokédex.");
  }
  return await respuesta.json();
}

// Obtener el listado de todas las generaciones
export async function obtenerGeneraciones() {
  const respuesta = await fetch(`${BASE_URL}/generation/`);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la lista de generaciones.");
  }
  return await respuesta.json();
}

// Obtener los detalles de una generación específica (incluyendo sus pokemon_species)
export async function obtenerDetalleGeneracion(urlOrId) {
  const url = urlOrId.toString().startsWith("http") ? urlOrId : `${BASE_URL}/generation/${urlOrId}/`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener los detalles de la generación.");
  }
  return await respuesta.json();
}

// Obtener detalles de un movimiento por URL o nombre
export async function obtenerDetalleMovimiento(urlOrName) {
  const url = urlOrName.toString().startsWith("http") ? urlOrName : `${BASE_URL}/move/${urlOrName.toLowerCase().replace(/\s+/g, "-")}/`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la información de este movimiento.");
  }
  return await respuesta.json();
}



