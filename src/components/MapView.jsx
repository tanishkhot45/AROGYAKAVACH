// components/MapView.jsx
import { GoogleMap, Circle, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { DISTRICT_COORDS, normalizeDistrict } from '../data/maharashtraDistricts.js'

const MH_CENTER = { lat: 19.7515, lng: 75.7139 }
const MH_BOUNDS = { north: 22.25, south: 15.6, west: 72.3, east: 80.5 }
const MAP_HEIGHT = '73vh'
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const SELECT_ZOOM = 9.6 // tighter zoom when a district is selected

export default function MapView({ apiKey, points = [], selectedDistrict }) {
  if (!apiKey) {
    return (
      <div className="card p-6">
        <div className="text-sm text-slate-700">
          <div className="font-semibold mb-1">Google Maps API key missing</div>
          Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code> and restart.
        </div>
      </div>
    )
  }

  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey })
  const [hover, setHover] = useState(null)
  const mapRef = useRef(null)
  const didInitialFitRef = useRef(false)

  // Keep track of native circle instances for hard cleanup on dataset changes
  const circleInstancesRef = useRef([]) // Array<google.maps.Circle>
  // Prevent auto-fit from overriding an intentional zoom-to-selection
  const skipNextAutoFitRef = useRef(false)

  // Version signature for current dataset (changes on any dropdown change)
  // IMPORTANT: use districtKey if available (coords key), not only display district label
  const layerVersion = useMemo(() => {
    return (points || [])
      .map(p => {
        const key = p.districtKey ?? p.district
        return `${normalizeDistrict(key)}:${Number(p.cases) || 0}`
      })
      .sort()
      .join('|')
  }, [points])

  // Build circle data (coerce cases → number; drop unknown coords only)
  const circles = useMemo(() => {
    const cleaned = (points || [])
      .map(p => {
        const key = p.districtKey ?? p.district
        const d = normalizeDistrict(key)
        const n = Number(p.cases)
        const cases = Number.isFinite(n) ? n : (parseFloat(`${p.cases}`) || 0)
        return { ...p, d, cases }
      })
      .filter(p => !!DISTRICT_COORDS[p.d])

    const maxCases = Math.max(1, ...cleaned.map(p => p.cases))
    const sizeForCases = (c) => {
      const val = Math.max(0, Number(c) || 0)
      const minR = 12000, maxR = 60000
      const t = Math.sqrt(val / maxCases) // perceptual scaling
      return minR + t * (maxR - minR)
    }

    return cleaned.map(p => ({
      ...p,
      center: DISTRICT_COORDS[p.d],
      radius: sizeForCases(p.cases),
      key: p.d, // per-district key
    }))
  }, [points])

  // --- view helpers ---
  const fitToAll = (m) => {
    if (!m) return
    if (circles.length) {
      const bounds = new window.google.maps.LatLngBounds()
      circles.forEach(p => bounds.extend(p.center))
      m.fitBounds(bounds, 40)
    } else {
      const bounds = new window.google.maps.LatLngBounds(
        { lat: MH_BOUNDS.south, lng: MH_BOUNDS.west },
        { lat: MH_BOUNDS.north, lng: MH_BOUNDS.east }
      )
      m.fitBounds(bounds, 40)
    }
    // IMPORTANT: widen clamp so statewide fitBounds isn't "fought"
    const z = clamp(m.getZoom(), 6.2, 9.2)
    if (z !== m.getZoom()) m.setZoom(z)
  }

  const panToSelection = (m) => {
    if (!m) return false
    const raw = selectedDistrict || ''
    if (!raw || raw === 'All Districts') return false

    const sel = normalizeDistrict(raw)
    if (sel && DISTRICT_COORDS[sel]) {
      const c = DISTRICT_COORDS[sel]
      m.setOptions({ center: c, zoom: SELECT_ZOOM })
      skipNextAutoFitRef.current = true
      return true
    }
    return false
  }

  // Map lifecycle
  const onMapLoad = (m) => {
    mapRef.current = m
    requestAnimationFrame(() => {
      // If selection exists, honor it, else show all
      if (!panToSelection(m)) fitToAll(m)
      didInitialFitRef.current = true
    })
  }
  const onMapUnmount = () => { mapRef.current = null }

  // HARD RESET of previous native circles whenever the dataset changes
  useEffect(() => {
    circleInstancesRef.current.forEach(c => {
      try { c.setMap(null) } catch {}
    })
    circleInstancesRef.current = []
    setHover(null)
  }, [layerVersion])

  // When circles change (filters affect points)
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    if (skipNextAutoFitRef.current) {
      skipNextAutoFitRef.current = false
      return
    }

    // If no district selected, always fit to all
    if (!selectedDistrict || selectedDistrict === 'All Districts') {
      fitToAll(mapRef.current)
      return
    }

    // Otherwise respect selection (fallback to fit)
    if (!panToSelection(mapRef.current)) fitToAll(mapRef.current)
  }, [isLoaded, circles.length, selectedDistrict])

  // When only selection changes, force correct view
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !didInitialFitRef.current) return
    setHover(null)

    if (!selectedDistrict || selectedDistrict === 'All Districts') {
      fitToAll(mapRef.current)
      return
    }

    panToSelection(mapRef.current) || fitToAll(mapRef.current)
  }, [selectedDistrict, isLoaded, circles.length])

  if (!isLoaded) return <div className="card p-6">Loading map…</div>

  return (
    <div className="card overflow-hidden">
      <GoogleMap
        id="map"
        mapContainerStyle={{ height: MAP_HEIGHT, width: '100%' }}
        center={MH_CENTER}
        zoom={7.2}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          disableDefaultUI: true,
          clickableIcons: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'administrative.province', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
          restriction: { latLngBounds: MH_BOUNDS, strictBounds: false },
        }}
      >
        {/* Keyed fragment guarantees previous batch unmounts */}
        <Fragment key={layerVersion}>
          {circles.map(p => (
            <Circle
              key={p.key}
              center={p.center}
              radius={p.radius}
              options={{
                strokeOpacity: hover?.key === p.key ? 0.85 : 0.6,
                strokeWeight: hover?.key === p.key ? 2 : 1,
                fillOpacity: hover?.key === p.key ? 0.45 : 0.32,
                strokeColor: '#b91c1c',
                fillColor: '#ef4444',
              }}
              onMouseOver={() => setHover(p)}
              onMouseOut={() => setHover(null)}
              onLoad={(circle) => {
                if (circle) circleInstancesRef.current.push(circle)
              }}
              onUnmount={(circle) => {
                if (circle) {
                  try { circle.setMap(null) } catch {}
                  circleInstancesRef.current = circleInstancesRef.current.filter(c => c !== circle)
                }
              }}
            />
          ))}
        </Fragment>

        {hover && (
          <InfoWindow position={hover.center} onCloseClick={() => setHover(null)}>
            <div className="text-sm">
              <div className="font-semibold">{hover.district}</div>
              <div className="text-slate-600">
                Predicted cases: <b>{hover.cases}</b>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
