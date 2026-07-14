import { obtenerDetalleTipo } from "./api.js";
import { cargarTipo } from "./dashboard.js";
import { cambiarVista } from "./main.js";
import { typeColors, typeTranslations } from "./config.js";
import { capitalizar } from "./utils.js";

// Lista de los 18 tipos canonicales de Pokémon
const TIPOS_LISTADO = [
  "normal", "fire", "water", "grass", "electric", "ice", 
  "fighting", "poison", "ground", "flying", "psychic", "bug", 
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// Mapeo de iconos temáticos aproximados para cada tipo para dar una estética premium
const tipoIconos = {
  normal: "lens",
  fire: "local_fire_department",
  water: "water_drop",
  grass: "eco",
  electric: "bolt",
  ice: "ac_unit",
  fighting: "sports_martial_arts",
  poison: "science",
  ground: "landscape",
  flying: "air",
  psychic: "psychology",
  bug: "pest_control",
  rock: "public",
  ghost: "skull",
  dragon: "pets",
  dark: "nights_stay",
  steel: "build",
  fairy: "auto_awesome"
};

let typesContent;

// Inicializa el contenedor y renderiza el listado inicial
export function inicializarTipos() {
  typesContent = document.getElementById("types-content");
  mostrarListadoDeTipos();
}

// Dibuja el listado de los 18 tipos
export function mostrarListadoDeTipos() {
  if (!typesContent) return;

  typesContent.innerHTML = `
    <div class="types-grid">
      ${TIPOS_LISTADO.map(tipo => {
        const trad = typeTranslations[tipo] || tipo;
        const color = typeColors[tipo] || "#777777";
        const icono = tipoIconos[tipo] || "category";
        return `
          <div class="type-card animate-fade-in" data-type="${tipo}" style="--type-color: ${color}">
            <div class="type-card-glow"></div>
            <div class="type-card-icon">
              <span class="material-symbols-outlined">${icono}</span>
            </div>
            <span class="type-card-name">${capitalizar(trad)}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;

  // Asignar eventos de clic a cada tarjeta de tipo
  const cards = typesContent.querySelectorAll(".type-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const tipo = card.dataset.type;
      mostrarDetalleDeTipo(tipo);
    });
  });
}

// Carga los detalles de un tipo y renderiza la "Ficha de Tipo"
export async function mostrarDetalleDeTipo(tipoName) {
  if (!typesContent) return;

  // Mostrar indicador de carga
  typesContent.innerHTML = `
    <div class="loader-stage" style="padding: 6rem 1rem;">
      <div class="loader-spinner"></div>
      <p>Cargando relaciones de daño para el tipo <strong>${capitalizar(typeTranslations[tipoName] || tipoName)}</strong>...</p>
    </div>
  `;

  try {
    const data = await obtenerDetalleTipo(tipoName);
    renderizarFichaTipo(data);
  } catch (error) {
    console.error("Error al obtener detalles del tipo:", error);
    typesContent.innerHTML = `
      <div class="error-stage" style="padding: 3rem 1rem;">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo cargar la información del tipo seleccionado. Verifica tu conexión.</p>
        <button id="retry-types-list-btn" class="back-btn" style="margin-top: 1rem;">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver al listado
        </button>
      </div>
    `;
    document.getElementById("retry-types-list-btn")?.addEventListener("click", mostrarListadoDeTipos);
  }
}

// Renderiza los datos en la Ficha de Tipo
function renderizarFichaTipo(data) {
  const nameEn = data.name;
  const nameEs = typeTranslations[nameEn] || nameEn;
  const colorBase = typeColors[nameEn] || "#777777";
  const totalPokemon = data.pokemon ? data.pokemon.length : 0;

  // Obtener relaciones
  const rel = data.damage_relations;

  // Renderizar un grupo de badges de tipo
  const crearGrupoBadges = (listaTipos) => {
    if (!listaTipos || listaTipos.length === 0) {
      return `<span class="no-relations-text">Ninguno</span>`;
    }
    return listaTipos.map(t => {
      const trad = typeTranslations[t.name] || t.name;
      const color = typeColors[t.name] || "#777777";
      return `
        <span class="type-badge-mini type-badge-clickable" 
              data-type="${t.name}" 
              style="--badge-color: ${color}; cursor: pointer; padding: 0.3rem 0.75rem; font-size: 0.75rem;">
          ${capitalizar(trad)}
        </span>
      `;
    }).join("");
  };

  typesContent.innerHTML = `
    <div class="type-detail-card animate-fade-in" style="--detail-type-color: ${colorBase}">
      <div class="detail-card-header">
        <button id="back-to-types-list" class="back-to-list-icon-btn" aria-label="Volver al listado de tipos">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="detail-type-header-title">
          <span class="material-symbols-outlined type-header-icon">${tipoIconos[nameEn] || "category"}</span>
          <h2>Tipo ${capitalizar(nameEs)}</h2>
        </div>
      </div>

      <div class="relations-container">
        <!-- Eficacia Ofensiva -->
        <div class="relations-column">
          <h3 class="relations-sec-title attack-title">
            <span class="material-symbols-outlined title-icon">swords</span>
            Eficacia Ofensiva (Al Atacar)
          </h3>
          <div class="relation-row">
            <span class="relation-label label-strong">Daño Súper Efectivo (x2):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.double_damage_to)}</div>
          </div>
          <div class="relation-row">
            <span class="relation-label label-weak">Daño Poco Efectivo (x0.5):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.half_damage_to)}</div>
          </div>
          <div class="relation-row">
            <span class="relation-label label-immune">Sin Efecto (x0):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.no_damage_to)}</div>
          </div>
        </div>

        <!-- Eficacia Defensiva -->
        <div class="relations-column">
          <h3 class="relations-sec-title defense-title">
            <span class="material-symbols-outlined title-icon">shield</span>
            Eficacia Defensiva (Al Defender)
          </h3>
          <div class="relation-row">
            <span class="relation-label label-vulnerable">Vulnerable a (x2):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.double_damage_from)}</div>
          </div>
          <div class="relation-row">
            <span class="relation-label label-resistant">Resistente a (x0.5):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.half_damage_from)}</div>
          </div>
          <div class="relation-row">
            <span class="relation-label label-immune-def">Inmune a (x0):</span>
            <div class="badges-wrapper">${crearGrupoBadges(rel.no_damage_from)}</div>
          </div>
        </div>
      </div>

      <div class="filter-action-section">
        <p class="action-description">Se registraron <strong>${totalPokemon} Pokémon</strong> de tipo ${nameEs}.</p>
        <button id="view-type-pokemon-btn" class="view-pokemon-btn">
          <span class="material-symbols-outlined">grid_view</span>
          Ver Pokémon de Tipo ${capitalizar(nameEs)}
        </button>
      </div>
    </div>
  `;

  // Asignar evento al botón de volver
  document.getElementById("back-to-types-list").addEventListener("click", mostrarListadoDeTipos);

  // Asignar evento al botón de filtrar en el dashboard
  document.getElementById("view-type-pokemon-btn").addEventListener("click", () => {
    if (data.pokemon && data.pokemon.length > 0) {
      cargarTipo(data.pokemon, nameEs);
      cambiarVista("dashboard");
    } else {
      alert("No hay ningún Pokémon registrado para este tipo.");
    }
  });

  // Asignar clics a los badges de la relación para navegar entre tipos
  const relatedBadges = typesContent.querySelectorAll(".type-badge-clickable");
  relatedBadges.forEach(badge => {
    badge.addEventListener("click", () => {
      const subTipo = badge.dataset.type;
      mostrarDetalleDeTipo(subTipo);
    });
  });
}
