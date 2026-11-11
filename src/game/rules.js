import { FONT, POINTS, RESPAWN_PLATFORM_MS } from './constants'

const POPUP_COLORS = { coin: '#fde047', gem: '#67e8f9', star: '#fef08a' }

function floatText(scene, { x, y, text, color }) {
  const t = scene.add
    .text(x, y, text, { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color, stroke: '#0f172a', strokeThickness: 4 })
    .setOrigin(0.5)
    .setDepth(30)
  scene.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 800, ease: 'Cubic.easeOut', onComplete: () => t.destroy() })
}

export function collect(scene, item) {
  if (!item.active) return
  const pts = POINTS[item.kind]
  scene.score += pts
  scene.coinsCollected += 1
  scene.sparkEmitter.explode(item.kind === 'coin' ? 8 : 16, item.x, item.y)
  floatText(scene, { x: item.x, y: item.y - 8, text: `+${pts}`, color: POPUP_COLORS[item.kind] })
  item.glow?.destroy()
  scene.tweens.killTweensOf(item)
  item.destroy()
}

function respawnPlatform(scene, plat) {
  plat.x = plat.baseX
  plat.body.enable = true
  plat.triggered = false
  scene.tweens.add({ targets: plat, alpha: 1, duration: 250 })
}

function breakPlatform(scene, plat) {
  scene.tweens.add({
    targets: plat,
    alpha: 0,
    duration: 180,
    onComplete: () => {
      plat.body.enable = false
    },
  })
  scene.time.delayedCall(RESPAWN_PLATFORM_MS, () => respawnPlatform(scene, plat))
}

export function triggerCrumble(scene, plat) {
  if (plat.triggered) return
  plat.triggered = true
  scene.tweens.add({ targets: plat, x: plat.baseX + 2, duration: 50, yoyo: true, repeat: Math.floor(plat.delay / 100) })
  scene.time.delayedCall(plat.delay, () => breakPlatform(scene, plat))
}

function blinkAfterDeath(scene, pl) {
  scene.tweens.add({
    targets: pl.vis,
    alpha: 0.35,
    duration: 90,
    yoyo: true,
    repeat: 7,
    onComplete: () => {
      pl.vis.setAlpha(1)
      pl.invulnerable = false
      if (!pl.reachedGoal) pl.vis.setTexture(`char_${pl.charId}_normal`)
    },
  })
}

export function die(scene, pl, force = false) {
  const blocked = scene.finished || pl.reachedGoal || (pl.invulnerable && !force)
  if (blocked) return
  scene.deaths += 1
  scene.deathEmitter.explode(20, pl.x, pl.y)
  scene.cameras.main.shake(160, 0.006)

  pl.invulnerable = true
  pl.vis.setTexture(`char_${pl.charId}_hurt`)
  pl.setPosition(pl.spawn.x, pl.spawn.y)
  pl.body.setVelocity(0, 0)
  blinkAfterDeath(scene, pl)
}

function finishRun(scene, pl) {
  scene.finished = true
  scene.physics.pause()
  scene.winEmitter.explode(50, pl.x, pl.y - 20)
  scene.emitHud()
  scene.game.events.emit('run-complete', {
    completionTimeMs: scene.elapsed,
    deaths: scene.deaths,
    score: scene.score,
    coins: scene.coinsCollected,
    coinsTotal: scene.coinsTotal,
  })
}

export function reachGoal(scene, pl) {
  if (scene.finished || pl.reachedGoal) return
  pl.reachedGoal = true
  pl.vis.setTexture(`char_${pl.charId}_happy`)
  pl.body.setVelocity(0, 0)
  pl.body.enable = false
  scene.tweens.add({ targets: pl.vis, y: pl.vis.y - 18, duration: 220, yoyo: true, ease: 'Quad.easeOut' })
  scene.winEmitter.explode(24, pl.x, pl.y)
  if (scene.players.every((p) => p.reachedGoal)) finishRun(scene, pl)
}
