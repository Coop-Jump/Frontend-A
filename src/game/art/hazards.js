import { bake, newGraphics } from './core'

// Pinchos metálicos (dos por celda)
function makeSpikes(scene, cs) {
  const g = newGraphics(scene)
  const teeth = 2
  const tw = cs / teeth
  for (let i = 0; i < teeth; i++) {
    g.fillStyle(0xcbd5e1, 1)
    g.fillTriangle(i * tw + 1, cs, i * tw + tw / 2, cs * 0.3, (i + 1) * tw - 1, cs)
    g.fillStyle(0xf8fafc, 1)
    g.fillTriangle(i * tw + tw / 2, cs * 0.3, i * tw + tw / 2, cs, i * tw + 1, cs)
    g.lineStyle(1, 0x475569, 1)
    g.strokeTriangle(i * tw + 1, cs, i * tw + tw / 2, cs * 0.3, (i + 1) * tw - 1, cs)
  }
  g.fillStyle(0xef4444, 0.9)
  g.fillRect(0, cs - 3, cs, 3)
  bake(scene, g, `hz_spikes_${cs}`, cs, cs)
}

function drawLavaWaves(g, cs) {
  g.fillStyle(0xfde047, 1)
  g.beginPath()
  g.moveTo(0, cs * 0.18)
  for (let i = 0; i <= 8; i++) g.lineTo((cs / 8) * i, cs * (0.18 + (i % 2 ? 0.12 : -0.1)))
  g.lineTo(cs, 0.3 * cs)
  g.lineTo(cs, 0.5 * cs)
  g.lineTo(0, 0.5 * cs)
  g.closePath()
  g.fillPath()
}

function makeLava(scene, cs) {
  const g = newGraphics(scene)
  g.fillStyle(0xdc2626, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0xf97316, 1)
  g.fillRect(0, cs * 0.18, cs, cs * 0.82)
  g.fillStyle(0xfacc15, 1)
  g.fillRect(0, cs * 0.6, cs, cs * 0.4)
  drawLavaWaves(g, cs)
  g.fillStyle(0xfef9c3, 0.9)
  g.fillCircle(cs * 0.3, cs * 0.55, cs * 0.06)
  g.fillCircle(cs * 0.75, cs * 0.75, cs * 0.05)
  bake(scene, g, `hz_lava_${cs}`, cs, cs)
}

export function makeHazards(scene, cs) {
  makeSpikes(scene, cs)
  makeLava(scene, cs)
}
