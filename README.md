<!-- calidad:inicio -->
![Calidad](https://img.shields.io/badge/Calidad-83%2F100-green) ![Aprobado](https://img.shields.io/badge/Aprobado-SI-green) ![Cumple](https://img.shields.io/badge/Cumple-13%2F14-green) ![Duplicación](https://img.shields.io/badge/Duplicaci%C3%B3n-0.5%25-green) ![SEC](https://img.shields.io/badge/SEC-0-green) ![SQL](https://img.shields.io/badge/SQL-0-green) ![DBG](https://img.shields.io/badge/DBG-0-green) ![Capas](https://img.shields.io/badge/Capas-3-green) ![Tests](https://img.shields.io/badge/Tests-14-green) ![Cob](https://img.shields.io/badge/Cob-n%2Fa-lightgrey) ![Vistas](https://img.shields.io/badge/Vistas-30-green)

**Calidad de servicios (heurístico):** índice **83/100** · cumple **13/14** · aprobado **SI** · capas **3**
Detalle completo en [`docs/EVALUACION.md`](docs/EVALUACION.md).
<!-- calidad:fin -->

# Coop Jump — Frontend

Cliente React + Phaser del juego cooperativo de plataformas (1 o 2 jugadores en el mismo teclado).

## Logo del juego
Copia tu logo a `public/logo.png` (o `public/logo.svg`). Se usa automáticamente en la
barra de navegación, el inicio y el login/registro. Si el archivo no existe se muestra
el emblema incluido. Si tu logo ya trae el nombre del juego, no se agrega texto al lado.

## Estructura
```
src/
├── App.jsx                  # Rutas (zona pública y zona privada con ProtectedRoute)
├── components/
│   ├── AppLayout.jsx        # Barra de navegación + pie de página
│   ├── Logo.jsx             # Logo (public/logo.png o emblema por defecto)
│   ├── CharacterAvatar.jsx  # Personajes en SVG para la interfaz
│   ├── LevelPreview.jsx     # Miniatura de un nivel (canvas)
│   ├── LevelsAdminPanel.jsx # CRUD de niveles (POST/PUT/DELETE /levels)
│   ├── PhaserGame.jsx       # Contenedor del juego + HUD + controles
│   └── ProtectedRoute.jsx
├── game/
│   ├── MainScene.js         # Escena de Phaser (física, reglas, animaciones)
│   ├── textures.js          # Todo el arte, dibujado por código
│   └── theme.js             # Temas por dificultad y personajes
├── pages/                   # Home, Login, Register, Dashboard, LevelSelection,
│                            # Game, Leaderboard, Settings, Admin
├── services/ api/ store/    # Acceso al backend y sesión
└── index.css                # Sistema de diseño (variables, botones, tarjetas...)
```

## Ejecución
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
La API se toma de `VITE_API_BASE_URL` (por defecto `http://localhost:3000/api`).

## Rutas
- Públicas: `/`, `/login`, `/register`
- Con sesión: `/dashboard`, `/levels?mode=single|coop`, `/game?level=<id>&mode=...`,
  `/leaderboard`, `/settings`, `/admin`
- `/singleplayer` y `/two-player` redirigen a la selección de nivel.

## Elementos de nivel soportados (`grid_json`)
- Plataformas: `platform`, `ground`, `goal_platform`, `moving` (`move_range`, `move_speed`),
  `disappearing` (`disappear_delay`).
- Peligros: `spikes`, `lava`. Caer al vacío también cuenta como muerte.
- Coleccionables: `coin` (10 pts), `gem` (50 pts), `star` (100 pts).

## Controles
Jugador 1 (Fénix): `A` `D` mover, `W` saltar. Jugador 2 (Blu): flechas. En un jugador
valen ambos esquemas y `Espacio`. `P`/`Esc` pausa, `R` reinicia.
