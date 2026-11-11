function EmptyRuns({ message }) {
  return (
    <div className="panel empty">
      <strong>Sin datos todavía</strong>
      {message}
    </div>
  )
}

function RunCell({ column, row, index }) {
  const className = `${column.right ? 'right' : ''} ${column.className || ''}`
  return <td className={className}>{column.render(row, index)}</td>
}

function RunRow({ columns, row, index }) {
  return (
    <tr>
      {columns.map((c) => <RunCell key={c.label} column={c} row={row} index={index} />)}
    </tr>
  )
}

export default function RunsTable({ columns, rows, empty }) {
  if (rows.length === 0) return <EmptyRuns message={empty} />
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.label} className={c.right ? 'right' : ''}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => <RunRow key={row.id} columns={columns} row={row} index={i} />)}
        </tbody>
      </table>
    </div>
  )
}
