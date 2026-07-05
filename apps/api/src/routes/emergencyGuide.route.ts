import { Router } from 'express'
import multer from 'multer'
import {
  createEmergencyGuide,
  getEmergencyGuide,
  listEmergencyGuides,
  updateEmergencyGuide,
  deleteEmergencyGuide,
} from '../controllers/EmergencyGuide.controller.js'
import { authenticate, requireVet } from '../middleware/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

export const emergencyGuideRouter: Router = Router()

emergencyGuideRouter.use(authenticate)

emergencyGuideRouter.post('/', requireVet, upload.single('image'), createEmergencyGuide)
emergencyGuideRouter.get('/', listEmergencyGuides)
emergencyGuideRouter.get('/:id', getEmergencyGuide)
emergencyGuideRouter.put('/:id', requireVet, upload.single('image'), updateEmergencyGuide)
emergencyGuideRouter.delete('/:id', requireVet, deleteEmergencyGuide)