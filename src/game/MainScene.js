import Phaser from 'phaser'
import { getTheme } from './theme'
import { buildTextures, VIEW } from './textures'
import { FONT, HUD_INTERVAL_MS } from './constants'
import { createEmitters } from './emitters'
import { createBackground, updateBackground } from './background'
import { createPlatforms, createHazards, createCollectibles, createGoal, updateMovers } from './levelObjects'
import { createPlayers, createInput, readInputs, movePlayer, animatePlayer } from './players'
import { updateCamera, minZoomFor } from './camera'
import * as rules from './rules'

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
    this.initState(grid)
    buildTextures(this, this.theme, this.cs)
    this.setupWorld()
    this.buildLevel(grid)
    this.setupCamera()
    this.createPauseText()
    this.emitHud()
  }

  initState(grid) {
    this.cs = grid.cell_size || 32
    this.worldW = grid.grid_width * this.cs
    this.worldH = grid.grid_height * this.cs
    this.deaths = 0
    this.score = 0
    this.coinsCollected = 0
    this.coinsTotal = (grid.collectibles || []).length
    this.elapsed = 0
    this.finished = false
    this.paused = false
    this.hudTimer = 0
  }

  setupWorld() {
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH)
    // Sin colisión abajo: caer al vacío cuenta como muerte (ver update).
    this.physics.world.setBoundsCollision(true, true, true, false)
    // La cámara no usa límites de Phaser: se calcula a mano (ver camera.js) porque
    // el zoom cambia para mantener a los dos jugadores a la vista.
    this.minZoom = minZoomFor(this.worldW, this.worldH)
    this.cameras.main.setRoundPixels(true)
  }

  buildLevel(grid) {
    createBackground(this, this.worldW, this.worldH)
    createEmitters(this)
    createPlatforms(this, grid)
    createHazards(this, grid)
    createCollectibles(this, grid)
    createGoal(this, grid)
    createPlayers(this, grid)
    createInput(this)
  }

  setupCamera() {
    this.cameraTarget = this.add.zone(this.players[0].x, this.players[0].y, 1, 1)
    this.cameras.main.startFollow(this.cameraTarget, true, 0.1, 0.1)
    updateCamera(this, true)
    this.cameras.main.fadeIn(350, 0, 0, 0)
  }

  createPauseText() {
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
    this.fixedLayers.push(this.pauseText)
  }

  // ---------- Reglas (ver rules.js) ----------

  collect(pl, item) {
    rules.collect(this, item)
  }

  triggerCrumble(plat) {
    rules.triggerCrumble(this, plat)
  }

  die(pl, force = false) {
    rules.die(this, pl, force)
  }

  reachGoal(pl) {
    rules.reachGoal(this, pl)
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

  // ---------- Bucle principal ----------

  update(time, delta) {
    if (this.finished || this.paused) return
    this.elapsed += delta

    const inputs = readInputs(this)
    this.players.forEach((pl, i) => movePlayer(this, pl, inputs[i]))
    updateMovers(this)
    this.players.forEach((pl) => {
      if (pl.y > this.worldH + 80) this.die(pl, true) // cayó al vacío
      animatePlayer(this, pl, time)
    })

    updateCamera(this)
    updateBackground(this, time)
    this.tickHud(delta)
  }

  tickHud(delta) {
    this.hudTimer += delta
    if (this.hudTimer < HUD_INTERVAL_MS) return
    this.hudTimer = 0
    this.emitHud()
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
