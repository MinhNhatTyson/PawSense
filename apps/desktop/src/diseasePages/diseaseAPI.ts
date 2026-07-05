import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Disease {
  id: string
  name: string
  description: string
  causes: string[]
  symptoms: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  preventionMethods: string[]
  treatmentMethods: string[]
  recoveryPeriod: string
  imageUrl?: string
  relatedDiseasesFrom?: any[]
  relatedDiseasesTo?: any[]
  diseaseMedicines?: {
  id: string
  diseaseId: string
  medicineId: string
  medicine: {
    id: string
    name: string
    dosage: string
    manufacturer?: string
  }
}[]
  diseaseSymptoms?: {
    id: string
    diseaseId: string
    symptomId: string
    symptom: {
      id: string
      name: string
      description: string
      affectedBodyAreas?: string[]
      commonality: string
      onsetSpeed: string
      notes?: string
    }
  }[]
  diseaseTreatments?: {
    id: string
    diseaseId: string
    treatmentId: string
    treatment: {
      id: string
      name: string
      estimatedDuration?: string
      successRate?: number
      steps: { id: string; stepOrder: number; title: string; durationMinutes?: number }[]
    }
  }[]
  diseaseFoods?: {
    id: string
    diseaseId: string
    foodId: string
    food: {
      id: string
      name: string
      brand: string
      category: string
    }
  }[]
  createdAt: string
  updatedAt: string
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'FLAGGED'
  createdById?: string
  approvedById?: string
  approvedAt?: string
  createdBy?: { id: string; email: string; profile?: { fullName?: string } }
  approvedBy?: { id: string; email: string; profile?: { fullName?: string } }
}

export interface DiseaseListResponse {
  data: Disease[]
  pagination: {
    total: number
    skip: number
    take: number
    hasMore: boolean
  }
}

export const diseaseAPI = {
create: async (
  data: Omit<Disease, 'id' | 'createdAt' | 'updatedAt'> & {
    relatedDiseaseIds?: string[]
    symptomIds?: string[]
    treatmentIds?: string[]
    medicineIds?: string[]
  },
  imageFile?: File
) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    if (imageFile) {
      formData.append('image', imageFile)
    }

    return apiClient.post<Disease>('/diseases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getById: async (id: string) => {
    return apiClient.get<Disease>(`/diseases/${id}`)
  },

  list: async (
    skip = 0,
    take = 10,
    search?: string,
    severity?: string
  ) => {
    return apiClient.get<DiseaseListResponse>('/diseases', {
      params: { skip, take, search, severity },
    })
  },

  search: async (query: string) => {
    return apiClient.get<Disease[]>('/diseases/search', {
      params: { q: query },
    })
  },

  update: async (
  id: string,
  data: Partial<Disease> & {
    relatedDiseaseIds?: string[]
    symptomIds?: string[]
    treatmentIds?: string[]
    medicineIds?: string[]
  },
  imageFile?: File
) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    if (imageFile) {
      formData.append('image', imageFile)
    }

    return apiClient.put<Disease>(`/diseases/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: async (id: string) => {
    return apiClient.delete(`/diseases/${id}`)
  },
}