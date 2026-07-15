import { apiFetch } from '../utils/apiFetch'

export interface VetSummary {
  id: string
  email: string
  profile?: {
    fullName?: string
    clinicName?: string
    address?: string
    specialization?: string
    phone?: string
    avatar?: string
    latitude?: number
    longitude?: number
  }
  distanceKm?: number | null
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export const vetDirectoryAPI = {
  async list(search?: string, coords?: Coordinates, radiusKm?: number): Promise<VetSummary[]> {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (coords) {
      params.set('lat', String(coords.latitude))
      params.set('lng', String(coords.longitude))
    }
    if (radiusKm) params.set('radiusKm', String(radiusKm))
    const res = await apiFetch(`/vet-directory?${params}`)
    if (!res.ok) throw new Error('Failed to load vets')
    return res.json()
  },
}