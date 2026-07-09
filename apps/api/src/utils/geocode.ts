interface GeocodeResult {
  latitude: number
  longitude: number
}

/**
 * Resolves a free-text address to coordinates using OpenStreetMap's Nominatim.
 * Free, no API key required — but rate-limited (max ~1 req/sec) and requires
 * a descriptive User-Agent per their usage policy. Returns null on any failure
 * so callers can gracefully fall back to leaving coordinates unset.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address?.trim()) return null

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PawSense/1.0 (veterinary knowledge base app)' },
    })
    if (!res.ok) return null

    const results = (await res.json()) as Array<{ lat: string; lon: string }>
    if (!results.length) return null

    const latitude = parseFloat(results[0]!.lat)
    const longitude = parseFloat(results[0]!.lon)
    if (isNaN(latitude) || isNaN(longitude)) return null

    return { latitude, longitude }
  } catch (err) {
    console.error('Geocoding failed:', err)
    return null
  }
}