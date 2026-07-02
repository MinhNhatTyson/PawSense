import { Router } from 'express'
import multer from 'multer'
import { analyzeSymptoms } from '../controllers/SymptomDiagnosis.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

export const symptomDiagnosisRouter: Router = Router()

// Open to any authenticated user — primarily used by mobile Pet Owners
symptomDiagnosisRouter.use(authenticate)
symptomDiagnosisRouter.post('/analyze', upload.array('images', 5), analyzeSymptoms)