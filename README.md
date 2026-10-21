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
