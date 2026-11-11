import { useLevelsAdmin } from '../hooks/useLevelsAdmin'
import LevelForm from './LevelForm'
import AdminLevelList from './AdminLevelList'

export default function LevelsAdminPanel() {
  const admin = useLevelsAdmin()
  return (
    <section aria-labelledby="levels-admin-title">
      <h2 id="levels-admin-title" style={{ fontSize: 26, marginBottom: 14 }}>Gestión de niveles</h2>

      {admin.error && <p role="alert" className="notice notice-error" style={{ marginBottom: 14 }}>{admin.error}</p>}
      {admin.notice && <p role="status" className="notice notice-success" style={{ marginBottom: 14 }}>{admin.notice}</p>}

      <div className="admin-layout">
        <LevelForm admin={admin} />
        <div><AdminLevelList admin={admin} /></div>
      </div>
    </section>
  )
}
