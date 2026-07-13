import { obtenerTodosLosMovimientos, obtenerDetalleMovimiento } from "./api.js";
import { cargarMovimiento } from "./dashboard.js";
import { cambiarVista } from "./main.js";
import { capitalizar } from "./utils.js";
import { commonMoveTranslations } from "./config.js";

const searchInput = document.getElementById("moves-search-input");
const popularMovesList = document.getElementById("popular-moves-list");
const searchResults = document.getElementById("moves-search-results");

// Estado local del módulo
let todosLosMovimientos = [];

// Listado estático de movimientos populares con sus URLs típicas
const popularMoves = [
  { name: "tackle", url: "https://pokeapi.co/api/v2/move/33/" },
  { name: "flamethrower", url: "https://pokeapi.co/api/v2/move/53/" },
  { name: "hydro-pump", url: "https://pokeapi.co/api/v2/move/56/" },
  { name: "thunderbolt", url: "https://pokeapi.co/api/v2/move/85/" },
  { name: "surf", url: "https://pokeapi.co/api/v2/move/57/" },
  { name: "earthquake", url: "https://pokeapi.co/api/v2/move/89/" },
  { name: "hyper-beam", url: "https://pokeapi.co/api/v2/move/63/" },
  { name: "psychic", url: "https://pokeapi.co/api/v2/move/94/" }
];

// Inicializar el buscador de movimientos
export async function inicializarMovesExplorer() {
  renderizarPopulares();

  try {
    // Indexar en background la lista completa de movimientos (nombres y URLs)
    const data = await obtenerTodosLosMovimientos();
    todosLosMovimientos = data.results;
    
    // Configurar el escuchador de búsqueda
    searchInput.addEventListener("input", manejarBusqueda);
  } catch (error) {
    console.error("Error al indexar los movimientos para el buscador:", error);
  }
}

// Dibuja los accesos rápidos de movimientos populares
function renderizarPopulares() {
  popularMovesList.innerHTML = "";

  popularMoves.forEach((move) => {
    // Intentar traducir
    const nombreTraducido = commonMoveTranslations[move.name] || capitalizar(move.name.replace(/-/g, " "));
    const btn = document.createElement("button");
    btn.className = "popular-move-btn";
    btn.innerHTML = `
      <span class="material-symbols-outlined btn-icon">bolt</span>
      ${nombreTraducido}
    `;

    btn.addEventListener("click", () => {
      cargarEspeciesConMovimiento(move.url, nombreTraducido);
    });

    popularMovesList.appendChild(btn);
  });
}

// Filtra la lista en memoria según la consulta del usuario (inglés o español)
function manejarBusqueda() {
  const query = searchInput.value.trim().toLowerCase();
  
  if (query.length < 2) {
    searchResults.innerHTML = "";
    return;
  }

  // Filtrar de los movimientos indexados
  const resultadosFiltrados = todosLosMovimientos.filter((m) => {
    const nameEn = m.name.toLowerCase();
    const nameEs = (commonMoveTranslations[m.name] || "").toLowerCase();
    return nameEn.includes(query) || nameEs.includes(query);
  });

  renderizarResultados(resultadosFiltrados.slice(0, 12)); // Limitar a 12 sugerencias para rendimiento
}

// Renderiza los resultados de búsqueda coincidente en el DOM
function renderizarResultados(resultados) {
  if (resultados.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results-moves">
        <span class="material-symbols-outlined">sentiment_dissatisfied</span>
        <p>No se encontraron movimientos que coincidan.</p>
      </div>
    `;
    return;
  }

  searchResults.innerHTML = "";

  resultados.forEach((m) => {
    const nombreTraducido = commonMoveTranslations[m.name] || capitalizar(m.name.replace(/-/g, " "));
    const item = document.createElement("div");
    item.className = "move-suggestion-card animate-fade-in";
    item.innerHTML = `
      <div class="suggestion-info">
        <h4>${nombreTraducido}</h4>
        <span class="suggestion-key">${m.name.replace(/-/g, " ")}</span>
      </div>
      <span class="material-symbols-outlined action-icon">arrow_forward</span>
    `;

    item.addEventListener("click", () => {
      cargarEspeciesConMovimiento(m.url, nombreTraducido);
    });

    searchResults.appendChild(item);
  });
}

// Realiza la petición del detalle del movimiento y redirige al dashboard filtrado
async function cargarEspeciesConMovimiento(url, nombreMovimiento) {
  // Limpiar buscador y resultados para la próxima vez
  searchInput.value = "";
  searchResults.innerHTML = "";

  // Mostrar spinner global en la pantalla activa temporalmente
  const movesView = document.getElementById("moves-view");
  const contenidoOriginal = movesView.innerHTML;
  
  movesView.innerHTML = `
    <div class="loader-stage" style="padding: 6rem 1rem;">
      <div class="loader-spinner"></div>
      <p>Buscando Pokémon que pueden aprender <strong>${nombreMovimiento}</strong>...</p>
    </div>
  `;

  try {
    const data = await obtenerDetalleMovimiento(url);
    
    // Restaurar el HTML original de la pantalla de búsqueda
    movesView.innerHTML = contenidoOriginal;
    // Re-vincular elementos del DOM que se perdieron en el innerHTML replacement
    const nuevoInput = document.getElementById("moves-search-input");
    const nuevoPopularList = document.getElementById("popular-moves-list");
    const nuevoSearchResults = document.getElementById("moves-search-results");
    
    // Actualizar referencias y volver a inicializar
    document.getElementById("moves-search-input").addEventListener("input", manejarBusqueda);
    inicializarMovesExplorer(); // Restablece los botones de populares y sus eventos

    const spanishNameEntry = data.names?.find(n => n.language.name === "es");
    const nombreOficialEs = spanishNameEntry ? spanishNameEntry.name : nombreMovimiento;

    if (!data.learned_by_pokemon || data.learned_by_pokemon.length === 0) {
      alert(`Ningún Pokémon registrado puede aprender ${nombreOficialEs} en esta versión.`);
      return;
    }

    // Cargar listado en el Dashboard y redirigir
    cargarMovimiento(data.learned_by_pokemon, nombreOficialEs);
    cambiarVista("dashboard");
  } catch (error) {
    console.error("Error al cargar Pokémon por movimiento:", error);
    alert("Hubo un error al obtener la lista de Pokémon para este movimiento.");
    // Restaurar vista
    movesView.innerHTML = contenidoOriginal;
    inicializarMovesExplorer();
  }
}
