import { Router } from 'express'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/Notification.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const notificationRouter: Router = Router()

notificationRouter.use(authenticate)
notificationRouter.get('/', listNotifications)
notificationRouter.patch('/:id/read', markNotificationRead)
notificationRouter.patch('/read-all', markAllNotificationsRead)