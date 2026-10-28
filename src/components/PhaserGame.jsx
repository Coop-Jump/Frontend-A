import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

class MainScene extends Phaser.Scene {
  create() {
    const width = this.scale.width
    const height = this.scale.height
    this.add.rectangle(width / 2, height / 2, 300, 200, 0x4f9eff)
    this.add.text(width / 2, height / 2, 'Phaser 3 + React', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)`;
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0f172a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: null,
    width: 800,
    height: 600,
  },
  scene: [MainScene],
  parent: null,
}

export default function PhaserGame() {
  const phaserRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (!phaserRef.current) return

    const cfg = { ...config, parent: phaserRef.current }
    gameRef.current = new Phaser.Game(cfg)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div className="page">
      <h2>Juego en Phaser 3</h2>
      <div
        ref={phaserRef}
        style={{ width: '100%', maxWidth: 800, height: 600, margin: '0 auto' }}
      />
    </div>
  )
}