import Phaser from 'phaser'

// Todo el arte del juego se dibuja por código (sin archivos de imagen):
// así el juego carga al instante y se puede retocar colores desde theme.js.
export const VIEW_W = 960
export const VIEW_H = 540

export function newGraphics(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false })
}

export function bake(scene, g, key, w, h) {
  if (scene.textures.exists(key)) scene.textures.remove(key)
  g.generateTexture(key, w, h)
  g.destroy()
}

export function lerpColor(a, b, t) {
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.IntegerToColor(a),
    Phaser.Display.Color.IntegerToColor(b),
    100,
    Math.round(t * 100),
  )
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b)
}
