import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface Notification {
  id: string
  type: 'CONTENT_APPROVED' | 'CONTENT_FLAGGED' | 'APPOINTMENT_BOOKED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_COMPLETED'  // ← MODIFIED
  title: string
  message: string
  contentType?: 'DISEASE' | 'MEDICINE' | 'EMERGENCY_GUIDE' | 'APPOINTMENT'  // ← MODIFIED
  contentId?: string
  read: boolean
  createdAt: string
}

export interface NotificationListResponse {
  data: Notification[]
  unreadCount: number
}

export const notificationAPI = {
  list: (unreadOnly = false, skip = 0, take = 20) =>
    apiClient.get<NotificationListResponse>('/notifications', { params: { unreadOnly, skip, take } }),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
}