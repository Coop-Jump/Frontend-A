import { VIEW } from './textures'

function addSky(scene) {
  const t = scene.theme
  const center = [VIEW.width / 2, VIEW.height / 2]
  const layers = [scene.add.image(...center, `sky_${t.id}`).setScrollFactor(0).setDepth(-30)]
  if (t.stars) layers.push(scene.add.image(...center, 'stars').setScrollFactor(0).setDepth(-29))
  return layers
}

function addParallax(scene) {
  const t = scene.theme
  scene.clouds = scene.add
    .tileSprite(VIEW.width / 2, 40 + 90, VIEW.width, 180, 'clouds')
    .setScrollFactor(0)
    .setDepth(-28)
    .setAlpha(t.stars ? 0.12 : 0.9)
  scene.mountains = scene.add
    .tileSprite(VIEW.width / 2, VIEW.height - 150, VIEW.width, 300, `mountains_${t.id}`)
    .setScrollFactor(0)
    .setDepth(-27)
  return [scene.clouds, scene.mountains]
}

function addFrame(scene, worldW, worldH) {
  const frame = scene.add.graphics().setDepth(-5)
  frame.lineStyle(4, 0xffffff, 0.35)
  frame.strokeRoundedRect(-2, -2, worldW + 4, worldH + 4, 6)
}

/**
 * Las capas de fondo (y la pantalla de pausa) son fijas en pantalla. Como el zoom de la
 * cámara también las escalaría, cada frame se les aplica la escala inversa (ver camera.js).
 */
export function createBackground(scene, worldW, worldH) {
  scene.fixedLayers = [...addSky(scene), ...addParallax(scene)]
  addFrame(scene, worldW, worldH)
}

/** Parallax de las capas de fondo y lava animada. */
export function updateBackground(scene, time) {
  const cam = scene.cameras.main
  scene.mountains.tilePositionX = cam.scrollX * 0.18
  scene.clouds.tilePositionX = cam.scrollX * 0.08 + time * 0.01
  scene.lavas.forEach((l) => {
    l.tilePositionX = time * 0.03
  })
}
