import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

function formatTime(ms) {
  const total = Math.floor(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0')
  return `${m}:${s}.${cs}`
}

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  init(data) {
    this.level = data.level
  }

  create() {
    const grid = this.level
    const cs = grid.cell_size || 32
    // Convierte coordenadas de celda a píxeles (centro de la celda/rect)
    const cx = (x, w = 1) => (x + w / 2) * cs
    const cy = (y, h = 1) => (y + h / 2) * cs

    this.deaths = 0
    this.finished = false
    this.startTime = this.time.now
    this.spawn = { x: cx(grid.spawn_j1.x), y: cy(grid.spawn_j1.y) }

    this.physics.world.setBounds(0, 0, grid.grid_width * cs, grid.grid_height * cs)

    this.platforms = this.physics.add.staticGroup()
    ;(grid.platforms || []).forEach((p) => {
      const color = p.type === 'goal_platform' ? 0x16a34a : p.type === 'ground' ? 0x334155 : 0x475569
      const r = this.add.rectangle(cx(p.x, p.width), cy(p.y, p.height), p.width * cs, p.height * cs, color)
      this.physics.add.existing(r, true)
      this.platforms.add(r)
    })

    this.hazards = this.physics.add.staticGroup()
    ;(grid.hazards || []).forEach((h) => {
      const r = this.add.rectangle(cx(h.x, h.width), cy(h.y, h.height), h.width * cs, h.height * cs, 0xef4444)
      this.physics.add.existing(r, true)
      this.hazards.add(r)
    })

    this.coins = this.physics.add.staticGroup()
    ;(grid.collectibles || []).forEach((c) => {
      const r = this.add.circle(cx(c.x), cy(c.y), cs / 4, 0xfacc15)
      this.physics.add.existing(r, true)
      this.coins.add(r)
    })

    this.goal = this.add.rectangle(cx(grid.goal.x), cy(grid.goal.y), cs, cs, 0x22c55e)
    this.physics.add.existing(this.goal, true)

    this.player = this.add.rectangle(this.spawn.x, this.spawn.y, cs * 0.75, cs * 0.75, 0x4f9eff)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)

    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.overlap(this.player, this.hazards, () => this.die())
    this.physics.add.overlap(this.player, this.coins, (_p, coin) => coin.destroy())
    this.physics.add.overlap(this.player, this.goal, () => this.reachGoal())

    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = this.input.keyboard.addKeys('A,D,W,SPACE')

    this.hud = this.add
      .text(12, 10, '', { fontSize: '20px', color: '#ffffff' })
      .setDepth(10)
      .setScrollFactor(0)

    // Cámara que sigue al jugador dentro de los límites del nivel
    this.cameras.main.setBounds(0, 0, grid.grid_width * cs, grid.grid_height * cs)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
  }

  die() {
    if (this.finished) return
    this.deaths += 1
    this.player.setPosition(this.spawn.x, this.spawn.y)
    this.player.body.setVelocity(0, 0)
  }

  reachGoal() {
    if (this.finished) return
    this.finished = true
    const completionTimeMs = this.time.now - this.startTime
    this.player.body.setVelocity(0, 0)
    this.physics.pause()
    this.game.events.emit('run-complete', { completionTimeMs, deaths: this.deaths })
  }

  update() {
    if (this.finished) return
    const body = this.player.body
    const left = this.cursors.left.isDown || this.keys.A.isDown
    const right = this.cursors.right.isDown || this.keys.D.isDown
    const jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown

    body.setVelocityX(left ? -200 : right ? 200 : 0)
    if (jump && body.blocked.down) body.setVelocityY(-520)

    this.hud.setText(`Tiempo: ${formatTime(this.time.now - this.startTime)}   Muertes: ${this.deaths}`)
  }
}

export default function PhaserGame({ level, onComplete }) {
  const phaserRef = useRef(null)
  const gameRef = useRef(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!phaserRef.current || !level) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: '#0f172a',
      parent: phaserRef.current,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
      },
      physics: { default: 'arcade', arcade: { gravity: { y: 1200 }, debug: false } },
      scene: [],
    })
    game.scene.add('MainScene', MainScene, true, { level })
    game.events.on('run-complete', (result) => onCompleteRef.current?.(result))
    gameRef.current = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [level])

  return (
    <div
      ref={phaserRef}
      style={{ width: '100%', maxWidth: 800, height: 600, margin: '0 auto' }}
    />
  )
}
