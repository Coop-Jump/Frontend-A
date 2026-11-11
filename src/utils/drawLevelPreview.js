import { getTheme } from '../game/theme'

const COLLECT_COLORS = { coin: '#facc15', gem: '#22d3ee', star: '#fde047' }
const SPECIAL_PLATFORMS = {
  goal_platform: { body: '#ca8a04', top: '#facc15' },
  moving: { body: '#64748b', top: '#cbd5e1' },
  disappearing: { body: '#d6b77a', top: '#f1d9a0' },
}
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`

function drawSky(ctx, theme, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, theme.previewSky[0])
  sky.addColorStop(1, theme.previewSky[1])
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)
}

function drawPlaceholder(ctx, width, height) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '14px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Sin vista previa', width / 2, height / 2)
}

// Convierte coordenadas de la grilla a píxeles del canvas.
function makeView(grid, width, height) {
  const pad = 8
  const gw = Number(grid.grid_width)
  const gh = Number(grid.grid_height)
  const scale = Math.min((width - pad * 2) / gw, (height - pad * 2) / gh)
  return { scale, gw, gh, ox: (width - gw * scale) / 2, oy: (height - gh * scale) / 2 }
}

function fillRect(ctx, view, rect, color) {
  const [x, y, w, h] = rect
  ctx.fillStyle = color
  ctx.fillRect(view.ox + x * view.scale, view.oy + y * view.scale, Math.max(1, w * view.scale), Math.max(1, h * view.scale))
}

function fillCircle(ctx, view, cell, circle) {
  const { radius, color } = circle
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(view.ox + (cell.x + 0.5) * view.scale, view.oy + (cell.y + 0.5) * view.scale, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawPlatforms(ctx, view, theme, platforms) {
  const normal = { body: hex(theme.platBody), top: hex(theme.platTop) }
  platforms.forEach((p) => {
    const colors = SPECIAL_PLATFORMS[p.type] || normal
    fillRect(ctx, view, [p.x, p.y, p.width, p.height], colors.body)
    fillRect(ctx, view, [p.x, p.y, p.width, Math.min(p.height, 0.35)], colors.top)
  })
}

function drawHazards(ctx, view, hazards) {
  hazards.forEach((h) => {
    const lava = h.type === 'lava'
    const rect = lava ? [h.x, h.y, h.width, h.height] : [h.x, h.y + 0.4, h.width, h.height * 0.6]
    fillRect(ctx, view, rect, lava ? '#f97316' : '#e2e8f0')
  })
}

function drawCollectibles(ctx, view, items) {
  const radius = Math.max(1.5, view.scale * 0.28)
  items.forEach((c) => fillCircle(ctx, view, c, { radius, color: COLLECT_COLORS[c.type] || COLLECT_COLORS.coin }))
}

function drawGoal(ctx, view, goal) {
  if (!goal) return
  fillRect(ctx, view, [goal.x + 0.35, goal.y - 0.9, 0.18, 1.9], '#e2e8f0')
  fillRect(ctx, view, [goal.x + 0.5, goal.y - 0.9, 0.9, 0.7], '#ef4444')
}

function drawSpawn(ctx, view, spawn, color) {
  if (!spawn) return
  fillCircle(ctx, view, spawn, { radius: Math.max(2.5, view.scale * 0.45), color })
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.2
  ctx.stroke()
}

function drawGrid(ctx, grid, theme, size) {
  const view = makeView(grid, size.width, size.height)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(view.ox, view.oy, view.gw * view.scale, view.gh * view.scale)
  drawPlatforms(ctx, view, theme, grid.platforms || [])
  drawHazards(ctx, view, grid.hazards || [])
  drawCollectibles(ctx, view, grid.collectibles || [])
  drawGoal(ctx, view, grid.goal)
  drawSpawn(ctx, view, grid.spawn_j1, '#f97316')
  drawSpawn(ctx, view, grid.spawn_j2, '#3b82f6')
}

/** Dibuja la miniatura de un nivel (grid_json) en un canvas. */
export function drawLevelPreview(canvas, grid, options) {
  const { difficulty, width, height } = options
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const theme = getTheme(difficulty)
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  drawSky(ctx, theme, width, height)
  const hasSize = Number(grid?.grid_width) && Number(grid?.grid_height)
  if (hasSize) drawGrid(ctx, grid, theme, { width, height })
  else drawPlaceholder(ctx, width, height)
}
