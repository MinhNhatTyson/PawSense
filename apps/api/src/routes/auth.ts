import { Router } from 'express'
import {
  register,
  login,
  changePassword,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export const authRouter: Router = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/change-password', authMiddleware, changePassword)
authRouter.get('/profile', authMiddleware, getProfile)
authRouter.put('/profile', authMiddleware, updateProfile)