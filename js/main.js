import { obtenerDatosPokemon } from "./api.js";
import { mostrarCargandoDetalle, mostrarErrorDetalle, renderizarDetalle } from "./detail.js";
import { inicializarDashboard, limpiarFiltros } from "./dashboard.js";
import { inicializarRegiones } from "./regions.js";
import { inicializarGeneraciones } from "./generations.js";
import { inicializarMovesExplorer } from "./moves.js";

// Referencias del DOM globales e intermodulares
export const searchForm = document.getElementById("search-form");
export const searchInput = document.getElementById("search-input");
export const detailView = document.getElementById("detail-view");
export const dashboardView = document.getElementById("dashboard-view");
export const regionsView = document.getElementById("regions-view");
export const generationsView = document.getElementById("generations-view");
export const movesView = document.getElementById("moves-view");
export const backToListBtn = document.getElementById("back-to-list-btn");

const navPokemonBtn = document.getElementById("nav-pokemon-btn");
const navRegionsBtn = document.getElementById("nav-regions-btn");
const navGenerationsBtn = document.getElementById("nav-generations-btn");
const navMovesBtn = document.getElementById("nav-moves-btn");
const clearFilterBtn = document.getElementById("clear-filter-btn");

// Función principal para obtener datos de un Pokémon y cargar su ficha
export async function obtenerPokemon(busqueda, esCargaInicial = false) {
  if (!busqueda || !busqueda.trim()) return;

  // Cambiar vista al detalle si no es la carga inicial
  if (!esCargaInicial) {
    cambiarVista("detalle");
  }
  mostrarCargandoDetalle();

  try {
    const datos = await obtenerDatosPokemon(busqueda);
    renderizarDetalle(datos);
  } catch (error) {
    console.error("Error al obtener el Pokémon:", error);
    mostrarErrorDetalle(error.message);
  }
}

// Alternar entre las vistas de listado (dashboard), regiones (regions), generaciones (generations), movimientos (moves) y ficha (detalle)
export function cambiarVista(vista) {
  const isDesktop = window.innerWidth >= 900;

  if (vista === "detalle") {
    if (!isDesktop) {
      // En móvil, sí ocultamos la lista y mostramos el detalle
      detailView.classList.add("active");
      dashboardView.classList.remove("active");
      regionsView.classList.remove("active");
      generationsView.classList.remove("active");
      movesView.classList.remove("active");
    }
    // En desktop, el detalle ya es visible en la izquierda por defecto.
    // Retornamos sin desactivar la lista derecha para que no quede vacía.
    return;
  }

  // Remover active de todos los contenedores de vista
  detailView.classList.remove("active");
  dashboardView.classList.remove("active");
  regionsView.classList.remove("active");
  generationsView.classList.remove("active");
  movesView.classList.remove("active");

  // Ajustar active en la barra de navegación global
  navPokemonBtn.classList.remove("active");
  navRegionsBtn.classList.remove("active");
  navGenerationsBtn.classList.remove("active");
  navMovesBtn.classList.remove("active");

  if (vista === "dashboard") {
    dashboardView.classList.add("active");
    navPokemonBtn.classList.add("active");
  } else if (vista === "regions") {
    regionsView.classList.add("active");
    navRegionsBtn.classList.add("active");
  } else if (vista === "generations") {
    generationsView.classList.add("active");
    navGenerationsBtn.classList.add("active");
  } else if (vista === "moves") {
    movesView.classList.add("active");
    navMovesBtn.classList.add("active");
  }
}

// --- Vinculación de Eventos ---

// Buscador
searchForm.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const valorBusqueda = searchInput.value;
  if (valorBusqueda.trim()) {
    obtenerPokemon(valorBusqueda);
  }
});

// Botón volver
backToListBtn.addEventListener("click", () => {
  cambiarVista("dashboard");
});

// Botones de la Barra de Navegación Global
navPokemonBtn.addEventListener("click", () => {
  limpiarFiltros();
  cambiarVista("dashboard");
});

navRegionsBtn.addEventListener("click", () => {
  cambiarVista("regions");
});

navGenerationsBtn.addEventListener("click", () => {
  cambiarVista("generations");
});

navMovesBtn.addEventListener("click", () => {
  cambiarVista("moves");
});

// Botón para limpiar filtro activo en el listado
clearFilterBtn.addEventListener("click", () => {
  limpiarFiltros();
});

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

// --- Inicialización de la Aplicación ---
inicializarDashboard();
inicializarRegiones();
inicializarGeneraciones();
inicializarMovesExplorer();
obtenerPokemon("pikachu", true);



