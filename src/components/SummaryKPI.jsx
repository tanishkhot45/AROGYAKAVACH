export default function SummaryKPI({ title, value, scope }) {
  return (
    <div className="card p-4 mb-3">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{Number(value || 0).toLocaleString()}</div>
      {scope ? <div className="text-xs text-slate-400 mt-1">{scope}</div> : null}
    </div>
  )
}
