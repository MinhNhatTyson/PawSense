import { prisma } from '../lib/prisma.js'

type NotificationType =
  | 'CONTENT_APPROVED'
  | 'CONTENT_FLAGGED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'

type ContentType = 'DISEASE' | 'MEDICINE' | 'EMERGENCY_GUIDE' | 'APPOINTMENT'

interface NotifyInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  contentType?: ContentType
  contentId?: string
}

// Best-effort: a failed notification should never fail the parent transaction.
export async function notify(input: NotifyInput) {
  try {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as any,
        title: input.title,
        message: input.message,
        contentType: input.contentType as any,
        contentId: input.contentId,
      },
    })
  } catch (err) {
    console.error('notify() failed:', err)
    return null
  }
}