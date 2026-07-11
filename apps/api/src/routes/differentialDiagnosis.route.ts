import { Router } from 'express'
import { analyzeDifferentialDiagnosis } from '../controllers/DifferentialDiagnosis.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const differentialDiagnosisRouter: Router = Router()

// Open to any authenticated user — primarily used by desktop Vets via DiagnosisPanel
differentialDiagnosisRouter.use(authenticate)
differentialDiagnosisRouter.post('/analyze', analyzeDifferentialDiagnosis)