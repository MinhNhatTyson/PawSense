import type { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'

export async function listNotifications(req: AuthRequest, res: Response) {
  const userId = req.userId!
  const { unreadOnly, skip = '0', take = '20' } = req.query

  const where: any = { userId }
  if (unreadOnly === 'true') where.read = false

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip as string, 10),
      take: parseInt(take as string, 10),
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ])

  res.json({ data: notifications, unreadCount })
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  const userId = req.userId!
  const { id } = req.params

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    res.status(404).json({ error: 'Notification not found' })
    return
  }

  const updated = await prisma.notification.update({ where: { id }, data: { read: true } })
  res.json(updated)
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
  const userId = req.userId!
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
  res.json({ success: true })
}