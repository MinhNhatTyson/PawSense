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
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const vetDirectoryAPI = {
  async list(search?: string): Promise<VetSummary[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/vet-directory?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load vets')
    return res.json()
  },
}