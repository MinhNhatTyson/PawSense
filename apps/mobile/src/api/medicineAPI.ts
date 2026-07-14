import { apiFetch } from '../utils/apiFetch'

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

export const medicineAPI = {
  async list(skip = 0, take = 20, search?: string, diseaseId?: string): Promise<MedicineListResponse> {
    const params = new URLSearchParams({ skip: String(skip), take: String(take) })
    if (search) params.set('search', search)
    if (diseaseId) params.set('diseaseId', diseaseId)
    const res = await apiFetch(`/medicines?${params}`)
    if (!res.ok) throw new Error('Failed to load medicines')
    return res.json()
  },

  async getById(id: string): Promise<Medicine> {
    const res = await apiFetch(`/medicines/${id}`)
    if (!res.ok) throw new Error('Medicine not found')
    return res.json()
  },

  async search(query: string): Promise<Medicine[]> {
    const params = new URLSearchParams({ q: query })
    const res = await apiFetch(`/medicines/search?${params}`)
    if (!res.ok) throw new Error('Search failed')
    return res.json()
  },
}