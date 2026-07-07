import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface VetAvailabilitySlot {
  id: string
  vetId: string
  startTime: string
  endTime: string
  isBooked: boolean
  appointment?: {
    id: string
    reason?: string
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    owner: { id: string; email: string; profile?: { fullName?: string } }
    catProfile?: { id: string; name: string } | null
  } | null
}

export interface Appointment {
  id: string
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  reason?: string
  cancelReason?: string
  cancelledBy?: 'OWNER' | 'VET'
  slot: { id: string; startTime: string; endTime: string }
  owner: { id: string; email: string; profile?: { fullName?: string; phone?: string } }
  catProfile?: { id: string; name: string } | null
}

export const vetAvailabilityAPI = {
  createSlot: (startTime: string, endTime: string) =>
    apiClient.post<VetAvailabilitySlot>('/vet-availability', { startTime, endTime }),

  createSlotsBulk: (data: { date: string; dayStart: string; dayEnd: string; durationMinutes: number }) =>
    apiClient.post<VetAvailabilitySlot[]>('/vet-availability/bulk', data),

  listMine: (from?: string) =>
    apiClient.get<VetAvailabilitySlot[]>('/vet-availability/mine', { params: { from } }),

  deleteSlot: (id: string) => apiClient.delete(`/vet-availability/${id}`),
}

export const appointmentAPI = {
  listAsVet: (status?: string) =>
    apiClient.get<Appointment[]>('/appointments/vet', { params: { status } }),

  cancel: (id: string, cancelReason?: string) =>
    apiClient.patch<Appointment>(`/appointments/${id}/cancel`, { cancelReason }),

  complete: (id: string) =>
    apiClient.patch<Appointment>(`/appointments/${id}/complete`),
}