import Phaser from 'phaser'

// Todo el arte del juego se dibuja por código (sin archivos de imagen):
// así el juego carga al instante y se puede retocar colores desde theme.js.

const VIEW_W = 960
const VIEW_H = 540

function newGraphics(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false })
}

function bake(scene, g, key, w, h) {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  g.generateTexture(key, w, h)
  g.destroy()
}

function lerpColor(a, b, t) {
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.IntegerToColor(a),
    Phaser.Display.Color.IntegerToColor(b),
    100,
    Math.round(t * 100),
  )
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b)
}

// ---------- Fondo ----------

function makeSky(scene, theme) {
  const g = newGraphics(scene)
  const bands = 60
  const bh = Math.ceil(VIEW_H / bands)
  for (let i = 0; i < bands; i++) {
    g.fillStyle(lerpColor(theme.skyTop, theme.skyBottom, i / (bands - 1)), 1)
    g.fillRect(0, i * bh, VIEW_W, bh + 1)
  }
  // Sol / luna
  const bright = theme.stars ? 0xfef9c3 : 0xfff7ae
  g.fillStyle(bright, 0.25)
  g.fillCircle(780, 110, 74)
  g.fillStyle(bright, 0.45)
  g.fillCircle(780, 110, 54)
  g.fillStyle(bright, 1)
  g.fillCircle(780, 110, 38)
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

function makeMountains(scene, theme) {
  const g = newGraphics(scene)
  const h = 300
  const layer = (color, alpha, peaks, base, amp) => {
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
  layer(theme.far, 0.55, 6, 190, 120)
  layer(theme.near, 0.8, 8, 250, 70)
  bake(scene, g, `mountains_${theme.id}`, VIEW_W, h)
}

function makeClouds(scene) {
  if (scene.textures.exists('clouds')) return
  const g = newGraphics(scene)
  const cloud = (x, y, s) => {
    g.fillStyle(0xffffff, 0.75)
    g.fillCircle(x, y, 22 * s)
    g.fillCircle(x + 26 * s, y - 10 * s, 28 * s)
    g.fillCircle(x + 56 * s, y, 22 * s)
    g.fillRoundedRect(x - 20 * s, y, 98 * s, 22 * s, 11 * s)
  }
  cloud(80, 60, 1)
  cloud(420, 110, 0.8)
  cloud(700, 50, 1.1)
  bake(scene, g, 'clouds', VIEW_W, 180)
}

// ---------- Bloques ----------

function makeTiles(scene, theme, cs) {
  const key = (n) => `${n}_${theme.id}_${cs}`

  // Plataforma con pasto
  let g = newGraphics(scene)
  g.fillStyle(theme.platBody, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(theme.platBodyDark, 0.55)
  g.fillRect(0, cs * 0.62, cs, cs * 0.38)
  g.fillStyle(theme.platBodyDark, 0.8)
  g.fillCircle(cs * 0.22, cs * 0.55, cs * 0.07)
  g.fillCircle(cs * 0.7, cs * 0.75, cs * 0.06)
  g.fillCircle(cs * 0.5, cs * 0.45, cs * 0.045)
  g.fillStyle(theme.platTop, 1)
  g.fillRect(0, 0, cs, cs * 0.3)
  g.fillStyle(theme.platTopDark, 1)
  g.fillRect(0, cs * 0.24, cs, cs * 0.07)
  // flequillos de pasto
  for (let i = 0; i < 4; i++) {
    g.fillTriangle(i * (cs / 4), cs * 0.3, i * (cs / 4) + cs / 8, cs * 0.5, (i + 1) * (cs / 4), cs * 0.3)
  }
  g.fillStyle(0xffffff, 0.35)
  g.fillRect(0, 0, cs, Math.max(2, cs * 0.06))
  g.lineStyle(1, 0x000000, 0.25)
  g.strokeRect(0, 0, cs, cs)
  bake(scene, g, key('tile_plat'), cs, cs)

  // Suelo (ladrillos de piedra)
  g = newGraphics(scene)
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
  bake(scene, g, key('tile_ground'), cs, cs)

  // Plataforma de meta (dorada)
  g = newGraphics(scene)
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
  bake(scene, g, 'tile_goal_' + cs, cs, cs)

  // Plataforma móvil (metal)
  g = newGraphics(scene)
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
  bake(scene, g, 'tile_moving_' + cs, cs, cs)

  // Plataforma que desaparece (arena agrietada)
  g = newGraphics(scene)
  g.fillStyle(0xd6b77a, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0xf1d9a0, 1)
  g.fillRect(0, 0, cs, cs * 0.3)
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
  g.lineStyle(1, 0x5b3d16, 0.5)
  g.strokeRect(0, 0, cs, cs)
  bake(scene, g, 'tile_crumble_' + cs, cs, cs)
}

// ---------- Peligros ----------

function makeHazards(scene, cs) {
  // Pinchos metálicos (dos por celda)
  let g = newGraphics(scene)
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
  bake(scene, g, 'hz_spikes_' + cs, cs, cs)

  // Lava
  g = newGraphics(scene)
  g.fillStyle(0xdc2626, 1)
  g.fillRect(0, 0, cs, cs)
  g.fillStyle(0xf97316, 1)
  g.fillRect(0, cs * 0.18, cs, cs * 0.82)
  g.fillStyle(0xfacc15, 1)
  g.fillRect(0, cs * 0.6, cs, cs * 0.4)
  g.fillStyle(0xfde047, 1)
  g.beginPath()
  g.moveTo(0, cs * 0.18)
  for (let i = 0; i <= 8; i++) g.lineTo((cs / 8) * i, cs * (0.18 + (i % 2 ? 0.12 : -0.1)))
  g.lineTo(cs, 0.3 * cs)
  g.lineTo(cs, 0.5 * cs)
  g.lineTo(0, 0.5 * cs)
  g.closePath()
  g.fillPath()
  g.fillStyle(0xfef9c3, 0.9)
  g.fillCircle(cs * 0.3, cs * 0.55, cs * 0.06)
  g.fillCircle(cs * 0.75, cs * 0.75, cs * 0.05)
  bake(scene, g, 'hz_lava_' + cs, cs, cs)
}

// ---------- Coleccionables y meta ----------

function makeCollectibles(scene) {
  if (scene.textures.exists('coin')) return
  const S = 64

  let g = newGraphics(scene)
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

  g = newGraphics(scene)
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

  g = newGraphics(scene)
  const pts = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 29 : 12
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push({ x: 32 + Math.cos(a) * r, y: 34 + Math.sin(a) * r })
  }
  g.fillStyle(0xb45309, 1)
  g.fillPoints(pts.map((p) => ({ x: 32 + (p.x - 32) * 1.1, y: 34 + (p.y - 34) * 1.1 })), true)
  g.fillStyle(0xfde047, 1)
  g.fillPoints(pts, true)
  g.fillStyle(0xffffff, 0.8)
  g.fillCircle(26, 26, 3)
  bake(scene, g, 'star', S, S)

  // Partícula y resplandor
  g = newGraphics(scene)
  g.fillStyle(0xffffff, 1)
  g.fillCircle(6, 6, 6)
  bake(scene, g, 'particle', 12, 12)

  g = newGraphics(scene)
  for (let r = 48; r > 0; r -= 4) {
    g.fillStyle(0xfde047, 0.035)
    g.fillCircle(48, 48, r)
  }
  bake(scene, g, 'glow', 96, 96)
}

function makeGoal(scene, cs) {
  const W = 64
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
  bake(scene, g, 'goal_' + cs, W, H)
}

// ---------- Personajes ----------

const CHAR_PALETTES = {
  fox: { body: 0xf97316, dark: 0xc2410c, patch: 0xfff1e0, ear: 0xfda4af, tail: 0xf97316, tip: 0xffffff },
  blu: { body: 0x3b82f6, dark: 0x1d4ed8, patch: 0xe0f2fe, ear: 0xbfdbfe, tail: 0x3b82f6, tip: 0x93c5fd },
}

// 96x96: el cuerpo ocupa de x=12 a x=84 y de y=22 a y=90.
function drawCharacter(g, id, expression) {
  const p = CHAR_PALETTES[id]

  // cola
  g.fillStyle(p.dark, 1)
  g.fillEllipse(82, 66, 26, 18)
  g.fillStyle(p.tail, 1)
  g.fillEllipse(81, 65, 22, 14)
  g.fillStyle(p.tip, 1)
  g.fillEllipse(90, 62, 9, 11)

  // orejas
  if (id === 'fox') {
    g.fillStyle(p.dark, 1)
    g.fillTriangle(18, 34, 22, 4, 44, 26)
    g.fillTriangle(52, 26, 74, 4, 78, 34)
    g.fillStyle(p.ear, 1)
    g.fillTriangle(24, 30, 26, 13, 38, 26)
    g.fillTriangle(58, 26, 70, 13, 72, 30)
  } else {
    g.fillStyle(p.dark, 1)
    g.fillCircle(26, 20, 14)
    g.fillCircle(70, 20, 14)
    g.fillStyle(p.ear, 1)
    g.fillCircle(26, 21, 8)
    g.fillCircle(70, 21, 8)
  }

  // cuerpo
  g.fillStyle(p.dark, 1)
  g.fillRoundedRect(10, 20, 76, 72, 30)
  g.fillStyle(p.body, 1)
  g.fillRoundedRect(13, 22, 70, 66, 28)
  // brillo
  g.fillStyle(0xffffff, 0.22)
  g.fillRoundedRect(20, 27, 30, 10, 5)
  // panza / hocico
  g.fillStyle(p.patch, 1)
  g.fillEllipse(48, 70, 50, 32)

  if (id === 'blu') {
    // bufanda amarilla
    g.fillStyle(0xfacc15, 1)
    g.fillRoundedRect(18, 78, 60, 10, 5)
    g.fillStyle(0xeab308, 1)
    g.fillRoundedRect(62, 80, 12, 16, 4)
  }

  // ojos
  const eyeY = 48
  const eye = (cx) => {
    if (expression === 'happy') {
      g.lineStyle(4, 0x1e293b, 1)
      g.beginPath()
      g.arc(cx, eyeY + 3, 7, Math.PI * 1.05, Math.PI * 1.95)
      g.strokePath()
    } else if (expression === 'hurt') {
      g.lineStyle(4, 0x1e293b, 1)
      g.lineBetween(cx - 6, eyeY - 6, cx + 6, eyeY + 6)
      g.lineBetween(cx + 6, eyeY - 6, cx - 6, eyeY + 6)
    } else {
      g.fillStyle(0xffffff, 1)
      g.fillEllipse(cx, eyeY, 17, 20)
      g.fillStyle(0x1e293b, 1)
      g.fillEllipse(cx + 2, eyeY + 1, 10, 13)
      g.fillStyle(0xffffff, 1)
      g.fillCircle(cx + 4, eyeY - 3, 2.6)
    }
  }
  eye(34)
  eye(62)

  // mejillas, nariz y boca
  g.fillStyle(0xfb7185, 0.55)
  g.fillCircle(22, 60, 5)
  g.fillCircle(74, 60, 5)
  g.fillStyle(0x1e293b, 1)
  g.fillTriangle(44, 58, 52, 58, 48, 63)
  g.lineStyle(3, 0x1e293b, 1)
  g.beginPath()
  if (expression === 'happy') {
    g.arc(48, 63, 9, 0.15, Math.PI - 0.15)
  } else if (expression === 'hurt') {
    g.arc(48, 74, 7, Math.PI * 1.1, Math.PI * 1.9)
  } else {
    g.arc(43, 63, 5, 0.1, Math.PI - 0.1)
    g.arc(53, 63, 5, 0.1, Math.PI - 0.1)
  }
  g.strokePath()

  // patitas
  g.fillStyle(p.dark, 1)
  g.fillRoundedRect(22, 86, 18, 8, 4)
  g.fillRoundedRect(56, 86, 18, 8, 4)
}

function makeCharacters(scene) {
  if (scene.textures.exists('char_fox_normal')) return
  for (const id of Object.keys(CHAR_PALETTES)) {
    for (const expression of ['normal', 'happy', 'hurt']) {
      const g = newGraphics(scene)
      drawCharacter(g, id, expression)
      bake(scene, g, `char_${id}_${expression}`, 96, 96)
    }
  }
}

export const VIEW = { width: VIEW_W, height: VIEW_H }

export function buildTextures(scene, theme, cs) {
  makeSky(scene, theme)
  makeMountains(scene, theme)
  makeStars(scene)
  makeClouds(scene)
  makeTiles(scene, theme, cs)
  makeHazards(scene, cs)
  makeCollectibles(scene)
  makeGoal(scene, cs)
  makeCharacters(scene)
}
