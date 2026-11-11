import { VIEW_H, VIEW_W } from './art/core'
import { makeBackground } from './art/background'
import { makeTiles } from './art/tiles'
import { makeHazards } from './art/hazards'
import { makeCollectibles, makeGoal } from './art/collectibles'
import { makeCharacters } from './art/characters'

export const VIEW = { width: VIEW_W, height: VIEW_H }

/** Dibuja y registra todas las texturas del juego (se llama al crear la escena). */
export function buildTextures(scene, theme, cs) {
  makeBackground(scene, theme)
  makeTiles(scene, theme, cs)
  makeHazards(scene, cs)
  makeCollectibles(scene)
  makeGoal(scene, cs)
  makeCharacters(scene)
}
