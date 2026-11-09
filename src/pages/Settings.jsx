import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { clearAuthSession } from '../services/authService'
import CharacterAvatar from '../components/CharacterAvatar'
import { CHARACTERS } from '../game/theme'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
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
          <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 16 }} onClick={handleLogout}>Cerrar sesión</button>
        </section>

        <section className="panel">
          <h3>Personajes</h3>
          <div className="char-cards">
            <div className="char-card" style={{ '--c': CHARACTERS[0].color }}>
              <CharacterAvatar id="fox" />
              <div><strong>{CHARACTERS[0].name}</strong><span>Jugador 1 · <kbd>A</kbd> <kbd>D</kbd> <kbd>W</kbd></span></div>
            </div>
            <div className="char-card" style={{ '--c': CHARACTERS[1].color }}>
              <CharacterAvatar id="blu" />
              <div><strong>{CHARACTERS[1].name}</strong><span>Jugador 2 · <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd></span></div>
            </div>
          </div>
        </section>

        <section className="panel">
          <h3>Atajos durante la partida</h3>
          <dl className="kv">
            <dt><kbd>P</kbd> / <kbd>Esc</kbd></dt>
            <dd>Pausar o continuar</dd>
            <dt><kbd>R</kbd></dt>
            <dd>Reiniciar el nivel</dd>
            <dt><kbd>Espacio</kbd></dt>
            <dd>Saltar (un jugador)</dd>
          </dl>
        </section>
      </div>
    </>
  )
}
