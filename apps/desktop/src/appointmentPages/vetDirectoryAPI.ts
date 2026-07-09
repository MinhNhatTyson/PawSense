import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export const vetDirectoryAPI = {
  list: (params: { search?: string; lat?: number; lng?: number; radiusKm?: number }) =>
    apiClient.get<VetSummary[]>('/vet-directory', { params }),
}