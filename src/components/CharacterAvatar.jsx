// Los mismos personajes que se dibujan dentro del juego (game/art/characters.js), en SVG
// para usarlos en la interfaz. Sirve para Home, Dashboard y Ajustes.
const PALETTES = {
  fox: { body: '#f97316', dark: '#c2410c', patch: '#fff1e0', ear: '#fda4af', tip: '#ffffff' },
  blu: { body: '#3b82f6', dark: '#1d4ed8', patch: '#e0f2fe', ear: '#bfdbfe', tip: '#93c5fd' },
}

function Tail({ p }) {
  return (
    <>
      <ellipse cx="82" cy="66" rx="13" ry="9" fill={p.dark} />
      <ellipse cx="81" cy="65" rx="11" ry="7" fill={p.body} />
      <ellipse cx="90" cy="62" rx="4.5" ry="5.5" fill={p.tip} />
    </>
  )
}

function FoxEars({ p }) {
  return (
    <>
      <path d="M18 34 L22 4 L44 26 Z M52 26 L74 4 L78 34 Z" fill={p.dark} />
      <path d="M24 30 L26 13 L38 26 Z M58 26 L70 13 L72 30 Z" fill={p.ear} />
    </>
  )
}

function RoundEars({ p }) {
  return (
    <>
      <circle cx="26" cy="20" r="14" fill={p.dark} />
      <circle cx="70" cy="20" r="14" fill={p.dark} />
      <circle cx="26" cy="21" r="8" fill={p.ear} />
      <circle cx="70" cy="21" r="8" fill={p.ear} />
    </>
  )
}

function Body({ p }) {
  return (
    <>
      <rect x="10" y="20" width="76" height="72" rx="30" fill={p.dark} />
      <rect x="13" y="22" width="70" height="66" rx="28" fill={p.body} />
      <rect x="20" y="27" width="30" height="10" rx="5" fill="#fff" opacity=".22" />
      <ellipse cx="48" cy="70" rx="25" ry="16" fill={p.patch} />
    </>
  )
}

function Scarf() {
  return (
    <>
      <rect x="18" y="78" width="60" height="10" rx="5" fill="#facc15" />
      <rect x="62" y="80" width="12" height="16" rx="4" fill="#eab308" />
    </>
  )
}

function Eye({ cx }) {
  return (
    <g>
      <ellipse cx={cx} cy="48" rx="8.5" ry="10" fill="#fff" />
      <ellipse cx={cx + 2} cy="49" rx="5" ry="6.5" fill="#1e293b" />
      <circle cx={cx + 4} cy="45" r="2.6" fill="#fff" />
    </g>
  )
}

function Face() {
  return (
    <>
      <Eye cx={34} />
      <Eye cx={62} />
      <circle cx="22" cy="60" r="5" fill="#fb7185" opacity=".55" />
      <circle cx="74" cy="60" r="5" fill="#fb7185" opacity=".55" />
      <path d="M44 58 L52 58 L48 63 Z" fill="#1e293b" />
      <path d="M38 63 Q43 70 48 63 Q53 70 58 63" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  )
}

function Feet({ p }) {
  return (
    <>
      <rect x="22" y="86" width="18" height="8" rx="4" fill={p.dark} />
      <rect x="56" y="86" width="18" height="8" rx="4" fill={p.dark} />
    </>
  )
}

export default function CharacterAvatar({ id = 'fox', className, size }) {
  const p = PALETTES[id] || PALETTES.fox
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <Tail p={p} />
      {id === 'fox' ? <FoxEars p={p} /> : <RoundEars p={p} />}
      <Body p={p} />
      {id === 'blu' && <Scarf />}
      <Face />
      <Feet p={p} />
    </svg>
  )
}
