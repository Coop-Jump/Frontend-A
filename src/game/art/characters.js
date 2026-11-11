import { bake, newGraphics } from './core'

const CHAR_PALETTES = {
  fox: { body: 0xf97316, dark: 0xc2410c, patch: 0xfff1e0, ear: 0xfda4af, tail: 0xf97316, tip: 0xffffff },
  blu: { body: 0x3b82f6, dark: 0x1d4ed8, patch: 0xe0f2fe, ear: 0xbfdbfe, tail: 0x3b82f6, tip: 0x93c5fd },
}
const EXPRESSIONS = ['normal', 'happy', 'hurt']
const DARK = 0x1e293b

function drawTail(g, p) {
  g.fillStyle(p.dark, 1)
  g.fillEllipse(82, 66, 26, 18)
  g.fillStyle(p.tail, 1)
  g.fillEllipse(81, 65, 22, 14)
  g.fillStyle(p.tip, 1)
  g.fillEllipse(90, 62, 9, 11)
}

function drawFoxEars(g, p) {
  g.fillStyle(p.dark, 1)
  g.fillTriangle(18, 34, 22, 4, 44, 26)
  g.fillTriangle(52, 26, 74, 4, 78, 34)
  g.fillStyle(p.ear, 1)
  g.fillTriangle(24, 30, 26, 13, 38, 26)
  g.fillTriangle(58, 26, 70, 13, 72, 30)
}

function drawRoundEars(g, p) {
  g.fillStyle(p.dark, 1)
  g.fillCircle(26, 20, 14)
  g.fillCircle(70, 20, 14)
  g.fillStyle(p.ear, 1)
  g.fillCircle(26, 21, 8)
  g.fillCircle(70, 21, 8)
}

// bufanda amarilla de Blu
function drawScarf(g) {
  g.fillStyle(0xfacc15, 1)
  g.fillRoundedRect(18, 78, 60, 10, 5)
  g.fillStyle(0xeab308, 1)
  g.fillRoundedRect(62, 80, 12, 16, 4)
}

function drawBody(g, p) {
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
}

const EYE_Y = 48

function drawHappyEye(g, cx) {
  g.lineStyle(4, DARK, 1)
  g.beginPath()
  g.arc(cx, EYE_Y + 3, 7, Math.PI * 1.05, Math.PI * 1.95)
  g.strokePath()
}

function drawHurtEye(g, cx) {
  g.lineStyle(4, DARK, 1)
  g.lineBetween(cx - 6, EYE_Y - 6, cx + 6, EYE_Y + 6)
  g.lineBetween(cx + 6, EYE_Y - 6, cx - 6, EYE_Y + 6)
}

function drawNormalEye(g, cx) {
  g.fillStyle(0xffffff, 1)
  g.fillEllipse(cx, EYE_Y, 17, 20)
  g.fillStyle(DARK, 1)
  g.fillEllipse(cx + 2, EYE_Y + 1, 10, 13)
  g.fillStyle(0xffffff, 1)
  g.fillCircle(cx + 4, EYE_Y - 3, 2.6)
}

const EYES = { happy: drawHappyEye, hurt: drawHurtEye, normal: drawNormalEye }

const MOUTHS = {
  happy: (g) => g.arc(48, 63, 9, 0.15, Math.PI - 0.15),
  hurt: (g) => g.arc(48, 74, 7, Math.PI * 1.1, Math.PI * 1.9),
  normal: (g) => {
    g.arc(43, 63, 5, 0.1, Math.PI - 0.1)
    g.arc(53, 63, 5, 0.1, Math.PI - 0.1)
  },
}

// ojos, mejillas, nariz y boca
function drawFace(g, expression) {
  EYES[expression](g, 34)
  EYES[expression](g, 62)
  g.fillStyle(0xfb7185, 0.55)
  g.fillCircle(22, 60, 5)
  g.fillCircle(74, 60, 5)
  g.fillStyle(DARK, 1)
  g.fillTriangle(44, 58, 52, 58, 48, 63)
  g.lineStyle(3, DARK, 1)
  g.beginPath()
  MOUTHS[expression](g)
  g.strokePath()
}

function drawFeet(g, p) {
  g.fillStyle(p.dark, 1)
  g.fillRoundedRect(22, 86, 18, 8, 4)
  g.fillRoundedRect(56, 86, 18, 8, 4)
}

// 96x96: el cuerpo ocupa de x=12 a x=84 y de y=22 a y=90.
function drawCharacter(g, id, expression) {
  const p = CHAR_PALETTES[id]
  drawTail(g, p)
  if (id === 'fox') drawFoxEars(g, p)
  else drawRoundEars(g, p)
  drawBody(g, p)
  if (id === 'blu') drawScarf(g)
  drawFace(g, expression)
  drawFeet(g, p)
}

export function makeCharacters(scene) {
  if (scene.textures.exists('char_fox_normal')) return
  Object.keys(CHAR_PALETTES).forEach((id) => {
    EXPRESSIONS.forEach((expression) => {
      const g = newGraphics(scene)
      drawCharacter(g, id, expression)
      bake(scene, g, `char_${id}_${expression}`, 96, 96)
    })
  })
}
