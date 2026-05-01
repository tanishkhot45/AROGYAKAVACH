import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

/* ─── Dummy reference data ─── */
const DISTRICTS = [
  'Mumbai City','Mumbai Suburban','Thane','Palghar','Pune','Nashik','Nagpur',
  'Chhatrapati Sambhajinagar','Kolhapur','Satara','Solapur','Amravati','Nanded',
]
const DOCTORS = [
  'Krushnakant Kande','Disha Deepak Dhobale','Amruta Lakhe','Dr. Patil','Athang Deshpande',
  'Swapnil Shyam Rokade','Dr. Shilpa Nemade','Shweta Barge','Dr. Sujit Shroff',
  'Dr. Siddhi Subhash Gholap','Anil Roy','Vedant Bhandare','Dr. Nitin Ghogare',
  'Sanjyot Chikhale','Siddhesh Buddhe',
]
const RISK = {"Mumbai City":70,"Mumbai Suburban":72,"Thane":68,"Palghar":56,"Pune":71,"Nashik":44,"Nagpur":66,"Chhatrapati Sambhajinagar":48,"Kolhapur":36,"Satara":34,"Solapur":52,"Amravati":50,"Nanded":46}
const BASE_CASES = {"Mumbai City":185,"Mumbai Suburban":220,"Thane":160,"Palghar":90,"Pune":210,"Nashik":65,"Nagpur":140,"Chhatrapati Sambhajinagar":55,"Kolhapur":30,"Satara":28,"Solapur":75,"Amravati":62,"Nanded":58}

const upliftFactor = (risk) => Math.max(0.03, Math.min(0.22, (risk - 30) / 350))
const forecastCases = (curr, risk, horizon) => {
  let v = curr
  for (let i = 0; i < horizon; i++) v = Math.round(v * (1 + upliftFactor(risk)))
  return v
}
const thisWeek = (() => {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  return Math.ceil((((now - jan1) / 86400000) + jan1.getDay() + 1) / 7)
})()

/* ─── Design tokens (matching dashboard) ─── */
const cn = (...parts) => parts.filter(Boolean).join(' ')

function GlassCard({ children, className }) {
  return (
    <div className={cn(
      'rounded-[26px] bg-white/70 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.40)] ring-1 ring-black/[0.06] backdrop-blur-xl',
      className
    )}>
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }) {
  return (
    <div>
      <div className="text-[17px] font-semibold tracking-tight text-black">{title}</div>
      {subtitle && <div className="mt-1 text-[12.5px] leading-relaxed text-black/50">{subtitle}</div>}
    </div>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-black/55">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl bg-white px-4 py-3.5 text-[13.5px] text-black shadow-sm ring-1 ring-black/10 outline-none transition focus:ring-black/20"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-black/40">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </label>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder, min }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-black/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-[13.5px] text-black shadow-sm ring-1 ring-black/10 outline-none transition focus:ring-black/20"
      />
    </label>
  )
}

function BtnPrimary({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={cn('rounded-2xl bg-black px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-85', className)}
    >
      {children}
    </button>
  )
}

