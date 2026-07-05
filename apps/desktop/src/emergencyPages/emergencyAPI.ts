import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type Urgency = 'CRITICAL' | 'URGENT'
export type VerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'FLAGGED'

export interface EmergencyGuide {
  id: string
  title: string
  category: string
  urgency: Urgency
  summary: string
  emergencySymptoms: string[]
  firstAidSteps: string[]
  doNots: string[]
  whenToSeekVet: string
  imageUrl?: string
  status: VerificationStatus
  createdById?: string
  createdBy?: { id: string; email: string; profile?: { fullName?: string } }
  approvedBy?: { id: string; email: string; profile?: { fullName?: string } }
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EmergencyGuideInput {
  title: string
  category: string
  urgency: Urgency
  summary: string
  emergencySymptoms: string[]
  firstAidSteps: string[]
  doNots: string[]
  whenToSeekVet: string
}

const buildFormData = (data: Partial<EmergencyGuideInput>, imageFile?: File) => {
  const fd = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) fd.append(key, JSON.stringify(value))
    else if (value !== undefined) fd.append(key, String(value))
  })
  if (imageFile) fd.append('image', imageFile)
  return fd
}

export const emergencyAPI = {
  list: async (params?: { search?: string; category?: string; urgency?: string; status?: string }) =>
    apiClient.get<EmergencyGuide[]>('/emergency-guides', { params }),

  getById: async (id: string) => apiClient.get<EmergencyGuide>(`/emergency-guides/${id}`),

  create: async (data: EmergencyGuideInput, imageFile?: File) =>
    apiClient.post<EmergencyGuide>('/emergency-guides', buildFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: async (id: string, data: Partial<EmergencyGuideInput>, imageFile?: File) =>
    apiClient.put<EmergencyGuide>(`/emergency-guides/${id}`, buildFormData(data, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: async (id: string) => apiClient.delete(`/emergency-guides/${id}`),
}