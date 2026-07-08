import { prisma } from '../lib/prisma.js' // ← adjust import path to match your actual prisma client location

type NotificationType =
  | 'CONTENT_APPROVED'
  | 'CONTENT_FLAGGED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'

interface NotifyInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
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
        link: input.link,
      },
    })
  } catch (err) {
    console.error('notify() failed:', err)
    return null
  }
}