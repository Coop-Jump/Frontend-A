import { useEffect, useRef } from 'react'
import { getTheme } from '../game/theme'

const COLLECT_COLORS = { coin: '#facc15', gem: '#22d3ee', star: '#fde047' }
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`

// Miniatura del nivel dibujada en un <canvas> a partir de su grid_json.
export default function LevelPreview({ grid, difficulty, width = 280, height = 160 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const theme = getTheme(difficulty)
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const sky = ctx.createLinearGradient(0, 0, 0, height)
    sky.addColorStop(0, theme.previewSky[0])
    sky.addColorStop(1, theme.previewSky[1])
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, width, height)

    const gw = Number(grid?.grid_width)
    const gh = Number(grid?.grid_height)
    if (!gw || !gh) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Sin vista previa', width / 2, height / 2)
      return
    }

    const pad = 8
    const scale = Math.min((width - pad * 2) / gw, (height - pad * 2) / gh)
    const ox = (width - gw * scale) / 2
    const oy = (height - gh * scale) / 2
    const rect = (x, y, w, h, color) => {
      ctx.fillStyle = color
      ctx.fillRect(ox + x * scale, oy + y * scale, Math.max(1, w * scale), Math.max(1, h * scale))
    }

    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fillRect(ox, oy, gw * scale, gh * scale)

    ;(grid.platforms || []).forEach((p) => {
      const body = p.type === 'goal_platform' ? '#ca8a04' : p.type === 'moving' ? '#64748b' : p.type === 'disappearing' ? '#d6b77a' : hex(theme.platBody)
      const top = p.type === 'goal_platform' ? '#facc15' : p.type === 'moving' ? '#cbd5e1' : p.type === 'disappearing' ? '#f1d9a0' : hex(theme.platTop)
      rect(p.x, p.y, p.width, p.height, body)
      rect(p.x, p.y, p.width, Math.min(p.height, 0.35), top)
    })
    ;(grid.hazards || []).forEach((h) => {
      const lava = h.type === 'lava'
      rect(h.x, h.y + (lava ? 0 : 0.4), h.width, lava ? h.height : h.height * 0.6, lava ? '#f97316' : '#e2e8f0')
    })
    ;(grid.collectibles || []).forEach((c) => {
      ctx.fillStyle = COLLECT_COLORS[c.type] || COLLECT_COLORS.coin
      ctx.beginPath()
      ctx.arc(ox + (c.x + 0.5) * scale, oy + (c.y + 0.5) * scale, Math.max(1.5, scale * 0.28), 0, Math.PI * 2)
      ctx.fill()
    })
    if (grid.goal) {
      rect(grid.goal.x + 0.35, grid.goal.y - 0.9, 0.18, 1.9, '#e2e8f0')
      rect(grid.goal.x + 0.5, grid.goal.y - 0.9, 0.9, 0.7, '#ef4444')
    }
    const dot = (s, color) => {
      if (!s) return
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(ox + (s.x + 0.5) * scale, oy + (s.y + 0.5) * scale, Math.max(2.5, scale * 0.45), 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.2
      ctx.stroke()
    }
    dot(grid.spawn_j1, '#f97316')
    dot(grid.spawn_j2, '#3b82f6')
  }, [grid, difficulty, width, height])

  return <canvas ref={ref} className="level-preview" style={{ width: '100%', aspectRatio: `${width} / ${height}` }} aria-hidden="true" />
}
