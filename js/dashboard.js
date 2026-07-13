import { typeColors, typeTranslations } from "./config.js";
import { capitalizar } from "./utils.js";
import { obtenerListadoPokemon, obtenerDetallesPorUrl } from "./api.js";
import { obtenerPokemon, cambiarVista, searchForm } from "./main.js";

const pokemonGrid = document.getElementById("pokemon-grid");
const counterText = document.getElementById("counter-text");
const paginationContainer = document.getElementById("pagination-container");

let limit = 20;
let offset = 0;
let totalPokemon = 0;
let paginaActual = 1;
let totalPaginas = 1;
let cargandoDashboard = false;

// Estado del filtrado por región, generación o movimiento
let modoListado = "global"; // "global", "region", "generation" o "move"
let regionEntries = [];
let nombreRegionActiva = "";
let generationEntries = [];
let nombreGeneracionActiva = "";
let moveEntries = [];
let nombreMovimientoActivo = "";

// Elementos del Banner de Filtro
const filterBanner = document.getElementById("filter-banner");
const filterBannerText = document.getElementById("filter-banner-text");

// Inicializa el listado principal
export function inicializarDashboard() {
  cargarDashboard();
}

// Carga Pokémon de la API para la página actual y reemplaza el grid
export async function cargarDashboard() {
  if (cargandoDashboard) return;
  cargandoDashboard = true;

  // Limpiar el grid y mostrar spinner de carga
  pokemonGrid.innerHTML = `
    <div class="loader-stage" style="grid-column: 1 / -1; padding: 4rem 1rem;">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando listado de Pokémon...</p>
    </div>
  `;

  // Ocultar paginador temporalmente mientras carga
  paginationContainer.style.opacity = "0.5";
  paginationContainer.style.pointerEvents = "none";

  // Mostrar u ocultar banner de filtro activo
  if (modoListado === "region") {
    filterBanner.classList.add("active");
    filterBannerText.textContent = `Región: ${capitalizar(nombreRegionActiva)}`;
  } else if (modoListado === "generation") {
    filterBanner.classList.add("active");
    filterBannerText.textContent = `Generación: ${nombreGeneracionActiva}`;
  } else if (modoListado === "move") {
    filterBanner.classList.add("active");
    filterBannerText.textContent = `Movimiento: ${nombreMovimientoActivo}`;
  } else {
    filterBanner.classList.remove("active");
  }

  try {
    let results = [];
    if (modoListado === "global") {
      const data = await obtenerListadoPokemon(offset, limit);
      totalPokemon = data.count;
      results = data.results;
    } else if (modoListado === "region") {
      totalPokemon = regionEntries.length;
      const slice = regionEntries.slice(offset, offset + limit);
      results = slice.map((entry) => {
        const urlParts = entry.pokemon_species.url.split("/");
        const id = urlParts[urlParts.length - 2];
        return { url: `https://pokeapi.co/api/v2/pokemon/${id}` };
      });
    } else if (modoListado === "generation") {
      totalPokemon = generationEntries.length;
      const slice = generationEntries.slice(offset, offset + limit);
      results = slice.map((entry) => {
        const urlParts = entry.url.split("/");
        const id = urlParts[urlParts.length - 2];
        return { url: `https://pokeapi.co/api/v2/pokemon/${id}` };
      });
    } else if (modoListado === "move") {
      totalPokemon = moveEntries.length;
      const slice = moveEntries.slice(offset, offset + limit);
      results = slice.map((entry) => {
        return { url: entry.url };
      });
    }

    totalPaginas = Math.ceil(totalPokemon / limit);
    paginaActual = Math.floor(offset / limit) + 1;

    // Obtener detalles de todos en paralelo
    const pokemonPagina = await Promise.all(
      results.map(async (p) => {
        try {
          return await obtenerDetallesPorUrl(p.url);
        } catch {
          return null;
        }
      })
    );

    // Filtrar fallidos y limpiar cargador local antes de renderizar
    const pokemonValidos = pokemonPagina.filter((p) => p !== null);
    pokemonGrid.innerHTML = "";

    pokemonValidos.forEach((p) => {
      const card = crearTarjetaCompacta(p);
      pokemonGrid.appendChild(card);
    });

    // Actualizar contador
    const inicio = offset + 1;
    const fin = Math.min(offset + limit, totalPokemon);
    counterText.textContent = `Mostrando ${inicio}-${fin} de ${totalPokemon} Pokémon`;

    // Renderizar los controles del paginador
    renderizarPaginador();
  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    pokemonGrid.innerHTML = `
      <div class="error-stage" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo cargar el listado de Pokémon. Verifica tu conexión.</p>
      </div>
    `;
    paginationContainer.innerHTML = "";
  } finally {
    cargandoDashboard = false;
    paginationContainer.style.opacity = "1";
    paginationContainer.style.pointerEvents = "auto";
  }
}

