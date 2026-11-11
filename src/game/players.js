import Phaser from 'phaser'
import { FONT, JUMP, SPEED } from './constants'

const TAG_COLORS = { fox: '#fed7aa', blu: '#bfdbfe' }

// ---------- Creación ----------

function createBody(scene, { x, y }, charId) {
  const size = scene.cs * 0.75
  // Cuerpo físico invisible + sprite visual aparte: así se puede deformar
  // (estirar/aplastar) sin alterar la hitbox.
  const pl = scene.add.rectangle(x, y, size, size, 0x000000, 0)
  scene.physics.add.existing(pl)
  pl.body.setCollideWorldBounds(true)
  Object.assign(pl, { charId, spawn: { x, y }, reachedGoal: false, invulnerable: false, wasOnGround: false, prevVy: 0, size })
  return pl
}

function addVisual(scene, pl, label) {
  const { x, y, size, charId } = pl
  pl.baseScale = (size * (96 / 72)) / 96
  pl.vis = scene.add
    .image(x, y + size / 2, `char_${charId}_normal`)
    .setOrigin(0.5, 90 / 96)
    .setScale(pl.baseScale)
    .setDepth(10)
  pl.tag = scene.add
    .text(x, y - size, label, {
      fontFamily: FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      color: TAG_COLORS[charId],
      stroke: '#0f172a',
      strokeThickness: 4,
    })
    .setOrigin(0.5, 1)
    .setDepth(11)
    .setVisible(scene.mode === 'coop')
}

function createPlayer(scene, { pos, charId, label }) {
  const pl = createBody(scene, pos, charId)
  addVisual(scene, pl, label)
  return pl
}

// Arrastra al jugador junto con la plataforma móvil.
const carryPlayer = (player, plat) => {
  if (player.body.touching.down && plat.body.touching.up) player.x += plat.body.deltaX()
}

function addCollisions(scene, pl) {
  const { add } = scene.physics
  add.collider(pl, scene.platforms)
  add.collider(pl, scene.movers, carryPlayer)
  add.collider(pl, scene.crumbles, (player, plat) => {
    if (player.body.touching.down && plat.body.touching.up) scene.triggerCrumble(plat)
  })
  add.overlap(pl, scene.hazards, () => scene.die(pl))
  add.overlap(pl, scene.coins, (_p, item) => scene.collect(pl, item))
  add.overlap(pl, scene.goal, () => scene.reachGoal(pl))
}

export function createPlayers(scene, grid) {
  const cs = scene.cs
  const at = (s) => ({ x: (s.x + 0.5) * cs, y: (s.y + 0.5) * cs })
  const specs = [{ pos: at(grid.spawn_j1), charId: 'fox', label: 'J1' }]
  if (scene.mode === 'coop') specs.push({ pos: at(grid.spawn_j2 || grid.spawn_j1), charId: 'blu', label: 'J2' })

  scene.players = specs.map((spec) => createPlayer(scene, spec))
  if (scene.players.length > 1) scene.physics.add.collider(scene.players[0], scene.players[1])
  scene.players.forEach((pl) => addCollisions(scene, pl))
}

// ---------- Entrada ----------

export function createInput(scene) {
  const K = Phaser.Input.Keyboard.KeyCodes
  scene.wasd = scene.input.keyboard.addKeys({ up: K.W, left: K.A, right: K.D })
  scene.cursors = scene.input.keyboard.createCursorKeys()
  scene.input.keyboard.addCapture([K.W, K.A, K.S, K.D, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.SPACE])
  scene.input.keyboard.on('keydown-P', () => scene.togglePause())
  scene.input.keyboard.on('keydown-ESC', () => scene.togglePause())
  scene.input.keyboard.on('keydown-R', () => scene.restartLevel())
}

const keysOf = (k) => ({ left: k.left.isDown, right: k.right.isDown, jump: k.up.isDown })

/** Una entrada { left, right, jump } por jugador: coop usa WASD y flechas; un jugador usa ambos. */
export function readInputs(scene) {
  const w = keysOf(scene.wasd)
  const c = keysOf(scene.cursors)
  if (scene.players.length > 1) return [w, c]
  return [{ left: w.left || c.left, right: w.right || c.right, jump: w.jump || c.jump || scene.cursors.space.isDown }]
}

// ---------- Movimiento y animación ----------

const isOnGround = (body) => body.blocked.down || body.touching.down

function stretch(scene, pl, sx, sy) {
  pl.scaleTween?.stop()
  pl.vis.setScale(pl.baseScale * sx, pl.baseScale * sy)
  pl.scaleTween = scene.tweens.add({ targets: pl.vis, scaleX: pl.baseScale, scaleY: pl.baseScale, duration: 180, ease: 'Quad.easeOut' })
}

function horizontalVelocity({ left, right }) {
  if (left) return -SPEED
  return right ? SPEED : 0
}

export function movePlayer(scene, pl, input) {
  if (pl.reachedGoal) return
  pl.body.setVelocityX(horizontalVelocity(input))
  if (!input.jump || !isOnGround(pl.body)) return
  pl.body.setVelocityY(JUMP)
  stretch(scene, pl, 0.8, 1.25)
  scene.dustEmitter.explode(5, pl.x, pl.y + pl.size / 2)
}

function landingEffect(scene, pl, onGround) {
  if (onGround && !pl.wasOnGround && pl.prevVy > 280) {
    stretch(scene, pl, 1.3, 0.72)
    scene.dustEmitter.explode(6, pl.x, pl.y + pl.size / 2)
  }
  pl.wasOnGround = onGround
  pl.prevVy = pl.body.velocity.y
}

function faceDirection(pl) {
  const vx = pl.body.velocity.x
  if (vx < -5) pl.vis.setFlipX(true)
  else if (vx > 5) pl.vis.setFlipX(false)
}

function idleOrRun(pl, time, onGround) {
  const running = onGround && Math.abs(pl.body.velocity.x) > 5
  pl.vis.setAngle(running ? Math.sin(time / 55) * 7 : 0)
  if (pl.scaleTween?.isPlaying() || pl.reachedGoal) return
  const bob = Math.sin(time / 280) * 0.012
  pl.vis.setScale(pl.baseScale * (1 - bob), pl.baseScale * (1 + bob))
}

function syncVisual(pl) {
  pl.vis.x = pl.x
  if (!pl.reachedGoal) pl.vis.y = pl.y + pl.size / 2 // al ganar, la animación de salto maneja la altura
  pl.tag.setPosition(pl.x, pl.y - pl.size * 0.9)
}

export function animatePlayer(scene, pl, time) {
  const onGround = isOnGround(pl.body)
  landingEffect(scene, pl, onGround)
  faceDirection(pl)
  idleOrRun(pl, time, onGround)
  syncVisual(pl)
}
