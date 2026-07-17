import { apiFetch } from '../utils/apiFetch'

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

export const notificationAPI = {
  async list(unreadOnly = false, skip = 0, take = 20): Promise<NotificationListResponse> {
    const params = new URLSearchParams({
      unreadOnly: String(unreadOnly),
      skip: String(skip),
      take: String(take),
    })
    const res = await apiFetch(`/notifications?${params}`)
    if (!res.ok) throw new Error('Failed to load notifications')
    return res.json()
  },

  async markRead(id: string): Promise<void> {
    const res = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to mark notification as read')
  },

  async markAllRead(): Promise<void> {
    const res = await apiFetch('/notifications/read-all', { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to mark all notifications as read')
  },
}