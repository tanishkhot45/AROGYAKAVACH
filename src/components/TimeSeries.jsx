import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceDot,
} from 'recharts'

const CHART_H = '60vh'
const INNER_H = '54vh'

const toTs = (w) => {
  const t = new Date(w).getTime()
  return Number.isFinite(t) ? t : null
}

const fmtTick = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })

const fmtTooltipLabel = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function TimeSeries({ series = [], nextPoint }) {
  const { data, nextDot } = useMemo(() => {
    // series: [{week: 'YYYY-MM-DD', cases: number}]
    const cleaned = (series || [])
      .map(d => {
        const ts = toTs(d.week)
        if (!ts) return null
        return { weekTs: ts, cases: Number(d.cases) || 0 }
      })
      .filter(Boolean)
      .sort((a, b) => a.weekTs - b.weekTs)

    // de-dup by weekTs (keep last)
    const byTs = new Map()
    for (const r of cleaned) byTs.set(r.weekTs, r)
    const dedup = Array.from(byTs.keys()).sort((a, b) => a - b).map(k => byTs.get(k))

    let nd = null
    if (nextPoint?.week) {
      const ts = toTs(nextPoint.week)
      if (ts) nd = { weekTs: ts, cases: Number(nextPoint.cases) || 0 }
    }

    return { data: dedup, nextDot: nd }
  }, [series, nextPoint])

  const hasData = data.length > 0

  return (
    <div className="card p-3" style={{ height: CHART_H }}>
      <h3 className="text-slate-700 font-semibold mb-2">Historical timeline</h3>
      <div style={{ height: INNER_H }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="weekTs"
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
                tickFormatter={fmtTick}
                tick={{ fontSize: 12 }}
              />

              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={fmtTooltipLabel}
                formatter={(v) => [Number(v).toLocaleString(), 'cases']}
              />

              <Line type="monotone" dataKey="cases" dot={false} strokeWidth={2} />
              {nextDot && <ReferenceDot x={nextDot.weekTs} y={nextDot.cases} r={5} />}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
            No timeline available for the current selection
          </div>
        )}
      </div>
    </div>
  )
}
