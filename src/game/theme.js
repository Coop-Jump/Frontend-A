// Temas visuales por dificultad. Los colores en número (0xRRGGBB) los usa Phaser;
// `css` y `cssSoft` los usa la interfaz (insignias, tarjetas, vistas previas).
export const THEMES = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    skyTop: 0x38bdf8,
    skyBottom: 0xe0f2fe,
    far: 0x7dd3fc,
    near: 0x4ade80,
    platTop: 0x4ade80,
    platTopDark: 0x16a34a,
    platBody: 0xa16207,
    platBodyDark: 0x78350f,
    stars: false,
    css: '#22c55e',
    cssSoft: 'rgba(34,197,94,0.15)',
    previewSky: ['#38bdf8', '#e0f2fe'],
  },
  medium: {
    id: 'medium',
    label: 'Media',
    skyTop: 0xf97316,
    skyBottom: 0xfef3c7,
    far: 0xfdba74,
    near: 0xf59e0b,
    platTop: 0xfbbf24,
    platTopDark: 0xd97706,
    platBody: 0x9a3412,
    platBodyDark: 0x7c2d12,
    stars: false,
    css: '#f59e0b',
    cssSoft: 'rgba(245,158,11,0.15)',
    previewSky: ['#f97316', '#fef3c7'],
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    skyTop: 0x4c1d95,
    skyBottom: 0xf472b6,
    far: 0x7c3aed,
    near: 0x5b21b6,
    platTop: 0xc4b5fd,
    platTopDark: 0x8b5cf6,
    platBody: 0x4c1d95,
    platBodyDark: 0x2e1065,
    stars: true,
    css: '#a855f7',
    cssSoft: 'rgba(168,85,247,0.15)',
    previewSky: ['#4c1d95', '#f472b6'],
  },
  expert: {
    id: 'expert',
    label: 'Experto',
    skyTop: 0x020617,
    skyBottom: 0x7f1d1d,
    far: 0x1e293b,
    near: 0x450a0a,
    platTop: 0x94a3b8,
    platTopDark: 0x475569,
    platBody: 0x1e293b,
    platBodyDark: 0x0f172a,
    stars: true,
    css: '#ef4444',
    cssSoft: 'rgba(239,68,68,0.15)',
    previewSky: ['#020617', '#7f1d1d'],
  },
}

export function getTheme(difficulty) {
  return THEMES[difficulty] || THEMES.easy
}

export const CHARACTERS = [
  { id: 'fox', name: 'Fénix', color: '#f97316' },
  { id: 'blu', name: 'Blu', color: '#3b82f6' },
]

// Valida lo mínimo que necesita el juego para renderizar un nivel.
export function isPlayableLevel(grid) {
  return Boolean(
    grid &&
      Number.isFinite(grid.grid_width) &&
      Number.isFinite(grid.grid_height) &&
      grid.goal &&
      Number.isFinite(grid.goal.x) &&
      Number.isFinite(grid.goal.y) &&
      grid.spawn_j1 &&
      Number.isFinite(grid.spawn_j1.x) &&
      Number.isFinite(grid.spawn_j1.y),
  )
}
