import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CSV_PROCESSED_URL = "/data/csv/processed.csv";
const CSV_PREDICTION_URL = "/data/csv/prediction.csv";

const DISTRICT_COORDS = {
  Ahilyanagar: { lat: 19.093412, lon: 74.746855 },
  Akola: { lat: 20.710576, lon: 77.00373 },
  Amravati: { lat: 20.937346, lon: 77.760249 },
  Beed: { lat: 18.987824, lon: 75.763809 },
  Bhandara: { lat: 21.169245, lon: 79.657152 },
  Buldhana: { lat: 20.532223, lon: 76.181689 },
  Chandrapur: { lat: 19.951685, lon: 79.295823 },
  "Chhatrapati Sambhajinagar": { lat: 19.885543, lon: 75.333441 },
  Dharashiv: { lat: 18.181663, lon: 76.041686 },
  Dhule: { lat: 20.90441, lon: 74.781243 },
  Gadchiroli: { lat: 20.184794, lon: 80.007887 },
  Gondia: { lat: 21.448734, lon: 80.1972 },
  Hingoli: { lat: 19.713154, lon: 77.153409 },
  Jalgaon: { lat: 21.009559, lon: 75.570044 },
  Jalna: { lat: 19.848844, lon: 75.901627 },
  Kolhapur: { lat: 16.694394, lon: 74.22406 },
  Latur: { lat: 18.401122, lon: 76.576955 },
  Nagpur: { lat: 21.148204, lon: 79.096814 },
  Nanded: { lat: 19.159314, lon: 77.313188 },
  Nandurbar: { lat: 21.36675, lon: 74.244736 },
  Nashik: { lat: 20.006006, lon: 73.795878 },
  Palghar: { lat: 19.697107, lon: 72.763725 },
  Parbhani: { lat: 19.268358, lon: 76.777025 },
  Pune: { lat: 18.525994, lon: 73.862602 },
  Raigad: { lat: 18.646539, lon: 72.875994 },
  Ratnagiri: { lat: 16.990597, lon: 73.297537 },
  Sangli: { lat: 16.860757, lon: 74.57878 },
  Satara: { lat: 17.690393, lon: 74.010744 },
  Sindhudurg: { lat: 16.107985, lon: 73.714977 },
  Solapur: { lat: 17.672099, lon: 75.907906 },
  Thane: { lat: 19.205931, lon: 72.971198 },
  Wardha: { lat: 20.735221, lon: 78.604456 },
  Washim: { lat: 20.108935, lon: 77.142117 },
  Yavatmal: { lat: 20.3876, lon: 78.131472 },
};

const DEFAULT_CENTER = { lat: 19.65, lon: 75.75 };
const DEFAULT_ZOOM = 6.7;

const cn = (...parts) => parts.filter(Boolean).join(" ");

function formatInt(n) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-IN").format(Math.round(v));
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function weekKey(year, week) { return (Number(year) || 0) * 100 + (Number(week) || 0); }
function weekLabel(year, week) {
  return `${String(year ?? "").padStart(4, "0")} • W${String(week ?? "").padStart(2, "0")}`;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}
function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function titleCase(str) { return str.replace(/\b\w/g, (c) => c.toUpperCase()); }
function prettyDateRange(startISO, endISO) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  const fmt = (d, opts) => d.toLocaleDateString("en-IN", opts);
  if (sameMonth) {
    return `${fmt(s, { day: "2-digit" })} – ${fmt(e, { day: "2-digit", month: "short", year: "numeric" })}`;
  }
  if (sameYear) {
    return `${fmt(s, { day: "2-digit", month: "short" })} – ${fmt(e, { day: "2-digit", month: "short", year: "numeric" })}`;
  }
  return `${fmt(s, { day: "2-digit", month: "short", year: "numeric" })} – ${fmt(e, { day: "2-digit", month: "short", year: "numeric" })}`;
}

