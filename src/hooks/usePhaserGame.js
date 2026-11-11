import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import MainScene from '../game/MainScene'
import { GRAVITY } from '../game/constants'
import { VIEW } from '../game/textures'

const EMPTY_HUD = { elapsed: 0, deaths: 0, score: 0, coins: 0, coinsTotal: 0, players: [] }

const gameConfig = (parent) => ({
  type: Phaser.AUTO,
  backgroundColor: '#0f172a',
  parent,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: VIEW.width, height: VIEW.height },
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
  scene: [],
})

function startGame(container, sceneData, handlers) {
  const game = new Phaser.Game(gameConfig(container))
  game.scene.add('MainScene', MainScene, true, sceneData)
  game.events.on('hud', handlers.setHud)
  game.events.on('pause-changed', handlers.setPaused)
  game.events.on('run-complete', handlers.onComplete)
  return game
}

/** Crea y destruye la instancia de Phaser y expone el HUD y el estado de pausa. */
export function usePhaserGame(options) {
  const { containerRef, level, mode, difficulty, playable, onComplete } = options
  const gameRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const [hud, setHud] = useState(EMPTY_HUD)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!containerRef.current || !playable) return undefined
    const handlers = { setHud, setPaused, onComplete: (result) => onCompleteRef.current?.(result) }
    const game = startGame(containerRef.current, { level, mode, difficulty }, handlers)
    gameRef.current = game
    return () => {
      gameRef.current = null
      game.destroy(true)
    }
  }, [containerRef, level, mode, difficulty, playable])

  const scene = () => gameRef.current?.scene.getScene('MainScene')
  return { hud, paused, togglePause: () => scene()?.togglePause(), restart: () => scene()?.restartLevel() }
}
