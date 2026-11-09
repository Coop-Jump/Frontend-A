import LevelsAdminPanel from '../components/LevelsAdminPanel'

const SECTIONS = [
  { title: 'Niveles', desc: 'Crear, editar y eliminar niveles.', active: true },
  { title: 'Usuarios', desc: 'Ver cuentas registradas. Próximamente.', active: false },
  { title: 'Estadísticas', desc: 'Puntuaciones y registros. Próximamente.', active: false },
]

export default function Admin() {
  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Administración</p>
        <h1>Panel de administración</h1>
        <p>Gestión de niveles, usuarios y estadísticas.</p>
      </div>

      <div className="admin-cards">
        {SECTIONS.map((s) => (
          <div key={s.title} className={`admin-card ${s.active ? 'active' : 'disabled'}`}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <LevelsAdminPanel />
    </>
  )
}