function GlassCard({ children, className }) {
  return (
    <div className={cn("rounded-[26px] bg-white/70 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.40)] ring-1 ring-black/[0.06] backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, align = "left" }) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div className="text-[17px] font-semibold tracking-tight text-black">{title}</div>
      {subtitle ? <div className="mt-1 text-[12.5px] leading-relaxed text-black/50">{subtitle}</div> : null}
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, displayTransform }) {
  const display = displayTransform || ((x) => x);
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-black/55">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl bg-white px-4 py-3.5 text-[13.5px] text-black shadow-sm ring-1 ring-black/10 outline-none transition focus:ring-black/20"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{display(o)}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-black/40">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </label>
  );
}
function prettyDate(isoOrDate) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function MapAutoFocus({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const kick = () => map.invalidateSize({ pan: false });
    const t1 = setTimeout(kick, 0);
    const t2 = setTimeout(kick, 180);
    const t3 = setTimeout(kick, 420);
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => kick());
      ro.observe(map.getContainer());
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); if (ro) ro.disconnect(); };
  }, [map]);
  useEffect(() => {
    if (!center) return;
    const t = setTimeout(() => {
      map.invalidateSize({ pan: false });
      map.setView([center.lat, center.lon], zoom, { animate: true, duration: 0.9 });
    }, 120);
    return () => clearTimeout(t);
  }, [center, zoom, map]);
  return null;
}

function Metric({ label, value, sub, badge, badgeColor }) {
  const badgeCls =
    badgeColor === "rose"  ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200" :
    badgeColor === "blue"  ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" :
    badgeColor === "green" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" :
    "bg-black/5 text-black/60";
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium uppercase tracking-wide text-black/45">{label}</div>
          <div className="mt-2 text-[2rem] font-semibold tracking-tight text-black leading-none truncate">{value}</div>
          {sub ? <div className="mt-2 text-[12px] text-black/45 truncate">{sub}</div> : null}
        </div>
        {badge ? (
          <div className={`shrink-0 rounded-2xl px-3 py-2 text-[11px] font-semibold ${badgeCls}`}>{badge}</div>
        ) : null}
      </div>
    </GlassCard>
  );
}

