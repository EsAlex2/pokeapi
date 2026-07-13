# 🌟 Pokédex Interactiva Premium

Una aplicación web moderna, interactiva y de alto rendimiento para explorar la base de datos de Pokémon consumiendo la [PokéAPI](https://pokeapi.co/). La aplicación está diseñada con un enfoque **Mobile-First** y un layout de **doble columna responsivo en Desktop** que evita el desplazamiento vertical innecesario, ofreciendo una experiencia de usuario extremadamente fluida.

---

## ✨ Características Principales

*   **⚡ Arquitectura Modular (ES6 Modules)**: Código estructurado, escalable y mantenible dividido en submódulos especializados.
*   **🎴 Diseño de Doble Columna (Desktop)**: En pantallas de más de 900px, el panel de detalles del Pokémon se fija a la izquierda y el listado de navegación a la derecha, previniendo scrolls excesivos.
*   **📂 Ficha del Pokémon Expandida (Pestañas)**:
    *   **⚔️ Combate**: Estadísticas base animadas, habilidades y dimensiones físicas (peso/altura).
    *   **🧬 Evoluciones**: Cadena evolutiva interactiva completa con avatares clicables para navegar entre especies.
    *   **☄️ Movimientos**: Listado clasificado (por Nivel, MT/MO, Huevo, Tutor). Incluye un **modal flotante dinámico** con información técnica detallada (clase de daño físico/especial/estado con iconos, poder, precisión, PP, objetivo, y descripción oficial en español).
*   **🔢 Dashboard Paginado con Elipsis**: Paginador numérico interactivo (`1 ... 4 [5] 6 ... 66`) con scroll automático al inicio de la cuadrícula.
*   **🌍 Pokédex Regionales**: Filtrado de especies según su región clásica (desde Kanto hasta Paldea).
*   **⏳ Generaciones Pokémon**: Panel interactivo para filtrar Pokémon de acuerdo a las 9 generaciones oficiales de la saga.
*   **🎨 Tema Claro y Oscuro**: Alternador estético con persistencia de preferencias del usuario mediante `localStorage`.
*   **🇪🇸 Traducción Completa al Español**: Tipos de Pokémon, métodos de aprendizaje y nombres técnicos de movimientos totalmente adaptados al español.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5** (Semántico)
*   **Vanilla CSS3** (Variables CSS, Flexbox, Grid, Animaciones Premium)
*   **JavaScript (ES6+)** (Nativo, Fetch API, Módulos asíncronos)
*   **Docker & Docker Compose** (Servidor Web Apache/httpd en Alpine)
*   **Google Material Symbols** (Librería de iconos)

---

## 📂 Estructura del Proyecto

```text
pokeapi/
├── index.html               # Estructura HTML de la aplicación
├── style.css                # Hoja de estilos con variables y animaciones
├── Dockerfile               # Configuración del contenedor Apache (httpd)
├── docker-compose.yml       # Orquestación de desarrollo local
├── README.md                # Documentación del repositorio
└── js/                      # Directorio de módulos JavaScript
    ├── main.js              # Coordinador de eventos y punto de entrada
    ├── api.js               # Cliente de red para llamadas HTTP
    ├── config.js            # Mapeos de tipo, estadísticas y traducciones
    ├── utils.js             # Funciones utilitarias y helpers
    ├── dashboard.js         # Controlador de la grilla de Pokémon y paginación
    ├── detail.js            # Manejo del panel detallado, evoluciones y movimientos
    ├── regions.js           # Gestión y filtrado por regiones de Pokédex
    └── generations.js       # Gestión y filtrado por generaciones oficiales
```

---

## 🚀 Cómo Ejecutar el Proyecto

Tienes dos formas sencillas de correr la aplicación en tu entorno local:

### Opción 1: Usando Docker (Recomendado)

Asegúrate de tener instalados **Docker** y **Docker Compose**.

1. Abre tu terminal en la raíz del proyecto.
2. Levanta el contenedor con el siguiente comando:
   ```bash
   docker compose up --build
   ```
3. Abre tu navegador e ingresa a: **[http://localhost:8080](http://localhost:8080)**

*Nota: La configuración incluye un volumen compartido, por lo que cualquier modificación en el código local se verá reflejada en el navegador de manera inmediata.*

### Opción 2: Ejecución Local Directa

Como el proyecto utiliza módulos de ES6 (`type="module"`), no se puede ejecutar directamente abriendo el archivo `index.html` con doble clic (debido a políticas de seguridad CORS del navegador). Debes servir los archivos usando cualquier servidor web local simple.

*   **Python 3**:
    ```bash
    python3 -m http.server 8000
    ```
    Y visita `http://localhost:8000`.

*   **Node.js (serve)**:
    ```bash
    npx serve .
    ```
    Y visita `http://localhost:3000`.

---

## 📈 Próximos Pasos & Mejoras
*   [ ] Agregar una sección de estadísticas comparativas entre múltiples Pokémon.
*   [ ] Implementar un minijuego de adivinanza ("¿Quién es ese Pokémon?").
*   [ ] Añadir sonidos oficiales del grito de cada Pokémon al abrir su ficha.
