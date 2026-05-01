import { useEffect, useMemo } from 'react'

export default function Controls({ data = [], filters, setFilters }) {
  const uniqSorted = (arr) =>
    Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
      String(a).localeCompare(String(b), 'en', { sensitivity: 'base' })
    )

  // --- Normalizers (prevents duplicate options due to whitespace/casing/odd labels) ---
  const norm = (x) => String(x ?? '').trim().replace(/\s+/g, ' ')

  const normDistrict = (x) => norm(x)

  const normDisease = (x) => {
    let s = norm(x)
    // remove dangling ampersand
    if (s.endsWith('&')) s = s.slice(0, -1).trim()
    // normalize known odd label variants
    if (s === 'Dengue &') s = 'Dengue'
    if (s === 'Dengue & ') s = 'Dengue'
    return s
  }

  const normCategory = (x) => norm(x)

  // Build a normalized view of the data ONCE (so all dropdown logic uses clean labels)
  const cleanData = useMemo(() => {
    return (data || []).map(r => ({
      ...r,
      district: normDistrict(r.district),
      disease: normDisease(r.disease),
      category: normCategory(r.category),
    }))
  }, [data])

  // Filter the option universe by current selections (also normalized)
  const subset = (cond) =>
    cleanData.filter(r =>
      (cond.district ? r.district === normDistrict(cond.district) : true) &&
      (cond.disease  ? r.disease  === normDisease(cond.disease)  : true) &&
      (cond.category ? r.category === normCategory(cond.category) : true)
    )

  // Districts depend on (Disease, Category)
  const districtOptions = useMemo(() => {
    const rows = subset({
      disease:  filters.disease  !== 'All Diseases'   ? filters.disease  : null,
      category: filters.category !== 'All Categories' ? filters.category : null,
    })
    return ['All Districts', ...uniqSorted(rows.map(r => r.district))]
  }, [cleanData, filters.disease, filters.category])

  // Diseases depend on (District, Category)
  const diseaseOptions = useMemo(() => {
    const rows = subset({
      district: filters.district !== 'All Districts' ? filters.district : null,
      category: filters.category !== 'All Categories' ? filters.category : null,
    })
    return ['All Diseases', ...uniqSorted(rows.map(r => r.disease))]
  }, [cleanData, filters.district, filters.category])

  // Categories depend on (District, Disease)
  const categoryOptions = useMemo(() => {
    const rows = subset({
      district: filters.district !== 'All Districts' ? filters.district : null,
      disease:  filters.disease  !== 'All Diseases'   ? filters.disease  : null,
    })
    return ['All Categories', ...uniqSorted(rows.map(r => r.category))]
  }, [cleanData, filters.district, filters.disease])

  // If a current selection becomes invalid, reset just that control
  useEffect(() => {
    const updates = {}
    if (!districtOptions.includes(filters.district)) updates.district = 'All Districts'
    if (!diseaseOptions.includes(filters.disease))   updates.disease  = 'All Diseases'
    if (!categoryOptions.includes(filters.category)) updates.category = 'All Categories'
    if (Object.keys(updates).length) setFilters(prev => ({ ...prev, ...updates }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtOptions, diseaseOptions, categoryOptions])

  // Change handlers (clear dependents for a clean UX)
  const onDistrictChange = (e) => {
    const v = e.target.value
    setFilters({ district: v, disease: 'All Diseases', category: 'All Categories' })
  }
  const onDiseaseChange = (e) => {
    const v = e.target.value
    setFilters(prev => ({ ...prev, disease: v, category: 'All Categories' }))
  }
  const onCategoryChange = (e) => {
    const v = e.target.value
    setFilters(prev => ({ ...prev, category: v }))
  }

  const sel =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 appearance-none focus:outline-none focus:ring-0 focus:border-slate-400'

  return (
    <div className="card p-4 grid md:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs text-slate-500 mb-1">District</label>
        <select className={sel} value={filters.district} onChange={onDistrictChange} aria-label="District">
          {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Disease</label>
        <select className={sel} value={filters.disease} onChange={onDiseaseChange} aria-label="Disease">
          {diseaseOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Category</label>
        <select className={sel} value={filters.category} onChange={onCategoryChange} aria-label="Category">
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}
