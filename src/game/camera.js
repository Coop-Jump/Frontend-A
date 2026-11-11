import Phaser from 'phaser'
import { CAMERA_MIN_ZOOM, CAMERA_PAD_X, CAMERA_PAD_Y, CAMERA_ZOOM_LERP } from './constants'
import { VIEW } from './textures'

/** Zoom mínimo permitido: como máximo se ve el nivel completo. */
export function minZoomFor(worldW, worldH) {
  return Phaser.Math.Clamp(Math.min(VIEW.width / worldW, VIEW.height / worldH), CAMERA_MIN_ZOOM, 1)
}

// En coop se acerca o aleja el zoom para que los dos jugadores queden a la vista.
function wantedZoom(scene) {
  const [a, b] = scene.players
  if (!b) return 1
  const needW = Math.abs(a.x - b.x) + CAMERA_PAD_X * 2
  const needH = Math.abs(a.y - b.y) + CAMERA_PAD_Y * 2
  return Phaser.Math.Clamp(Math.min(VIEW.width / needW, VIEW.height / needH), scene.minZoom, 1)
}

// Centra en `value` sin salirse del mundo (o centrado si el mundo es más chico que la vista).
function clampCenter(value, half, world) {
  return world <= half * 2 ? world / 2 : Phaser.Math.Clamp(value, half, world - half)
}

function targetPoint(scene, zoom) {
  const n = scene.players.length
  const mx = scene.players.reduce((sum, p) => sum + p.x, 0) / n
  const my = scene.players.reduce((sum, p) => sum + p.y, 0) / n
  return {
    x: clampCenter(mx, VIEW.width / (2 * zoom), scene.worldW),
    y: clampCenter(my, VIEW.height / (2 * zoom), scene.worldH),
  }
}

/** Encuadra a los jugadores. Con `immediate` salta directo a la posición final. */
export function updateCamera(scene, immediate = false) {
  const cam = scene.cameras.main
  const wanted = wantedZoom(scene)
  const zoom = immediate ? wanted : cam.zoom + (wanted - cam.zoom) * CAMERA_ZOOM_LERP
  cam.setZoom(zoom)

  const point = targetPoint(scene, zoom)
  scene.cameraTarget.setPosition(point.x, point.y)
  if (immediate) cam.centerOn(point.x, point.y)

  // Capas fijas y nombres de jugador mantienen su tamaño en pantalla.
  scene.fixedLayers.forEach((layer) => layer.setScale(1 / zoom))
  scene.players.forEach((pl) => pl.tag.setScale(1 / zoom))
}
