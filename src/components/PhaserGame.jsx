import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import level1 from '../assets/levels/level1.json'

const TILE_SIZE = 40

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
    this.players = []
    this.cursors = null
    this.wasd = null
    this.platforms = null
    this.goal = null
    this.gameOver = false
    this.victory = false
    this.levelData = null
  }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false })
    graphics.fillStyle(0x4a5568, 1)
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
    graphics.generateTexture('platform', TILE_SIZE, TILE_SIZE)
    graphics.clear()

    graphics.fillStyle(0xf97316, 1)
    graphics.fillRect(0, 0, TILE_SIZE * 0.8, TILE_SIZE * 0.9)
    graphics.generateTexture('player1', TILE_SIZE * 0.8, TILE_SIZE * 0.9)
    graphics.clear()

    graphics.fillStyle(0xe53e3e, 1)
    graphics.fillRect(0, 0, TILE_SIZE * 0.8, TILE_SIZE * 0.9)
    graphics.generateTexture('player2', TILE_SIZE * 0.8, TILE_SIZE * 0.9)
    graphics.clear()

    graphics.fillStyle(0xecc94b, 1)
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
    graphics.generateTexture('goal', TILE_SIZE, TILE_SIZE)
    graphics.clear()

    graphics.fillStyle(0xc53030, 1)
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE / 2)
    graphics.generateTexture('deathZone', TILE_SIZE, TILE_SIZE / 2)
    graphics.clear()

    graphics.destroy()
  }

  create() {
    this.levelData = level1
    this.levelWidth = this.levelData.width * TILE_SIZE
    this.levelHeight = this.levelData.height * TILE_SIZE
    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight)
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight)
    this.buildMap()
    this.createPlayers()
    this.createGoal()
    this.setupControls()
    this.setupCollisions()
    this.cameras.main.startFollow(this.getCameraTarget(), true, 0.1, 0.1)
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#00000080', padding: { x: 10, y: 5 }
    }).setScrollFactor(0)
    this.updateStatusText()
  }

  buildMap() {
    this.platforms = this.physics.add.staticGroup()
    const layer = this.levelData.layers.find(l => l.name === 'platforms')
    if (!layer) return
    const { width, height } = this.levelData
    const levelHeight = height * TILE_SIZE
    const data = layer.data
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x
        if (data[index] === 1) {
          const platform = this.platforms.create(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'platform')
          platform.setDisplaySize(TILE_SIZE, TILE_SIZE)
          platform.refreshBody()
        }
      }
    }
    const levelWidth = this.levelData.width * TILE_SIZE
    this.deathZone = this.add.zone(0, levelHeight, levelWidth, TILE_SIZE).setOrigin(0, 1)
    this.physics.add.existing(this.deathZone, true)
    this.deathZone.body.setSize(levelWidth, TILE_SIZE)
    this.deathZone.body.setOffset(0, -TILE_SIZE)
  }

  createPlayers() {
    const start1 = this.levelData.objects.player1Start
    const start2 = this.levelData.objects.player2Start
    this.player1 = this.physics.add.sprite(start1.x, start1.y, 'player1')
    this.player1.setCollideWorldBounds(true)
    this.player1.setBounce(0.1)
    this.player1.setDragX(1000)
    this.player1.setMaxVelocity(300, 500)
    this.player1.playerNumber = 1
    this.player1.alive = true
    this.player1.reachedGoal = false

    this.player2 = this.physics.add.sprite(start2.x, start2.y, 'player2')
    this.player2.setCollideWorldBounds(true)
    this.player2.setBounce(0.1)
    this.player2.setDragX(1000)
    this.player2.setMaxVelocity(300, 500)
    this.player2.playerNumber = 2
    this.player2.alive = true
    this.player2.reachedGoal = false
    this.players = [this.player1, this.player2]
  }

  createGoal() {
    const goalPos = this.levelData.objects.goal
    this.goal = this.physics.add.staticSprite(goalPos.x, goalPos.y, 'goal')
    this.goal.setDisplaySize(TILE_SIZE, TILE_SIZE)
    this.goal.refreshBody()
  }

  setupControls() {
    this.wasd = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D, down: Phaser.Input.Keyboard.KeyCodes.S })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.addCapture([ Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.RIGHT ])
  }

  setupCollisions() {
    this.physics.add.collider(this.player1, this.platforms)
    this.physics.add.collider(this.player2, this.platforms)
    this.physics.add.collider(this.player1, this.player2)
    this.physics.add.overlap(this.player1, this.goal, () => this.onPlayerReachGoal(this.player1))
    this.physics.add.overlap(this.player2, this.goal, () => this.onPlayerReachGoal(this.player2))
    this.physics.add.overlap(this.player1, this.deathZone, () => this.onPlayerDeath(this.player1))
    this.physics.add.overlap(this.player2, this.deathZone, () => this.onPlayerDeath(this.player2))
  }

  getCameraTarget() {
    if (!this.cameraTarget) this.cameraTarget = this.add.sprite(0, 0)
    return this.cameraTarget
  }

  updateCameraTarget() {
    if (this.player1 && this.player2 && this.cameraTarget) {
      const midX = (this.player1.x + this.player2.x) / 2
      const midY = (this.player1.y + this.player2.y) / 2
      this.cameraTarget.setPosition(midX, midY)
    } else if (this.player1 && this.cameraTarget) {
      this.cameraTarget.setPosition(this.player1.x, this.player1.y)
    } else if (this.player2 && this.cameraTarget) {
      this.cameraTarget.setPosition(this.player2.x, this.player2.y)
    }
  }

  update() {
    if (this.gameOver || this.victory) return
    this.updateCameraTarget()
    this.handlePlayerMovement(this.player1, this.wasd)
    this.handlePlayerMovement(this.player2, this.cursors)
    this.updateStatusText()
  }

  handlePlayerMovement(player, keys) {
    if (!player || !player.alive) return
    const onGround = player.body.blocked.down || player.body.touching.down
    const speed = 250
    const jumpPower = -450
    let leftPressed, rightPressed, jumpPressed
    if (player.playerNumber === 1) {
      leftPressed = keys.left.isDown
      rightPressed = keys.right.isDown
      jumpPressed = Phaser.Input.Keyboard.JustDown(keys.up)
    } else {
      leftPressed = keys.left.isDown
      rightPressed = keys.right.isDown
      jumpPressed = Phaser.Input.Keyboard.JustDown(keys.up)
    }
    if (leftPressed) { player.setVelocityX(-speed); player.setFlipX(true) }
    else if (rightPressed) { player.setVelocityX(speed); player.setFlipX(false) }
    else { player.setVelocityX(0) }
    if (jumpPressed && onGround) player.setVelocityY(jumpPower)
    if ((player.playerNumber === 1 ? keys.down.isDown : keys.down.isDown) && !onGround) {
      player.setVelocityY(player.body.velocity.y + 200)
    }
  }

  onPlayerReachGoal(player) {
    if (!player.alive || player.reachedGoal) return
    player.reachedGoal = true
    player.setTint(0x00ff00)
    player.setVelocity(0, 0)
    player.body.enable = false
    this.checkVictory()
  }

  onPlayerDeath(player) {
    if (!player.alive) return
    player.alive = false
    player.setTint(0xff0000)
    player.setVelocity(0, 0)
    player.body.enable = false
    player.setVisible(false)
    this.checkGameOver()
  }

  checkVictory() {
    const allReached = this.players.every(p => p.reachedGoal)
    if (allReached) { this.victory = true; this.gameOver = true; this.showVictory() }
  }

  checkGameOver() {
    const allDead = this.players.every(p => !p.alive)
    if (allDead) { this.gameOver = true; this.showGameOver() }
  }

  showVictory() {
    const cx = this.cameras.main.centerX
    const cy = this.cameras.main.centerY
    this.add.text(cx, cy - 50, '¡VICTORIA!', { fontSize: '48px', color: '#48bb78', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0)
    this.add.text(cx, cy + 20, 'Ambos jugadores llegaron a la meta', { fontSize: '24px', color: '#ffffff', backgroundColor: '#00000080', padding: { x: 15, y: 8 } }).setOrigin(0.5).setScrollFactor(0)
    this.add.text(cx, cy + 80, 'Presiona R para reiniciar', { fontSize: '18px', color: '#a0aec0', backgroundColor: '#00000080', padding: { x: 10, y: 5 } }).setOrigin(0.5).setScrollFactor(0)
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
  }

  showGameOver() {
    const cx = this.cameras.main.centerX
    const cy = this.cameras.main.centerY
    this.add.text(cx, cy - 50, 'GAME OVER', { fontSize: '48px', color: '#e53e3e', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0)
    this.add.text(cx, cy + 20, 'Ambos jugadores han caído', { fontSize: '24px', color: '#ffffff', backgroundColor: '#00000080', padding: { x: 15, y: 8 } }).setOrigin(0.5).setScrollFactor(0)
    this.add.text(cx, cy + 80, 'Presiona R para reiniciar', { fontSize: '18px', color: '#a0aec0', backgroundColor: '#00000080', padding: { x: 10, y: 5 } }).setOrigin(0.5).setScrollFactor(0)
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
  }

  updateStatusText() {
    if (this.gameOver) return
    const p1Status = this.player1.alive ? (this.player1.reachedGoal ? '✓ Meta' : '● Vivo') : '✗ Muerto'
    const p2Status = this.player2.alive ? (this.player2.reachedGoal ? '✓ Meta' : '● Vivo') : '✗ Muerto'
    this.statusText.setText(`Jugador 1 (WASD): ${p1Status}  |  Jugador 2 (Flechas): ${p2Status}`)
  }

  checkRestart() {
    if (this.gameOver && this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart()
    }
  }
}

const originalUpdate = MainScene.prototype.update
MainScene.prototype.update = function() {
  originalUpdate.call(this)
  this.checkRestart()
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#1a202c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, parent: null, width: 800, height: 600 },
  physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
  scene: [MainScene],
}

export default function PhaserGame() {
  const phaserRef = useRef(null)
  const gameRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phaserRef.current) return
    const cfg = { ...config, parent: phaserRef.current }
    gameRef.current = new Phaser.Game(cfg)
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => { clearTimeout(timer); if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null } }
  }, [])

  return (
    <div className="page">
      <h2 style={{ fontSize: 28, color: '#f97316', fontWeight: 900 }}>Coop Jump - Juego Cooperativo</h2>
      <div style={{ position: 'relative', width: '100%', maxWidth: 800, height: 600, margin: '0 auto', borderRadius: 16, overflow: 'hidden', boxShadow: '0 15px 40px rgba(249,115,22,0.2)' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #fff5eb 0%, #ffe4cc 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ width: 80, height: 80, border: '8px solid #ffedd5', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: '#f97316', marginTop: 24, fontSize: 22, fontWeight: 800 }}>Cargando nivel...</h3>
            <p style={{ color: '#fb923c', fontSize: 14, marginTop: 8 }}>Preparando el juego cooperativo</p>
          </div>
        )}
        <div ref={phaserRef} style={{ width: '100%', height: 600 }} />
      </div>
      <div style={{ marginTop: 16, padding: 14, background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)', borderRadius: 12, color: '#7c2d12', fontSize: 14, maxWidth: 800, margin: '16px auto 0', border: '2px solid #ffedd5' }}>
        <strong style={{ color: '#f97316' }}>Controles:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, lineHeight: 1.6 }}>
          <li><strong>Jugador 1 (Naranja):</strong> WASD - Mover, W - Saltar</li>
          <li><strong>Jugador 2 (Rojo):</strong> Flechas - Mover, ↑ - Saltar</li>
          <li><strong>Objetivo:</strong> Ambos jugadores deben llegar a la meta (cuadrado dorado) sin caer</li>
          <li><strong>Reiniciar:</strong> Presiona R al finalizar</li>
        </ul>
      </div>
    </div>
  )
}
