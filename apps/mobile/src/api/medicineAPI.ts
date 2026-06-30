import { storage } from '../utils/storage'

const API_URL = 'http://localhost:3000/api'

export interface MedicineDisease {
  id: string
  diseaseId: string
  medicineId: string
  disease: {
    id: string
    name: string
    severity: string
  }
}

export interface Medicine {
  id: string
  name: string
  description: string
  dosage: string
  sideEffects: string[]
  usageInstructions: string
  warnings: string[]
  manufacturer: string | null
  imageUrl: string | null
  diseaseMedicines: MedicineDisease[]
  createdAt: string
  updatedAt: string
}

export interface MedicineListResponse {
  data: Medicine[]
  pagination: {
    total: number
    skip: number
    take: number
    hasMore: boolean
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const medicineAPI = {
  async list(skip = 0, take = 20, search?: string): Promise<MedicineListResponse> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ skip: String(skip), take: String(take) })
    if (search) params.set('search', search)
    const res = await fetch(`${API_URL}/medicines?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load medicines')
    return res.json()
  },

  async getById(id: string): Promise<Medicine> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/medicines/${id}`, { headers })
    if (!res.ok) throw new Error('Medicine not found')
    return res.json()
  },

  async search(query: string): Promise<Medicine[]> {
    const headers = await getHeaders()
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`${API_URL}/medicines/search?${params}`, { headers })
    if (!res.ok) throw new Error('Search failed')
    return res.json()
  },
}