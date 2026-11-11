import { bake, newGraphics } from './core'

const S = 64

function makeCoin(scene) {
  const g = newGraphics(scene)
  g.fillStyle(0xa16207, 1)
  g.fillCircle(S / 2, S / 2, 28)
  g.fillStyle(0xfacc15, 1)
  g.fillCircle(S / 2, S / 2, 25)
  g.lineStyle(4, 0xca8a04, 1)
  g.strokeCircle(S / 2, S / 2, 17)
  g.fillStyle(0xfef08a, 1)
  g.fillRect(S / 2 - 4, S / 2 - 11, 8, 22)
  g.fillStyle(0xffffff, 0.85)
  g.fillEllipse(S / 2 - 12, S / 2 - 14, 9, 14)
  bake(scene, g, 'coin', S, S)
}

function makeGem(scene) {
  const g = newGraphics(scene)
  g.fillStyle(0x0e7490, 1)
  g.fillPoints([{ x: 32, y: 4 }, { x: 58, y: 24 }, { x: 32, y: 60 }, { x: 6, y: 24 }], true)
  g.fillStyle(0x22d3ee, 1)
  g.fillPoints([{ x: 32, y: 8 }, { x: 53, y: 24 }, { x: 32, y: 54 }, { x: 11, y: 24 }], true)
  g.fillStyle(0xa5f3fc, 1)
  g.fillPoints([{ x: 32, y: 8 }, { x: 11, y: 24 }, { x: 32, y: 24 }], true)
  g.fillStyle(0x67e8f9, 1)
  g.fillPoints([{ x: 32, y: 8 }, { x: 53, y: 24 }, { x: 32, y: 24 }], true)
  g.lineStyle(2, 0xffffff, 0.8)
  g.lineBetween(11, 24, 53, 24)
  bake(scene, g, 'gem', S, S)
}

function starPoints() {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 29 : 12
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push({ x: 32 + Math.cos(a) * r, y: 34 + Math.sin(a) * r })
  }
  return pts
}

function makeStar(scene) {
  const g = newGraphics(scene)
  const pts = starPoints()
  g.fillStyle(0xb45309, 1)
  g.fillPoints(pts.map((p) => ({ x: 32 + (p.x - 32) * 1.1, y: 34 + (p.y - 34) * 1.1 })), true)
  g.fillStyle(0xfde047, 1)
  g.fillPoints(pts, true)
  g.fillStyle(0xffffff, 0.8)
  g.fillCircle(26, 26, 3)
  bake(scene, g, 'star', S, S)
}

// Partícula
function makeParticle(scene) {
  const g = newGraphics(scene)
  g.fillStyle(0xffffff, 1)
  g.fillCircle(6, 6, 6)
  bake(scene, g, 'particle', 12, 12)
}

// Resplandor
function makeGlow(scene) {
  const g = newGraphics(scene)
  for (let r = 48; r > 0; r -= 4) {
    g.fillStyle(0xfde047, 0.035)
    g.fillCircle(48, 48, r)
  }
  bake(scene, g, 'glow', 96, 96)
}

export function makeCollectibles(scene) {
  if (scene.textures.exists('coin')) return
  makeCoin(scene)
  makeGem(scene)
  makeStar(scene)
  makeParticle(scene)
  makeGlow(scene)
}

export function makeGoal(scene, cs) {
  const H = 96
  const g = newGraphics(scene)
  g.fillStyle(0x94a3b8, 1)
  g.fillRect(12, 8, 6, H - 8)
  g.fillStyle(0xe2e8f0, 1)
  g.fillRect(12, 8, 2, H - 8)
  g.fillStyle(0xfacc15, 1)
  g.fillCircle(15, 8, 7)
  g.fillStyle(0xef4444, 1)
  g.fillPoints([{ x: 18, y: 12 }, { x: 58, y: 26 }, { x: 18, y: 42 }], true)
  g.fillStyle(0xfca5a5, 1)
  g.fillPoints([{ x: 18, y: 12 }, { x: 58, y: 26 }, { x: 18, y: 26 }], true)
  g.fillStyle(0xfef08a, 1)
  g.fillCircle(28, 26, 4)
  bake(scene, g, `goal_${cs}`, 64, H)
}
