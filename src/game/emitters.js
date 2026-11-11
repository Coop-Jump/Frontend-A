const EMITTERS = {
  dustEmitter: {
    lifespan: 350,
    speed: { min: 20, max: 70 },
    angle: { min: 200, max: 340 },
    scale: { start: 0.55, end: 0 },
    alpha: { start: 0.7, end: 0 },
    tint: 0xf1f5f9,
  },
  sparkEmitter: {
    lifespan: 500,
    speed: { min: 60, max: 170 },
    scale: { start: 0.6, end: 0 },
    gravityY: 300,
    tint: [0xfde047, 0xfacc15, 0xffffff],
  },
  deathEmitter: {
    lifespan: 650,
    speed: { min: 80, max: 260 },
    scale: { start: 0.9, end: 0 },
    gravityY: 500,
    tint: [0xef4444, 0xf97316, 0xfacc15],
  },
  winEmitter: {
    lifespan: 1100,
    speed: { min: 120, max: 340 },
    scale: { start: 0.9, end: 0 },
    gravityY: 380,
    tint: [0xf97316, 0x3b82f6, 0xfacc15, 0x22c55e, 0xec4899],
  },
}

/** Crea los emisores de partículas y los deja como propiedades de la escena. */
export function createEmitters(scene) {
  Object.entries(EMITTERS).forEach(([name, config]) => {
    scene[name] = scene.add.particles(0, 0, 'particle', { emitting: false, ...config }).setDepth(20)
  })
}
