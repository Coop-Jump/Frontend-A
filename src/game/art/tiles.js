import { bake, newGraphics } from './core'

function drawPlatformBody(g, t, cs) {
  g.fillStyle(t.platBody, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(t.platBodyDark, 0.55)
  g.fillRect(0, cs * 0.62, cs, cs * 0.38)
  g.fillStyle(t.platBodyDark, 0.8)
  g.fillCircle(cs * 0.22, cs * 0.55, cs * 0.07)
  g.fillCircle(cs * 0.7, cs * 0.75, cs * 0.06)
  g.fillCircle(cs * 0.5, cs * 0.45, cs * 0.045)
}

function drawGrassTop(g, t, cs) {
  g.fillStyle(t.platTop, 1)
  g.fillRect(0, 0, cs, cs * 0.3)
  g.fillStyle(t.platTopDark, 1)
  g.fillRect(0, cs * 0.24, cs, cs * 0.07)
  // flequillos de pasto
  for (let i = 0; i < 4; i++) {
    g.fillTriangle(i * (cs / 4), cs * 0.3, i * (cs / 4) + cs / 8, cs * 0.5, (i + 1) * (cs / 4), cs * 0.3)
  }
  g.fillStyle(0xffffff, 0.35)
  g.fillRect(0, 0, cs, Math.max(2, cs * 0.06))
}

// Plataforma con pasto
function makePlatformTile(scene, theme, cs) {
  const g = newGraphics(scene)
  drawPlatformBody(g, theme, cs)
  drawGrassTop(g, theme, cs)
  g.lineStyle(1, 0x000000, 0.25)
  g.strokeRect(0, 0, cs, cs)
  bake(scene, g, `tile_plat_${theme.id}_${cs}`, cs, cs)
}

// Suelo (ladrillos de piedra)
function makeGroundTile(scene, theme, cs) {
  const g = newGraphics(scene)
  g.fillStyle(theme.platBodyDark, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(theme.platTop, 1)
  g.fillRect(0, 0, cs, cs * 0.22)
  g.fillStyle(theme.platTopDark, 1)
  g.fillRect(0, cs * 0.18, cs, cs * 0.06)
  g.lineStyle(1, 0x000000, 0.3)
  g.strokeRect(0, cs * 0.24, cs, cs * 0.38)
  g.strokeRect(0, cs * 0.62, cs, cs * 0.38)
  g.lineBetween(cs * 0.5, cs * 0.24, cs * 0.5, cs * 0.62)
  g.lineBetween(cs * 0.25, cs * 0.62, cs * 0.25, cs)
  g.lineBetween(cs * 0.75, cs * 0.62, cs * 0.75, cs)
  bake(scene, g, `tile_ground_${theme.id}_${cs}`, cs, cs)
}

// Plataforma de meta (dorada)
function makeGoalTile(scene, cs) {
  const g = newGraphics(scene)
  g.fillStyle(0xca8a04, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0xfacc15, 1)
  g.fillRect(0, 0, cs, cs * 0.45)
  g.fillStyle(0xfef08a, 1)
  g.fillRect(0, 0, cs, cs * 0.12)
  g.lineStyle(1, 0x713f12, 0.6)
  g.strokeRect(0, 0, cs, cs)
  g.fillStyle(0x713f12, 0.5)
  g.fillCircle(cs * 0.2, cs * 0.75, 2)
  g.fillCircle(cs * 0.8, cs * 0.75, 2)
  bake(scene, g, `tile_goal_${cs}`, cs, cs)
}

// Plataforma móvil (metal)
function makeMovingTile(scene, cs) {
  const g = newGraphics(scene)
  g.fillStyle(0x475569, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0x94a3b8, 1)
  g.fillRect(0, 0, cs, cs * 0.35)
  g.fillStyle(0xe2e8f0, 0.8)
  g.fillRect(0, 0, cs, cs * 0.1)
  g.fillStyle(0xfacc15, 1)
  for (let i = 0; i < 3; i++) {
    g.fillTriangle(cs * (0.1 + i * 0.3), cs * 0.9, cs * (0.2 + i * 0.3), cs * 0.45, cs * (0.3 + i * 0.3), cs * 0.9)
  }
  g.fillStyle(0x1e293b, 1)
  g.fillCircle(cs * 0.08, cs * 0.2, 2)
  g.fillCircle(cs * 0.92, cs * 0.2, 2)
  g.lineStyle(1, 0x0f172a, 0.5)
  g.strokeRect(0, 0, cs, cs)
  bake(scene, g, `tile_moving_${cs}`, cs, cs)
}

function drawCracks(g, cs) {
  g.lineStyle(2, 0x7c5a2a, 0.85)
  g.beginPath()
  g.moveTo(cs * 0.3, 0)
  g.lineTo(cs * 0.4, cs * 0.4)
  g.lineTo(cs * 0.25, cs * 0.7)
  g.lineTo(cs * 0.45, cs)
  g.moveTo(cs * 0.75, cs * 0.15)
  g.lineTo(cs * 0.65, cs * 0.55)
  g.lineTo(cs * 0.8, cs * 0.9)
  g.strokePath()
}

// Plataforma que desaparece (arena agrietada)
function makeCrumbleTile(scene, cs) {
  const g = newGraphics(scene)
  g.fillStyle(0xd6b77a, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0xf1d9a0, 1)
  g.fillRect(0, 0, cs, cs * 0.3)
  drawCracks(g, cs)
  g.lineStyle(1, 0x5b3d16, 0.5)
  g.strokeRect(0, 0, cs, cs)
  bake(scene, g, `tile_crumble_${cs}`, cs, cs)
}

export function makeTiles(scene, theme, cs) {
  makePlatformTile(scene, theme, cs)
  makeGroundTile(scene, theme, cs)
  makeGoalTile(scene, cs)
  makeMovingTile(scene, cs)
  makeCrumbleTile(scene, cs)
}
