import { useEffect, useRef } from 'react'
import { drawLevelPreview } from '../utils/drawLevelPreview'

// Miniatura del nivel dibujada en un <canvas> a partir de su grid_json.
export default function LevelPreview({ grid, difficulty, width = 280, height = 160 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) drawLevelPreview(ref.current, grid, { difficulty, width, height })
  }, [grid, difficulty, width, height])

  return <canvas ref={ref} className="level-preview" style={{ width: '100%', aspectRatio: `${width} / ${height}` }} aria-hidden="true" />
}