export default function ArogyaKavachDashboard() {
  const navigate = useNavigate();
  const [procRows, setProcRows] = useState([]);
  const [predRows, setPredRows] = useState([]);
  const [dataError, setDataError] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  const [district, setDistrict] = useState("");
  const [disease, setDisease] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadCsv(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
      const text = await res.text();
      return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
    }
    (async () => {
      try {
        setDataError(null);
        const [rawProc, rawPred] = await Promise.all([loadCsv(CSV_PROCESSED_URL), loadCsv(CSV_PREDICTION_URL)]);
        const cleanedProc = rawProc.map((r) => ({
          report_year: Number(r.report_year), report_week: Number(r.report_week),
          district: String(r.district || "").trim(), disease: String(r.disease || "").trim(),
          category: String(r.category || "").trim(), cases: Number(r.cases || 0),
        })).filter((r) => r.district && r.disease && r.category);
        const cleanedPred = rawPred.map((r) => ({
          district: String(r.district || "").trim(), disease: String(r.disease || "").trim(),
          category: String(r.category || "").trim(),
          target_week_monday: String(r.target_week_monday || "").trim(),
          predicted_cases_week_total: Number(r.predicted_cases_week_total || 0),
        })).filter((r) => r.district && r.disease && r.category);
        if (!alive) return;
        setProcRows(cleanedProc);
        setPredRows(cleanedPred);
        setDataReady(true);
      } catch (e) {
        if (!alive) return;
        setDataError(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  const districts = useMemo(() => [...new Set(procRows.map((r) => r.district))].sort((a, b) => a.localeCompare(b)), [procRows]);
  const diseases = useMemo(() => {
    const rows = district ? procRows.filter((r) => r.district === district) : procRows;
    return [...new Set(rows.map((r) => r.disease))].sort((a, b) => a.localeCompare(b));
  }, [procRows, district]);
  const categories = useMemo(() => {
    const rows = procRows.filter((r) => {
      if (district && r.district !== district) return false;
      if (disease && r.disease !== disease) return false;
      return true;
    });
    return [...new Set(rows.map((r) => r.category))].sort((a, b) => a.localeCompare(b));
  }, [procRows, district, disease]);

  useEffect(() => { if (disease && !diseases.includes(disease)) setDisease(""); }, [diseases, disease]);
  useEffect(() => { if (category && !categories.includes(category)) setCategory(""); }, [categories, category]);

  const filteredProc = useMemo(() => procRows.filter((r) => (!district || r.district === district) && (!disease || r.disease === disease) && (!category || r.category === category)), [procRows, district, disease, category]);
  const filteredPred = useMemo(() => predRows.filter((r) => (!district || r.district === district) && (!disease || r.disease === disease) && (!category || r.category === category)), [predRows, district, disease, category]);

  const forecastRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = addDays(today, 7);
    return { startISO: toISODate(today), endISO: toISODate(end) };
  }, []);
  const forecastRangeLabel = useMemo(
    () => prettyDateRange(forecastRange.startISO, forecastRange.endISO),
    [forecastRange]
  );

  const trendSeries = useMemo(() => {
    if (!filteredProc.length) return [];
    const byWeek = new Map();
    for (const r of filteredProc) {
      const key = weekKey(r.report_year, r.report_week);
      const cur = byWeek.get(key) || { key, label: weekLabel(r.report_year, r.report_week), cases: 0 };
      cur.cases += Number(r.cases) || 0;
      byWeek.set(key, cur);
    }
    const sorted = Array.from(byWeek.values()).sort((a, b) => a.key - b.key);
    return sorted.slice(Math.max(0, sorted.length - 28));
  }, [filteredProc]);

  const latestWeekInfo = useMemo(() => {
    if (!trendSeries.length) return null;
    const last = trendSeries[trendSeries.length - 1];
    const prev = trendSeries.length >= 2 ? trendSeries[trendSeries.length - 2] : null;
    let badge = null;
    if (prev && prev.cases) {
      const pct = ((last.cases - prev.cases) / prev.cases) * 100;
      badge = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
    }
    return { lastTotal: last.cases, lastLabel: last.label, badge };
  }, [trendSeries]);

  const predictionTotal = useMemo(() => filteredPred.reduce((acc, r) => acc + (Number(r.predicted_cases_week_total) || 0), 0), [filteredPred]);

  const predictedByDistrict = useMemo(() => {
    const by = new Map();
    for (const r of predRows) {
      if (disease && r.disease !== disease) continue;
      if (category && r.category !== category) continue;
      if (district && r.district !== district) continue;
      const cur = by.get(r.district) || { district: r.district, predicted: 0 };
      cur.predicted += Number(r.predicted_cases_week_total) || 0;
      by.set(r.district, cur);
    }
    return Array.from(by.values()).sort((a, b) => b.predicted - a.predicted);
  }, [predRows, district, disease, category]);

  const predictedTop = useMemo(() => predictedByDistrict.slice(0, 10), [predictedByDistrict]);
  const maxPredForScale = useMemo(() => predictedByDistrict.reduce((m, d) => Math.max(m, d.predicted), 0) || 1, [predictedByDistrict]);
  const focusCenter = useMemo(() => (district && DISTRICT_COORDS[district]) ? DISTRICT_COORDS[district] : DEFAULT_CENTER, [district]);
  const focusZoom = useMemo(() => (district && DISTRICT_COORDS[district]) ? 8.6 : DEFAULT_ZOOM, [district]);

  const diseaseShare = useMemo(() => {
    const by = new Map();
    for (const r of filteredProc) by.set(r.disease, (by.get(r.disease) || 0) + (Number(r.cases) || 0));
    return Array.from(by.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [filteredProc]);

  const categoryShare = useMemo(() => {
    const by = new Map();
    for (const r of filteredProc) by.set(r.category, (by.get(r.category) || 0) + (Number(r.cases) || 0));
    return Array.from(by.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredProc]);

  const highestRiskDistrict = useMemo(() => {
    if (!predictedByDistrict.length) return null;
    const top = predictedByDistrict[0];
    return { name: top.district, predicted: top.predicted };
  }, [predictedByDistrict]);

  const mostAffectedDisease = useMemo(() => {
    if (!diseaseShare.length) return null;
    const top = diseaseShare[0];
    const total = diseaseShare.reduce((s, d) => s + d.value, 0) || 1;
    const pct = ((top.value / total) * 100).toFixed(1);
    return { name: top.name, cases: top.value, pct };
  }, [diseaseShare]);

  const hasAnyFilter = Boolean(district || disease || category);
  const resetFilters = () => { setDistrict(""); setDisease(""); setCategory(""); };
  const handleDistrictChange = (val) => { setDistrict(val); setDisease(""); setCategory(""); };
  const handleDiseaseChange = (val) => { setDisease(val); setCategory(""); };

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
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
            type="button"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-[24px] text-red-600">
              ✚
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Arogya Kavach</div>
              <div className="text-xs text-black/55">Public Health Dashboard</div>
            </div>
          </button>
          {/* Portal buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/DoctorPortal")}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-semibold text-black ring-1 ring-black/10 shadow-sm transition hover:bg-black/5"
            >
              <span className="text-[15px] leading-none">💊</span>
              <span className="hidden sm:inline">Doctor Portal</span>
              <span className="sm:hidden">Doctor</span>
            </button>

            <button
              onClick={() => navigate("/AshaReportingPortal")}
              className="flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-85"
            >
              <span className="text-[15px] leading-none">📊</span>
              <span className="hidden sm:inline">ASHA Portal</span>
              <span className="sm:hidden">ASHA</span>
            </button>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 text-left md:px-7">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="max-w-4xl">
          <div className="text-[2rem] font-semibold tracking-tight sm:text-[2.4rem] md:text-[2.75rem] leading-[1.15]">District-level disease forecasting</div>
          <div className="mt-3 text-[13.5px] leading-relaxed text-black/55 max-w-2xl">
            Filter by district, disease, and category. The map shows predicted load for the forecast week, while charts summarize historical trends and distribution.
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mt-7">
          <GlassCard className="p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-black">Filters</div>
                <div className="mt-0.5 text-[12px] text-black/55">
<div className="mt-0.5 text-[12px] text-black/55">
  Forecast week: <span className="font-medium">{prettyDate(forecastRange.endISO)}</span>
</div>                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasAnyFilter ? (
                  <div className="hidden md:flex items-center gap-2 text-[12px] text-black/60">
                    {district ? <span className="rounded-full bg-black/5 px-3 py-1">{district}</span> : null}
                    {disease ? <span className="rounded-full bg-black/5 px-3 py-1">{disease}</span> : null}
                    {category ? <span className="rounded-full bg-black/5 px-3 py-1">{titleCase(category)}</span> : null}
                  </div>
                ) : null}
                <button onClick={resetFilters} className="rounded-2xl bg-black px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:opacity-90">Reset</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-4"><Select label="District" value={district} onChange={handleDistrictChange} options={districts} placeholder="All districts" /></div>
              <div className="md:col-span-4"><Select label="Disease" value={disease} onChange={handleDiseaseChange} options={diseases} placeholder={district ? `Diseases in ${district}` : "All diseases"} /></div>
              <div className="md:col-span-4"><Select label="Category" value={category} onChange={setCategory} options={categories} displayTransform={titleCase} placeholder={disease ? `Categories for ${disease}` : district ? `Categories in ${district}` : "All categories"} /></div>
            </div>
            {dataError ? (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 ring-1 ring-rose-200">
                <div className="font-semibold">Couldn't load data</div>
                <div className="mt-1 opacity-90">{dataError}</div>
                <div className="mt-2 text-rose-700/80">
                  Ensure CSVs exist at:
                  <div className="mt-1 font-mono">public/data/csv/processed.csv</div>
                  <div className="font-mono">public/data/csv/prediction.csv</div>
                </div>
              </div>
            ) : null}
            {!dataReady && !dataError ? <div className="mt-4 text-xs text-black/55">Loading data…</div> : null}
          </GlassCard>
        </div>

        {/* Metrics */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
<Metric label="Next Week Forecast" value={dataReady ? formatInt(predictionTotal) : "—"} sub={prettyDate(forecastRange.endISO)} badge="Predicted" />
          <Metric label="Highest Risk District" value={highestRiskDistrict ? highestRiskDistrict.name : "—"} sub={highestRiskDistrict ? `${formatInt(highestRiskDistrict.predicted)} predicted cases` : "No prediction data"} badge={highestRiskDistrict ? "⚠ High Risk" : null} badgeColor="rose" />
          <Metric label="Most Affected Disease" value={mostAffectedDisease ? mostAffectedDisease.name : "—"} sub={mostAffectedDisease ? `${formatInt(mostAffectedDisease.cases)} cases · ${mostAffectedDisease.pct}% of total` : "No historical data"} badge={mostAffectedDisease ? "#1 Disease" : null} badgeColor="blue" />
        </div>

        {/* Main row */}
        <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <GlassCard className="lg:col-span-7 flex flex-col overflow-hidden">
            <div className="px-6 pt-6 pb-4 shrink-0">
              <CardHeader title="Predictive map" subtitle="Click any circle to zoom in and filter all charts to that district. Click again to deselect." />
            </div>
            <div className="relative flex-1" style={{ minHeight: 500 }}>
              <MapContainer
                key={`map-${district || "all"}-${disease || "all"}-${category || "all"}`}
                center={[focusCenter.lat, focusCenter.lon]}
                zoom={focusZoom}
                scrollWheelZoom
                style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
                whenReady={(e) => {
                  const m = e.target;
                  requestAnimationFrame(() => m.invalidateSize({ pan: false }));
                  setTimeout(() => m.invalidateSize({ pan: false }), 300);
                }}
              >
                <MapAutoFocus center={focusCenter} zoom={focusZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {predictedByDistrict.filter((d) => DISTRICT_COORDS[d.district]).map((d) => {
                  const coord = DISTRICT_COORDS[d.district];
                  const normalized = Math.sqrt(d.predicted / maxPredForScale);
                  const radius = clamp(6 + 24 * normalized, 6, 32);
                  const strong = district && d.district === district;
                  return (
                    <CircleMarker
                      key={d.district}
                      center={[coord.lat, coord.lon]}
                      radius={strong ? radius + 4 : radius}
                      pathOptions={{
                        color: strong ? "#1d4ed8" : "#991b1b", weight: strong ? 3 : 1.5,
                        opacity: strong ? 1 : 0.65, fillColor: strong ? "#3b82f6" : "#dc2626",
                        fillOpacity: strong ? 0.45 : 0.2,
                      }}
                      eventHandlers={{
                        click: () => { district === d.district ? handleDistrictChange("") : handleDistrictChange(d.district); },
                        mouseover: (e) => { e.target.setStyle({ fillOpacity: strong ? 0.6 : 0.38, weight: strong ? 3 : 2.5 }); e.target.getElement().style.cursor = "pointer"; },
                        mouseout: (e) => { e.target.setStyle({ fillOpacity: strong ? 0.45 : 0.2, weight: strong ? 3 : 1.5 }); },
                      }}
                    >
                      <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                        <div className="text-xs min-w-[130px]">
                          <div className="font-semibold text-black">{d.district}</div>
                          <div className="mt-1 text-black/70">Predicted: <span className="font-semibold text-black">{formatInt(d.predicted)}</span></div>
                          <div className="mt-1.5 text-[10px] text-black/40 italic">{district === d.district ? "Click to deselect" : "Click to explore"}</div>
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
              <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-2xl bg-white/85 px-3 py-2 text-[12px] text-black/60 shadow-sm ring-1 ring-black/10 backdrop-blur">
                <div className="font-semibold text-black/75">Legend</div>
                <div className="mt-1">Bigger circle → higher predicted load</div>
                <div className="mt-0.5">Click a circle to explore that district</div>
              </div>
            </div>
          </GlassCard>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <GlassCard className="p-6">
              <CardHeader align="center" title="Historical trend" subtitle={latestWeekInfo ? `Last point: ${latestWeekInfo.lastLabel}` : "No historical data"} />
              <div className="mt-4 h-[240px]">
                {trendSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendSeries} margin={{ top: 10, right: 14, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 8" strokeOpacity={0.22} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.55)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.55)" }} axisLine={false} tickLine={false} width={38} />
                      <ReTooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 18px 60px -40px rgba(0,0,0,0.35)" }} formatter={(v) => [formatInt(v), "Cases"]} labelStyle={{ fontWeight: 700 }} />
                      <Line type="monotone" dataKey="cases" stroke="#0071e3" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center rounded-3xl bg-black/[0.03] text-xs text-black/55">No trend available for selected filters.</div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <CardHeader align="center" title="Top districts (prediction)" subtitle="Horizontal bars keep labels clean and readable." />
              <div className="mt-4 h-[270px]">
                {predictedTop.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictedTop.slice().reverse()} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 8" strokeOpacity={0.22} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.55)" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="district" width={110} tick={{ fontSize: 11.5, fill: "rgba(0,0,0,0.75)", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <ReTooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 18px 60px -40px rgba(0,0,0,0.35)" }} formatter={(v) => [formatInt(v), "Predicted"]} labelStyle={{ fontWeight: 700 }} />
                      <Bar dataKey="predicted" radius={[0, 8, 8, 0]}>
                        {predictedTop.slice().reverse().map((_, i) => (
                          <Cell key={i} fill={["#0071e3","#6366f1","#10b981","#f59e0b","#ef4444","#0ea5e9","#8b5cf6","#f97316","#14b8a6","#ec4899"][i % 10]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center rounded-3xl bg-black/[0.03] text-xs text-black/55">No predictions available for selected filters.</div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Composition */}
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
          <GlassCard className="p-6">
            <CardHeader align="center" title="Disease mix (historical)" subtitle="Top contributors in the current selection." />
            <div className="mt-4 h-[340px]">
              {diseaseShare.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ReTooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 18px 60px -40px rgba(0,0,0,0.35)" }} formatter={(v) => [formatInt(v), "Cases"]} />
                    <Pie data={diseaseShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} innerRadius={72} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={{ stroke: "rgba(0,0,0,0.25)", strokeWidth: 1 }}>
                      {diseaseShare.map((_, i) => (
                        <Cell key={i} fill={["#0071e3","#111827","#10b981","#f59e0b","#6366f1","#ef4444","#0ea5e9"][i % 7]} fillOpacity={0.88} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center rounded-3xl bg-black/[0.03] text-xs text-black/55">No historical distribution available.</div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col">
            <CardHeader align="center" title="Category split (historical)" subtitle="Clean, readable breakdown." />
            <div className="mt-4 flex flex-col flex-1 gap-3">
              {categoryShare.length ? (
                categoryShare.map((c) => {
                  const total = categoryShare.reduce((a, b) => a + b.value, 0) || 1;
                  const pct = (c.value / total) * 100;
                  return (
                    <div key={c.name} className="flex-1 rounded-3xl bg-white/70 px-4 py-4 ring-1 ring-black/10 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[14px] font-semibold text-black">{titleCase(c.name)}</div>
                        <div className="text-[12px] font-semibold text-black/55">{formatInt(c.value)} <span className="text-black/35">({pct.toFixed(1)}%)</span></div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-black/5">
                        <div className="h-2 rounded-full bg-black/70" style={{ width: `${clamp(pct, 0, 100)}%`, opacity: 0.28 }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 grid place-items-center rounded-3xl bg-black/[0.03] text-xs text-black/55">No category split available.</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #ffffff; transform: translateZ(0); border-radius: 0; }
        .leaflet-tile-pane { transform: translateZ(0); }
        .recharts-pie-label-text { font-size: 11px !important; fill: rgba(0,0,0,0.65) !important; font-weight: 500; }
        .leaflet-interactive { cursor: pointer !important; }
      `}</style>
    </div>
  );
}