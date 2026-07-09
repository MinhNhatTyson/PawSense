import { useState, useEffect, useCallback } from 'react'
import { vetDirectoryAPI, type VetSummary } from './vetDirectoryAPI'
import { Sidebar } from '../components/Sidebar'

const RADIUS_OPTIONS = [5, 10, 25, 50]

export default function VetDirectory() {
  const [vets, setVets] = useState<VetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState<number | null>(null)

  const load = useCallback(async (q: string, c: { lat: number; lng: number } | null, r: number | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await vetDirectoryAPI.list({
        search: q || undefined,
        lat: c?.lat,
        lng: c?.lng,
        radiusKm: r || undefined,
      })
      setVets(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load veterinarians')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(search, coords, radiusKm) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (q: string) => {
    setSearch(q)
    load(q, coords, radiusKm)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this environment.')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(next)
        setLocating(false)
        load(search, next, radiusKm)
      },
      () => {
        setLocating(false)
        setLocationError('Could not determine your location. Check browser location permissions.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleClearLocation = () => {
    setCoords(null)
    setRadiusKm(null)
    setLocationError(null)
    load(search, null, null)
  }

  const handleRadius = (km: number) => {
    const next = radiusKm === km ? null : km
    setRadiusKm(next)
    load(search, coords, next)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ padding: '48px 56px', background: 'var(--cream)', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
            Nearby Veterinarians
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Browse fellow veterinarians on PawSense, sorted by distance from you
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 'var(--radius-md)', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Location banner */}
        {!coords && (
          <div style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-body)', marginBottom: locationError ? 6 : 0 }}>
                Enable location to sort veterinarians by distance from you.
              </p>
              {locationError && <p style={{ fontSize: 13, color: 'var(--error)' }}>{locationError}</p>}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 20px', flexShrink: 0 }}
              onClick={handleUseLocation}
              disabled={locating}
            >
              {locating && <span className="spinner" />}
              {locating ? 'Detecting…' : '📍 Use my location'}
            </button>
          </div>
        )}

        {/* Radius filter */}
        {coords && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {RADIUS_OPTIONS.map(km => (
              <button
                key={km}
                onClick={() => handleRadius(km)}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: radiusKm === km ? 600 : 400,
                  border: `1.5px solid ${radiusKm === km ? 'var(--green-sage)' : 'var(--warm-white)'}`,
                  background: radiusKm === km ? 'var(--green-pale)' : '#fff',
                  color: radiusKm === km ? 'var(--green-forest)' : 'var(--text-body)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                }}
              >
                Within {km} km
              </button>
            ))}
            <button
              onClick={handleClearLocation}
              style={{ padding: '8px 14px', fontSize: 13, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear location
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 380, marginBottom: 28 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or clinic…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '80px 20px', color: 'var(--text-muted)', fontSize: 15 }}>
            <span className="spinner spinner-dark" /> Loading veterinarians…
          </div>
        ) : vets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 15 }}>
              {radiusKm ? `No veterinarians found within ${radiusKm} km.` : 'No veterinarians found.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {vets.map(vet => (
              <div key={vet.id} style={{ background: '#fff', border: '1px solid var(--warm-white)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-pale)', color: 'var(--green-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                    {(vet.profile?.fullName || vet.email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vet.profile?.fullName || vet.email}
                    </div>
                    {vet.profile?.clinicName && (
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{vet.profile.clinicName}</div>
                    )}
                  </div>
                </div>

                {vet.profile?.address && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-light)' }}>📍 {vet.profile.address}</div>
                )}

                {vet.profile?.specialization && (
                  <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 600, background: 'var(--green-pale)', color: 'var(--green-forest)', padding: '3px 10px', borderRadius: 100 }}>
                    {vet.profile.specialization}
                  </span>
                )}

                {vet.distanceKm != null && (
                  <span style={{ alignSelf: 'flex-start', fontSize: 11.5, fontWeight: 700, color: 'var(--gold-deep)' }}>
                    {vet.distanceKm < 1 ? `${Math.round(vet.distanceKm * 1000)} m away` : `${vet.distanceKm.toFixed(1)} km away`}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}