// Activa el modo de región con su conjunto de datos y recarga el listado
export function cargarRegion(entries, nombre) {
  modoListado = "region";
  regionEntries = entries;
  nombreRegionActiva = nombre;
  offset = 0;
  cargarDashboard();
}

// Activa el modo de generación con su conjunto de datos y recarga el listado
export function cargarGeneracion(entries, nombre) {
  modoListado = "generation";
  generationEntries = entries;
  nombreGeneracionActiva = nombre;
  offset = 0;
  cargarDashboard();
}

// Limpia todos los filtros y retorna al listado global
export function limpiarFiltros() {
  modoListado = "global";
  regionEntries = [];
  nombreRegionActiva = "";
  generationEntries = [];
  nombreGeneracionActiva = "";
  moveEntries = [];
  nombreMovimientoActivo = "";
  offset = 0;
  cargarDashboard();
}

// Carga los Pokémon que aprenden el movimiento seleccionado
export function cargarMovimiento(entries, nombre) {
  modoListado = "move";
  moveEntries = entries;
  nombreMovimientoActivo = nombre;
  offset = 0;
  cargarDashboard();
}



// Genera el elemento DOM para cada tarjeta compacta del listado
function crearTarjetaCompacta(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-compact-card animate-fade-in";

  const tipoPrincipal = pokemon.types[0].type.name;
  const colorBase = typeColors[tipoPrincipal] || "#777777";
  card.style.setProperty("--pokemon-theme-color", colorBase);

  const idFormateado = `#${pokemon.id.toString().padStart(4, "0")}`;
  const nombreFormateado = capitalizar(pokemon.name);

  const imagenUrl =
    `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokemon.id}.png` ||
    pokemon.sprites.front_default ||
    "https://raw.githubusercontent.com/PokeAPI/sprites@master/sprites/items/poke-ball.png";

  const tiposHTML = pokemon.types
    .map((t) => {
      const nombreTipo = t.type.name;
      const tradTipo = typeTranslations[nombreTipo] || nombreTipo;
      const colorTipo = typeColors[nombreTipo] || "#777777";
      return `<span class="type-badge-mini" style="--badge-color: ${colorTipo}">${capitalizar(tradTipo)}</span>`;
    })
    .join("");

  card.innerHTML = `
    <span class="compact-id">${idFormateado}</span>
    <img 
      src="${imagenUrl}" 
      alt="${nombreFormateado}" 
      class="compact-img" 
      onerror="this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/poke-ball.png';"
    />
    <h3 class="compact-name">${nombreFormateado}</h3>
    <div class="compact-types">${tiposHTML}</div>
  `;

  // Abrir detalle al hacer clic
  card.addEventListener("click", () => {
    obtenerPokemon(pokemon.name);
  });

  return card;
}

// Genera e inyecta los botones del paginador en el DOM
function renderizarPaginador() {
  paginationContainer.innerHTML = "";

  // Botón Anterior
  const btnPrev = document.createElement("button");
  btnPrev.className = "pager-btn prev-btn";
  btnPrev.innerHTML = `<span class="material-symbols-outlined">chevron_left</span>`;
  btnPrev.disabled = paginaActual === 1;
  btnPrev.setAttribute("aria-label", "Página anterior");
  btnPrev.addEventListener("click", () => {
    irAPagina(paginaActual - 1);
  });
  paginationContainer.appendChild(btnPrev);

  // Rango de páginas a mostrar
  const range = [];
  const delta = 1;
  const left = paginaActual - delta;
  const right = paginaActual + delta;
  let l;

  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= left && i <= right)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        paginationContainer.appendChild(crearBotonPagina(l + 1));
      } else if (i - l > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pager-ellipsis";
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }
    }
    paginationContainer.appendChild(crearBotonPagina(i));
    l = i;
  });

  // Botón Siguiente
  const btnNext = document.createElement("button");
  btnNext.className = "pager-btn next-btn";
  btnNext.innerHTML = `<span class="material-symbols-outlined">chevron_right</span>`;
  btnNext.disabled = paginaActual === totalPaginas;
  btnNext.setAttribute("aria-label", "Página siguiente");
  btnNext.addEventListener("click", () => {
    irAPagina(paginaActual + 1);
  });
  paginationContainer.appendChild(btnNext);
}

// Crea un botón numérico individual
function crearBotonPagina(pag) {
  const btn = document.createElement("button");
  btn.className = `pager-btn num-btn ${pag === paginaActual ? "active" : ""}`;
  btn.textContent = pag;
  btn.addEventListener("click", () => {
    if (pag !== paginaActual) {
      irAPagina(pag);
    }
  });
  return btn;
}

// Navega hacia una página específica
function irAPagina(pag) {
  offset = (pag - 1) * limit;
  cargarDashboard();
  // Hacer scroll suave hacia la cabecera del listado
  const formOffset = searchForm.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: formOffset - 20, behavior: "smooth" });
}
