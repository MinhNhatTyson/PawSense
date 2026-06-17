import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface TreatmentStep {
  id: string
  treatmentId: string
  stepOrder: number
  title: string
  description: string
  durationMinutes?: number
  createdAt: string
}

export interface TreatmentStepInput {
  title: string
  description: string
  durationMinutes?: number
}

export interface Treatment {
  id: string
  name: string
  description: string
  contraindications: string[]
  vetNotes?: string
  estimatedDuration?: string
  estimatedCost?: string
  successRate?: number
  imageUrl?: string
  steps: TreatmentStep[]
  diseaseTreatments?: {
    id: string
    diseaseId: string
    treatmentId: string
    disease: { id: string; name: string; severity: string }
  }[]
  createdAt: string
  updatedAt: string
}

export interface TreatmentListResponse {
  data: Treatment[]
  pagination: { total: number; skip: number; take: number; hasMore: boolean }
}

export const treatmentAPI = {
  create: async (
    data: {
      name: string
      description: string
      contraindications?: string[]
      vetNotes?: string
      estimatedDuration?: string
      estimatedCost?: string
      successRate?: number
      steps?: TreatmentStepInput[]
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    if (data.contraindications) formData.append('contraindications', JSON.stringify(data.contraindications))
    if (data.vetNotes) formData.append('vetNotes', data.vetNotes)
    if (data.estimatedDuration) formData.append('estimatedDuration', data.estimatedDuration)
    if (data.estimatedCost) formData.append('estimatedCost', data.estimatedCost)
    if (data.successRate !== undefined) formData.append('successRate', String(data.successRate))
    if (data.steps) formData.append('steps', JSON.stringify(data.steps))
    if (data.diseaseIds) formData.append('diseaseIds', JSON.stringify(data.diseaseIds))
    if (imageFile) formData.append('image', imageFile)
    return apiClient.post<Treatment>('/treatments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getById: async (id: string) => apiClient.get<Treatment>(`/treatments/${id}`),

  list: async (skip = 0, take = 12, search?: string) =>
    apiClient.get<TreatmentListResponse>('/treatments', { params: { skip, take, search } }),

  search: async (query: string) =>
    apiClient.get<Treatment[]>('/treatments/search', { params: { q: query } }),

  update: async (
    id: string,
    data: {
      name?: string
      description?: string
      contraindications?: string[]
      vetNotes?: string
      estimatedDuration?: string
      estimatedCost?: string
      successRate?: number
      steps?: TreatmentStepInput[]
      diseaseIds?: string[]
    },
    imageFile?: File
  ) => {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.contraindications !== undefined) formData.append('contraindications', JSON.stringify(data.contraindications))
    if (data.vetNotes !== undefined) formData.append('vetNotes', data.vetNotes)
    if (data.estimatedDuration !== undefined) formData.append('estimatedDuration', data.estimatedDuration)
    if (data.estimatedCost !== undefined) formData.append('estimatedCost', data.estimatedCost)
    if (data.successRate !== undefined) formData.append('successRate', String(data.successRate))
    if (data.steps !== undefined) formData.append('steps', JSON.stringify(data.steps))
    if (data.diseaseIds !== undefined) formData.append('diseaseIds', JSON.stringify(data.diseaseIds))
    if (imageFile) formData.append('image', imageFile)
    return apiClient.put<Treatment>(`/treatments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: async (id: string) => apiClient.delete(`/treatments/${id}`),
}