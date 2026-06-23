import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface Medicine {
  id: string
  name: string
  description: string
  dosage: string
  sideEffects: string[]
  usageInstructions: string
  warnings: string[]
  manufacturer?: string
  imageUrl?: string
  diseaseMedicines?: {
    id: string
    diseaseId: string
    medicineId: string
    disease: { id: string; name: string; severity: string }
  }[]
  createdAt: string
  updatedAt: string
}

export interface MedicineListResponse {
  data: Medicine[]
  pagination: { total: number; skip: number; take: number; hasMore: boolean }
}

export const medicineAPI = {
  create: async (
    data: {
      name: string
      description: string
      dosage: string
      sideEffects?: string[]
      usageInstructions: string
      warnings?: string[]
      manufacturer?: string
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('dosage', data.dosage)
    formData.append('usageInstructions', data.usageInstructions)
    if (data.sideEffects) formData.append('sideEffects', JSON.stringify(data.sideEffects))
    if (data.warnings) formData.append('warnings', JSON.stringify(data.warnings))
    if (data.manufacturer) formData.append('manufacturer', data.manufacturer)
    if (data.diseaseIds) formData.append('diseaseIds', JSON.stringify(data.diseaseIds))
    if (imageFile) formData.append('image', imageFile)
    return apiClient.post<Medicine>('/medicines', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getById: async (id: string) => apiClient.get<Medicine>(`/medicines/${id}`),

  list: async (skip = 0, take = 12, search?: string) =>
    apiClient.get<MedicineListResponse>('/medicines', {
      params: { skip, take, search },
    }),

  search: async (query: string) =>
    apiClient.get<Medicine[]>('/medicines/search', { params: { q: query } }),

  update: async (
    id: string,
    data: {
      name?: string
      description?: string
      dosage?: string
      sideEffects?: string[]
      usageInstructions?: string
      warnings?: string[]
      manufacturer?: string
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.dosage !== undefined) formData.append('dosage', data.dosage)
    if (data.usageInstructions !== undefined)
      formData.append('usageInstructions', data.usageInstructions)
    if (data.sideEffects !== undefined)
      formData.append('sideEffects', JSON.stringify(data.sideEffects))
    if (data.warnings !== undefined)
      formData.append('warnings', JSON.stringify(data.warnings))
    if (data.manufacturer !== undefined) formData.append('manufacturer', data.manufacturer)
    if (data.diseaseIds !== undefined)
      formData.append('diseaseIds', JSON.stringify(data.diseaseIds))
    if (imageFile) formData.append('image', imageFile)
    return apiClient.put<Medicine>(`/medicines/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: async (id: string) => apiClient.delete(`/medicines/${id}`),
}