import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type SymptomCommonality = 'RARE' | 'COMMON' | 'VERY_COMMON'
export type SymptomOnsetSpeed = 'ACUTE' | 'SUBACUTE' | 'CHRONIC'

export interface SymptomDisease {
  id: string
  diseaseId: string
  symptomId: string
  disease: {
    id: string
    name: string
    severity: string
  }
}

export interface Symptom {
  id: string
  name: string
  description: string
  affectedBodyArea?: string
  commonality: SymptomCommonality
  onsetSpeed: SymptomOnsetSpeed
  notes?: string
  diseaseSymptoms?: SymptomDisease[]
  createdAt: string
  updatedAt: string
}

export interface SymptomListResponse {
  data: Symptom[]
  pagination: {
    total: number
    skip: number
    take: number
    hasMore: boolean
  }
}

export const symptomAPI = {
  create: async (
    data: Omit<Symptom, 'id' | 'createdAt' | 'updatedAt'> & { diseaseIds?: string[] }
  ) => {
    return apiClient.post<Symptom>('/symptoms', data)
  },

  getById: async (id: string) => {
    return apiClient.get<Symptom>(`/symptoms/${id}`)
  },

  list: async (
    skip = 0,
    take = 20,
    search?: string,
    commonality?: string,
    onsetSpeed?: string
  ) => {
    return apiClient.get<SymptomListResponse>('/symptoms', {
      params: { skip, take, search, commonality, onsetSpeed },
    })
  },

  search: async (query: string) => {
    return apiClient.get<Symptom[]>('/symptoms/search', {
      params: { q: query },
    })
  },

  update: async (
    id: string,
    data: Partial<Symptom> & { diseaseIds?: string[] }
  ) => {
    return apiClient.put<Symptom>(`/symptoms/${id}`, data)
  },

  delete: async (id: string) => {
    return apiClient.delete(`/symptoms/${id}`)
  },

  linkDiseases: async (id: string, diseaseIds: string[]) => {
    return apiClient.post<Symptom>(`/symptoms/${id}/diseases`, { diseaseIds })
  },

  unlinkDisease: async (id: string, diseaseId: string) => {
    return apiClient.delete<Symptom>(`/symptoms/${id}/diseases/${diseaseId}`)
  },
}