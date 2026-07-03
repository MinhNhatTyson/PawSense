import { Router } from 'express'
import multer from 'multer'
import { analyzeImage } from '../controllers/ImageDiagnosis.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const imageDiagnosisRouter: Router = Router()

// Open to any authenticated user — primarily used by mobile Pet Owners
imageDiagnosisRouter.use(authenticate)
imageDiagnosisRouter.post('/analyze', upload.array('images', 5), analyzeImage)