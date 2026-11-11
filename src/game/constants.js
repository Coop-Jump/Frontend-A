// Física validada contra los niveles del seed (ver Docs/seed.sql):
// gravedad 1200, velocidad 200, salto 520, jugador de 0.75 celdas.
export const GRAVITY = 1200
export const SPEED = 200
export const JUMP = -520

export const FONT = 'Fredoka, Inter, system-ui, sans-serif'
export const POINTS = { coin: 10, gem: 50, star: 100 }
export const RESPAWN_PLATFORM_MS = 2500
export const HUD_INTERVAL_MS = 80

// Margen (en px del mundo) que la cámara deja alrededor de los jugadores en coop.
export const CAMERA_PAD_X = 130
export const CAMERA_PAD_Y = 100
export const CAMERA_MIN_ZOOM = 0.35
export const CAMERA_ZOOM_LERP = 0.08
