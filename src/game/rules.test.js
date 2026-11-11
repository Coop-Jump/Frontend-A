import { beforeEach, describe, expect, it, vi } from 'vitest'
import { collect, die, reachGoal, triggerCrumble } from './rules'

// Escena falsa con lo mínimo que usan las reglas (sin Phaser ni canvas).
function makeScene(overrides = {}) {
  const tweens = []
  const delayed = []
  return {
    finished: false, deaths: 0, score: 0, coinsCollected: 0, coinsTotal: 2, elapsed: 4321,
    players: [],
    sparkEmitter: { explode: vi.fn() },
    deathEmitter: { explode: vi.fn() },
    winEmitter: { explode: vi.fn() },
    cameras: { main: { shake: vi.fn() } },
    physics: { pause: vi.fn() },
    emitHud: vi.fn(),
    game: { events: { emit: vi.fn() } },
    add: { text: vi.fn(() => ({ setOrigin: () => ({ setDepth: () => ({ destroy: vi.fn() }) }) })) },
    tweens: { add: vi.fn((cfg) => tweens.push(cfg)), killTweensOf: vi.fn() },
    time: { delayedCall: vi.fn((ms, fn) => delayed.push({ ms, fn })) },
    _tweens: tweens, _delayed: delayed,
    ...overrides,
  }
}

const makePlayer = (extra = {}) => ({
  charId: 'fox', reachedGoal: false, invulnerable: false, x: 100, y: 200, spawn: { x: 10, y: 20 },
  vis: { setTexture: vi.fn(), setAlpha: vi.fn(), y: 50 },
  body: { setVelocity: vi.fn(), enable: true },
  setPosition: vi.fn(),
  ...extra,
})

describe('collect', () => {
  let scene
  beforeEach(() => { scene = makeScene() })

  it('suma los puntos según el tipo de tesoro', () => {
    const item = { active: true, kind: 'gem', x: 5, y: 6, destroy: vi.fn(), glow: { destroy: vi.fn() } }
    collect(scene, item)
    expect(scene.score).toBe(50)
    expect(scene.coinsCollected).toBe(1)
    expect(item.destroy).toHaveBeenCalled()
    expect(item.glow.destroy).toHaveBeenCalled()
    expect(scene.sparkEmitter.explode).toHaveBeenCalledWith(16, 5, 6)
  })

  it('una moneda vale 10 y usa menos partículas', () => {
    collect(scene, { active: true, kind: 'coin', x: 1, y: 1, destroy: vi.fn() })
    expect(scene.score).toBe(10)
    expect(scene.sparkEmitter.explode).toHaveBeenCalledWith(8, 1, 1)
  })

  it('ignora un tesoro que ya no está activo', () => {
    collect(scene, { active: false, kind: 'star', x: 1, y: 1, destroy: vi.fn() })
    expect(scene.score).toBe(0)
    expect(scene.coinsCollected).toBe(0)
  })
})

describe('die', () => {
  it('cuenta la muerte y devuelve al jugador a su inicio', () => {
    const scene = makeScene()
    const pl = makePlayer()
    die(scene, pl)
    expect(scene.deaths).toBe(1)
    expect(pl.setPosition).toHaveBeenCalledWith(10, 20)
    expect(pl.body.setVelocity).toHaveBeenCalledWith(0, 0)
    expect(pl.invulnerable).toBe(true)
    expect(pl.vis.setTexture).toHaveBeenCalledWith('char_fox_hurt')
    expect(scene.cameras.main.shake).toHaveBeenCalled()
  })

  it('no cuenta dos veces mientras es invulnerable, salvo que se fuerce', () => {
    const scene = makeScene()
    const pl = makePlayer({ invulnerable: true })
    die(scene, pl)
    expect(scene.deaths).toBe(0)
    die(scene, pl, true)
    expect(scene.deaths).toBe(1)
  })

  it('no muere quien ya llegó a la meta ni cuando terminó la partida', () => {
    const scene = makeScene()
    die(scene, makePlayer({ reachedGoal: true }))
    scene.finished = true
    die(scene, makePlayer())
    expect(scene.deaths).toBe(0)
  })

  it('al terminar el parpadeo vuelve a ser vulnerable', () => {
    const scene = makeScene()
    const pl = makePlayer()
    die(scene, pl)
    scene._tweens.at(-1).onComplete()
    expect(pl.invulnerable).toBe(false)
    expect(pl.vis.setTexture).toHaveBeenLastCalledWith('char_fox_normal')
  })
})

describe('reachGoal', () => {
  it('con un solo jugador pendiente solo marca su llegada', () => {
    const scene = makeScene()
    const a = makePlayer()
    const b = makePlayer({ charId: 'blu' })
    scene.players = [a, b]
    reachGoal(scene, a)
    expect(a.reachedGoal).toBe(true)
    expect(a.body.enable).toBe(false)
    expect(scene.finished).toBe(false)
    expect(scene.game.events.emit).not.toHaveBeenCalled()
  })

  it('cuando llegan todos termina la partida y emite el resultado', () => {
    const scene = makeScene({ deaths: 2, score: 60, coinsCollected: 3 })
    const a = makePlayer()
    scene.players = [a]
    reachGoal(scene, a)
    expect(scene.finished).toBe(true)
    expect(scene.physics.pause).toHaveBeenCalled()
    expect(scene.game.events.emit).toHaveBeenCalledWith('run-complete', {
      completionTimeMs: 4321, deaths: 2, score: 60, coins: 3, coinsTotal: 2,
    })
  })

  it('ignora una segunda llegada del mismo jugador', () => {
    const scene = makeScene()
    const a = makePlayer({ reachedGoal: true })
    scene.players = [a]
    reachGoal(scene, a)
    expect(scene.game.events.emit).not.toHaveBeenCalled()
  })
})

describe('triggerCrumble', () => {
  const makePlatform = () => ({ triggered: false, delay: 1000, baseX: 50, x: 50, body: { enable: true } })

  it('solo se activa una vez', () => {
    const scene = makeScene()
    const plat = makePlatform()
    triggerCrumble(scene, plat)
    triggerCrumble(scene, plat)
    expect(plat.triggered).toBe(true)
    expect(scene.time.delayedCall).toHaveBeenCalledTimes(1)
  })

  it('se rompe tras el retraso y reaparece después', () => {
    const scene = makeScene()
    const plat = makePlatform()
    triggerCrumble(scene, plat)
    scene._delayed[0].fn() // se rompe
    scene._tweens.at(-1).onComplete()
    expect(plat.body.enable).toBe(false)
    scene._delayed[1].fn() // reaparece
    expect(plat.body.enable).toBe(true)
    expect(plat.triggered).toBe(false)
  })
})
