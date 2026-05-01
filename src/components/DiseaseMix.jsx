// components/DiseaseMix.jsx
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

const PALETTE = [
  '#2563eb', // blue
  '#16a34a', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#eab308', // yellow
]

export default function DiseaseMix({ districtLabel, totalsByDisease = {} }) {
  const { data, keys } = useMemo(() => {
    if (!districtLabel) return { data: [], keys: [] }

    const entries = Object.entries(totalsByDisease || {})
      .map(([k, v]) => [k, Number(v) || 0])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])

    if (!entries.length) return { data: [], keys: [] }

    const TOP_N = 6
    const top = entries.slice(0, TOP_N)
    const rest = entries.slice(TOP_N)
    const otherSum = rest.reduce((s, [, v]) => s + v, 0)

    const row = { label: 'Predicted' }
    const klist = []

    for (const [d, v] of top) {
      row[d] = Math.round(v)
      klist.push(d)
    }
    if (otherSum > 0) {
      row.Other = Math.round(otherSum)
      klist.push('Other')
    }

    return { data: [row], keys: klist }
  }, [districtLabel, totalsByDisease])

  const colorFor = (key, idx) => {
    if (key === 'Other') return '#94a3b8' // slate gray for Other
    return PALETTE[idx % PALETTE.length]
  }

  return (
    <div className="card p-4 w-full min-w-0">
      <div className="mb-3">
        <h3 className="text-slate-700 font-semibold">Disease mix</h3>
        <div className="text-xs text-slate-500">
          {districtLabel
            ? `Predicted cases by disease — ${districtLabel}`
            : 'Select a district to see the mix'}
        </div>
      </div>

      {data.length ? (
        <div style={{ height: 320 }} className="w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'cases']} />
              <Legend
                verticalAlign="bottom"
                align="left"
                wrapperStyle={{
                  fontSize: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 8,
                }}
              />

              {keys.map((k, idx) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="a"
                  fill={colorFor(k, idx)}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-32 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
          No mix available (select a district)
        </div>
      )}
    </div>
  )
}