function BtnGhost({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={cn('rounded-2xl bg-white px-4 py-2.5 text-[13px] font-semibold text-black ring-1 ring-black/10 shadow-sm transition hover:bg-black/5', className)}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const styles = {
    OK: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Low: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    Open: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    'In Progress': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Closed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  }
  return (
    <span className={cn('inline-block rounded-2xl px-3 py-1 text-[11px] font-semibold', styles[status] || 'bg-black/5 text-black/60')}>
      {status}
    </span>
  )
}

function download(name, mime, text) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

/* ─── Table wrapper ─── */
function Table({ head, children }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-black/[0.06]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-black/[0.06] bg-black/[0.02]">
            {head.map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-black/40">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function TR({ cells, actions }) {
  return (
    <tr className="border-b border-black/[0.04] transition hover:bg-black/[0.015]">
      {cells.map((c, i) => <td key={i} className="px-4 py-3 text-black/80">{c}</td>)}
      {actions && <td className="px-4 py-3 text-right">{actions}</td>}
    </tr>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function DoctorPortal() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)
  const [login, setLogin] = useState({ hospital: 'Sir JJ Hospital, Mumbai', doctor: DOCTORS[0], id: '', pw: '' })
  const [tab, setTab] = useState('cases')

  /* Cases */
  const [cases, setCases] = useState([])
  const [caseForm, setCaseForm] = useState({
    disease: 'Acute Diarrhoeal Disease (ADD)', district: DISTRICTS[0],
    week: String(thisWeek), count: 0, hosp: 0, death: 0,
  })

  /* ASHA */
  const [asha, setAsha] = useState([])
  const [ashaForm, setAshaForm] = useState({ facility: '', syndrome: 'Fever with rash', count: 5, notes: '', file: '' })

  /* Inventory */
  const [inv, setInv] = useState([])
  const [invForm, setInvForm] = useState({
    district: DISTRICTS[0], horizon: 0, beds: 120, o2: 80, ors: 500, iv: 220, rdt: 300, buffer: 15,
  })

  /* Alerts */
  const [al, setAl] = useState({ district: DISTRICTS[0], horizon: 0 })
  const alertSeries = useMemo(() => {
    const base = BASE_CASES[al.district] || 0
    const risk = RISK[al.district] || 40
    const hist = [Math.round(base * 0.78), Math.round(base * 0.86), Math.round(base * 0.93)]
    return hist.concat([
      forecastCases(base, risk, 0),
      forecastCases(base, risk, 1),
      forecastCases(base, risk, 2),
    ]).map((v, i) => ({ x: `W${i - 2 <= 0 ? i - 2 : '+' + (i - 2)}`, v }))
  }, [al])

  const alertSummary = useMemo(() => {
    const base = BASE_CASES[al.district] || 0
    const risk = RISK[al.district] || 40
    const now = forecastCases(base, risk, 0)
    const p1 = forecastCases(base, risk, 1)
    const p2 = forecastCases(base, risk, 2)
    const pick = al.horizon === 0 ? now : al.horizon === 1 ? p1 : p2
    return `${al.district}: baseline ${now}, +1w ${p1}, +2w ${p2} (selected ${pick})`
  }, [al])

  /* Roster */
  const roster = [
    ['Krushnakant Kande', 'Doctor', 'Sir JJ Hospital'],
    ['Disha Deepak Dhobale', 'Doctor', 'Sir JJ Hospital'],
    ['Amruta Lakhe', 'Doctor', 'Sir JJ Hospital'],
    ['Dr. Patil', 'Doctor', 'Sir JJ Hospital'],
    ['Athang Deshpande', 'Doctor', 'Sir JJ Hospital'],
    ['Swapnil Shyam Rokade', 'Doctor', 'Sir JJ Hospital'],
    ['Dr. Shilpa Nemade', 'Doctor', 'Sir JJ Hospital'],
    ['Shweta Barge', 'Doctor', 'Sir JJ Hospital'],
    ['Dr. Sujit Shroff', 'Doctor', 'Sir JJ Hospital'],
    ['Dr. Siddhi Subhash Gholap', 'Doctor', 'Sir JJ Hospital'],
    ['Anil Roy', 'Doctor', 'Sir JJ Hospital'],
    ['Vedant Bhandare', '4th-Year MBBS', 'VDGMC Latur'],
    ['Dr. Nitin Ghogare', 'Doctor', 'VDGMC Latur'],
    ['Sanjyot Chikhale', '4th-Year MBBS', 'JJ & GGMC'],
    ['Siddhesh Buddhe', 'Medical Student', 'JJ & GGMC'],
  ]
  const [roQuery, setRoQuery] = useState('')
  const roRows = useMemo(
    () => roster.filter(r => r.join(' ').toLowerCase().includes(roQuery.toLowerCase())),
    [roQuery]
  )

  /* Grievance */
  const [gr, setGr] = useState([])
  const [grForm, setGrForm] = useState({ cat: 'Data correction', dist: DISTRICTS[0], prio: 'Low', sub: '', body: '' })

  /* ── Handlers ── */
  const doLogin = () => { if (!login.id || !login.pw) return; setLoggedIn(true) }

  const addCase = () => setCases(p => [...p, { ...caseForm, count: +caseForm.count || 0, hosp: +caseForm.hosp || 0, death: +caseForm.death || 0, id: crypto.randomUUID().slice(0, 8) }])
  const delCase = i => setCases(p => p.filter((_, idx) => idx !== i))
  const exportCases = () => {
    const h = ['disease', 'district', 'week', 'count', 'hosp', 'death', 'id']
    download('cases.csv', 'text/csv', [h.join(','), ...cases.map(r => h.map(k => r[k]).join(','))].join('\n'))
  }

  const addAsha = () => {
    if (!ashaForm.facility || !ashaForm.count) return
    setAsha(p => [...p, { ...ashaForm, id: crypto.randomUUID().slice(0, 8) }])
    setAshaForm({ facility: '', syndrome: 'Fever with rash', count: 5, notes: '', file: '' })
  }
  const delAsha = i => setAsha(p => p.filter((_, idx) => idx !== i))
  const exportAsha = () => {
    const h = ['facility', 'syndrome', 'count', 'notes', 'file', 'id']
    download('asha_intake.csv', 'text/csv', [h.join(','), ...asha.map(r => h.map(k => r[k]).join(','))].join('\n'))
  }

  const runInv = () => {
    const risk = RISK[invForm.district] || 40
    const demand = forecastCases(BASE_CASES[invForm.district] || 0, risk, +invForm.horizon)
    const buf = (+invForm.buffer || 0) / 100
    setInv([
      ['Beds', invForm.beds, Math.round(demand * 0.12 * (1 + buf))],
      ['Oxygen Cylinders', invForm.o2, Math.round(demand * 0.08 * (1 + buf))],
      ['ORS (packs)', invForm.ors, Math.round(demand * 2.1 * (1 + buf))],
      ['IV Fluids (units)', invForm.iv, Math.round(demand * 0.6 * (1 + buf))],
      ['RDT Kits', invForm.rdt, Math.round(demand * 1.2 * (1 + buf))],
    ].map(([name, cur, need]) => {
      const delta = need - cur
      return { name, cur, need, delta, status: delta <= 0 ? 'OK' : delta < need * 0.15 ? 'Low' : 'Critical' }
    }))
  }

  const raiseGr = () => {
    if (!grForm.sub || !grForm.body) return
    setGr(p => [{ ...grForm, id: 'AK-' + Math.random().toString(36).slice(2, 8).toUpperCase(), status: 'Open' }, ...p])
    setGrForm({ cat: 'Data correction', dist: DISTRICTS[0], prio: 'Low', sub: '', body: '' })
  }
  const updateGr = (i, status) => setGr(p => p.map((r, idx) => idx === i ? { ...r, status } : r))

  /* ── Nav items ── */
  const NAV = [
    ['cases', 'My Cases'],
    ['inventory', 'Inventory Planner'],
    ['alerts', 'Alerts & Forecasts'],
    ['roster', 'Roster & Directory'],
    ['grievance', 'Grievance Portal'],
  ]

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_20%_10%,rgba(0,113,227,0.12),transparent_40%),radial-gradient(circle_at_75%_18%,rgba(16,185,129,0.09),transparent_40%),radial-gradient(circle_at_30%_85%,rgba(244,63,94,0.07),transparent_42%),linear-gradient(#fbfbfd,#f6f7fb)] text-black">

      {/* ── Navbar ── */}
<motion.header
  initial={{ opacity: 0, y: -6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45, ease: "easeOut" }}
  className="sticky top-0 z-30 border-b border-black/10 bg-white/70 backdrop-blur-xl"
>
  <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-7">
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex items-center gap-3 text-left"
    >
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-[24px] text-red-500">
        ✚
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">Arogya Kavach</div>
        <div className="text-xs text-black/55">Doctor Portal</div>
      </div>
    </button>

    <div className="flex items-center gap-3">
      {loggedIn && (
        <div className="hidden md:block text-xs text-black/55">
          {login.doctor} · {login.hospital}
        </div>
      )}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-semibold text-black ring-1 ring-black/10 shadow-sm transition hover:bg-black/5"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12L12 3L21 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 10V20C5 20.5523 5.44772 21 6 21H9V16C9 15.4477 9.44772 15 10 15H14C14.5523 15 15 15.4477 15 16V21H18C18.5523 21 19 20.5523 19 20V10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Dashboard
      </button>
    </div>
  </div>
</motion.header>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-7">

        {/* ── Login ── */}
        {!loggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-[calc(100vh-80px)] items-center justify-center"
          >
            <div className="w-full max-w-lg">
              <div className="mb-7 text-center">
                <div className="text-[2rem] font-semibold tracking-tight leading-[1.15]">Doctor Login</div>
                <div className="mt-2 text-[13.5px] text-black/55">Sign in to access your cases, inventory planner, and grievance tracker.</div>
              </div>
              <GlassCard className="p-7">
                <div className="grid gap-4">
                  <SelectField label="Hospital / Medical College" value={login.hospital} onChange={v => setLogin(p => ({ ...p, hospital: v }))}>
                    <option>Sir JJ Hospital, Mumbai</option>
                    <option>Grant Government Medical College (GGMC)</option>
                    <option>King Edward Memorial (KEM) Hospital</option>
                    <option>Vilāsrao Deshmukh GMC & Hospital, Latur (VDGMC)</option>
                  </SelectField>
                  <SelectField label="Doctor" value={login.doctor} onChange={v => setLogin(p => ({ ...p, doctor: v }))}>
                    {DOCTORS.map(n => <option key={n}>{n}</option>)}
                  </SelectField>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Email / ID" value={login.id} onChange={v => setLogin(p => ({ ...p, id: v }))} placeholder="doctor@hospital.gov.in" />
                    <InputField label="Password" type="password" value={login.pw} onChange={v => setLogin(p => ({ ...p, pw: v }))} placeholder="••••••••" />
                  </div>
                </div>
                <BtnPrimary onClick={doLogin} className="mt-6 w-full justify-center">Login</BtnPrimary>
                <p className="mt-3 text-center text-[12px] text-black/35">SSO planned (NIC / Keycloak) in production</p>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ── App ── */}
        {loggedIn && (
          <div className="mt-2 grid lg:grid-cols-12 gap-5">

            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <GlassCard className="p-4 sticky top-[72px]">
                <div className="mb-3 px-1">
                  <div className="text-[13px] font-semibold text-black">Portal Menu</div>
                </div>
                <div className="grid gap-1.5">
                  {NAV.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => key === 'alerts' ? navigate('/') : setTab(key)}
                      className={cn(
                        'w-full rounded-2xl px-4 py-3 text-left text-[13.5px] font-medium transition',
                        tab === key && key !== 'alerts'
                          ? 'bg-black text-white'
                          : key === 'alerts'
                            ? 'bg-white ring-1 ring-black/10 text-black/70 hover:bg-black/5 flex items-center justify-between'
                            : 'bg-white ring-1 ring-black/10 text-black/70 hover:bg-black/5'
                      )}
                    >
                      {label}
                      {key === 'alerts' && (
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-40">
                          <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </aside>

            {/* Main content */}
            <main className="lg:col-span-9 grid gap-5">

              {/* ── MY CASES ── */}
              {tab === 'cases' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid gap-5">
                  <GlassCard className="p-7">
                    <CardHeader title="My Cases" subtitle="Quick entry and export for weekly bulletins (CSV/IHIP-ready). No person-identifiable data." />
                    <div className="mt-5 grid md:grid-cols-3 gap-4">
                      <SelectField label="Disease" value={caseForm.disease} onChange={v => setCaseForm(p => ({ ...p, disease: v }))}>
                        <option>Acute Diarrhoeal Disease (ADD)</option>
                        <option>Dengue</option><option>Malaria</option><option>ILI</option><option>SARI</option>
                      </SelectField>
                      <SelectField label="District" value={caseForm.district} onChange={v => setCaseForm(p => ({ ...p, district: v }))}>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </SelectField>
                      <SelectField label="Epi Week" value={caseForm.week} onChange={v => setCaseForm(p => ({ ...p, week: v }))}>
                        {Array.from({ length: 52 }, (_, i) => String(i + 1)).map(w => <option key={w}>W{w}</option>)}
                      </SelectField>
                    </div>
                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                      <InputField label="New Cases" type="number" value={caseForm.count} onChange={v => setCaseForm(p => ({ ...p, count: v }))} />
                      <InputField label="Hospitalisations" type="number" value={caseForm.hosp} onChange={v => setCaseForm(p => ({ ...p, hosp: v }))} />
                      <InputField label="Deaths" type="number" value={caseForm.death} onChange={v => setCaseForm(p => ({ ...p, death: v }))} />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <BtnPrimary onClick={addCase}>Add Record</BtnPrimary>
                      <BtnGhost onClick={exportCases}>Export CSV</BtnGhost>
                      <span className="text-[12px] text-black/45">{cases.length} records</span>
                    </div>
                  </GlassCard>

                  {cases.length > 0 && (
                    <GlassCard className="p-7">
                      <CardHeader title="Submitted Records" />
                      <Table head={['Disease', 'District', 'Week', 'Cases', 'Hosp', 'Deaths', '']}>
                        {cases.map((r, i) => (
                          <TR key={i}
                            cells={[r.disease, r.district, r.week, r.count, r.hosp, r.death]}
                            actions={<BtnGhost onClick={() => delCase(i)} className="text-[12px] px-3 py-1.5 text-rose-600 ring-rose-200 hover:bg-rose-50">Delete</BtnGhost>}
                          />
                        ))}
                      </Table>
                    </GlassCard>
                  )}
                </motion.div>
              )}

              {/* ── INVENTORY ── */}
              {tab === 'inventory' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid gap-5">
                  <GlassCard className="p-7">
                    <CardHeader title="Inventory Planner" subtitle="Compute deltas for beds / oxygen / ORS / IV / RDT vs forecast demand. Values are illustrative." />
                    <div className="mt-5 grid md:grid-cols-3 gap-4">
                      <SelectField label="District" value={invForm.district} onChange={v => setInvForm(p => ({ ...p, district: v }))}>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </SelectField>
                      <SelectField label="Forecast Week" value={invForm.horizon} onChange={v => setInvForm(p => ({ ...p, horizon: +v }))}>
                        <option value="0">This week</option>
                        <option value="1">+1 week</option>
                        <option value="2">+2 weeks</option>
                      </SelectField>
                      <InputField label="Buffer %" type="number" value={invForm.buffer} onChange={v => setInvForm(p => ({ ...p, buffer: +v }))} />
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InputField label="Current Beds" type="number" value={invForm.beds} onChange={v => setInvForm(p => ({ ...p, beds: +v }))} />
                      <InputField label="Oxygen Cylinders" type="number" value={invForm.o2} onChange={v => setInvForm(p => ({ ...p, o2: +v }))} />
                      <InputField label="ORS (packs)" type="number" value={invForm.ors} onChange={v => setInvForm(p => ({ ...p, ors: +v }))} />
                      <InputField label="IV Fluids (units)" type="number" value={invForm.iv} onChange={v => setInvForm(p => ({ ...p, iv: +v }))} />
                      <InputField label="RDT Kits" type="number" value={invForm.rdt} onChange={v => setInvForm(p => ({ ...p, rdt: +v }))} />
                      <div className="flex items-end">
                        <BtnPrimary onClick={runInv} className="w-full justify-center">Calculate</BtnPrimary>
                      </div>
                    </div>
                  </GlassCard>

                  {inv.length > 0 && (
                    <GlassCard className="p-7">
                      <CardHeader title="Supply Gap Analysis" />
                      <Table head={['Item', 'Current', 'Needed', 'Delta', 'Status']}>
                        {inv.map((r, i) => (
                          <TR key={i} cells={[
                            r.name, r.cur, r.need,
                            <span className={r.delta > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                              {r.delta > 0 ? `+${r.delta}` : r.delta}
                            </span>,
                            <StatusBadge status={r.status} />,
                          ]} />
                        ))}
                      </Table>
                    </GlassCard>
                  )}
                </motion.div>
              )}

              {/* ── ROSTER ── */}
              {tab === 'roster' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  <GlassCard className="p-7">
                    <CardHeader title="Roster & Directory" subtitle="Doctors and students for JJ / KEM / GGMC / VDGMC. Use search to filter." />
                    <div className="mt-5">
                      <div className="relative">
                        <input
                          value={roQuery}
                          onChange={e => setRoQuery(e.target.value)}
                          placeholder="Search name or hospital…"
                          className="w-full rounded-2xl bg-white pl-10 pr-4 py-3.5 text-[13.5px] text-black shadow-sm ring-1 ring-black/10 outline-none transition focus:ring-black/20"
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M13.5 13.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <Table head={['Name', 'Role', 'Hospital / Medical College']}>
                      {roRows.map((r, i) => <TR key={i} cells={r} />)}
                    </Table>
                  </GlassCard>
                </motion.div>
              )}

              {/* ── GRIEVANCE ── */}
              {tab === 'grievance' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid gap-5">
                  <GlassCard className="p-7">
                    <CardHeader title="Grievance Portal" subtitle="Raise issues related to data, workflow, staffing, or supplies. Track status and respond." />
                    <div className="mt-5 grid md:grid-cols-3 gap-4">
                      <SelectField label="Category" value={grForm.cat} onChange={v => setGrForm(p => ({ ...p, cat: v }))}>
                        <option>Data correction</option><option>Workflow issue</option>
                        <option>Staffing</option><option>Supplies</option><option>Other</option>
                      </SelectField>
                      <SelectField label="District" value={grForm.dist} onChange={v => setGrForm(p => ({ ...p, dist: v }))}>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </SelectField>
                      <SelectField label="Priority" value={grForm.prio} onChange={v => setGrForm(p => ({ ...p, prio: v }))}>
                        <option>Low</option><option>Medium</option><option>High</option>
                      </SelectField>
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <InputField label="Subject" value={grForm.sub} onChange={v => setGrForm(p => ({ ...p, sub: v }))} placeholder="Short title of the issue" />
                      <label className="flex flex-col gap-2">
                        <span className="text-[12px] font-medium text-black/55">Attachment (optional)</span>
                        <input type="file" className="w-full rounded-2xl bg-white px-4 py-3 text-[13px] text-black/60 shadow-sm ring-1 ring-black/10 file:mr-3 file:rounded-xl file:border-0 file:bg-black/5 file:px-3 file:py-1 file:text-[12px] file:font-medium" />
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="flex flex-col gap-2">
                        <span className="text-[12px] font-medium text-black/55">Details</span>
                        <textarea
                          value={grForm.body}
                          onChange={e => setGrForm(p => ({ ...p, body: e.target.value }))}
                          placeholder="Describe the issue, steps to reproduce, expected resolution…"
                          className="w-full rounded-2xl bg-white px-4 py-3.5 text-[13.5px] text-black shadow-sm ring-1 ring-black/10 outline-none transition focus:ring-black/20 min-h-[110px] resize-none"
                        />
                      </label>
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <BtnPrimary onClick={raiseGr}>Raise Ticket</BtnPrimary>
                      <span className="text-[12px] text-black/45">{gr.filter(x => x.status === 'Open').length} open tickets</span>
                    </div>
                  </GlassCard>

                  {gr.length > 0 && (
                    <GlassCard className="p-7">
                      <CardHeader title="Open Tickets" />
                      <Table head={['ID', 'Category', 'District', 'Priority', 'Subject', 'Status', '']}>
                        {gr.map((g, i) => (
                          <TR key={g.id}
                            cells={[g.id, g.cat, g.dist, g.prio, g.sub, <StatusBadge status={g.status} />]}
                            actions={
                              <div className="flex gap-2 justify-end">
                                <BtnGhost onClick={() => updateGr(i, 'In Progress')} className="text-[12px] px-3 py-1.5">In Progress</BtnGhost>
                                <BtnGhost onClick={() => updateGr(i, 'Closed')} className="text-[12px] px-3 py-1.5">Close</BtnGhost>
                              </div>
                            }
                          />
                        ))}
                      </Table>
                    </GlassCard>
                  )}
                </motion.div>
              )}


            </main>
          </div>
        )}

        {/* Footer */}
        
      </div>
    </div>
  )
}