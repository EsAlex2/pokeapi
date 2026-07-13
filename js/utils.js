// Capitaliza la primera letra de un string
export function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Extrae el ID numérico de una URL de la PokéAPI (ej: https://pokeapi.co/api/v2/pokemon-species/25/)
export function extraerIdDeUrl(url) {
  if (!url) return "";
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 2];
}
