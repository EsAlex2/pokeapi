import { obtenerGeneraciones, obtenerDetalleGeneracion } from "./api.js";
import { cargarGeneracion } from "./dashboard.js";
import { cambiarVista } from "./main.js";

const generationsGrid = document.getElementById("generations-grid");

const generationDisplayData = {
  "generation-i": { titulo: "Generación I", region: "Kanto", juego: "Rojo / Azul / Amarillo", icono: "filter_1" },
  "generation-ii": { titulo: "Generación II", region: "Johto", juego: "Oro / Plata / Cristal", icono: "filter_2" },
  "generation-iii": { titulo: "Generación III", region: "Hoenn", juego: "Rubí / Zafiro / Esmeralda", icono: "filter_3" },
  "generation-iv": { titulo: "Generación IV", region: "Sinnoh", juego: "Diamante / Perla / Platino", icono: "filter_4" },
  "generation-v": { titulo: "Generación V", region: "Teselia", juego: "Negro / Blanco (1 y 2)", icono: "filter_5" },
  "generation-vi": { titulo: "Generación VI", region: "Kalos", juego: "X / Y", icono: "filter_6" },
  "generation-vii": { titulo: "Generación VII", region: "Alola", juego: "Sol / Luna / Ultra", icono: "filter_7" },
  "generation-viii": { titulo: "Generación VIII", region: "Galar", juego: "Espada / Escudo / Arceus", icono: "filter_8" },
  "generation-ix": { titulo: "Generación IX", region: "Paldea", juego: "Escarlata / Púrpura", icono: "filter_9" }
};

// Inicializar la vista de generaciones
export async function inicializarGeneraciones() {
  generationsGrid.innerHTML = `
    <div class="loader-stage" style="grid-column: 1 / -1; padding: 4rem 1rem;">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando lista de generaciones...</p>
    </div>
  `;

  try {
    const data = await obtenerGeneraciones();
    
    // Filtrar para mostrar solo las generaciones canonicales de nuestro mapa
    const gensFiltradas = data.results.filter(g => generationDisplayData[g.name]);
    
    renderizarGeneraciones(gensFiltradas);
  } catch (error) {
    console.error("Error al inicializar las generaciones:", error);
    generationsGrid.innerHTML = `
      <div class="error-stage" style="grid-column: 1 / -1; padding: 3rem 1rem;">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo cargar la lista de generaciones. Verifica tu conexión.</p>
      </div>
    `;
  }
}

// Renderiza las tarjetas de generaciones en el DOM
function renderizarGeneraciones(generaciones) {
  generationsGrid.innerHTML = "";

  generaciones.forEach((gen) => {
    const info = generationDisplayData[gen.name];
    const card = document.createElement("div");
    card.className = "generation-card animate-fade-in";

    card.innerHTML = `
      <div class="generation-card-icon">
        <span class="material-symbols-outlined">${info.icono || "history"}</span>
      </div>
      <div class="generation-card-info">
        <h3>${info.titulo}</h3>
        <p>Región principal: <strong>${info.region}</strong></p>
        <p class="gen-games">${info.juego}</p>
      </div>
      <div class="generation-card-action">
        <span class="material-symbols-outlined">chevron_right</span>
      </div>
    `;

    card.addEventListener("click", () => {
      cargarEspeciesGeneracion(gen.url, info.titulo);
    });

    generationsGrid.appendChild(card);
  });
}

// Carga los Pokémon de la generación seleccionada y cambia la vista
async function cargarEspeciesGeneracion(url, nombreGen) {
  generationsGrid.innerHTML = `
    <div class="loader-stage" style="grid-column: 1 / -1; padding: 4rem 1rem;">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando Pokémon introducidos en la ${nombreGen}...</p>
    </div>
  `;

  try {
    const data = await obtenerDetalleGeneracion(url);
    
    // Cambiar al listado y cargar datos de la generación
    cargarGeneracion(data.pokemon_species, nombreGen);
    cambiarVista("dashboard");
    
    // Recargar la vista en background para mantenerla disponible
    inicializarGeneraciones();
  } catch (error) {
    console.error("Error al cargar la generación:", error);
    inicializarGeneraciones(); // Resetear vista
    alert(`No se pudo cargar la ${nombreGen}.`);
  }
}
