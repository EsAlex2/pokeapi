import { obtenerRegionesPokedex, obtenerDetallePokedex } from "./api.js";
import { cargarRegion } from "./dashboard.js";
import { cambiarVista } from "./main.js";

const regionsGrid = document.getElementById("regions-grid");

const regionDisplayData = {
  "kanto": { titulo: "Kanto", sub: "1ª Generación - Rubí/Zafiro Orígenes", icono: "landscape" },
  "original-johto": { titulo: "Johto", sub: "2ª Generación - Oro, Plata y Cristal", icono: "water_lux" },
  "hoenn": { titulo: "Hoenn", sub: "3ª Generación - Rubí, Zafiro y Esmeralda", icono: "forest" },
  "original-sinnoh": { titulo: "Sinnoh", sub: "4ª Generación - Diamante y Perla", icono: "filter_hdr" },
  "original-unova": { titulo: "Teselia (Unova)", sub: "5ª Generación - Blanco y Negro", icono: "apartment" },
  "kalos-central": { titulo: "Kalos (Central)", sub: "6ª Generación - Pokémon X e Y", icono: "castle" },
  "original-alola": { titulo: "Alola", sub: "7ª Generación - Sol y Luna", icono: "tsunami" },
  "galar": { titulo: "Galar", sub: "8ª Generación - Espada y Escudo", icono: "fort" },
  "hisui": { titulo: "Hisui", sub: "Región de Sinnoh del Pasado", icono: "volcano" },
  "paldea": { titulo: "Paldea", sub: "9ª Generación - Escarlata y Púrpura", icono: "explore" }
};

// Inicializar la vista de regiones
export async function inicializarRegiones() {
  regionsGrid.innerHTML = `
    <div class="loader-stage" style="grid-column: 1 / -1; padding: 4rem 1rem;">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando lista de regiones...</p>
    </div>
  `;

  try {
    const data = await obtenerRegionesPokedex();
    
    // Filtrar para mostrar solo las regiones canonicales definidas en nuestro mapa
    const pokedexesFiltradas = data.results.filter(p => regionDisplayData[p.name]);
    
    renderizarBotonesRegiones(pokedexesFiltradas);
  } catch (error) {
    console.error("Error al inicializar las regiones:", error);
    regionsGrid.innerHTML = `
      <div class="error-stage" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo cargar la lista de regiones. Verifica tu conexión.</p>
      </div>
    `;
  }
}

// Renderiza los botones de regiones en el DOM
function renderizarBotonesRegiones(pokedexes) {
  regionsGrid.innerHTML = "";

  pokedexes.forEach((dex) => {
    const info = regionDisplayData[dex.name];
    const card = document.createElement("div");
    card.className = "region-card animate-fade-in";

    card.innerHTML = `
      <div class="region-card-icon">
        <span class="material-symbols-outlined">${info.icono || "map"}</span>
      </div>
      <div class="region-card-info">
        <h3>${info.titulo}</h3>
        <p>${info.sub}</p>
      </div>
      <div class="region-card-action">
        <span class="material-symbols-outlined">chevron_right</span>
      </div>
    `;

    card.addEventListener("click", () => {
      cargarPokedexRegional(dex.url, info.titulo);
    });

    regionsGrid.appendChild(card);
  });
}

// Carga los Pokémon de la Pokédex seleccionada y cambia la vista
async function cargarPokedexRegional(url, nombreRegion) {
  // Mostrar pantalla de carga
  regionsGrid.innerHTML = `
    <div class="loader-stage" style="grid-column: 1 / -1; padding: 4rem 1rem;">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando especies de la Pokédex de ${nombreRegion}...</p>
    </div>
  `;

  try {
    const data = await obtenerDetallePokedex(url);
    
    // Cambiar al listado de Pokémon y pasar los datos filtrados
    cargarRegion(data.pokemon_entries, nombreRegion);
    cambiarVista("dashboard");
    
    // Recargar la vista de regiones en background para que quede disponible para después
    inicializarRegiones();
  } catch (error) {
    console.error("Error al cargar la Pokedex regional:", error);
    inicializarRegiones(); // Resetear vista
    alert(`No se pudo cargar la Pokédex de ${nombreRegion}.`);
  }
}
