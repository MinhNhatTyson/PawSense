import { storage } from '../utils/storage'
import { API_URL } from '../config'

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

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const vetDirectoryAPI = {
  async list(search?: string, coords?: Coordinates, radiusKm?: number): Promise<VetSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (coords) {
      params.set('lat', String(coords.latitude))
      params.set('lng', String(coords.longitude))
    }
    if (radiusKm) params.set('radiusKm', String(radiusKm))
    const res = await fetch(`${API_URL}/vet-directory?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load vets')
    return res.json()
  },
}