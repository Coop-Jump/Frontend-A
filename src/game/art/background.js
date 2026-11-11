import Phaser from 'phaser'
import { VIEW_H, VIEW_W, bake, lerpColor, newGraphics } from './core'

function drawSkyBands(g, theme) {
  const bands = 60
  const bh = Math.ceil(VIEW_H / bands)
  for (let i = 0; i < bands; i++) {
    g.fillStyle(lerpColor(theme.skyTop, theme.skyBottom, i / (bands - 1)), 1)
    g.fillRect(0, i * bh, VIEW_W, bh + 1)
  }
}

// Sol / luna
function drawSun(g, theme) {
  const bright = theme.stars ? 0xfef9c3 : 0xfff7ae
  g.fillStyle(bright, 0.25)
  g.fillCircle(780, 110, 74)
  g.fillStyle(bright, 0.45)
  g.fillCircle(780, 110, 54)
  g.fillStyle(bright, 1)
  g.fillCircle(780, 110, 38)
}

function makeSky(scene, theme) {
  const g = newGraphics(scene)
  drawSkyBands(g, theme)
  drawSun(g, theme)
  bake(scene, g, `sky_${theme.id}`, VIEW_W, VIEW_H)
}

function makeStars(scene) {
  if (scene.textures.exists('stars')) return
  const g = newGraphics(scene)
  const rnd = new Phaser.Math.RandomDataGenerator(['coop-jump'])
  for (let i = 0; i < 110; i++) {
    g.fillStyle(0xffffff, rnd.realInRange(0.3, 1))
    g.fillCircle(rnd.between(0, VIEW_W), rnd.between(0, VIEW_H * 0.8), rnd.realInRange(0.6, 1.8))
  }
  bake(scene, g, 'stars', VIEW_W, VIEW_H)
}

function mountainLayer(g, h, spec) {
  const { color, alpha, peaks, base, amp } = spec
  g.fillStyle(color, alpha)
  g.beginPath()
  g.moveTo(0, h)
  for (let i = 0; i <= peaks; i++) {
    const x = (VIEW_W / peaks) * i
    const y = base - (i % 2 === 0 ? amp : amp * 0.35)
    g.lineTo(x, i === peaks ? base - amp : y) // el borde derecho coincide con el izquierdo
  }
  g.lineTo(VIEW_W, h)
  g.closePath()
  g.fillPath()
}

function makeMountains(scene, theme) {
  const g = newGraphics(scene)
  const h = 300
  mountainLayer(g, h, { color: theme.far, alpha: 0.55, peaks: 6, base: 190, amp: 120 })
  mountainLayer(g, h, { color: theme.near, alpha: 0.8, peaks: 8, base: 250, amp: 70 })
  bake(scene, g, `mountains_${theme.id}`, VIEW_W, h)
}

function drawCloud(g, x, y, s) {
  g.fillStyle(0xffffff, 0.75)
  g.fillCircle(x, y, 22 * s)
  g.fillCircle(x + 26 * s, y - 10 * s, 28 * s)
  g.fillCircle(x + 56 * s, y, 22 * s)
  g.fillRoundedRect(x - 20 * s, y, 98 * s, 22 * s, 11 * s)
}

function makeClouds(scene) {
  if (scene.textures.exists('clouds')) return
  const g = newGraphics(scene)
  drawCloud(g, 80, 60, 1)
  drawCloud(g, 420, 110, 0.8)
  drawCloud(g, 700, 50, 1.1)
  bake(scene, g, 'clouds', VIEW_W, 180)
}

export function makeBackground(scene, theme) {
  makeSky(scene, theme)
  makeMountains(scene, theme)
  makeStars(scene)
  makeClouds(scene)
}
