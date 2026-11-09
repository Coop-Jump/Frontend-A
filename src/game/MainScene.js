import Phaser from 'phaser'
import { getTheme } from './theme'
import { buildTextures, VIEW } from './textures'

// Física validada contra los niveles del seed (ver Docs/seed.sql):
// gravedad 1200, velocidad 200, salto 520, jugador de 0.75 celdas.
export const GRAVITY = 1200
const SPEED = 200
const JUMP = -520

const FONT = 'Fredoka, Inter, system-ui, sans-serif'
const POINTS = { coin: 10, gem: 50, star: 100 }
const RESPAWN_PLATFORM_MS = 2500
const HUD_INTERVAL_MS = 80

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  init(data) {
    this.level = data.level
    this.mode = data.mode || 'coop'
    this.theme = getTheme(data.difficulty)
  }

  create() {
    const grid = this.level
    const cs = grid.cell_size || 32
    const worldW = grid.grid_width * cs
    const worldH = grid.grid_height * cs

    this.cs = cs
    this.worldH = worldH
    this.deaths = 0
    this.score = 0
    this.coinsCollected = 0
    this.coinsTotal = (grid.collectibles || []).length
    this.elapsed = 0
    this.finished = false
    this.paused = false
    this.hudTimer = 0

    buildTextures(this, this.theme, cs)

    this.physics.world.setBounds(0, 0, worldW, worldH)
    // Sin colisión abajo: caer al vacío cuenta como muerte (ver update).
    this.physics.world.setBoundsCollision(true, true, true, false)
    // Si el nivel es más chico que la pantalla, los límites se amplían para que quede centrado.
    const boundsW = Math.max(worldW, VIEW.width)
    const boundsH = Math.max(worldH, VIEW.height)
    this.cameras.main.setBounds(-(boundsW - worldW) / 2, -(boundsH - worldH) / 2, boundsW, boundsH)
    this.cameras.main.setRoundPixels(true)

    this.createBackground(worldW, worldH)
    this.createEmitters()
    this.createPlatforms(grid)
    this.createHazards(grid)
    this.createCollectibles(grid)
    this.createGoal(grid)
    this.createPlayers(grid)
    this.createInput()

    this.cameraTarget = this.add.zone(this.players[0].x, this.players[0].y, 1, 1)
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1)
    this.cameras.main.fadeIn(350, 0, 0, 0)

    this.pauseText = this.add
      .text(VIEW.width / 2, VIEW.height / 2, 'PAUSA', {
        fontFamily: FONT,
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#0f172a',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50)
      .setVisible(false)

    this.emitHud(true)
  }

  // ---------- Construcción del mundo ----------

  createBackground(worldW, worldH) {
    const t = this.theme
    this.add.image(VIEW.width / 2, VIEW.height / 2, `sky_${t.id}`).setScrollFactor(0).setDepth(-30)
    if (t.stars) this.add.image(VIEW.width / 2, VIEW.height / 2, 'stars').setScrollFactor(0).setDepth(-29)

    this.clouds = this.add
      .tileSprite(0, 40, VIEW.width, 180, 'clouds')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-28)
      .setAlpha(t.stars ? 0.12 : 0.9)
    this.mountains = this.add
      .tileSprite(0, VIEW.height - 300, VIEW.width, 300, `mountains_${t.id}`)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-27)

    // Marco del nivel
    const frame = this.add.graphics().setDepth(-5)
    frame.lineStyle(4, 0xffffff, 0.35)
    frame.strokeRoundedRect(-2, -2, worldW + 4, worldH + 4, 6)
  }

  createEmitters() {
    const mk = (config) => this.add.particles(0, 0, 'particle', { emitting: false, ...config }).setDepth(20)
    this.dustEmitter = mk({
      lifespan: 350,
      speed: { min: 20, max: 70 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xf1f5f9,
    })
    this.sparkEmitter = mk({
      lifespan: 500,
      speed: { min: 60, max: 170 },
      scale: { start: 0.6, end: 0 },
      gravityY: 300,
      tint: [0xfde047, 0xfacc15, 0xffffff],
    })
    this.deathEmitter = mk({
      lifespan: 650,
      speed: { min: 80, max: 260 },
      scale: { start: 0.9, end: 0 },
      gravityY: 500,
      tint: [0xef4444, 0xf97316, 0xfacc15],
    })
    this.winEmitter = mk({
      lifespan: 1100,
      speed: { min: 120, max: 340 },
      scale: { start: 0.9, end: 0 },
      gravityY: 380,
      tint: [0xf97316, 0x3b82f6, 0xfacc15, 0x22c55e, 0xec4899],
    })
  }

  createPlatforms(grid) {
    const cs = this.cs
    const t = this.theme
    this.platforms = this.physics.add.staticGroup()
    this.crumbles = this.physics.add.staticGroup()
    this.movers = this.physics.add.group({ allowGravity: false, immovable: true })

    const texFor = {
      ground: `tile_ground_${t.id}_${cs}`,
      goal_platform: `tile_goal_${cs}`,
      moving: `tile_moving_${cs}`,
      disappearing: `tile_crumble_${cs}`,
    }

    ;(grid.platforms || []).forEach((p) => {
      const w = p.width * cs
      const h = p.height * cs
      const x = (p.x + p.width / 2) * cs
      const y = (p.y + p.height / 2) * cs
      const tex = texFor[p.type] || `tile_plat_${t.id}_${cs}`
      const tile = this.add.tileSprite(x, y, w, h, tex).setDepth(2)

      if (p.type === 'moving') {
        this.movers.add(tile)
        tile.body.setImmovable(true)
        tile.body.setAllowGravity(false)
        tile.rangePx = (p.move_range || 3) * cs
        tile.omega = p.move_speed || 1
      } else if (p.type === 'disappearing') {
        this.physics.add.existing(tile, true)
        this.crumbles.add(tile)
        tile.delay = p.disappear_delay || 1000
        tile.triggered = false
        tile.baseX = x
      } else {
        this.physics.add.existing(tile, true)
        this.platforms.add(tile)
      }
    })
  }

  createHazards(grid) {
    const cs = this.cs
    this.hazards = this.physics.add.staticGroup()
    this.lavas = []

    ;(grid.hazards || []).forEach((hz) => {
      const w = hz.width * cs
      const h = hz.height * cs
      const x = (hz.x + hz.width / 2) * cs
      const y = (hz.y + hz.height / 2) * cs
      const isLava = hz.type === 'lava'
      const tile = this.add.tileSprite(x, y, w, h, isLava ? `hz_lava_${cs}` : `hz_spikes_${cs}`).setDepth(3)
      if (isLava) {
        this.lavas.push(tile)
        this.tweens.add({ targets: tile, alpha: 0.82, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }

      // Hitbox más chica que el dibujo, para que sea justo con el jugador.
      const zone = this.add.zone(x, y + h * (isLava ? 0.1 : 0.22), w * 0.86, h * (isLava ? 0.75 : 0.5))
      this.physics.add.existing(zone, true)
      this.hazards.add(zone)
    })
  }

  createCollectibles(grid) {
    const cs = this.cs
    this.coins = this.physics.add.staticGroup()

    ;(grid.collectibles || []).forEach((c, i) => {
      const kind = POINTS[c.type] ? c.type : 'coin'
      const size = kind === 'coin' ? cs * 0.62 : cs * 0.72
      const img = this.add.image((c.x + 0.5) * cs, (c.y + 0.5) * cs, kind).setDisplaySize(size, size).setDepth(6)
      img.kind = kind

      if (kind !== 'coin') {
        const glow = this.add.image(img.x, img.y, 'glow').setDepth(5).setAlpha(0.7).setScale(cs / 40)
        glow.setBlendMode(Phaser.BlendModes.ADD)
        img.glow = glow
        this.tweens.add({ targets: glow, alpha: 0.25, scale: (cs / 40) * 1.25, duration: 800, yoyo: true, repeat: -1 })
      }

      const baseY = img.y
      this.tweens.add({ targets: img, y: baseY - 4, duration: 700 + (i % 5) * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      if (kind === 'coin') {
        this.tweens.add({ targets: img, scaleX: 0.04, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 80 })
      } else {
        this.tweens.add({ targets: img, angle: kind === 'star' ? 10 : 0, duration: 600, yoyo: true, repeat: -1 })
      }

      this.physics.add.existing(img, true)
      img.body.setSize(cs * 0.6, cs * 0.6)
      this.coins.add(img)
    })
  }

  createGoal(grid) {
    const cs = this.cs
    const gx = (grid.goal.x + 0.5) * cs
    const gy = (grid.goal.y + 0.5) * cs

    const glow = this.add.image(gx, gy, 'glow').setDepth(4).setScale((cs / 32) * 1.6).setAlpha(0.8)
    glow.setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: glow, alpha: 0.35, scale: (cs / 32) * 2.1, duration: 900, yoyo: true, repeat: -1 })

    // La bandera se apoya en la base de la celda de meta.
    const flag = this.add.image(gx, gy + cs / 2, `goal_${cs}`).setOrigin(0.5, 1).setDepth(5)
    flag.setDisplaySize(cs * 1.05, cs * 1.58)
    this.tweens.add({ targets: flag, angle: 2.5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.goal = this.add.zone(gx, gy, cs, cs * 1.4)
    this.physics.add.existing(this.goal, true)
  }

  createPlayers(grid) {
    const cs = this.cs
    const spawn1 = grid.spawn_j1
    const spawn2 = grid.spawn_j2 || grid.spawn_j1
    const at = (s) => ({ x: (s.x + 0.5) * cs, y: (s.y + 0.5) * cs })

    this.players = [this.createPlayer(at(spawn1), 'fox', 'J1')]
    if (this.mode === 'coop') {
      this.players.push(this.createPlayer(at(spawn2), 'blu', 'J2'))
      this.physics.add.collider(this.players[0], this.players[1])
    }

    this.players.forEach((pl) => {
      this.physics.add.collider(pl, this.platforms)
      this.physics.add.collider(pl, this.movers, (player, plat) => {
        // Arrastra al jugador junto con la plataforma móvil.
        if (player.body.touching.down && plat.body.touching.up) player.x += plat.body.deltaX()
      })
      this.physics.add.collider(pl, this.crumbles, (player, plat) => {
        if (player.body.touching.down && plat.body.touching.up) this.triggerCrumble(plat)
      })
      this.physics.add.overlap(pl, this.hazards, () => this.die(pl))
      this.physics.add.overlap(pl, this.coins, (_p, item) => this.collect(pl, item))
      this.physics.add.overlap(pl, this.goal, () => this.reachGoal(pl))
    })
  }

  createPlayer({ x, y }, charId, label) {
    const size = this.cs * 0.75
    // Cuerpo físico invisible + sprite visual aparte: así se puede deformar
    // (estirar/aplastar) sin alterar la hitbox.
    const pl = this.add.rectangle(x, y, size, size, 0x000000, 0)
    this.physics.add.existing(pl)
    pl.body.setCollideWorldBounds(true)
    pl.charId = charId
    pl.spawn = { x, y }
    pl.reachedGoal = false
    pl.invulnerable = false
    pl.wasOnGround = false
    pl.prevVy = 0
    pl.size = size

    const display = size * (96 / 72)
    pl.baseScale = display / 96
    pl.vis = this.add
      .image(x, y + size / 2, `char_${charId}_normal`)
      .setOrigin(0.5, 90 / 96)
      .setScale(pl.baseScale)
      .setDepth(10)
    pl.tag = this.add
      .text(x, y - size, label, {
        fontFamily: FONT,
        fontSize: '13px',
        fontStyle: 'bold',
        color: charId === 'fox' ? '#fed7aa' : '#bfdbfe',
        stroke: '#0f172a',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(11)
    if (this.mode !== 'coop') pl.tag.setVisible(false)
    return pl
  }

  createInput() {
    const K = Phaser.Input.Keyboard.KeyCodes
    this.wasd = this.input.keyboard.addKeys({ up: K.W, left: K.A, right: K.D })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.addCapture([K.W, K.A, K.S, K.D, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.SPACE])
    this.input.keyboard.on('keydown-P', () => this.togglePause())
    this.input.keyboard.on('keydown-ESC', () => this.togglePause())
    this.input.keyboard.on('keydown-R', () => this.restartLevel())
  }

  // ---------- Reglas ----------

  collect(pl, item) {
    if (!item.active) return
    const kind = item.kind
    const pts = POINTS[kind]
    this.score += pts
    this.coinsCollected += 1
    this.sparkEmitter.explode(kind === 'coin' ? 8 : 16, item.x, item.y)
    this.floatText(item.x, item.y - 8, `+${pts}`, kind === 'coin' ? '#fde047' : kind === 'gem' ? '#67e8f9' : '#fef08a')
    item.glow?.destroy()
    this.tweens.killTweensOf(item)
    item.destroy()
  }

  floatText(x, y, text, color) {
    const t = this.add
      .text(x, y, text, { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color, stroke: '#0f172a', strokeThickness: 4 })
      .setOrigin(0.5)
      .setDepth(30)
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 800, ease: 'Cubic.easeOut', onComplete: () => t.destroy() })
  }

  triggerCrumble(plat) {
    if (plat.triggered) return
    plat.triggered = true
    this.tweens.add({ targets: plat, x: plat.baseX + 2, duration: 50, yoyo: true, repeat: Math.floor(plat.delay / 100) })
    this.time.delayedCall(plat.delay, () => {
      this.tweens.add({
        targets: plat,
        alpha: 0,
        duration: 180,
        onComplete: () => {
          plat.body.enable = false
        },
      })
      this.time.delayedCall(RESPAWN_PLATFORM_MS, () => {
        plat.x = plat.baseX
        plat.body.enable = true
        plat.triggered = false
        this.tweens.add({ targets: plat, alpha: 1, duration: 250 })
      })
    })
  }

  die(pl, force = false) {
    if (this.finished || pl.reachedGoal || (pl.invulnerable && !force)) return
    this.deaths += 1
    this.deathEmitter.explode(20, pl.x, pl.y)
    this.cameras.main.shake(160, 0.006)

    pl.invulnerable = true
    pl.vis.setTexture(`char_${pl.charId}_hurt`)
    pl.setPosition(pl.spawn.x, pl.spawn.y)
    pl.body.setVelocity(0, 0)
    this.tweens.add({
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

  reachGoal(pl) {
    if (this.finished || pl.reachedGoal) return
    pl.reachedGoal = true
    pl.vis.setTexture(`char_${pl.charId}_happy`)
    pl.body.setVelocity(0, 0)
    pl.body.enable = false
    this.tweens.add({ targets: pl.vis, y: pl.vis.y - 18, duration: 220, yoyo: true, ease: 'Quad.easeOut' })
    this.winEmitter.explode(24, pl.x, pl.y)

    if (this.players.every((p) => p.reachedGoal)) {
      this.finished = true
      this.physics.pause()
      this.winEmitter.explode(50, pl.x, pl.y - 20)
      this.emitHud(true)
      this.game.events.emit('run-complete', {
        completionTimeMs: this.elapsed,
        deaths: this.deaths,
        score: this.score,
        coins: this.coinsCollected,
        coinsTotal: this.coinsTotal,
      })
    }
  }

  togglePause() {
    if (this.finished) return
    this.paused = !this.paused
    if (this.paused) {
      this.physics.pause()
      this.tweens.pauseAll()
    } else {
      this.physics.resume()
      this.tweens.resumeAll()
    }
    this.pauseText.setVisible(this.paused)
    this.game.events.emit('pause-changed', this.paused)
  }

  restartLevel() {
    this.game.events.emit('pause-changed', false)
    this.tweens.killAll()
    this.scene.restart({ level: this.level, mode: this.mode, difficulty: this.theme.id })
  }

  // ---------- Movimiento y animación ----------

  move(pl, left, right, jump) {
    if (pl.reachedGoal) return
    const body = pl.body
    const onGround = body.blocked.down || body.touching.down
    body.setVelocityX(left ? -SPEED : right ? SPEED : 0)
    if (jump && onGround) {
      body.setVelocityY(JUMP)
      this.stretch(pl, 0.8, 1.25)
      this.dustEmitter.explode(5, pl.x, pl.y + pl.size / 2)
    }
  }

  stretch(pl, sx, sy) {
    pl.scaleTween?.stop()
    pl.vis.setScale(pl.baseScale * sx, pl.baseScale * sy)
    pl.scaleTween = this.tweens.add({ targets: pl.vis, scaleX: pl.baseScale, scaleY: pl.baseScale, duration: 180, ease: 'Quad.easeOut' })
  }

  animate(pl, time) {
    const body = pl.body
    const onGround = body.blocked.down || body.touching.down

    if (onGround && !pl.wasOnGround && pl.prevVy > 280) {
      this.stretch(pl, 1.3, 0.72)
      this.dustEmitter.explode(6, pl.x, pl.y + pl.size / 2)
    }
    pl.wasOnGround = onGround
    pl.prevVy = body.velocity.y

    if (body.velocity.x < -5) pl.vis.setFlipX(true)
    else if (body.velocity.x > 5) pl.vis.setFlipX(false)

    const running = onGround && Math.abs(body.velocity.x) > 5
    const idleBob = Math.sin(time / 280) * 0.012
    pl.vis.setAngle(running ? Math.sin(time / 55) * 7 : 0)
    if (!pl.scaleTween?.isPlaying() && !pl.reachedGoal) {
      pl.vis.setScale(pl.baseScale * (1 - idleBob), pl.baseScale * (1 + idleBob))
    }

    pl.vis.x = pl.x
    if (!pl.reachedGoal) pl.vis.y = pl.y + pl.size / 2 // al ganar, la animación de salto maneja la altura
    pl.tag.setPosition(pl.x, pl.y - pl.size * 0.9)
  }

  update(time, delta) {
    if (this.finished || this.paused) return
    this.elapsed += delta

    const [p1, p2] = this.players
    const w = this.wasd
    const c = this.cursors
    if (p2) {
      this.move(p1, w.left.isDown, w.right.isDown, w.up.isDown)
      this.move(p2, c.left.isDown, c.right.isDown, c.up.isDown)
    } else {
      this.move(
        p1,
        w.left.isDown || c.left.isDown,
        w.right.isDown || c.right.isDown,
        w.up.isDown || c.up.isDown || c.space.isDown,
      )
    }

    // Plataformas móviles: vaivén senoidal entre x y x + move_range
    // (posición = x0 + R/2 · (1 − cos ωt), por eso la velocidad es R/2 · ω · sin ωt).
    const t = this.elapsed / 1000
    this.movers.getChildren().forEach((m) => {
      m.body.setVelocityX(m.rangePx * 0.5 * m.omega * Math.sin(m.omega * t))
    })

    this.players.forEach((pl) => {
      if (pl.y > this.worldH + 80) this.die(pl, true) // cayó al vacío
      this.animate(pl, time)
    })

    const mx = this.players.reduce((a, p) => a + p.x, 0) / this.players.length
    const my = this.players.reduce((a, p) => a + p.y, 0) / this.players.length
    this.cameraTarget.setPosition(mx, my)

    // Parallax y lava animada
    const cam = this.cameras.main
    this.mountains.tilePositionX = cam.scrollX * 0.18
    this.clouds.tilePositionX = cam.scrollX * 0.08 + time * 0.01
    this.lavas.forEach((l) => {
      l.tilePositionX = time * 0.03
    })

    this.hudTimer += delta
    if (this.hudTimer >= HUD_INTERVAL_MS) {
      this.hudTimer = 0
      this.emitHud()
    }
  }

  emitHud() {
    this.game.events.emit('hud', {
      elapsed: this.elapsed,
      deaths: this.deaths,
      score: this.score,
      coins: this.coinsCollected,
      coinsTotal: this.coinsTotal,
      players: this.players.map((p) => ({ reached: p.reachedGoal, charId: p.charId })),
    })
  }
}
