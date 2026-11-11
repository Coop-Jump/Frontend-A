import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { clearAuthSession } from '../services/authService'
import CharacterAvatar from '../components/CharacterAvatar'
import { CHARACTERS } from '../game/theme'

const SHORTCUTS = [
  { keys: <><kbd>P</kbd> / <kbd>Esc</kbd></>, text: 'Pausar o continuar' },
  { keys: <kbd>R</kbd>, text: 'Reiniciar el nivel' },
  { keys: <kbd>Espacio</kbd>, text: 'Saltar (un jugador)' },
]

const PLAYERS = [
  { avatar: 'fox', character: CHARACTERS[0], label: 'Jugador 1', keys: <><kbd>A</kbd> <kbd>D</kbd> <kbd>W</kbd></> },
  { avatar: 'blu', character: CHARACTERS[1], label: 'Jugador 2', keys: <><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd></> },
]

function AccountPanel({ user, onLogout }) {
  return (
    <section className="panel">
      <h3>Cuenta</h3>
      <dl className="kv">
        <dt>Usuario</dt>
        <dd>{user?.username || '—'}</dd>
        <dt>ID</dt>
        <dd>{user?.id || '—'}</dd>
        {user?.created_at && (
          <>
            <dt>Miembro desde</dt>
            <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
          </>
        )}
      </dl>
      <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 16 }} onClick={onLogout}>Cerrar sesión</button>
    </section>
  )
}

function CharactersPanel() {
  return (
    <section className="panel">
      <h3>Personajes</h3>
      <div className="char-cards">
        {PLAYERS.map((p) => (
          <div key={p.avatar} className="char-card" style={{ '--c': p.character.color }}>
            <CharacterAvatar id={p.avatar} />
            <div><strong>{p.character.name}</strong><span>{p.label} · {p.keys}</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ShortcutsPanel() {
  return (
    <section className="panel">
      <h3>Atajos durante la partida</h3>
      <dl className="kv">
        {SHORTCUTS.map((s) => (
          <Fragment key={s.text}>
            <dt>{s.keys}</dt>
            <dd>{s.text}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = () => {
    clearAuthSession()
    navigate('/')
  }

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Configuración</p>
        <h1>Ajustes</h1>
        <p>Tu cuenta, los personajes y los controles del juego.</p>
      </div>
      <div className="settings-list">
        <AccountPanel user={user} onLogout={logout} />
        <CharactersPanel />
        <ShortcutsPanel />
      </div>
    </>
  )
}
