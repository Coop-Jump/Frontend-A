import Phaser from 'phaser'
import { POINTS } from './constants'

// Rectángulo en píxeles de un elemento de la grilla con x, y, width y height.
function rectOf(item, cs) {
  return { x: (item.x + item.width / 2) * cs, y: (item.y + item.height / 2) * cs, w: item.width * cs, h: item.height * cs }
}

const forever = { yoyo: true, repeat: -1 }

// ---------- Plataformas ----------

function platformTexture(p, theme, cs) {
  const byType = {
    ground: `tile_ground_${theme.id}_${cs}`,
    goal_platform: `tile_goal_${cs}`,
    moving: `tile_moving_${cs}`,
    disappearing: `tile_crumble_${cs}`,
  }
  return byType[p.type] || `tile_plat_${theme.id}_${cs}`
}

function setupMover(scene, tile, p) {
  scene.movers.add(tile)
  tile.body.setImmovable(true)
  tile.body.setAllowGravity(false)
  tile.rangePx = (p.move_range || 3) * scene.cs
  tile.omega = p.move_speed || 1
}

function setupCrumble(scene, tile, p) {
  scene.physics.add.existing(tile, true)
  scene.crumbles.add(tile)
  tile.delay = p.disappear_delay || 1000
  tile.triggered = false
  tile.baseX = tile.x
}

function setupSolid(scene, tile) {
  scene.physics.add.existing(tile, true)
  scene.platforms.add(tile)
}

const PLATFORM_SETUP = { moving: setupMover, disappearing: setupCrumble }

function addPlatform(scene, p) {
  const r = rectOf(p, scene.cs)
  const tile = scene.add.tileSprite(r.x, r.y, r.w, r.h, platformTexture(p, scene.theme, scene.cs)).setDepth(2)
  ;(PLATFORM_SETUP[p.type] || setupSolid)(scene, tile, p)
}

export function createPlatforms(scene, grid) {
  scene.platforms = scene.physics.add.staticGroup()
  scene.crumbles = scene.physics.add.staticGroup()
  scene.movers = scene.physics.add.group({ allowGravity: false, immovable: true })
  ;(grid.platforms || []).forEach((p) => addPlatform(scene, p))
}

/** Plataformas móviles: vaivén senoidal entre x y x + move_range
 * (posición = x0 + R/2 · (1 − cos ωt), por eso la velocidad es R/2 · ω · sin ωt). */
export function updateMovers(scene) {
  const t = scene.elapsed / 1000
  scene.movers.getChildren().forEach((m) => {
    m.body.setVelocityX(m.rangePx * 0.5 * m.omega * Math.sin(m.omega * t))
  })
}

// ---------- Peligros ----------

// Hitbox más chica que el dibujo, para que sea justo con el jugador.
const HAZARD_HITBOX = { lava: { dy: 0.1, h: 0.75 }, spikes: { dy: 0.22, h: 0.5 } }

function addHazard(scene, hz) {
  const r = rectOf(hz, scene.cs)
  const kind = hz.type === 'lava' ? 'lava' : 'spikes'
  const tile = scene.add.tileSprite(r.x, r.y, r.w, r.h, `hz_${kind}_${scene.cs}`).setDepth(3)
  if (kind === 'lava') {
    scene.lavas.push(tile)
    scene.tweens.add({ targets: tile, alpha: 0.82, duration: 700, ease: 'Sine.easeInOut', ...forever })
  }
  const box = HAZARD_HITBOX[kind]
  const zone = scene.add.zone(r.x, r.y + r.h * box.dy, r.w * 0.86, r.h * box.h)
  scene.physics.add.existing(zone, true)
  scene.hazards.add(zone)
}

export function createHazards(scene, grid) {
  scene.hazards = scene.physics.add.staticGroup()
  scene.lavas = []
  ;(grid.hazards || []).forEach((hz) => addHazard(scene, hz))
}

// ---------- Coleccionables ----------

function addGlow(scene, img) {
  const scale = scene.cs / 40
  const glow = scene.add.image(img.x, img.y, 'glow').setDepth(5).setAlpha(0.7).setScale(scale)
  glow.setBlendMode(Phaser.BlendModes.ADD)
  scene.tweens.add({ targets: glow, alpha: 0.25, scale: scale * 1.25, duration: 800, ...forever })
  return glow
}

function animateCollectible(scene, img, i) {
  scene.tweens.add({ targets: img, y: img.y - 4, duration: 700 + (i % 5) * 60, ease: 'Sine.easeInOut', ...forever })
  if (img.kind === 'coin') {
    scene.tweens.add({ targets: img, scaleX: 0.04, duration: 520, ease: 'Sine.easeInOut', delay: i * 80, ...forever })
  } else {
    scene.tweens.add({ targets: img, angle: img.kind === 'star' ? 10 : 0, duration: 600, ...forever })
  }
}

function addCollectible(scene, c, i) {
  const cs = scene.cs
  const kind = POINTS[c.type] ? c.type : 'coin'
  const size = kind === 'coin' ? cs * 0.62 : cs * 0.72
  const img = scene.add.image((c.x + 0.5) * cs, (c.y + 0.5) * cs, kind).setDisplaySize(size, size).setDepth(6)
  img.kind = kind
  if (kind !== 'coin') img.glow = addGlow(scene, img)
  animateCollectible(scene, img, i)
  scene.physics.add.existing(img, true)
  img.body.setSize(cs * 0.6, cs * 0.6)
  scene.coins.add(img)
}

export function createCollectibles(scene, grid) {
  scene.coins = scene.physics.add.staticGroup()
  ;(grid.collectibles || []).forEach((c, i) => addCollectible(scene, c, i))
}

// ---------- Meta ----------

export function createGoal(scene, grid) {
  const cs = scene.cs
  const gx = (grid.goal.x + 0.5) * cs
  const gy = (grid.goal.y + 0.5) * cs

  const glow = scene.add.image(gx, gy, 'glow').setDepth(4).setScale((cs / 32) * 1.6).setAlpha(0.8)
  glow.setBlendMode(Phaser.BlendModes.ADD)
  scene.tweens.add({ targets: glow, alpha: 0.35, scale: (cs / 32) * 2.1, duration: 900, ...forever })

  // La bandera se apoya en la base de la celda de meta.
  const flag = scene.add.image(gx, gy + cs / 2, `goal_${cs}`).setOrigin(0.5, 1).setDepth(5)
  flag.setDisplaySize(cs * 1.05, cs * 1.58)
  scene.tweens.add({ targets: flag, angle: 2.5, duration: 600, ease: 'Sine.easeInOut', ...forever })

  scene.goal = scene.add.zone(gx, gy, cs, cs * 1.4)
  scene.physics.add.existing(scene.goal, true)
}
