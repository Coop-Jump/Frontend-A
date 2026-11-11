import { useState } from 'react'
import { Link } from 'react-router-dom'

// Para usar el logo oficial del juego, copia el archivo a `public/logo.png`
// (o `public/logo.svg`). Si no existe, se muestra el emblema incluido.
const LOGO_FILES = ['/logo.png', '/logo.svg']

function EmblemFenix() {
  return (
    <>
      <path d="M13 32 L15 22 L22 28 Z M31 28 L38 22 L38 32 Z" fill="#9a3412" />
      <rect x="12" y="26" width="26" height="24" rx="10" fill="#fff7ed" />
      <rect x="14" y="28" width="22" height="20" rx="8" fill="#fdba74" />
      <circle cx="21" cy="37" r="2.4" fill="#1e293b" />
      <circle cx="30" cy="37" r="2.4" fill="#1e293b" />
    </>
  )
}

function EmblemBlu() {
  return (
    <>
      <circle cx="40" cy="22" r="4" fill="#1d4ed8" />
      <circle cx="53" cy="22" r="4" fill="#1d4ed8" />
      <rect x="37" y="22" width="19" height="20" rx="9" fill="#3b82f6" />
      <circle cx="43.5" cy="31" r="2" fill="#fff" />
      <circle cx="50" cy="31" r="2" fill="#fff" />
      <rect x="39" y="38" width="15" height="4" rx="2" fill="#facc15" />
    </>
  )
}

function FallbackEmblem({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <path d="M8 50 Q32 24 56 50" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <EmblemFenix />
      <EmblemBlu />
    </svg>
  )
}

function LogoMark({ size, file }) {
  if (!file.src) return <FallbackEmblem size={size} />
  return (
    <img src={file.src} alt="" height={size} style={{ height: size, width: 'auto', maxWidth: size * 4 }}
      onError={file.next} />
  )
}

function LogoText() {
  return <span className="logo-text">COOP<span> JUMP</span></span>
}

// Prueba los archivos de logo en orden; si ninguno existe se usa el emblema incluido.
function useLogoFile() {
  const [index, setIndex] = useState(0)
  return { src: LOGO_FILES[index], next: () => setIndex((i) => i + 1) }
}

export default function Logo({ size = 44, showText = true, to = '/', stacked = false }) {
  const file = useLogoFile()
  const content = (
    <span className={`logo ${stacked ? 'logo-stacked' : ''}`} aria-label="Coop Jump">
      <LogoMark size={size} file={file} />
      {showText && !file.src && <LogoText />}
    </span>
  )
  return to ? <Link to={to} className="logo-link">{content}</Link> : content
}
