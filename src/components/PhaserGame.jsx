import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { fetchLevels } from '../services/levelService'

function formatTime(ms) {
  const total = Math.floor(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0')
  return `${m}:${s}.${cs}`
}

// Física validada contra los niveles del seed (ver Docs/seed.sql):
// gravedad 1200, velocidad 200, salto 520, jugador de 0.75 celdas.
const GRAVITY = 1200
const SPEED = 200
const JUMP = -520

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
    const cx = (x, w = 1) => (x + w / 2) * cs
    const cy = (y, h = 1) => (y + h / 2) * cs

    this.cs = cs
    this.deaths = 0
    this.finished = false
    this.startTime = this.time.now

    this.physics.world.setBounds(0, 0, grid.grid_width * cs, grid.grid_height * cs)
    this.cameras.main.setBounds(0, 0, grid.grid_width * cs, grid.grid_height * cs)

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

    this.goal = this.add.rectangle(cx(grid.goal.x), cy(grid.goal.y), cs, cs, 0xfacc15)
    this.physics.add.existing(this.goal, true)

    // Dos jugadores: J1 naranja (WASD), J2 rojo (flechas)
    const spawn1 = grid.spawn_j1
    const spawn2 = grid.spawn_j2 || grid.spawn_j1
    this.players = [
      this.createPlayer(cx(spawn1.x), cy(spawn1.y), 0xf97316),
      this.createPlayer(cx(spawn2.x), cy(spawn2.y), 0xe53e3e),
    ]

    this.physics.add.collider(this.players[0], this.players[1])
    this.players.forEach((pl) => {
      this.physics.add.collider(pl, this.platforms)
      this.physics.add.overlap(pl, this.hazards, () => this.die(pl))
      this.physics.add.overlap(pl, this.coins, (_p, coin) => coin.destroy())
      this.physics.add.overlap(pl, this.goal, () => this.reachGoal(pl))
    })

    const K = Phaser.Input.Keyboard.KeyCodes
    this.wasd = this.input.keyboard.addKeys({ up: K.W, left: K.A, right: K.D })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.addCapture([K.W, K.A, K.S, K.D, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.SPACE])

    this.hud = this.add
      .text(12, 10, '', { fontSize: '18px', color: '#ffffff', backgroundColor: '#00000080', padding: { x: 8, y: 4 } })
      .setDepth(10)
      .setScrollFactor(0)

    // La cámara sigue el punto medio entre los dos jugadores
    this.cameraTarget = this.add.zone(this.players[0].x, this.players[0].y, 1, 1)
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1)
  }

  createPlayer(x, y, color) {
    const size = this.cs * 0.75
    const pl = this.add.rectangle(x, y, size, size, color)
    this.physics.add.existing(pl)
    pl.body.setCollideWorldBounds(true)
    pl.spawn = { x, y }
    pl.reachedGoal = false
    return pl
  }

  die(pl) {
    if (this.finished || pl.reachedGoal) return
    this.deaths += 1
    pl.setPosition(pl.spawn.x, pl.spawn.y)
    pl.body.setVelocity(0, 0)
  }

  reachGoal(pl) {
    if (this.finished || pl.reachedGoal) return
    pl.reachedGoal = true
    pl.setFillStyle(0x22c55e)
    pl.body.setVelocity(0, 0)
    pl.body.enable = false
    if (this.players.every((p) => p.reachedGoal)) {
      this.finished = true
      const completionTimeMs = this.time.now - this.startTime
      this.physics.pause()
      this.game.events.emit('run-complete', { completionTimeMs, deaths: this.deaths })
    }
  }

  move(pl, left, right, jump) {
    if (pl.reachedGoal) return
    const body = pl.body
    body.setVelocityX(left ? -SPEED : right ? SPEED : 0)
    if (jump && body.blocked.down) body.setVelocityY(JUMP)
  }

  update() {
    if (this.finished) return
    const [p1, p2] = this.players
    this.move(p1, this.wasd.left.isDown, this.wasd.right.isDown, this.wasd.up.isDown)
    this.move(p2, this.cursors.left.isDown, this.cursors.right.isDown, this.cursors.up.isDown)

    this.cameraTarget.setPosition((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)

    const st = (p) => (p.reachedGoal ? '✓' : '●')
    this.hud.setText(
      `Tiempo: ${formatTime(this.time.now - this.startTime)}  Muertes: ${this.deaths}  |  J1 ${st(p1)}  J2 ${st(p2)}`,
    )
  }
}

export default function PhaserGame({ level: levelProp, onComplete }) {
  const phaserRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const [fallbackLevel, setFallbackLevel] = useState(null)
  const level = levelProp || fallbackLevel

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Sin nivel por props (p. ej. /singleplayer, /two-player): usa el primero del backend
  useEffect(() => {
    if (levelProp) return
    let cancelled = false
    fetchLevels()
      .then((data) => {
        if (!cancelled) setFallbackLevel(data.levels?.[0]?.grid_json || null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [levelProp])

  useEffect(() => {
    if (!phaserRef.current || !level) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: '#1a202c',
      parent: phaserRef.current,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 600 },
      physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
      scene: [],
    })
    game.scene.add('MainScene', MainScene, true, { level })
    game.events.on('run-complete', (result) => onCompleteRef.current?.(result))

    return () => {
      game.destroy(true)
    }
  }, [level])

  return (
    <div>
      <div
        ref={phaserRef}
        style={{ width: '100%', maxWidth: 800, height: 600, margin: '0 auto', borderRadius: 16, overflow: 'hidden' }}
      />
      {!level && <p style={{ textAlign: 'center' }}>Cargando nivel...</p>}
      <div style={{ maxWidth: 800, margin: '16px auto 0', padding: 14, background: '#fff7ed', borderRadius: 12, color: '#7c2d12', fontSize: 14, border: '2px solid #ffedd5' }}>
        <strong style={{ color: '#f97316' }}>Controles:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.6 }}>
          <li><strong>Jugador 1 (Naranja):</strong> A / D mover, W saltar</li>
          <li><strong>Jugador 2 (Rojo):</strong> Flechas ← → mover, ↑ saltar</li>
          <li><strong>Objetivo:</strong> ambos jugadores deben llegar a la meta (cuadrado dorado)</li>
          <li><strong>Pinchos rojos:</strong> suman una muerte y vuelves al inicio</li>
        </ul>
      </div>
    </div>
  )
}
