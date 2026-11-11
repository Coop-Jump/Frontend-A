const MEDALS = ['🥇', '🥈', '🥉']

function PodiumStep({ run, place }) {
  return (
    <div className={`podium-step p${place + 1}`}>
      <div className="medal">{MEDALS[place]}</div>
      <div className="name">{run.username || 'Anónimo'}</div>
      <div className="time">{run.formattedTime}</div>
      <div className="sub">{run.deaths} muertes</div>
    </div>
  )
}

export default function Podium({ rows }) {
  if (rows.length === 0) return null
  // Orden visual: 2.º, 1.º, 3.º
  const order = [1, 0, 2].filter((i) => rows[i])
  return (
    <div className="podium" aria-label="Podio">
      {order.map((i) => <PodiumStep key={rows[i].id} run={rows[i]} place={i} />)}
    </div>
  )
}
