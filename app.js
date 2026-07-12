// Mapeo de colores oficiales por tipo de Pokémon para inyección dinámica de estilos CSS
const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#705798",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// Traducciones de estadísticas al español
const statNamesEs = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

// Referencias a elementos del DOM
const pokemonContainer = document.getElementById("pokemon-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

// Función para capitalizar texto
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Función principal para obtener datos del Pokémon
async function obtenerPokemon(busqueda = "pikachu") {
  // Mostrar pantalla de carga
  mostrarCargando();

  try {
    // Normalizar la búsqueda a minúsculas
    const query = busqueda.trim().toLowerCase();

    if (!query) {
      mostrarError("Por favor ingresa un nombre o número de Pokémon.");
      return;
    }

    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);

    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        throw new Error(
          "No se encontró ningún Pokémon con ese nombre o número.",
        );
      } else {
        throw new Error("Ocurrió un error al conectar con la PokéAPI.");
      }
    }

    const datos = await respuesta.json();
    renderizarPokemon(datos);
  } catch (error) {
    console.error("Error al obtener el Pokémon:", error);
    mostrarError(error.message);
  }
}

// Renderiza un spinner de carga
function mostrarCargando() {
  pokemonContainer.innerHTML = `
    <div class="loader-container">
      <div class="loader-spinner"></div>
      <p>Buscando en la base de datos...</p>
    </div>
  `;
}

// Renderiza una tarjeta con el mensaje de error
function mostrarError(mensaje) {
  pokemonContainer.innerHTML = `
    <div class="error-card animate-fade-in">
      <span class="material-symbols-outlined error-icon">error</span>
      <h3>¡Oops! Algo salió mal</h3>
      <p>${mensaje}</p>
    </div>
  `;
}

// Renderiza la tarjeta con los detalles del Pokémon en el DOM
function renderizarPokemon(pokemon) {
  // Obtener color base del tipo principal
  const tipoPrincipal = pokemon.types[0].type.name;
  const colorBase = typeColors[tipoPrincipal] || "#777777";

  // Formatear el ID (ej: #0001)
  const idFormateado = `#${pokemon.id.toString().padStart(4, "0")}`;
  const nombreFormateado = capitalizar(pokemon.name);

  // Obtener imagen de alta calidad (usando jsDelivr como CDN prioritario para evitar problemas de conexión/bloqueos)
  const imagenUrl =
    `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${pokemon.id}.png` ||
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

  // Construir chips de tipos
  const tiposHTML = pokemon.types
    .map((t) => {
      const nombreTipo = t.type.name;
      const colorTipo = typeColors[nombreTipo] || "#777777";
      return `<span class="type-badge" style="--badge-color: ${colorTipo}">${capitalizar(nombreTipo)}</span>`;
    })
    .join("");

  // Convertir habilidades a texto amigable
  const habilidades = pokemon.abilities
    .map((a) => capitalizar(a.ability.name.replace("-", " ")))
    .join(", ");

  // Formatear peso (hectogramos a kg) y altura (decímetros a m)
  const pesoKg = (pokemon.weight / 10).toFixed(1);
  const alturaM = (pokemon.height / 10).toFixed(1);

  // Construir estadísticas
  const estadisticasHTML = pokemon.stats
    .map((s) => {
      const nombreEst = statNamesEs[s.stat.name] || capitalizar(s.stat.name);
      const valor = s.base_stat;
      // Porcentaje relativo al máximo promedio de estadísticas (ej: 200)
      const porcentaje = Math.min((valor / 200) * 100, 100);
      return `
      <div class="stat-row">
        <span class="stat-name">${nombreEst}</span>
        <span class="stat-value">${valor}</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${porcentaje}%; --bar-color: ${colorBase}"></div>
        </div>
      </div>
    `;
    })
    .join("");

  // Insertar HTML de la tarjeta Pokémon
  pokemonContainer.innerHTML = `
    <div class="pokemon-card animate-fade-in" style="--pokemon-theme-color: ${colorBase}">
      <div class="pokemon-card-glow"></div>
      
      <div class="pokemon-card-left">
        <span class="pokemon-id">${idFormateado}</span>
        <div class="pokemon-image-container">
          <img 
            src="${imagenUrl}" 
            alt="${nombreFormateado}" 
            class="pokemon-image" 
            onerror="this.onerror=function(){this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/poke-ball.png';}; this.src='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokemon.id}.png';"
          />
        </div>
        <h2 class="pokemon-name">${nombreFormateado}</h2>
        <div class="pokemon-types">${tiposHTML}</div>
      </div>

      <div class="pokemon-card-right">
        <div class="pokemon-physical">
          <div class="physical-item">
            <span class="material-symbols-outlined physical-icon">height</span>
            <div>
              <span class="physical-value">${alturaM} m</span>
              <span class="physical-label">Altura</span>
            </div>
          </div>
          <div class="physical-item">
            <span class="material-symbols-outlined physical-icon">weight</span>
            <div>
              <span class="physical-value">${pesoKg} kg</span>
              <span class="physical-label">Peso</span>
            </div>
          </div>
        </div>

        <div class="pokemon-abilities">
          <span class="abilities-label">Habilidades:</span>
          <span class="abilities-value">${habilidades}</span>
        </div>

        <div class="pokemon-stats">
          <span class="section-title">Estadísticas de Combate</span>
          <div class="stats-list">${estadisticasHTML}</div>
        </div>
      </div>
    </div>
  `;
}

// Escuchar el evento submit del formulario
searchForm.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const valorBusqueda = searchInput.value;
  obtenerPokemon(valorBusqueda);
});

// Carga inicial por defecto con Ditto
obtenerPokemon();

// --- Lógica del selector de Tema Claro / Oscuro ---
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-icon");

// Comprobar preferencia guardada
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-theme");
  themeIcon.textContent = "dark_mode";
} else {
  themeIcon.textContent = "light_mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const isLight = document.body.classList.contains("light-theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeIcon.textContent = isLight ? "dark_mode" : "light_mode";
});
