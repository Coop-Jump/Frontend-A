<!-- calidad:inicio -->
![Calidad](https://img.shields.io/badge/Calidad-25%2F100-red) ![Aprobado](https://img.shields.io/badge/Aprobado-NO-red) ![Cumple](https://img.shields.io/badge/Cumple-10%2F15-yellow) ![Duplicación](https://img.shields.io/badge/Duplicaci%C3%B3n-20.6%25-yellow) ![SEC](https://img.shields.io/badge/SEC-0-green) ![SQL](https://img.shields.io/badge/SQL-0-green) ![DBG](https://img.shields.io/badge/DBG-0-green) ![Capas](https://img.shields.io/badge/Capas-1-red) ![Tests](https://img.shields.io/badge/Tests-0-red) ![Vistas](https://img.shields.io/badge/Vistas-8-green)

**Calidad de servicios (heurístico):** índice **25/100** · cumple **10/15** · aprobado **NO** · capas **1**
Detalle completo en [`docs/EVALUACION.md`](docs/EVALUACION.md).
<!-- calidad:fin -->

# Frontend-A

## Descripción
Proyecto de aplicación React con enrutamiento usando Vite y `react-router-dom`.

## Estructura

```
frontend-a/
├── src/
│   ├── App.jsx              # Ruteador principal (React Router)
│   ├── main.jsx             # Punto de entrada de la aplicación
│   └── pages/
│       ├── Home.jsx         # Página de inicio
│       ├── Login.jsx        # Página de login
│       ├── Register.jsx     # Página de registro
│       ├── Game.jsx         # Pantalla de juego
│       ├── Leaderboard.jsx  # Tabla de clasificación
│       └── Admin.jsx        # Panel de administración
├── public/
│   └── favicon.svg          # Icono del proyecto
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
└── index.html               # HTML de la raíz
```

## Requisitos
- Node.js v14+
- npm v6+ or yarn

## Instalación
```bash
cd frontend-a
npm install
```

## Ejecución
```bash
# Desarrollo (en el puerto 5173)
npm run dev

# Versión de producción
npm run build
```

## Páginas creadas
- **Home** – Página principal con menú de navegación
- **Login** – Formulario de autenticación
- **Register** – Registro de usuario
- **Game** – Pantalla de juego (placeholder)
- **Leaderboard** – Clasificación (placeholder)
- **Admin** – Panel de administración (placeholder)

## Enrutamiento
El enrutamiento se maneja con `react-router-dom` v6:
- `/` → Home
- `/login` → Login
- `/register` → Register
- `/game` → Game
- `/leaderboard` → Leaderboard
- `/admin` → Admin
