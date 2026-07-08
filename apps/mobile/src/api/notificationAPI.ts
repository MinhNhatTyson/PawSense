import { storage } from '../utils/storage'
import { API_URL } from '../config'

export type NotificationType =
  | 'CONTENT_APPROVED'
  | 'CONTENT_FLAGGED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'

export type NotificationContentType = 'DISEASE' | 'MEDICINE' | 'EMERGENCY_GUIDE' | 'APPOINTMENT'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  contentType?: NotificationContentType
  contentId?: string
  read: boolean
  createdAt: string
}

export interface NotificationListResponse {
  data: AppNotification[]
  unreadCount: number
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const notificationAPI = {
  async list(unreadOnly = false, skip = 0, take = 20): Promise<NotificationListResponse> {
    const headers = await getHeaders()
    const params = new URLSearchParams({
      unreadOnly: String(unreadOnly),
      skip: String(skip),
      take: String(take),
    })
    const res = await fetch(`${API_URL}/notifications?${params}`, { headers })
    if (!res.ok) throw new Error('Failed to load notifications')
    return res.json()
  },

  async markRead(id: string): Promise<void> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', headers })
    if (!res.ok) throw new Error('Failed to mark notification as read')
  },

  async markAllRead(): Promise<void> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers })
    if (!res.ok) throw new Error('Failed to mark all notifications as read')
  },
}