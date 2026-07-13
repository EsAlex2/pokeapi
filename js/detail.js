import { typeColors, statNamesEs, typeTranslations, commonMoveTranslations } from "./config.js";
import { capitalizar, extraerIdDeUrl } from "./utils.js";
import { obtenerEspecie, obtenerCadenaEvolutiva, obtenerDetalleMovimiento } from "./api.js";
import { obtenerPokemon } from "./main.js";

const pokemonDetailContainer = document.getElementById("pokemon-detail-container");

// Configurar cierre del modal de movimientos a nivel de módulo
const modal = document.getElementById("move-detail-modal");
const closeBtn = document.getElementById("close-modal-btn");
if (modal && closeBtn) {
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

// Renderiza un spinner de carga en la vista de detalle
export function mostrarCargandoDetalle() {
  pokemonDetailContainer.innerHTML = `
    <div class="loader-container">
      <div class="loader-spinner"></div>
      <p>Cargando información...</p>
    </div>
  `;
}

// Renderiza una tarjeta de error en la vista de detalle
export function mostrarErrorDetalle(mensaje) {
  pokemonDetailContainer.innerHTML = `
    <div class="error-card animate-fade-in">
      <span class="material-symbols-outlined error-icon">error</span>
      <h3>¡Oops! Algo salió mal</h3>
      <p>${mensaje}</p>
    </div>
  `;
}

// Renderiza la tarjeta con los detalles del Pokémon en el DOM
export function renderizarDetalle(pokemon) {
  const tipoPrincipal = pokemon.types[0].type.name;
  const colorBase = typeColors[tipoPrincipal] || "#777777";

  const idFormateado = `#${pokemon.id.toString().padStart(4, "0")}`;
  const nombreFormateado = capitalizar(pokemon.name);

  // Imagen de alta calidad con jsDelivr
  const imagenUrl =
    `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${pokemon.id}.png` ||
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

  const tiposHTML = pokemon.types
    .map((t) => {
      const nombreTipo = t.type.name;
      const tradTipo = typeTranslations[nombreTipo] || nombreTipo;
      const colorTipo = typeColors[nombreTipo] || "#777777";
      return `<span class="type-badge" style="--badge-color: ${colorTipo}">${capitalizar(tradTipo)}</span>`;
    })
    .join("");

  const habilidades = pokemon.abilities
    .map((a) => capitalizar(a.ability.name.replace("-", " ")))
    .join(", ");

  const pesoKg = (pokemon.weight / 10).toFixed(1);
  const alturaM = (pokemon.height / 10).toFixed(1);

  const estadisticasHTML = pokemon.stats
    .map((s) => {
      const nombreEst = statNamesEs[s.stat.name] || capitalizar(s.stat.name);
      const valor = s.base_stat;
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

  pokemonDetailContainer.innerHTML = `
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
        <!-- Barra de Pestañas -->
        <div class="pokemon-tabs">
          <button class="tab-btn active" data-tab="tab-stats" style="--active-color: ${colorBase}">Combate</button>
          <button class="tab-btn" data-tab="tab-evolutions" style="--active-color: ${colorBase}">Evoluciones</button>
          <button class="tab-btn" data-tab="tab-moves" style="--active-color: ${colorBase}">Movimientos</button>
        </div>

        <!-- Pestaña 1: Combate -->
        <div id="tab-stats" class="tab-content active">
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

        <!-- Pestaña 2: Evoluciones -->
        <div id="tab-evolutions" class="tab-content">
          <!-- Se cargará de forma asíncrona -->
        </div>

        <!-- Pestaña 3: Movimientos -->
        <div id="tab-moves" class="tab-content">
          <!-- Se cargará de forma asíncrona -->
        </div>
      </div>
    </div>
  `;

  // Asignar controladores de Pestañas
  const tabBtns = pokemonDetailContainer.querySelectorAll(".tab-btn");
  const tabContents = pokemonDetailContainer.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = btn.getAttribute("data-tab");
      pokemonDetailContainer.querySelector(`#${targetTab}`).classList.add("active");
    });
  });

  // Cargas asíncronas
  cargarEvolucionesEnDetalle(pokemon.species.url, colorBase);
  cargarMovimientosEnDetalle(pokemon.moves, colorBase);
}

// Función auxiliar recursiva para agrupar los niveles de la cadena evolutiva
function parsearArbolAPorNivel(nodo, nivel = 0, stages = []) {
  if (!stages[nivel]) {
    stages[nivel] = [];
  }

  const id = extraerIdDeUrl(nodo.species.url);

  if (!stages[nivel].some((p) => p.id === id)) {
    stages[nivel].push({
      id: id,
      name: nodo.species.name,
    });
  }

  if (nodo.evolves_to && nodo.evolves_to.length > 0) {
    nodo.evolves_to.forEach((child) => {
      parsearArbolAPorNivel(child, nivel + 1, stages);
    });
  }

  return stages;
}

