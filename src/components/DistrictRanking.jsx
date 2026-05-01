// components/DistrictRanking.jsx
export default function DistrictRanking({ rows = [], onSelectDistrict, title = "Top districts" }) {
  return (
    <div className="card p-4 w-full min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-700 font-semibold">{title}</h3>
        <div className="text-xs text-slate-500">Click a row to select district</div>
      </div>

      {rows.length ? (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">District</th>
                <th className="py-2 text-right">Predicted cases</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.districtKey || r.district}
                  className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer"
                  onClick={() => onSelectDistrict?.(r.district)}
                >
                  <td className="py-2 pr-3 text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-3 font-medium text-slate-800">{r.district}</td>
                  <td className="py-2 text-right tabular-nums">{Number(r.cases || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-32 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
          No districts to rank for this selection
        </div>
      )}
    </div>
  )
}