// Carga la información de evoluciones de la API de manera asíncrona
async function cargarEvolucionesEnDetalle(speciesUrl, colorBase) {
  const container = document.getElementById("tab-evolutions");
  if (!container) return;

  container.innerHTML = `
    <div class="loader-stage">
      <div class="loader-spinner spinner-small"></div>
      <p>Cargando cadena evolutiva...</p>
    </div>
  `;

  try {
    const datosEspecie = await obtenerEspecie(speciesUrl);
    const datosCadena = await obtenerCadenaEvolutiva(datosEspecie.evolution_chain.url);

    const stages = parsearArbolAPorNivel(datosCadena.chain);

    if (stages.length <= 1) {
      container.innerHTML = `
        <div class="no-evolutions">
          <span class="material-symbols-outlined no-ev-icon">info</span>
          <p>Este Pokémon no tiene evoluciones conocidas.</p>
        </div>
      `;
      return;
    }

    // Renderizar flujo
    let flowHTML = `<div class="evolution-flow">`;

    stages.forEach((stage, idx) => {
      flowHTML += `<div class="evolution-stage-group">`;

      stage.forEach((p) => {
        const spriteUrl = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${p.id}.png`;
        const nombreCapitalizado = capitalizar(p.name);
        flowHTML += `
          <div class="evolution-node" data-pokemon-name="${p.name}" title="Ver detalles de ${nombreCapitalizado}">
            <img src="${spriteUrl}" alt="${nombreCapitalizado}" class="evolution-node-img" onerror="this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/poke-ball.png';" />
            <span class="evolution-node-name">${nombreCapitalizado}</span>
          </div>
        `;
      });

      flowHTML += `</div>`;

      if (idx < stages.length - 1) {
        flowHTML += `
          <div class="evolution-arrow">
            <span class="material-symbols-outlined">arrow_forward</span>
          </div>
        `;
      }
    });

    flowHTML += `</div>`;
    container.innerHTML = flowHTML;

    // Vincular clics en los nodos de evolución
    container.querySelectorAll(".evolution-node").forEach((node) => {
      node.addEventListener("click", () => {
        const name = node.getAttribute("data-pokemon-name");
        obtenerPokemon(name);
      });
    });
  } catch (error) {
    console.error("Error al cargar la cadena evolutiva:", error);
    container.innerHTML = `
      <div class="error-stage">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo obtener el flujo de evolución.</p>
      </div>
    `;
  }
}

// Carga la información de los movimientos de forma ordenada
function cargarMovimientosEnDetalle(moves, colorBase) {
  const container = document.getElementById("tab-moves");
  if (!container) return;

  if (!moves || moves.length === 0) {
    container.innerHTML = `
      <div class="no-moves">
        <span class="material-symbols-outlined no-mv-icon">info</span>
        <p>Este Pokémon no posee movimientos registrados.</p>
      </div>
    `;
    return;
  }

  // Parsear y agrupar por método de aprendizaje
  const methodOrder = { "level-up": 1, "machine": 2, "egg": 3, "tutor": 4 };
  const methodNames = {
    "level-up": "Nivel",
    "machine": "MT/MO",
    "egg": "Huevo",
    "tutor": "Tutor"
  };

  const movesParsed = moves.map((m) => {
    const detail = m.version_group_details[0] || { move_learn_method: { name: "other" }, level_learned_at: 0 };
    return {
      name: m.move.name,
      url: m.move.url,
      method: detail.move_learn_method.name,
      level: detail.level_learned_at,
    };
  });

  // Ordenar: Nivel (menor a mayor), MT/MO, Huevo, Tutor
  movesParsed.sort((a, b) => {
    const oA = methodOrder[a.method] || 5;
    const oB = methodOrder[b.method] || 5;
    if (oA !== oB) return oA - oB;
    if (a.method === "level-up" && b.method === "level-up") return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  let html = `
    <div class="moves-container">
      <table class="moves-table">
        <thead>
          <tr>
            <th>Movimiento</th>
            <th>Método</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
  `;

  movesParsed.forEach((m) => {
    const cleanName = commonMoveTranslations[m.name] || capitalizar(m.name.replace(/-/g, " "));
    const cleanMethod = methodNames[m.method] || "Otro";
    const methodClass = `method-${m.method}`;
    const levelDisplay = m.method === "level-up" ? `Nivel ${m.level}` : "—";

    html += `
      <tr class="move-row" data-move-name="${m.name}" data-move-url="${m.url}">
        <td class="move-name-cell">${cleanName}</td>
        <td><span class="method-badge ${methodClass}">${cleanMethod}</span></td>
        <td class="move-level-cell">${levelDisplay}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Vincular clics en las filas para abrir el modal
  container.querySelectorAll(".move-row").forEach((row) => {
    row.addEventListener("click", () => {
      const name = row.getAttribute("data-move-name");
      const url = row.getAttribute("data-move-url");
      abrirDetalleMovimiento(name, url, colorBase);
    });
  });
}

// Abre el modal flotante y realiza la consulta del movimiento
async function abrirDetalleMovimiento(nombreMove, urlMove, colorBase) {
  const modalBody = document.getElementById("move-modal-body");
  if (!modal || !modalBody) return;

  // Abrir modal y mostrar pantalla de carga
  modal.classList.add("active");
  modalBody.innerHTML = `
    <div class="loader-stage" style="padding: 4rem 1rem;">
      <div class="loader-spinner"></div>
      <p>Cargando información técnica del movimiento...</p>
    </div>
  `;

  try {
    const data = await obtenerDetalleMovimiento(urlMove);

    // Mapeo de clase de daño con iconos y colores representativos
    const damageClassMap = {
      physical: { nombre: "Físico", icono: "flash_on", color: "#FF4757" },
      special: { nombre: "Especial", icono: "flare", color: "#54A0FF" },
      status: { nombre: "Estado", icono: "change_circle", color: "#1DD1A1" }
    };

    const dClass = damageClassMap[data.damage_class?.name] || { nombre: "Otros", icono: "help", color: "#777777" };
    const colorTipo = typeColors[data.type.name] || "#777777";
    const typeNameEs = typeTranslations[data.type.name] || data.type.name;

    // Buscar traducción oficial en español en el array names
    const spanishNameEntry = data.names?.find(n => n.language.name === "es");
    const cleanMoveName = spanishNameEntry ? spanishNameEntry.name : (commonMoveTranslations[data.name] || capitalizar(data.name.replace(/-/g, " ")));

    // Resolver efecto / descripción (en español o en su defecto inglés)
    let effectText = "No hay descripción disponible para este movimiento.";
    const effectEntry = data.effect_entries?.find(e => e.language.name === "es") || data.effect_entries?.find(e => e.language.name === "en");
    
    if (effectEntry) {
      effectText = effectEntry.short_effect || effectEntry.effect;
      if (data.effect_chance !== null && data.effect_chance !== undefined) {
        effectText = effectText.replace(/\$effect_chance/g, `${data.effect_chance}%`);
      }
    } else if (data.flavor_text_entries?.length > 0) {
      const flavorEntry = data.flavor_text_entries.find(f => f.language.name === "es") || data.flavor_text_entries.find(f => f.language.name === "en");
      if (flavorEntry) {
        effectText = flavorEntry.flavor_text;
      }
    }

    // Formatear metadatos adicionales
    const targetEs = data.target?.name ? capitalizar(data.target.name.replace(/-/g, " ")) : "—";
    const categoryEs = data.meta?.category?.name ? capitalizar(data.meta.category.name.replace(/-/g, " ")) : "—";
    const ailmentEs = data.meta?.ailment?.name && data.meta.ailment.name !== "none" ? capitalizar(data.meta.ailment.name) : "Ninguno";

    modalBody.innerHTML = `
      <div class="move-detail-container" style="--move-theme-color: ${colorBase}">
        <div class="move-detail-header">
          <h2>${cleanMoveName}</h2>
          <div class="move-detail-badges">
            <span class="type-badge-mini" style="--badge-color: ${colorTipo}; padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 700;">
              ${capitalizar(typeNameEs)}
            </span>
            <span class="class-badge" style="--class-color: ${dClass.color}">
              <span class="material-symbols-outlined class-icon">${dClass.icono}</span>
              ${dClass.nombre}
            </span>
          </div>
        </div>

        <div class="move-stats-grid">
          <div class="move-stat-box">
            <span class="move-stat-label">Poder</span>
            <span class="move-stat-value">${data.power !== null ? data.power : "—"}</span>
          </div>
          <div class="move-stat-box">
            <span class="move-stat-label">Precisión</span>
            <span class="move-stat-value">${data.accuracy !== null ? `${data.accuracy}%` : "—"}</span>
          </div>
          <div class="move-stat-box">
            <span class="move-stat-label">PP</span>
            <span class="move-stat-value">${data.pp !== null ? data.pp : "—"}</span>
          </div>
        </div>

        <div class="move-effect-section">
          <h3>Efecto</h3>
          <p>${effectText}</p>
        </div>

        <div class="move-metadata-grid">
          <div class="meta-item">
            <span class="meta-label">Objetivo</span>
            <span class="meta-value">${targetEs}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Categoría</span>
            <span class="meta-value">${categoryEs}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Estado</span>
            <span class="meta-value">${ailmentEs}</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error al obtener detalles del movimiento:", error);
    modalBody.innerHTML = `
      <div class="error-stage" style="padding: 3rem 1rem;">
        <span class="material-symbols-outlined">error</span>
        <p>No se pudo cargar la información de este movimiento.</p>
      </div>
    `;
  }
}
